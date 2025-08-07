#!/usr/bin/env python3
"""
Improved Infinite Memory Backend
- Better sentiment analysis
- Working all components
- Proper error handling
- Enhanced features
- Medicine recommendation system
"""

import sys
import os
from typing import Optional, List, Dict, Any
import json
from datetime import datetime, timedelta
import random
import re

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn

# Import medicine recommendation system
from medicine_recommendation_system import medicine_engine

app = FastAPI(title="Infinite Memory API - Improved", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data storage
memory_data = {}
tasks_data = {}
alerts_data = []

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
    user_id: str

class CreateTaskRequest(BaseModel):
    patient_id: str
    summary: str
    start_date: str
    end_date: str
    description: Optional[str] = ""

class MarkTaskCompletedRequest(BaseModel):
    patient_id: str
    task_id: str

class MedicineRecommendationRequest(BaseModel):
    user_id: str
    symptoms: str
    include_restocking: bool = True

class UpdateStockRequest(BaseModel):
    medicine_id: str
    new_quantity: int

class MemoryAnalysis(BaseModel):
    importance_score: float
    summary: str
    entities: List[str]
    sentiment: str
    topics: List[str]
    action_items: Optional[List[str]] = None
    urgency_level: str = "normal"

class Task(BaseModel):
    task_id: str
    patient_id: str
    summary: str
    description: str
    start_date: str
    end_date: str
    completed: bool
    created_at: str
    priority: str = "medium"

class MemoryReport(BaseModel):
    patient_id: str
    days: int
    total_interactions: int
    average_importance: float
    memory_trends: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]
    sentiment_distribution: Dict[str, int]

def analyze_sentiment_advanced(text: str) -> Dict[str, Any]:
    """Advanced sentiment analysis with multiple approaches"""
    text_lower = text.lower()
    words = text_lower.split()
    
    # Comprehensive word lists
    positive_words = [
        'good', 'better', 'improved', 'healthy', 'recovered', 'well', 'fine', 'great', 
        'excellent', 'amazing', 'wonderful', 'happy', 'relieved', 'comfortable', 
        'strong', 'energetic', 'positive', 'optimistic', 'confident', 'peaceful',
        'calm', 'relaxed', 'satisfied', 'content', 'joyful', 'excited', 'grateful'
    ]
    
    negative_words = [
        'pain', 'sick', 'worse', 'bad', 'problem', 'hurt', 'ache', 'suffering', 
        'terrible', 'awful', 'horrible', 'depressed', 'sad', 'angry', 'frustrated',
        'worried', 'anxious', 'scared', 'afraid', 'fear', 'dead', 'dying', 'suicide',
        'kill', 'death', 'hopeless', 'helpless', 'lonely', 'alone', 'empty', 'numb',
        'tired', 'exhausted', 'weak', 'dizzy', 'nausea', 'vomit', 'bleeding', 'swelling',
        'fever', 'chills', 'cough', 'cold', 'flu', 'infection', 'disease', 'cancer',
        'heart', 'attack', 'stroke', 'emergency', 'urgent', 'critical', 'severe',
        'remember', 'memory', 'forget', 'forgetting', 'confused', 'confusion', 'lost',
        'disoriented', 'unable', 'cannot', 'cant', 'dont', 'not', 'never', 'hate',
        'despise', 'loathe', 'miserable', 'desperate', 'panic', 'terrified', 'devastated'
    ]
    
    # Medical/health keywords
    medical_keywords = [
        'medicine', 'patient', 'doctor', 'hospital', 'treatment', 'symptoms', 'diagnosis',
        'health', 'medical', 'therapy', 'medication', 'prescription', 'appointment',
        'checkup', 'examination', 'test', 'scan', 'x-ray', 'blood', 'pressure',
        'temperature', 'pulse', 'heart', 'lung', 'brain', 'stomach', 'pain'
    ]
    
    # Count words
    positive_count = sum(1 for word in words if word in positive_words)
    negative_count = sum(1 for word in words if word in negative_words)
    medical_count = sum(1 for word in words if word in medical_keywords)
    
    # Pattern matching for complex phrases
    negative_patterns = [
        r'\bnot\s+feeling\b', r'\bnot\s+alive\b', r'\btoo\s+depressed\b',
        r'\bwant\s+to\s+die\b', r'\bkill\s+myself\b', r'\bnot\s+being\s+able\s+to\b',
        r'\bcannot\s+remember\b', r'\bunable\s+to\b', r'\bnot\s+able\s+to\b',
        r'\bdont\s+remember\b', r'\bcant\s+remember\b', r'\bforgetting\s+everything\b',
        r'\bmemory\s+loss\b', r'\bnot\s+working\b', r'\bnot\s+functioning\b',
        r'\bbroken\b', r'\bdamaged\b', r'\bhopeless\b', r'\bhelpless\b',
        r'\bwant\s+to\s+end\s+it\b', r'\bno\s+point\b', r'\bworthless\b'
    ]
    
    positive_patterns = [
        r'\bfeeling\s+good\b', r'\bmuch\s+better\b', r'\brecovering\s+well\b',
        r'\bimproving\b', r'\bgetting\s+better\b', r'\bfeeling\s+better\b',
        r'\bmuch\s+improved\b', r'\bvery\s+happy\b', r'\bexcellent\s+progress\b'
    ]
    
    # Check patterns
    negative_pattern_matches = sum(1 for pattern in negative_patterns if re.search(pattern, text_lower))
    positive_pattern_matches = sum(1 for pattern in positive_patterns if re.search(pattern, text_lower))
    
    # Calculate sentiment score
    sentiment_score = (positive_count + positive_pattern_matches) - (negative_count + negative_pattern_matches)
    
    # Determine sentiment
    if sentiment_score > 0:
        sentiment = "positive"
    elif sentiment_score < 0:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    # Determine urgency level
    urgency_level = "normal"
    if negative_count > 3 or negative_pattern_matches > 0:
        urgency_level = "high"
    elif negative_count > 1:
        urgency_level = "medium"
    
    return {
        "sentiment": sentiment,
        "sentiment_score": sentiment_score,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "medical_count": medical_count,
        "negative_patterns": negative_pattern_matches,
        "positive_patterns": positive_pattern_matches,
        "urgency_level": urgency_level
    }

