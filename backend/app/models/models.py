from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base

class ProcessingStatus(str, enum.Enum):
    UPLOADED = "Uploaded"
    PROCESSING = "Processing"
    OCR_COMPLETED = "OCR Completed"
    AI_ANALYSIS = "AI Analysis"
    REVIEW_REQUIRED = "Review Required"
    COMPLETED = "Completed"
    FAILED = "Failed"

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "Unverified"
    VERIFIED = "Verified"
    REJECTED = "Rejected"

class DocumentType(str, enum.Enum):
    PRESCRIPTION = "Prescription"
    LAB_REPORT = "Lab Report"
    DIAGNOSTIC_REPORT = "Diagnostic Report"
    DISCHARGE_SUMMARY = "Discharge Summary"
    MEDICAL_RECORD = "Medical Record"
    OTHER = "Other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    password = Column(String(100), nullable=True)
    abha_id = Column(String(50), nullable=True)
    blood_group = Column(String(10), nullable=True, default="O+")
    dob = Column(String(20), nullable=True, default="1995-01-01")
    gender = Column(String(20), nullable=True, default="Male")
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_path = Column(String(500), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    document_type = Column(String(50), default=DocumentType.OTHER)
    processing_status = Column(String(50), default=ProcessingStatus.UPLOADED)
    ocr_text = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    stage2_intelligence = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")
    medications = relationship("Medication", back_populates="document", cascade="all, delete-orphan")
    lab_results = relationship("LabResult", back_populates="document", cascade="all, delete-orphan")
    diagnoses = relationship("Diagnosis", back_populates="document", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="document", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="document", cascade="all, delete-orphan")

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    medicine_name = Column(String(200), nullable=False)
    generic_name = Column(String(200), nullable=True)
    strength = Column(String(50), nullable=True)
    dosage = Column(String(50), nullable=True)
    frequency = Column(String(100), nullable=True)
    route = Column(String(50), nullable=True)
    duration = Column(String(50), nullable=True)
    instructions = Column(Text, nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    verification_status = Column(String(30), default=VerificationStatus.UNVERIFIED)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="medications")

class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    test_name = Column(String(200), nullable=False)
    value = Column(String(50), nullable=False)
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)
    status = Column(String(30), default="Normal") # Normal, High, Low, Critical, Unknown
    test_date = Column(String(50), nullable=True)
    verification_status = Column(String(30), default=VerificationStatus.UNVERIFIED)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="lab_results")

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    diagnosis_name = Column(String(250), nullable=False)
    diagnosis_date = Column(String(50), nullable=True)
    verification_status = Column(String(30), default=VerificationStatus.UNVERIFIED)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="diagnoses")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    event_type = Column(String(50), nullable=False)
    event_date = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="timeline_events")
    document = relationship("Document", back_populates="timeline_events")

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    summary_text = Column(Text, nullable=False)
    key_findings = Column(Text, nullable=True)
    abnormal_explanation = Column(Text, nullable=True)
    plain_language_meaning = Column(Text, nullable=True)
    suggested_next_steps = Column(Text, nullable=True)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="summaries")
