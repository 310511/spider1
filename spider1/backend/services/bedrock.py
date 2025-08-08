# This file will contain the logic for interacting with AWS Bedrock. 

import json
from typing import Optional
from ..config import settings
from ..clients import bedrock_runtime
from ..logger import logger
import base64

# The Bedrock client is now initialized in backend/clients.py

def analyze_text(transcript: str) -> dict:
    """
    Analyzes the given transcript using AWS Bedrock with Claude 3 Opus.

    Args:
        transcript: The text transcript of a conversation.

    Returns:
        A dictionary containing the structured analysis from the model.
    """
    # We will refine this prompt later. This is the core of the AI's "brain".
    prompt = f"""
        Human: You are an AI assistant for a person with memory loss.
        Your task is to analyze the following conversation transcript and extract key information.
        Please output your analysis as a single, valid JSON object. Do not include any text outside of the JSON object.

        The JSON object should have the following structure:
        {{
          "summary": "A brief, one-sentence summary of the conversation.",
          "importance_score": "A score from 0.0 to 1.0 indicating how important this memory is.",
          "entities": [
            {{
              "name": "Name of the entity (person, place, thing)",
              "type": "Type of entity (e.g., PERSON, LOCATION, MEDICATION)"
            }}
          ],
          "relationships": [
            {{
              "subject": "Entity A",
              "predicate": "Relationship (e.g., IS_LOCATED_AT, WAS_DISCUSSED_BY)",
              "object": "Entity B"
            }}
          ]
        }}

        Here is the transcript:
        <transcript>
        {transcript}
        </transcript>

        Assistant:
    """

    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 4096,
        "temperature": 0.5,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
    })

    try:
        response = bedrock_runtime.invoke_model(
            body=body,
            modelId=settings.bedrock_model_id,
            contentType="application/json",
            accept="application/json",
        )

        response_body_raw = response.get("body").read()
        # print("--- RAW BEDROCK RESPONSE ---")
        # print(response_body_raw.decode('utf-8'))
        # print("--------------------------")

        response_body = json.loads(response_body_raw)
        
        # The actual response is nested in the 'content' list
        if not response_body.get("content"):
             raise ValueError("Bedrock response is missing 'content' block or it is empty.")

        analysis_json_string = response_body["content"][0].get("text", "")
        print("--- EXTRACTED MODEL OUTPUT ---")
        print(analysis_json_string)
        print("----------------------------")

        if not analysis_json_string:
            raise ValueError("Model returned an empty string.")

        # Clean the string: find the first '{' and the last '}'
        try:
            start_index = analysis_json_string.index('{')
            end_index = analysis_json_string.rindex('}') + 1
            cleaned_json_string = analysis_json_string[start_index:end_index]
            return json.loads(cleaned_json_string)
        except ValueError:
            raise ValueError("Could not find a valid JSON object in the model's response.")

    except Exception as e:
        logger.error(f"Error processing Bedrock response: {e}")
        # In a real app, you'd want more robust error handling
        return {"error": str(e)}


def synthesize_answer(query: str, kendra_results: list[str], neptune_results: list[str]) -> str:
    """
    Uses a fast LLM to synthesize a final answer from a query and retrieved context.
    """
    kendra_context = "\\n".join(kendra_results)
    neptune_context = "\\n".join(neptune_results)

    prompt = f"""
        Human: You are Kai, a personal AI companion. Your user has memory loss. Your purpose is to provide short, clear, and kind reminders.
        Your response will be converted directly to speech, so it must sound like a natural, human conversation.

        ---VERY IMPORTANT INSTRUCTIONS---
        1. Speak in the first person. Use "I remember..." or "You mentioned...". Do NOT say "The context says..." or "Based on the information...".
        2. Be direct and concise. Get straight to the point. Aim for one or two simple sentences.
        3. If you have relevant information, state it. For example, if the user asks "What's happening today?" and you know about a visitor, say "I remember you said Jane is visiting this morning."
        4. If you don't have information, just say "I don't have anything about that." Do not apologize or elaborate.
        5. If the user asks for a picture you have, say "Of course. Here is the picture of..."

        ---USER'S QUESTION---
        "{query}"

        ---RELEVANT MEMORIES FOR YOU TO USE---
        <kendra_context>
        {kendra_context}
        </kendra_context>
        <neptune_context>
        {neptune_context}
        </neptune_context>
        ---END OF MEMORIES---

        Now, as Kai, provide a very short, direct, and kind response.

        Assistant:
    """

    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "temperature": 0.5,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
    })

    try:
        response = bedrock_runtime.invoke_model(
            body=body,
            modelId=settings.bedrock_synthesis_model_id,
            contentType="application/json",
            accept="application/json",
        )

        response_body = json.loads(response.get("body").read())
        answer = response_body["content"][0].get("text", "")
        return answer

    except Exception as e:
        logger.error(f"Error synthesizing answer with Bedrock: {e}")
        return "I'm sorry, I'm having trouble formulating an answer right now."


def extract_entity_from_query(query: str) -> Optional[str]:
    """
    Uses an LLM to extract the primary noun/entity from a user's query.
    """
    prompt = f"""
        Human: Your task is to extract the single, most important subject or entity from the following user question.
        The subject is likely to be a person, place, or thing.
        Return only the subject name and nothing else.
        For example, for the query "Where did I leave my keys?", you should return "keys".
        For "What did Dr. Smith say?", you should return "Dr. Smith".

        Here is the user's question: "{query}"

        Assistant:
    """
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 50,
        "temperature": 0.1,
        "messages": [
            { "role": "user", "content": [{"type": "text", "text": prompt}] }
        ],
    })

    try:
        response = bedrock_runtime.invoke_model(
            body=body,
            modelId=settings.bedrock_synthesis_model_id,  # Use the fast model
            contentType="application/json",
            accept="application/json",
        )
        response_body = json.loads(response.get("body").read())
        entity = response_body["content"][0].get("text", "").strip()
        logger.info(f"Extracted entity '{entity}' from query '{query}'")
        return entity if entity else None
    except Exception as e:
        logger.error(f"Error extracting entity: {e}")
        return None

def analyze_image(image_data: bytes, user_prompt: str) -> Optional[str]:
    """
    Analyzes an image using a multimodal model on Bedrock.
    """
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    prompt_with_image = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "temperature": 0.5,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg", # Assuming jpeg, can be improved
                            "data": image_base64,
                        },
                    },
                    {
                        "type": "text",
                        "text": f"""
                        You are an AI assistant for a person with memory loss.
                        A user has uploaded an image. Your task is to describe this image in detail,
                        extract any text you see, and summarize what is important about it.
                        The user might have provided a caption or question: "{user_prompt}"

                        Please provide a concise but comprehensive description of the image.
                        """
                    }
                ]
            }
        ]
    }
    
    body = json.dumps(prompt_with_image)

    try:
        response = bedrock_runtime.invoke_model(
            body=body,
            modelId=settings.bedrock_model_id, # Use the powerful model for analysis
            contentType="application/json",
            accept="application/json",
        )
        response_body = json.loads(response.get("body").read())
        description = response_body["content"][0].get("text", "")
        logger.info("Image analysis successful.")
        return description
    except Exception as e:
        logger.error(f"Error analyzing image with Bedrock: {e}")
        return None 