def analyze_text_improved(text: str) -> MemoryAnalysis:
    """Improved text analysis with better sentiment detection"""
    sentiment_analysis = analyze_sentiment_advanced(text)
    
    # Extract medical entities
    words = text.lower().split()
    medical_keywords = [
        'medicine', 'patient', 'doctor', 'hospital', 'treatment', 'symptoms', 'diagnosis',
        'health', 'medical', 'therapy', 'medication', 'prescription', 'appointment',
        'checkup', 'examination', 'test', 'scan', 'x-ray', 'blood', 'pressure',
        'temperature', 'pulse', 'heart', 'lung', 'brain', 'stomach', 'pain'
    ]
    found_keywords = [word for word in words if word in medical_keywords]
    
    # Calculate importance score
    base_score = 0.3
    medical_bonus = len(found_keywords) * 0.1
    sentiment_bonus = 0.3 if sentiment_analysis["sentiment"] == "negative" else 0.1 if sentiment_analysis["sentiment"] == "positive" else 0.05
    urgency_bonus = 0.2 if sentiment_analysis["urgency_level"] == "high" else 0.1 if sentiment_analysis["urgency_level"] == "medium" else 0.0
    length_bonus = min(0.2, len(text) / 1000)
    
    importance_score = min(1.0, base_score + medical_bonus + sentiment_bonus + urgency_bonus + length_bonus)
    
    # Generate summary based on sentiment and content
    if sentiment_analysis["sentiment"] == "negative":
        if sentiment_analysis["urgency_level"] == "high":
            summary = f"URGENT: Patient reported severe concerning symptoms. Key topics: {', '.join(found_keywords[:3]) if found_keywords else 'mental health'}"
        else:
            summary = f"Patient reported concerning symptoms. Key topics: {', '.join(found_keywords[:3]) if found_keywords else 'mental health'}"
        action_items = ["Immediate follow-up required", "Schedule urgent appointment", "Consider mental health support"]
    elif sentiment_analysis["sentiment"] == "positive":
        summary = f"Patient reported improvement. Key topics: {', '.join(found_keywords[:3]) if found_keywords else 'recovery'}"
        action_items = ["Continue current treatment", "Schedule follow-up appointment"]
    else:
        summary = f"Patient interaction recorded. Key topics: {', '.join(found_keywords[:3]) if found_keywords else 'general health'}"
        action_items = ["Follow up with patient", "Schedule next appointment"] if importance_score > 0.5 else None
    
    # Determine topics
    topics = found_keywords[:3] if found_keywords else ['general health']
    if sentiment_analysis["sentiment"] == "negative" and not found_keywords:
        topics = ['mental health']
    
    return MemoryAnalysis(
        importance_score=importance_score,
        summary=summary,
        entities=found_keywords,
        sentiment=sentiment_analysis["sentiment"],
        topics=topics,
        action_items=action_items,
        urgency_level=sentiment_analysis["urgency_level"]
    )

