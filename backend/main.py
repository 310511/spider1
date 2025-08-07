import sys
import os
from io import BytesIO
from fastapi.concurrency import run_in_threadpool
from typing import Optional

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from backend.services import bedrock
from backend.services import kendra
from backend.services import neptune
from backend.services import elevenlabs
from backend.services import s3
from backend.logger import logger
from backend.services import speaker, speaker_identification
from backend.services import memory_analytics
from backend.services import agent_service
from backend.services import task_service

app = FastAPI()


class ProcessTextRequest(BaseModel):
    user_id: str
    text: str


class QueryRequest(BaseModel):
    user_id: str
    query: str


class ProcessAudioRequest(BaseModel):
    user_id: str
    filepath: str


class TextToSpeechRequest(BaseModel):
    text: str
    user_id: str # For potential future voice cloning or user-specific settings


class CreateTaskRequest(BaseModel):
    patient_id: str
    summary: str
    start_date: str
    end_date: str
    description: Optional[str] = ""


class MarkTaskCompletedRequest(BaseModel):
    patient_id: str
    task_id: str


@app.get("/")
def read_root():
    return {"message": "Welcome to the INFINITE-MEMORY API"}


@app.post("/process-text")
async def process_text(request: ProcessTextRequest):
    analysis = bedrock.analyze_text(request.text)
    
    # Store the result in Kendra
    if "error" not in analysis:
        # Store in Vector DB
        kendra.add_document(
            user_id=request.user_id,
            original_transcript=request.text,
            analysis_json=analysis
        )
        # Store in Graph DB
        await run_in_threadpool(neptune.add_graph_data, analysis)

    # Record for memory analytics
    memory_analytics.record_memory_interaction(
        patient_id=request.user_id,
        importance_score=float(analysis.get("importance_score", 0.5)),
        # ... other fields
    )

    return analysis


@app.post("/query")
async def query(request: QueryRequest):
    """
    Accepts a user's query, retrieves context from Kendra and Neptune,
    and returns a synthesized answer from an LLM.
    """
    user_query = request.query
    user_id = request.user_id
    logger.info(f"Received query: '{user_query}'")

    # 1. Query databases
    kendra_results = kendra.query_index(user_query, user_id=user_id)
    kendra_context_for_llm = [res["text"] for res in kendra_results]
    
    # Intelligently extract an entity from the query for the graph DB
    entity_query = bedrock.extract_entity_from_query(user_query)
    neptune_context = []
    if entity_query:
        neptune_context = await run_in_threadpool(neptune.query_graph, entity_query, user_id=user_id)

    # Get upcoming tasks
    tasks = await run_in_threadpool(task_service.get_tasks_for_patient, user_id)
    tasks_context = [f"- {t.get('summary')} from {t.get('start_date')} to {t.get('end_date')}" for t in tasks]
    
    # Combine all context
    full_context = "\\n".join(kendra_context_for_llm + neptune_context + tasks_context)
    
    # 2. Run the LangChain Agent
    final_answer = await run_in_threadpool(
        agent_service.run_agent,
        query=user_query,
        context=full_context,
        tasks=tasks_context
    )

    # Find the most relevant image URL to return, if any
    image_url = None
    if kendra_results and kendra_results[0]["s3_url"]:
        image_url = kendra_results[0]["s3_url"]

    # 3. Return response
    return {"query": user_query, "answer": final_answer, "image_url": image_url}


@app.post("/process-audio")
async def process_audio(request: ProcessAudioRequest):
    """
    Accepts an audio file path, identifies the speaker, transcribes,
    analyzes, stores the memory, and then deletes the local file.
    """
    filepath = request.filepath
    if not os.path.exists(filepath):
        return {"error": "File not found."}

    # 1. Get embedding from the whole audio file
    embedding = speaker.get_embedding_from_file(filepath)
    if embedding is None:
        return {"error": "Could not generate speaker embedding."}

    # 2. Transcribe audio (we still need the text)
    with open(filepath, 'rb') as f:
        audio_data = f.read()
    transcript = elevenlabs.speech_to_text(audio_data)
    if not transcript:
        return {"error": "Could not transcribe audio."}
    
    # 3. Get AI analysis and importance score
    analysis = bedrock.analyze_text(transcript)
    if "error" in analysis:
        return analysis # Return the error from Bedrock
    
    importance_score = float(analysis.get("importance_score", 0.5))

    # 4. Identify speaker and update knowledge base
    user_id = request.user_id
    cluster_id = await run_in_threadpool(
        speaker_identification.identify_and_update_speaker,
        embedding=embedding,
        importance_score=importance_score,
        user_id=user_id
    )

    # 5. Store enriched memory in Kendra
    kendra.add_document(
        user_id=user_id,
        original_transcript=transcript,
        analysis_json=analysis,
        speaker_cluster_id=cluster_id
    )

    # 6. Delete the local file
    try:
        os.remove(filepath)
        logger.info(f"Successfully deleted local audio file: {filepath}")
    except OSError as e:
        logger.error(f"Error deleting file {filepath}: {e}")

    # Add cluster_id to the response
    analysis['speaker_cluster_id'] = cluster_id

    # Record for memory analytics
    memory_analytics.record_memory_interaction(
        patient_id=user_id,
        importance_score=importance_score,
        # ... other fields
    )

    return analysis


