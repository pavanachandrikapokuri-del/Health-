from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

# --- Pydantic Schemas for API, Authentication & Verification ---

class LoginPayload(BaseModel):
    identifier: str  # email or phone
    password: Optional[str] = "password123"

class RegisterPayload(BaseModel):
    name: str
    identifier: str  # email or phone
    password: Optional[str] = "password123"
    blood_group: Optional[str] = "O+"
    dob: Optional[str] = "1995-01-01"
    gender: Optional[str] = "Male"

class ChatPayload(BaseModel):
    query: str
    language: Optional[str] = "en"

class MedicationSchema(BaseModel):
    id: Optional[int] = None
    medicine_name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    verification_status: Optional[str] = "Unverified"
    confidence: Optional[str] = "High"

class LabResultSchema(BaseModel):
    id: Optional[int] = None
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: Optional[str] = "Normal"  # Normal, High, Low, Critical, Unknown
    test_date: Optional[str] = None
    verification_status: Optional[str] = "Unverified"
    confidence: Optional[str] = "High"

class DiagnosisSchema(BaseModel):
    id: Optional[int] = None
    diagnosis_name: str
    diagnosis_date: Optional[str] = None
    verification_status: Optional[str] = "Unverified"

class HealthSummarySchema(BaseModel):
    document_contains: str
    key_findings: List[str] = []
    abnormal_values: List[str] = []
    medications_summary: List[str] = []
    what_this_may_mean: str
    suggested_next_steps: str
    warnings: List[str] = []

# --- STAGE 1: FACT EXTRACTION SCHEMAS ---
class Stage1ExtractionSchema(BaseModel):
    document_type: str = "Other"  # Prescription, Lab Report, Diagnostic Report, Discharge Summary, Medical Record, Other
    document_date: Optional[str] = None
    patient_name: Optional[str] = None
    patient_age: Optional[str] = None
    patient_gender: Optional[str] = None
    patient_id: Optional[str] = None
    blood_group: Optional[str] = None
    medications: List[MedicationSchema] = []
    lab_results: List[LabResultSchema] = []
    diagnoses: List[DiagnosisSchema] = []
    summary: Optional[HealthSummarySchema] = None
    confidence: float = 0.85

# --- STAGE 2: HEALTH COPILOT INTELLIGENCE SCHEMAS ---
class KeyInsightSchema(BaseModel):
    title: str
    severity: str = "informational"  # high, moderate, informational, unknown
    explanation: str
    why_it_matters: str
    source_document_id: Optional[str] = None
    source_filename: Optional[str] = None

class AbnormalFindingSchema(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = ""
    reference_range: Optional[str] = ""
    severity: str = "moderate"  # high, moderate, informational, unknown
    what_report_says: str
    what_this_means: str
    why_it_can_matter: str
    what_this_does_not_mean: str
    what_to_discuss: str
    source_document_id: Optional[str] = None
    source_filename: Optional[str] = None

class MultifactorPatternSchema(BaseModel):
    pattern_name: str
    findings_involved: List[str] = []
    pattern_explanation: str
    clinical_caution: str

class TrendItemSchema(BaseModel):
    test_name: str
    direction: str = "stable"  # improving, increasing, decreasing, stable, unknown
    change: str = ""
    history_points: List[dict] = []
    interpretation: str

class MedicationInsightSchema(BaseModel):
    medicine_name: str
    strength: Optional[str] = ""
    schedule: Optional[str] = ""
    instruction: Optional[str] = ""
    copilot_interpretation: str
    source_document_id: Optional[str] = None
    source_filename: Optional[str] = None

class HealthCopilotIntelligenceSchema(BaseModel):
    overall_summary: str
    key_insights: List[KeyInsightSchema] = []
    abnormal_findings: List[AbnormalFindingSchema] = []
    multifactor_patterns: List[MultifactorPatternSchema] = []
    trends: List[TrendItemSchema] = []
    medication_insights: List[MedicationInsightSchema] = []
    questions_for_doctor: List[str] = []
    missing_information: List[str] = []
    verification_items: List[str] = []
    safety_note: str = "Altrix HealthCopilot provides informative analysis only and does not provide a medical diagnosis or treatment plan. Always consult a qualified healthcare professional."

GroqMedicalExtractionSchema = Stage1ExtractionSchema

class DocumentOut(BaseModel):
    id: int
    user_id: int
    filename: str
    original_filename: str
    file_type: str
    file_path: str
    upload_date: datetime
    document_type: str
    processing_status: str
    ocr_text: Optional[str] = None
    confidence: float
    medications: List[MedicationSchema] = []
    lab_results: List[LabResultSchema] = []
    diagnoses: List[DiagnosisSchema] = []
    summary: Optional[dict] = None
    stage2_intelligence: Optional[Any] = None

    class Config:
        from_attributes = True

class TimelineEventOut(BaseModel):
    id: int
    user_id: int
    document_id: Optional[int] = None
    event_type: str
    event_date: str
    title: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    abha_id: Optional[str] = None
    blood_group: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None

    class Config:
        from_attributes = True

class VerificationPayload(BaseModel):
    document_type: Optional[str] = None
    medications: List[MedicationSchema] = []
    lab_results: List[LabResultSchema] = []
    diagnoses: List[DiagnosisSchema] = []

class TranslationRequest(BaseModel):
    text: str
    target_language: str = "te"

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str

class AbhaProfileOut(BaseModel):
    abha_id: str
    name: str
    gender: str
    dob: str
    mobile: str
    status: str
    fhir_resources: dict