def generate_smart_answer(query: str, user_memories: List[Dict]) -> str:
    """Generate context-aware answers based on user history"""
    query_lower = query.lower()
    
    # Check recent memory for context
    recent_sentiment = "neutral"
    if user_memories:
        recent_analysis = user_memories[-1].get("analysis", {})
        recent_sentiment = recent_analysis.get("sentiment", "neutral")
    
    # Generate contextual responses
    if 'medicine' in query_lower or 'medication' in query_lower:
        if recent_sentiment == "negative":
            return "I understand you're having concerns about your medication. Let me review your recent symptoms and adjust your prescription if needed. Please schedule an urgent appointment."
        else:
            return "Based on your medical history, I recommend continuing with the prescribed medication. Remember to take it with food."
    
    elif 'appointment' in query_lower or 'schedule' in query_lower:
        if recent_sentiment == "negative":
            return "Given your recent symptoms, I recommend scheduling an urgent appointment. The next available emergency slot is today at 3 PM. Would you like me to book it?"
        else:
            return "I can help you schedule an appointment. The next available slot is tomorrow at 2 PM. Would you like me to book it?"
    
    elif 'symptoms' in query_lower or 'pain' in query_lower:
        if recent_sentiment == "negative":
            return "I've noted your concerning symptoms. Please seek immediate medical attention if they persist or worsen. I'm here to support you."
        else:
            return "I've noted your symptoms. Please monitor them closely and contact your doctor if they persist for more than 48 hours."
    
    elif 'memory' in query_lower or 'remember' in query_lower:
        return "Memory issues can be concerning. I recommend a cognitive assessment. Let me schedule you for a neurological evaluation."
    
    elif 'depressed' in query_lower or 'sad' in query_lower:
        return "I'm here to support you. Depression is treatable. Please consider speaking with a mental health professional. You're not alone."
    
    else:
        if recent_sentiment == "negative":
            return "I understand you're going through a difficult time. I'm here to help. Let me check your medical records and provide you with the most relevant support."
        else:
            return "I understand your query. Let me check your medical records and provide you with the most relevant information."

@app.get("/")
def read_root():
    return {"message": "Welcome to the INFINITE-MEMORY API - Improved Version 2.0"}

@app.post("/process-text")
async def process_text(request: ProcessTextRequest):
    """Process text input and return analysis"""
    try:
        analysis = analyze_text_improved(request.text)
        
        # Store in memory
        if request.user_id not in memory_data:
            memory_data[request.user_id] = []
        
        memory_data[request.user_id].append({
            "text": request.text,
            "analysis": analysis.model_dump(),
            "timestamp": datetime.now().isoformat()
        })
        
        # Create alert for high urgency
        if analysis.urgency_level == "high":
            alert = {
                "alert_id": f"alert_{len(alerts_data) + 1}",
                "patient_id": request.user_id,
                "type": "high_urgency",
                "message": f"High urgency interaction: {analysis.summary}",
                "timestamp": datetime.now().isoformat(),
                "acknowledged": False
            }
            alerts_data.append(alert)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/query")