@app.post("/query-audio")
async def query_audio(user_id: str = File(...), audio: UploadFile = File(...)):
    """
    Accepts a user_id and an audio query, gets a synthesized text answer,
    and returns it as speech.
    """
    audio_data = await audio.read()
    query_text = elevenlabs.speech_to_text(audio_data)

    if not query_text:
        return {"error": "Could not transcribe audio query."}
    
    kendra_results = kendra.query_index(query_text, user_id=user_id)
    kendra_context_for_llm = [res["text"] for res in kendra_results]
    
    entity_query = bedrock.extract_entity_from_query(query_text)
    neptune_context = []
    if entity_query:
        neptune_context = await run_in_threadpool(neptune.query_graph, entity_query, user_id=user_id)
    
    final_answer_text = bedrock.synthesize_answer(
        query=query_text,
        kendra_results=kendra_context_for_llm,
        neptune_results=neptune_context
    )

    # Convert final answer to speech
    audio_response = elevenlabs.text_to_speech(final_answer_text)

    if not audio_response:
        return {"error": "Could not generate audio response."}

    # Stream the audio bytes back to the client
    return StreamingResponse(BytesIO(audio_response), media_type="audio/mpeg")


@app.post("/process-image")
async def process_image(user_id: str = File(...), caption: str = File(""), image: UploadFile = File(...)):
    """
    Accepts an image and a caption, uploads to S3, analyzes it,
    and stores the description as a memory in Kendra.
    """
    image_data = await image.read()
    file_extension = image.filename.split('.')[-1]

    # 1. Upload image to S3
    image_url = s3.upload_file_to_s3(image_data, file_extension, user_id=user_id)
    if not image_url:
        return {"error": "Failed to upload image to S3."}

    # 2. Analyze image with Bedrock
    description = bedrock.analyze_image(image_data, caption)
    if not description:
        return {"error": "Failed to analyze image."}

    # 3. Store the description and URL in Kendra
    # We create a simplified analysis JSON for Kendra to process
    analysis_for_kendra = {
        "summary": f"Image a user uploaded with caption: '{caption}'. Description: {description}",
        "importance_score": 0.9 # Images are considered high importance
    }
    kendra.add_document(
        user_id=user_id,
        original_transcript=description,
        analysis_json=analysis_for_kendra,
        s3_url=image_url
    )

    return {"s3_url": image_url, "description": description}


@app.get("/memory-report/{patient_id}")
async def get_memory_report(patient_id: str, days: int = 3):
    report = memory_analytics.get_patient_memory_trend(patient_id, days)
    alerts = memory_analytics.get_patient_alerts(patient_id)
    return {"report": report, "alerts": alerts}


@app.get("/admin/patient-summaries")
async def get_all_patient_summaries():
    summaries = memory_analytics.get_all_patient_summaries()
    return {"summaries": summaries}


@app.get("/admin/alerts")
async def get_admin_alerts():
    # This currently gets all alerts for all patients.
    # A more advanced version might aggregate them.
    summaries = memory_analytics.get_all_patient_summaries()
    all_alerts = []
    for patient, data in summaries.items():
        all_alerts.extend(data.get("alerts", []))
    return {"alerts": all_alerts}


@app.post("/admin/acknowledge-alert/{alert_id}")
async def acknowledge_alert_endpoint(alert_id: str):
    # Note: Acknowledging requires the full key (patient_id, timestamp)
    # This is a simplified example.
    logger.info(f"Received request to acknowledge alert {alert_id}")
    # memory_analytics.acknowledge_alert(alert_id) # Placeholder
    return {"status": "acknowledged"}


@app.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """Converts text to speech and returns the audio."""
    audio_response = elevenlabs.text_to_speech(request.text)
    if not audio_response:
        return {"error": "Could not generate audio response."}
    return StreamingResponse(BytesIO(audio_response), media_type="audio/mpeg")


@app.post("/tasks/create")
async def create_task_endpoint(request: CreateTaskRequest):
    return task_service.create_task(
        patient_id=request.patient_id,
        summary=request.summary,
        start_date=request.start_date,
        end_date=request.end_date,
        description=request.description or ""
    )


@app.get("/tasks/{patient_id}")
async def get_tasks_endpoint(patient_id: str):
    return task_service.get_tasks_for_patient(patient_id)


@app.post("/tasks/complete")
async def complete_task_endpoint(request: MarkTaskCompletedRequest):
    return task_service.mark_task_as_completed(
        patient_id=request.patient_id,
        task_id=request.task_id
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
