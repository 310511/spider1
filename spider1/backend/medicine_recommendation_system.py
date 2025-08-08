#!/usr/bin/env python3
"""
Medicine Recommendation System
- AI-powered medicine recommendations based on symptoms
- Automatic restocking requests when medicines are out of stock
- Integration with Infinite Memory system
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class MedicineCategory(Enum):
    PAIN_RELIEF = "pain_relief"
    ANTI_DEPRESSANT = "anti_depressant"
    ANTI_ANXIETY = "anti_anxiety"
    SLEEP_AID = "sleep_aid"
    ANTI_INFLAMMATORY = "anti_inflammatory"
    ANTIBIOTIC = "antibiotic"
    VITAMIN = "vitamin"
    SUPPLEMENT = "supplement"
    PRESCRIPTION = "prescription"

@dataclass
class Medicine:
    id: str
    name: str
    category: MedicineCategory
    description: str
    dosage: str
    side_effects: List[str]
    contraindications: List[str]
    price: float
    stock_quantity: int
    min_stock_level: int
    prescription_required: bool
    symptoms_treated: List[str]
    conditions_treated: List[str]

@dataclass
class MedicineRecommendation:
    medicine: Medicine
    confidence_score: float
    reasoning: str
    dosage_instructions: str
    warnings: List[str]
    alternative_medicines: List[Medicine]

@dataclass
class RestockingRequest:
    request_id: str
    medicine_id: str
    medicine_name: str
    current_stock: int
    requested_quantity: int
    urgency_level: str
    reason: str
    created_at: datetime
    status: str = "pending"

class MedicineRecommendationEngine:
    def __init__(self):
        self.medicines = self._initialize_medicines()
        self.restocking_requests = []
        self.symptom_keywords = self._initialize_symptom_keywords()
        
    def _initialize_medicines(self) -> Dict[str, Medicine]:
        """Initialize the medicine database"""
        medicines_data = {
            # Pain Relief
            "paracetamol": Medicine(
                id="paracetamol",
                name="Paracetamol",
                category=MedicineCategory.PAIN_RELIEF,
                description="Pain reliever and fever reducer",
                dosage="500-1000mg every 4-6 hours",
                side_effects=["Nausea", "Liver problems in high doses"],
                contraindications=["Liver disease", "Alcohol abuse"],
                price=5.99,
                stock_quantity=150,
                min_stock_level=50,
                prescription_required=False,
                symptoms_treated=["headache", "fever", "pain", "body aches"],
                conditions_treated=["migraine", "arthritis", "fever"]
            ),
            "ibuprofen": Medicine(
                id="ibuprofen",
                name="Ibuprofen",
                category=MedicineCategory.PAIN_RELIEF,
                description="Anti-inflammatory pain reliever",
                dosage="200-400mg every 4-6 hours",
                side_effects=["Stomach upset", "Increased bleeding risk"],
                contraindications=["Stomach ulcers", "Kidney problems"],
                price=7.99,
                stock_quantity=120,
                min_stock_level=40,
                prescription_required=False,
                symptoms_treated=["pain", "inflammation", "swelling", "fever"],
                conditions_treated=["arthritis", "sprains", "dental pain"]
            ),
            
            # Mental Health
            "sertraline": Medicine(
                id="sertraline",
                name="Sertraline",
                category=MedicineCategory.ANTI_DEPRESSANT,
                description="Selective serotonin reuptake inhibitor for depression",
                dosage="50-200mg daily",
                side_effects=["Nausea", "Insomnia", "Sexual dysfunction"],
                contraindications=["Bipolar disorder", "Pregnancy"],
                price=45.99,
                stock_quantity=30,
                min_stock_level=20,
                prescription_required=True,
                symptoms_treated=["depression", "anxiety", "panic attacks", "obsessive thoughts"],
                conditions_treated=["major depressive disorder", "panic disorder", "ocd"]
            ),
            "alprazolam": Medicine(
                id="alprazolam",
                name="Alprazolam",
                category=MedicineCategory.ANTI_ANXIETY,
                description="Benzodiazepine for anxiety and panic disorders",
                dosage="0.25-2mg three times daily",
                side_effects=["Drowsiness", "Dependency", "Memory problems"],
                contraindications=["Respiratory depression", "Pregnancy"],
                price=38.99,
                stock_quantity=25,
                min_stock_level=15,
                prescription_required=True,
                symptoms_treated=["anxiety", "panic", "insomnia", "muscle tension"],
                conditions_treated=["generalized anxiety disorder", "panic disorder"]
            ),
            
            # Sleep Aids
            "melatonin": Medicine(
                id="melatonin",
                name="Melatonin",
                category=MedicineCategory.SLEEP_AID,
                description="Natural sleep hormone supplement",
                dosage="1-5mg 30 minutes before bedtime",
                side_effects=["Drowsiness", "Vivid dreams"],
                contraindications=["Autoimmune disorders"],
                price=12.99,
                stock_quantity=80,
                min_stock_level=30,
                prescription_required=False,
                symptoms_treated=["insomnia", "jet lag", "sleep problems"],
                conditions_treated=["sleep disorders", "circadian rhythm disorders"]
            ),
            
            # Vitamins and Supplements
            "vitamin_d": Medicine(
                id="vitamin_d",
                name="Vitamin D3",
                category=MedicineCategory.VITAMIN,
                description="Essential vitamin for bone health and immunity",
                dosage="1000-4000 IU daily",
                side_effects=["Nausea in high doses"],
                contraindications=["Hypercalcemia"],
                price=15.99,
                stock_quantity=200,
                min_stock_level=50,
                prescription_required=False,
                symptoms_treated=["fatigue", "bone pain", "weakness"],
                conditions_treated=["vitamin d deficiency", "osteoporosis"]
            ),
            "omega_3": Medicine(
                id="omega_3",
                name="Omega-3 Fatty Acids",
                category=MedicineCategory.SUPPLEMENT,
                description="Essential fatty acids for heart and brain health",
                dosage="1000-2000mg daily",
                side_effects=["Fishy burps", "Stomach upset"],
                contraindications=["Bleeding disorders"],
                price=22.99,
                stock_quantity=90,
                min_stock_level=30,
                prescription_required=False,
                symptoms_treated=["inflammation", "joint pain", "brain fog"],
                conditions_treated=["heart disease", "arthritis", "depression"]
            ),
            
            # Anti-inflammatory
            "naproxen": Medicine(
                id="naproxen",
                name="Naproxen",
                category=MedicineCategory.ANTI_INFLAMMATORY,
                description="Non-steroidal anti-inflammatory drug",
                dosage="250-500mg twice daily",
                side_effects=["Stomach upset", "Increased bleeding risk"],
                contraindications=["Stomach ulcers", "Kidney problems"],
                price=9.99,
                stock_quantity=60,
                min_stock_level=25,
                prescription_required=False,
                symptoms_treated=["pain", "inflammation", "swelling", "fever"],
                conditions_treated=["arthritis", "menstrual cramps", "gout"]
            )
        }
        return medicines_data
    
    def _initialize_symptom_keywords(self) -> Dict[str, List[str]]:
        """Initialize symptom keywords for medicine matching"""
        return {
            "pain": ["pain", "ache", "hurt", "sore", "tender", "throbbing", "sharp pain"],
            "headache": ["headache", "migraine", "head pain", "tension headache"],
            "depression": ["depression", "depressed", "sad", "hopeless", "worthless", "suicidal", "kill myself", "want to die", "feeling down", "low mood"],
            "anxiety": ["anxiety", "anxious", "panic", "worried", "nervous", "fear", "scared", "terrified", "stress", "tense"],
            "insomnia": ["insomnia", "can't sleep", "sleepless", "tired", "exhausted", "restless"],
            "inflammation": ["inflammation", "swelling", "redness", "heat", "tender"],
            "fever": ["fever", "hot", "temperature", "chills", "sweating"],
            "fatigue": ["fatigue", "tired", "exhausted", "weak", "lethargic"],
            "memory": ["memory", "forget", "confused", "brain fog", "cognitive"],
            "joint_pain": ["joint pain", "arthritis", "stiffness", "creaking"],
            "stomach": ["stomach", "nausea", "vomit", "indigestion", "bloating", "dizzy", "dizziness", "vertigo"],
            "stress": ["stress", "overwhelmed", "burnout", "tension", "pressure"],
            "dizziness": ["dizzy", "dizziness", "vertigo", "lightheaded", "unsteady", "spinning"],
            "nausea": ["nausea", "nauseous", "sick", "queasy", "upset stomach"],
            "cough": ["cough", "coughing", "chest congestion", "phlegm"],
            "cold": ["cold", "runny nose", "congestion", "sneezing", "sore throat"],
            "flu": ["flu", "influenza", "body aches", "chills", "fever"],
            "allergy": ["allergy", "allergic", "sneezing", "itchy", "rash"],
            "back_pain": ["back pain", "lower back", "spine", "disc"],
            "chest_pain": ["chest pain", "heart", "breathing", "shortness of breath"],
            "muscle_pain": ["muscle pain", "muscle ache", "cramp", "spasm"],
            "eye_problems": ["eye pain", "blurred vision", "red eyes", "dry eyes"],
            "ear_problems": ["ear pain", "earache", "ringing", "hearing"],
            "skin_problems": ["rash", "itching", "hives", "acne", "eczema"],
            "digestive": ["indigestion", "heartburn", "acid reflux", "constipation", "diarrhea"]
        }
    
    def analyze_symptoms(self, text: str) -> Dict[str, float]:
        """Analyze text for symptoms and return confidence scores"""
        text_lower = text.lower()
        symptom_scores = {}
        
        for symptom, keywords in self.symptom_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
            if score > 0:
                symptom_scores[symptom] = min(1.0, score / len(keywords))
        
        return symptom_scores
    
    def recommend_medicines(self, symptoms: Dict[str, float], patient_history: List[Dict] = None) -> List[MedicineRecommendation]:
        """Recommend medicines based on symptoms and patient history"""
        recommendations = []
        
        # Check for mental health concerns (high priority)
        if symptoms.get("depression", 0) > 0.05 or symptoms.get("anxiety", 0) > 0.05:
            if symptoms.get("depression", 0) > symptoms.get("anxiety", 0):
                medicine = self.medicines["sertraline"]
                recommendations.append(MedicineRecommendation(
                    medicine=medicine,
                    confidence_score=min(0.9, symptoms["depression"] * 3),  # Boost confidence
                    reasoning="Depression symptoms detected. Sertraline is an effective SSRI for treating depression.",
                    dosage_instructions="Start with 50mg daily, may increase to 100-200mg based on response",
                    warnings=["Requires prescription", "May take 2-4 weeks to see full effect", "Monitor for suicidal thoughts"],
                    alternative_medicines=[self.medicines["alprazolam"]]
                ))
            else:
                medicine = self.medicines["alprazolam"]
                recommendations.append(MedicineRecommendation(
                    medicine=medicine,
                    confidence_score=min(0.9, symptoms["anxiety"] * 3),  # Boost confidence
                    reasoning="Anxiety symptoms detected. Alprazolam provides rapid relief for anxiety and panic.",
                    dosage_instructions="0.25-0.5mg three times daily as needed",
                    warnings=["Requires prescription", "Risk of dependency", "May cause drowsiness"],
                    alternative_medicines=[self.medicines["sertraline"]]
                ))
        
        # Check for sleep problems
        if symptoms.get("insomnia", 0) > 0.1:
            medicine = self.medicines["melatonin"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.8, symptoms["insomnia"] * 3),  # Boost confidence
                reasoning="Sleep problems detected. Melatonin is a natural sleep aid.",
                dosage_instructions="1-3mg 30 minutes before bedtime",
                warnings=["May cause drowsiness", "Avoid driving after taking"],
                alternative_medicines=[]
            ))
        
        # Check for pain
        if symptoms.get("pain", 0) > 0.1 or symptoms.get("headache", 0) > 0.1:
            if symptoms.get("inflammation", 0) > 0.1:
                medicine = self.medicines["ibuprofen"]
                recommendations.append(MedicineRecommendation(
                    medicine=medicine,
                    confidence_score=min(0.85, max(symptoms.get("pain", 0), symptoms.get("headache", 0)) * 3),
                    reasoning="Pain with inflammation detected. Ibuprofen provides both pain relief and anti-inflammatory effects.",
                    dosage_instructions="200-400mg every 4-6 hours with food",
                    warnings=["May cause stomach upset", "Avoid if you have ulcers"],
                    alternative_medicines=[self.medicines["paracetamol"], self.medicines["naproxen"]]
                ))
            else:
                medicine = self.medicines["paracetamol"]
                recommendations.append(MedicineRecommendation(
                    medicine=medicine,
                    confidence_score=min(0.8, max(symptoms.get("pain", 0), symptoms.get("headache", 0)) * 3),
                    reasoning="Pain symptoms detected. Paracetamol is effective for pain and fever.",
                    dosage_instructions="500-1000mg every 4-6 hours",
                    warnings=["Avoid alcohol", "Don't exceed 4000mg daily"],
                    alternative_medicines=[self.medicines["ibuprofen"]]
                ))
        
        # Check for fatigue and general health
        if symptoms.get("fatigue", 0) > 0.1:
            medicine = self.medicines["vitamin_d"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.7, symptoms["fatigue"] * 3),  # Boost confidence
                reasoning="Fatigue detected. Vitamin D deficiency is common and can cause fatigue.",
                dosage_instructions="1000-2000 IU daily with food",
                warnings=["Take with food for better absorption"],
                alternative_medicines=[self.medicines["omega_3"]]
            ))
        
        # Check for inflammation
        if symptoms.get("inflammation", 0) > 0.1:
            medicine = self.medicines["naproxen"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.8, symptoms["inflammation"] * 3),  # Boost confidence
                reasoning="Inflammation detected. Naproxen is effective for inflammatory conditions.",
                dosage_instructions="250-500mg twice daily with food",
                warnings=["May cause stomach upset", "Avoid if you have ulcers"],
                alternative_medicines=[self.medicines["ibuprofen"]]
            ))
        
        # Check for dizziness and nausea
        if symptoms.get("dizziness", 0) > 0.1 or symptoms.get("nausea", 0) > 0.1:
            if symptoms.get("dizziness", 0) > symptoms.get("nausea", 0):
                medicine = self.medicines["paracetamol"]  # Can help with dizziness from pain
                recommendations.append(MedicineRecommendation(
                    medicine=medicine,
                    confidence_score=min(0.7, symptoms["dizziness"] * 3),
                    reasoning="Dizziness detected. This could be due to various causes. Paracetamol may help if related to pain or fever.",
                    dosage_instructions="500-1000mg every 4-6 hours",
                    warnings=["Avoid alcohol", "Don't exceed 4000mg daily", "Seek medical attention if dizziness persists"],
                    alternative_medicines=[self.medicines["ibuprofen"]]
                ))
            else:
                # For nausea, recommend rest and hydration, but could suggest anti-nausea if available
                medicine = self.medicines["paracetamol"]  # Can help with nausea from fever
                recommendations.append(MedicineRecommendation(
                    medicine=medicine,
                    confidence_score=min(0.6, symptoms["nausea"] * 3),
                    reasoning="Nausea detected. This could be due to various causes. Rest and hydration are important.",
                    dosage_instructions="500-1000mg every 4-6 hours if fever present",
                    warnings=["Avoid alcohol", "Don't exceed 4000mg daily", "Seek medical attention if nausea persists"],
                    alternative_medicines=[self.medicines["ibuprofen"]]
                ))
        
        # Check for cold and flu symptoms
        if symptoms.get("cold", 0) > 0.1 or symptoms.get("flu", 0) > 0.1:
            medicine = self.medicines["paracetamol"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.8, max(symptoms.get("cold", 0), symptoms.get("flu", 0)) * 3),
                reasoning="Cold or flu symptoms detected. Paracetamol helps with fever and body aches.",
                dosage_instructions="500-1000mg every 4-6 hours",
                warnings=["Avoid alcohol", "Don't exceed 4000mg daily", "Rest and stay hydrated"],
                alternative_medicines=[self.medicines["ibuprofen"]]
            ))
        
        # Check for cough
        if symptoms.get("cough", 0) > 0.1:
            medicine = self.medicines["paracetamol"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.7, symptoms["cough"] * 3),
                reasoning="Cough detected. Paracetamol can help with fever and pain associated with cough.",
                dosage_instructions="500-1000mg every 4-6 hours",
                warnings=["Avoid alcohol", "Don't exceed 4000mg daily", "Consider honey for cough relief"],
                alternative_medicines=[self.medicines["ibuprofen"]]
            ))
        
        # Check for digestive issues
        if symptoms.get("digestive", 0) > 0.1:
            medicine = self.medicines["vitamin_d"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.6, symptoms["digestive"] * 3),
                reasoning="Digestive issues detected. Vitamin D can help with overall health and immune function.",
                dosage_instructions="1000-2000 IU daily with food",
                warnings=["Take with food for better absorption"],
                alternative_medicines=[self.medicines["omega_3"]]
            ))
        
        # Check for skin problems
        if symptoms.get("skin_problems", 0) > 0.1:
            medicine = self.medicines["omega_3"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.6, symptoms["skin_problems"] * 3),
                reasoning="Skin problems detected. Omega-3 fatty acids can help with skin health and inflammation.",
                dosage_instructions="1000-2000mg daily",
                warnings=["May cause fishy burps", "Take with food"],
                alternative_medicines=[self.medicines["vitamin_d"]]
            ))
        
        # Check for muscle pain
        if symptoms.get("muscle_pain", 0) > 0.1:
            medicine = self.medicines["ibuprofen"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.8, symptoms["muscle_pain"] * 3),
                reasoning="Muscle pain detected. Ibuprofen is effective for muscle pain and inflammation.",
                dosage_instructions="200-400mg every 4-6 hours with food",
                warnings=["May cause stomach upset", "Avoid if you have ulcers"],
                alternative_medicines=[self.medicines["paracetamol"], self.medicines["naproxen"]]
            ))
        
        # Check for back pain
        if symptoms.get("back_pain", 0) > 0.1:
            medicine = self.medicines["naproxen"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=min(0.8, symptoms["back_pain"] * 3),
                reasoning="Back pain detected. Naproxen is effective for back pain and inflammation.",
                dosage_instructions="250-500mg twice daily with food",
                warnings=["May cause stomach upset", "Avoid if you have ulcers"],
                alternative_medicines=[self.medicines["ibuprofen"]]
            ))
        
        # If no specific symptoms detected, recommend general pain relief for any pain-related symptoms
        if not recommendations and (symptoms.get("pain", 0) > 0.05 or symptoms.get("headache", 0) > 0.05):
            medicine = self.medicines["paracetamol"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=0.6,
                reasoning="General pain symptoms detected. Paracetamol is a safe and effective pain reliever.",
                dosage_instructions="500-1000mg every 4-6 hours",
                warnings=["Avoid alcohol", "Don't exceed 4000mg daily"],
                alternative_medicines=[self.medicines["ibuprofen"]]
            ))
        
        # If still no recommendations, suggest vitamin D for general health
        if not recommendations:
            medicine = self.medicines["vitamin_d"]
            recommendations.append(MedicineRecommendation(
                medicine=medicine,
                confidence_score=0.5,
                reasoning="General health support. Vitamin D is important for overall health and immune function.",
                dosage_instructions="1000-2000 IU daily with food",
                warnings=["Take with food for better absorption"],
                alternative_medicines=[self.medicines["omega_3"]]
            ))
        
        return recommendations
    
    def check_stock_and_create_restocking_request(self, medicine_id: str) -> Optional[RestockingRequest]:
        """Check if medicine is low in stock and create restocking request"""
        medicine = self.medicines.get(medicine_id)
        if not medicine:
            return None
        
        if medicine.stock_quantity <= medicine.min_stock_level:
            request = RestockingRequest(
                request_id=f"restock_{medicine_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                medicine_id=medicine_id,
                medicine_name=medicine.name,
                current_stock=medicine.stock_quantity,
                requested_quantity=medicine.min_stock_level * 3,  # Request 3x minimum stock
                urgency_level="high" if medicine.stock_quantity == 0 else "medium",
                reason=f"Stock level ({medicine.stock_quantity}) below minimum ({medicine.min_stock_level})",
                created_at=datetime.now()
            )
            self.restocking_requests.append(request)
            return request
        return None
    
    def get_medicine_info(self, medicine_id: str) -> Optional[Medicine]:
        """Get medicine information by ID"""
        return self.medicines.get(medicine_id)
    
    def get_all_medicines(self) -> List[Medicine]:
        """Get all medicines"""
        return list(self.medicines.values())
    
    def get_restocking_requests(self) -> List[RestockingRequest]:
        """Get all restocking requests"""
        return self.restocking_requests
    
    def update_stock(self, medicine_id: str, quantity: int):
        """Update medicine stock quantity"""
        if medicine_id in self.medicines:
            self.medicines[medicine_id].stock_quantity = max(0, quantity)
    
    def process_medicine_recommendation(self, text: str, patient_id: str = None) -> Dict:
        """Process text and return medicine recommendations with restocking requests"""
        # Analyze symptoms
        symptoms = self.analyze_symptoms(text)
        
        # Get recommendations
        recommendations = self.recommend_medicines(symptoms)
        
        # Check stock levels and create restocking requests
        restocking_requests = []
        for rec in recommendations:
            restock_request = self.check_stock_and_create_restocking_request(rec.medicine.id)
            if restock_request:
                restocking_requests.append(restock_request)
        
        # Format recommendations for API response
        formatted_recommendations = []
        for rec in recommendations:
            formatted_rec = {
                "medicine_id": rec.medicine.id,
                "medicine_name": rec.medicine.name,
                "category": rec.medicine.category.value,
                "description": rec.medicine.description,
                "dosage": rec.medicine.dosage,
                "confidence_score": rec.confidence_score,
                "reasoning": rec.reasoning,
                "dosage_instructions": rec.dosage_instructions,
                "warnings": rec.warnings,
                "stock_quantity": rec.medicine.stock_quantity,
                "price": rec.medicine.price,
                "prescription_required": rec.medicine.prescription_required,
                "alternative_medicines": [med.name for med in rec.alternative_medicines]
            }
            formatted_recommendations.append(formatted_rec)
        
        return {
            "symptoms_detected": symptoms,
            "recommendations": formatted_recommendations,
            "restocking_requests": [
                {
                    "request_id": req.request_id,
                    "medicine_name": req.medicine_name,
                    "current_stock": req.current_stock,
                    "requested_quantity": req.requested_quantity,
                    "urgency_level": req.urgency_level,
                    "reason": req.reason,
                    "created_at": req.created_at.isoformat(),
                    "status": req.status
                }
                for req in restocking_requests
            ],
            "total_recommendations": len(formatted_recommendations),
            "total_restocking_requests": len(restocking_requests)
        }

# Global instance
medicine_engine = MedicineRecommendationEngine() 