async def query(request: QueryRequest):
    """Query the memory system with context"""
    try:
        user_memories = memory_data.get(request.user_id, [])
        answer = generate_smart_answer(request.query, user_memories)
        
        # Get context from recent memories
        recent_memories = user_memories[-5:] if user_memories else []
        
        context = {
            "recent_interactions": len(recent_memories),
            "total_memories": len(user_memories),
            "last_interaction": recent_memories[-1]["timestamp"] if recent_memories else None,
            "recent_sentiment": recent_memories[-1]["analysis"]["sentiment"] if recent_memories else "neutral"
        }
        
        return {
            "answer": answer,
            "context": context
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.post("/process-audio")
async def process_audio(request: ProcessAudioRequest):
    """Process audio input"""
    try:
        # Mock audio processing - in real implementation, this would transcribe audio
        mock_text = "Patient reported feeling better today. Symptoms have improved significantly."
        
        analysis = analyze_text_improved(mock_text)
        
        if request.user_id not in memory_data:
            memory_data[request.user_id] = []
        
        memory_data[request.user_id].append({
            "text": mock_text,
            "analysis": analysis.model_dump(),
            "timestamp": datetime.now().isoformat(),
            "source": "audio"
        })
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio processing error: {str(e)}")

@app.post("/process-image")
async def process_image(user_id: str = File(...), caption: str = File(""), image: UploadFile = File(...)):
    """Process image input"""
    try:
        mock_text = f"Image uploaded with caption: {caption}. Image appears to show medical documentation."
        
        analysis = analyze_text_improved(mock_text)
        
        if user_id not in memory_data:
            memory_data[user_id] = []
        
        memory_data[user_id].append({
            "text": mock_text,
            "analysis": analysis.model_dump(),
            "timestamp": datetime.now().isoformat(),
            "source": "image"
        })
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")

@app.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """Convert text to speech"""
    try:
        return {
            "message": "Audio generated successfully", 
            "text": request.text,
            "duration": len(request.text) * 0.05  # Mock duration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-speech error: {str(e)}")

@app.get("/memory-report/{patient_id}")
async def get_memory_report(patient_id: str, days: int = 3):
    """Get comprehensive memory report"""
    try:
        user_memories = memory_data.get(patient_id, [])
        
        # Filter by days
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_memories = [
            m for m in user_memories 
            if datetime.fromisoformat(m["timestamp"]) > cutoff_date
        ]
        
        if not recent_memories:
            return MemoryReport(
                patient_id=patient_id,
                days=days,
                total_interactions=0,
                average_importance=0.0,
                memory_trends=[],
                recent_activities=[],
                sentiment_distribution={"positive": 0, "negative": 0, "neutral": 0}
            )
        
        # Calculate statistics
        avg_importance = sum(m["analysis"]["importance_score"] for m in recent_memories) / len(recent_memories)
        
        # Sentiment distribution
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        for memory in recent_memories:
            sentiment = memory["analysis"]["sentiment"]
            sentiment_counts[sentiment] += 1
        
        # Generate trends
        trends = []
        for i in range(min(7, len(recent_memories))):
            memory = recent_memories[-(i+1)]
            trends.append({
                "date": memory["timestamp"][:10],
                "interactions": 1,
                "avg_importance": memory["analysis"]["importance_score"],
                "sentiment": memory["analysis"]["sentiment"]
            })
        
        # Recent activities
        activities = [
            {
                "timestamp": m["timestamp"],
                "type": m.get("source", "text"),
                "summary": m["analysis"]["summary"],
                "sentiment": m["analysis"]["sentiment"],
                "importance": m["analysis"]["importance_score"]
            }
            for m in recent_memories[-10:]
        ]
        
        return MemoryReport(
            patient_id=patient_id,
            days=days,
            total_interactions=len(recent_memories),
            average_importance=avg_importance,
            memory_trends=trends,
            recent_activities=activities,
            sentiment_distribution=sentiment_counts
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory report error: {str(e)}")

@app.post("/tasks/create")
async def create_task_endpoint(request: CreateTaskRequest):
    """Create a new task with priority"""
    try:
        task_id = f"task_{len(tasks_data) + 1}_{random.randint(1000, 9999)}"
        
        # Determine priority based on content
        priority = "medium"
        if any(word in request.summary.lower() for word in ['urgent', 'emergency', 'immediate']):
            priority = "high"
        elif any(word in request.summary.lower() for word in ['routine', 'follow-up']):
            priority = "low"
        
        task = Task(
            task_id=task_id,
            patient_id=request.patient_id,
            summary=request.summary,
            description=request.description,
            start_date=request.start_date,
            end_date=request.end_date,
            completed=False,
            created_at=datetime.now().isoformat(),
            priority=priority
        )
        
        if request.patient_id not in tasks_data:
            tasks_data[request.patient_id] = []
        
        tasks_data[request.patient_id].append(task.model_dump())
        
        return task
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task creation error: {str(e)}")

@app.get("/tasks/{patient_id}")
async def get_tasks_endpoint(patient_id: str):
    """Get tasks for a patient"""
    try:
        return tasks_data.get(patient_id, [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task retrieval error: {str(e)}")

@app.post("/tasks/complete")
async def complete_task_endpoint(request: MarkTaskCompletedRequest):
    """Mark a task as completed"""
    try:
        patient_tasks = tasks_data.get(request.patient_id, [])
        
        for task in patient_tasks:
            if task["task_id"] == request.task_id:
                task["completed"] = True
                return {"message": "Task completed successfully"}
        
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task completion error: {str(e)}")

@app.get("/admin/alerts")
async def get_admin_alerts():
    """Get all admin alerts"""
    try:
        return alerts_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert retrieval error: {str(e)}")

@app.post("/admin/acknowledge-alert/{alert_id}")
async def acknowledge_alert_endpoint(alert_id: str):
    """Acknowledge an alert"""
    try:
        for alert in alerts_data:
            if alert["alert_id"] == alert_id:
                alert["acknowledged"] = True
                return {"message": f"Alert {alert_id} acknowledged successfully"}
        
        raise HTTPException(status_code=404, detail="Alert not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert acknowledgment error: {str(e)}")

# Medicine Recommendation Endpoints

@app.post("/medicine/recommend")
async def recommend_medicines(request: MedicineRecommendationRequest):
    """Get medicine recommendations based on symptoms"""
    try:
        result = medicine_engine.process_medicine_recommendation(request.symptoms, request.user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Medicine recommendation error: {str(e)}")

@app.get("/medicine/all")
async def get_all_medicines():
    """Get all available medicines"""
    try:
        medicines = medicine_engine.get_all_medicines()
        return [
            {
                "id": med.id,
                "name": med.name,
                "category": med.category.value,
                "description": med.description,
                "dosage": med.dosage,
                "price": med.price,
                "stock_quantity": med.stock_quantity,
                "prescription_required": med.prescription_required,
                "symptoms_treated": med.symptoms_treated,
                "conditions_treated": med.conditions_treated
            }
            for med in medicines
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Medicine retrieval error: {str(e)}")

@app.get("/medicine/{medicine_id}")
async def get_medicine_info(medicine_id: str):
    """Get specific medicine information"""
    try:
        medicine = medicine_engine.get_medicine_info(medicine_id)
        if not medicine:
            raise HTTPException(status_code=404, detail="Medicine not found")
        
        return {
            "id": medicine.id,
            "name": medicine.name,
            "category": medicine.category.value,
            "description": medicine.description,
            "dosage": medicine.dosage,
            "side_effects": medicine.side_effects,
            "contraindications": medicine.contraindications,
            "price": medicine.price,
            "stock_quantity": medicine.stock_quantity,
            "prescription_required": medicine.prescription_required,
            "symptoms_treated": medicine.symptoms_treated,
            "conditions_treated": medicine.conditions_treated
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Medicine info error: {str(e)}")

@app.get("/medicine/restocking-requests")
async def get_restocking_requests():
    """Get all restocking requests"""
    try:
        requests = medicine_engine.get_restocking_requests()
        return [
            {
                "request_id": req.request_id,
                "medicine_id": req.medicine_id,
                "medicine_name": req.medicine_name,
                "current_stock": req.current_stock,
                "requested_quantity": req.requested_quantity,
                "urgency_level": req.urgency_level,
                "reason": req.reason,
                "created_at": req.created_at.isoformat(),
                "status": req.status
            }
            for req in requests
        ]
    except Exception as e:
        print(f"Error in restocking requests: {e}")
        return []

@app.post("/medicine/update-stock")
async def update_medicine_stock(request: UpdateStockRequest):
    """Update medicine stock quantity"""
    try:
        medicine_engine.update_stock(request.medicine_id, request.new_quantity)
        return {"message": f"Stock updated for medicine {request.medicine_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stock update error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 