import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db, Base, engine
from app.models.models import User, Document, Medication, LabResult, Diagnosis, TimelineEvent, Summary, ProcessingStatus, VerificationStatus
from app.schemas.schemas import (
    DocumentOut, MedicationSchema, LabResultSchema, DiagnosisSchema,
    VerificationPayload, TranslationRequest, TranslationResponse, AbhaProfileOut, TimelineEventOut, UserOut,
    HealthCopilotIntelligenceSchema
)
from app.services.storage import get_storage_service
from app.services.ocr import OCRService
from app.services.ai_extractor import GroqAIExtractor
from app.services.translator import TranslationService

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

def _migrate_db():
    try:
        import sqlite3
        db_path = os.path.join(os.path.dirname(__file__), "..", "..", "health_copilot.db")
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(documents)")
            cols = [c[1] for c in cursor.fetchall()]
            if cols and "stage2_intelligence" not in cols:
                cursor.execute("ALTER TABLE documents ADD COLUMN stage2_intelligence TEXT")
                conn.commit()
            conn.close()
    except Exception as e:
        print(f"[Migration] Error during DB migration: {e}")

_migrate_db()

router = APIRouter(prefix="/api")

# --- Initialize default user if empty ---
def ensure_default_user(db: Session) -> User:
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(
            id=1,
            name="Rahul Sharma",
            email="rahul.sharma@altrixlabs.ai",
            abha_id="91-4820-1129-9384",
            blood_group="O+",
            dob="1992-06-15",
            gender="Male"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# --- Auth & User Login Endpoints ---
@router.post("/auth/register", response_model=UserOut)
def register_user(payload: dict, db: Session = Depends(get_db)):
    name = payload.get("name", "User").strip()
    identifier = payload.get("identifier", "").strip()
    password = payload.get("password", "password123").strip()
    
    if not name or not identifier:
        raise HTTPException(status_code=400, detail="Name and Email or Phone are required.")

    existing = db.query(User).filter((User.email == identifier) | (User.phone == identifier)).first()
    if existing:
        return existing

    import random
    mock_abha = f"91-{random.randint(1000,9999)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}"
    
    is_email = "@" in identifier
    new_user = User(
        name=name,
        email=identifier if is_email else f"{name.lower().replace(' ', '')}@altrixlabs.ai",
        phone=identifier if not is_email else "+91 9876543210",
        password=password,
        abha_id=mock_abha,
        blood_group=payload.get("blood_group", "O+"),
        dob=payload.get("dob", "1995-01-01"),
        gender=payload.get("gender", "Male")
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/auth/login", response_model=UserOut)
def login_user(payload: dict, db: Session = Depends(get_db)):
    identifier = payload.get("identifier", "").strip()
    password = payload.get("password", "").strip()
    name = payload.get("name", "").strip()

    if not identifier:
        raise HTTPException(status_code=400, detail="Email or Phone is required.")

    user = db.query(User).filter((User.email == identifier) | (User.phone == identifier)).first()
    if not user:
        import random
        mock_abha = f"91-{random.randint(1000,9999)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}"
        is_email = "@" in identifier
        user = User(
            name=name if name else (identifier.split("@")[0].capitalize() if is_email else "User"),
            email=identifier if is_email else f"user_{identifier}@altrixlabs.ai",
            phone=identifier if not is_email else "+91 9876543210",
            password=password,
            abha_id=mock_abha,
            blood_group="O+",
            dob="1995-01-01",
            gender="Male"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user

# --- Reset / Wipe All Data Endpoint ---
@router.post("/data/reset")
def reset_all_data(db: Session = Depends(get_db)):
    db.query(Medication).delete()
    db.query(LabResult).delete()
    db.query(Diagnosis).delete()
    db.query(Summary).delete()
    db.query(TimelineEvent).delete()
    db.query(Document).delete()
    db.commit()
    return {"status": "success", "message": "All database records successfully deleted. System is clean."}

# --- Health Check ---
@router.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat(), "service": "Altrix Labs AI Health Copilot API"}

# --- Document Upload ---
@router.post("/documents/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    target_user = None
    if user_id:
        target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        target_user = ensure_default_user(db)
    
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = [".pdf", ".jpg", ".jpeg", ".png"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, JPG, JPEG, PNG."
        )

    file_bytes = await file.read()
    if len(file_bytes) > 15 * 1024 * 1024:  # 15MB limit
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 15MB limit."
        )

    storage_service = get_storage_service()
    storage_path = storage_service.save_file(file_bytes, filename)

    doc = Document(
        user_id=target_user.id,
        filename=os.path.basename(storage_path),
        original_filename=filename,
        file_type=file.content_type or f"application/{ext.replace('.', '')}",
        file_path=storage_path,
        upload_date=datetime.utcnow(),
        document_type="Other",
        processing_status=ProcessingStatus.UPLOADED,
        confidence=0.0
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc

# --- Helper: Convert document object to JSON dict for history ---
def _doc_to_history_dict(doc: Document) -> dict:
    return {
        "id": doc.id,
        "original_filename": doc.original_filename,
        "document_type": doc.document_type,
        "document_date": doc.upload_date.strftime("%Y-%m-%d") if doc.upload_date else "",
        "medications": [
            {
                "medicine_name": m.medicine_name,
                "generic_name": m.generic_name,
                "strength": m.strength,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "instructions": m.instructions,
                "start_date": m.start_date
            } for m in doc.medications
        ],
        "lab_results": [
            {
                "test_name": l.test_name,
                "value": l.value,
                "unit": l.unit,
                "reference_range": l.reference_range,
                "status": l.status,
                "test_date": l.test_date
            } for l in doc.lab_results
        ]
    }

# --- Process Document (2-STAGE: Fact Extraction + Health Intelligence) ---
@router.post("/documents/{document_id}/process", response_model=DocumentOut)
def process_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        doc.processing_status = ProcessingStatus.PROCESSING
        db.commit()

        storage_service = get_storage_service()
        file_bytes = storage_service.get_file(doc.file_path)
        ocr_text, ocr_confidence = OCRService.extract_text(file_bytes, doc.file_type, doc.original_filename)
        
        doc.ocr_text = ocr_text
        doc.processing_status = ProcessingStatus.OCR_COMPLETED
        db.commit()

        doc.processing_status = ProcessingStatus.AI_ANALYSIS
        db.commit()

        ai_extractor = GroqAIExtractor()
        
        # --- STAGE 1: FACT EXTRACTION ---
        extracted_facts = ai_extractor.extract_stage1(ocr_text, doc.original_filename)
        doc.document_type = extracted_facts.get("document_type", "Other")
        doc.confidence = extracted_facts.get("confidence", ocr_confidence)

        db.query(Medication).filter(Medication.document_id == doc.id).delete()
        for m in extracted_facts.get("medications", []):
            med = Medication(
                document_id=doc.id,
                medicine_name=m.get("medicine_name", "Unknown Medicine"),
                generic_name=m.get("generic_name"),
                strength=m.get("strength"),
                dosage=m.get("dosage"),
                frequency=m.get("frequency"),
                route=m.get("route"),
                duration=m.get("duration"),
                instructions=m.get("instructions"),
                start_date=m.get("start_date"),
                end_date=m.get("end_date"),
                verification_status=VerificationStatus.UNVERIFIED
            )
            db.add(med)

        db.query(LabResult).filter(LabResult.document_id == doc.id).delete()
        for l in extracted_facts.get("lab_results", []):
            lab = LabResult(
                document_id=doc.id,
                test_name=l.get("test_name", "Laboratory Test"),
                value=str(l.get("value", "")),
                unit=l.get("unit"),
                reference_range=l.get("reference_range"),
                status=l.get("status", "Normal"),
                test_date=l.get("test_date", doc.upload_date.strftime("%Y-%m-%d") if doc.upload_date else datetime.utcnow().strftime("%Y-%m-%d")),
                verification_status=VerificationStatus.UNVERIFIED
            )
            db.add(lab)

        db.query(Diagnosis).filter(Diagnosis.document_id == doc.id).delete()
        for d in extracted_facts.get("diagnoses", []):
            diag = Diagnosis(
                document_id=doc.id,
                diagnosis_name=d.get("diagnosis_name", "Clinical Condition"),
                diagnosis_date=d.get("diagnosis_date", datetime.utcnow().strftime("%Y-%m-%d")),
                verification_status=VerificationStatus.UNVERIFIED
            )
            db.add(diag)
        db.commit()

        # --- STAGE 2: HEALTH COPILOT INTELLIGENCE ---
        user_other_docs = db.query(Document).filter(Document.user_id == doc.user_id, Document.id != doc.id).all()
        user_history = [_doc_to_history_dict(d) for d in user_other_docs]

        doc_meta = {
            "id": str(doc.id),
            "original_filename": doc.original_filename,
            "document_date": extracted_facts.get("document_date") or doc.upload_date.strftime("%Y-%m-%d")
        }

        stage2_intelligence = ai_extractor.analyze_stage2_health_copilot(extracted_facts, user_history, doc_meta)
        doc.stage2_intelligence = json.dumps(stage2_intelligence)

        # Save Summary Record
        db.query(Summary).filter(Summary.document_id == doc.id).delete()
        key_findings_text = "\n".join([k.get("explanation", "") for k in stage2_intelligence.get("key_insights", [])])
        abnormal_text = "\n".join([f"{a['test_name']}: {a['what_this_means']}" for a in stage2_intelligence.get("abnormal_findings", [])])
        
        sum_obj = Summary(
            document_id=doc.id,
            summary_text=stage2_intelligence.get("overall_summary", "Medical document analyzed."),
            key_findings=key_findings_text,
            abnormal_explanation=abnormal_text,
            plain_language_meaning=stage2_intelligence.get("overall_summary", ""),
            suggested_next_steps="\n".join(stage2_intelligence.get("questions_for_doctor", [])),
            language="en"
        )
        db.add(sum_obj)

        db.query(TimelineEvent).filter(TimelineEvent.document_id == doc.id).delete()
        t_event = TimelineEvent(
            user_id=doc.user_id,
            document_id=doc.id,
            event_type=doc.document_type,
            event_date=extracted_facts.get("document_date") or doc.upload_date.strftime("%Y-%m-%d"),
            title=f"{doc.document_type}: {doc.original_filename}",
            description=stage2_intelligence.get("overall_summary", "Document analyzed via Altrix AI Copilot.")
        )
        db.add(t_event)

        doc.processing_status = ProcessingStatus.COMPLETED if doc.confidence >= 0.85 else ProcessingStatus.REVIEW_REQUIRED
        db.commit()
        db.refresh(doc)
        if doc.stage2_intelligence and isinstance(doc.stage2_intelligence, str):
            try:
                doc.stage2_intelligence = json.loads(doc.stage2_intelligence)
            except Exception:
                pass
        return doc

    except Exception as e:
        db.rollback()
        doc.processing_status = ProcessingStatus.FAILED
        db.commit()
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")

# --- List Documents (User Filtered) ---
@router.get("/documents", response_model=List[DocumentOut])
def list_documents(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Document)
    if user_id:
        query = query.filter(Document.user_id == user_id)
    docs = query.order_by(Document.upload_date.desc()).all()
    # Format stage2_intelligence as json dict for response
    for d in docs:
        if d.stage2_intelligence and isinstance(d.stage2_intelligence, str):
            try:
                d.stage2_intelligence = json.loads(d.stage2_intelligence)
            except Exception:
                pass
    return docs

# --- Single Document Details ---
@router.get("/documents/{document_id}", response_model=DocumentOut)
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.stage2_intelligence and isinstance(doc.stage2_intelligence, str):
        try:
            doc.stage2_intelligence = json.loads(doc.stage2_intelligence)
        except Exception:
            pass
    return doc

# --- UNIFIED CROSS-DOCUMENT COPILOT INTELLIGENCE ---
@router.get("/copilot/intelligence", response_model=HealthCopilotIntelligenceSchema)
def get_copilot_intelligence(user_id: Optional[int] = None, lang: str = "en", db: Session = Depends(get_db)):
    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = ensure_default_user(db)

    user_docs = db.query(Document).filter(Document.user_id == user.id).order_by(Document.upload_date.asc()).all()
    if not user_docs:
        base_intel = HealthCopilotIntelligenceSchema(
            overall_summary="No medical documents uploaded yet. Upload a laboratory report or prescription to generate AI Health Intelligence.",
            key_insights=[],
            abnormal_findings=[],
            multifactor_patterns=[],
            trends=[],
            medication_insights=[],
            questions_for_doctor=["Upload your medical records to generate doctor discussion prompts."],
            missing_information=["No user health records uploaded."],
            verification_items=[],
            safety_note="Altrix HealthCopilot provides informative analysis only."
        ).model_dump()
        if lang in ["te", "hi"]:
            base_intel = TranslationService.translate_intelligence(base_intel, lang)
        return base_intel

    # Gather user history records across all docs
    all_history = [_doc_to_history_dict(d) for d in user_docs]
    latest_doc = user_docs[-1]
    latest_facts = {
        "document_type": latest_doc.document_type,
        "document_date": latest_doc.upload_date.strftime("%Y-%m-%d"),
        "medications": [
            {
                "medicine_name": m.medicine_name,
                "generic_name": m.generic_name,
                "strength": m.strength,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "instructions": m.instructions
            } for m in latest_doc.medications
        ],
        "lab_results": [
            {
                "test_name": l.test_name,
                "value": l.value,
                "unit": l.unit,
                "reference_range": l.reference_range,
                "status": l.status,
                "test_date": l.test_date
            } for l in latest_doc.lab_results
        ]
    }

    ai_extractor = GroqAIExtractor()
    doc_meta = {
        "id": str(latest_doc.id),
        "original_filename": latest_doc.original_filename,
        "document_date": latest_doc.upload_date.strftime("%Y-%m-%d")
    }

    # Generate unified cross-document intelligence across previous history + latest doc
    other_history = all_history[:-1]
    unified_intelligence = ai_extractor.analyze_stage2_health_copilot(latest_facts, other_history, doc_meta)
    if lang in ["te", "hi"]:
        unified_intelligence = TranslationService.translate_intelligence(unified_intelligence, lang)
    return unified_intelligence

# --- Verify & Edit Document Data ---
@router.put("/documents/{document_id}/verify", response_model=DocumentOut)
def verify_document_data(
    document_id: int,
    payload: VerificationPayload,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if payload.document_type:
        doc.document_type = payload.document_type

    if payload.medications:
        db.query(Medication).filter(Medication.document_id == doc.id).delete()
        for m in payload.medications:
            med = Medication(
                document_id=doc.id,
                medicine_name=m.medicine_name,
                generic_name=m.generic_name,
                strength=m.strength,
                dosage=m.dosage,
                frequency=m.frequency,
                route=m.route,
                duration=m.duration,
                instructions=m.instructions,
                start_date=m.start_date,
                end_date=m.end_date,
                verification_status=VerificationStatus.VERIFIED
            )
            db.add(med)

    if payload.lab_results:
        db.query(LabResult).filter(LabResult.document_id == doc.id).delete()
        for l in payload.lab_results:
            lab = LabResult(
                document_id=doc.id,
                test_name=l.test_name,
                value=l.value,
                unit=l.unit,
                reference_range=l.reference_range,
                status=l.status,
                test_date=l.test_date or datetime.utcnow().strftime("%Y-%m-%d"),
                verification_status=VerificationStatus.VERIFIED
            )
            db.add(lab)

    if payload.diagnoses:
        db.query(Diagnosis).filter(Diagnosis.document_id == doc.id).delete()
        for d in payload.diagnoses:
            diag = Diagnosis(
                document_id=doc.id,
                diagnosis_name=d.diagnosis_name,
                diagnosis_date=d.diagnosis_date or datetime.utcnow().strftime("%Y-%m-%d"),
                verification_status=VerificationStatus.VERIFIED
            )
            db.add(diag)

    doc.processing_status = ProcessingStatus.COMPLETED
    db.commit()
    db.refresh(doc)
    return doc

# --- Health Profile ---
@router.get("/health-profile")
def get_health_profile(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = ensure_default_user(db)

    doc_ids = [d.id for d in db.query(Document.id).filter(Document.user_id == user.id).all()]

    documents_count = len(doc_ids)
    medications_count = db.query(Medication).filter(Medication.document_id.in_(doc_ids)).count() if doc_ids else 0
    abnormal_labs_count = db.query(LabResult).filter(LabResult.document_id.in_(doc_ids), LabResult.status.in_(["High", "Low", "Critical"])).count() if doc_ids else 0
    diagnoses_count = db.query(Diagnosis).filter(Diagnosis.document_id.in_(doc_ids)).count() if doc_ids else 0
    recent_timeline = db.query(TimelineEvent).filter(TimelineEvent.user_id == user.id).order_by(TimelineEvent.event_date.desc()).limit(5).all()

    return {
        "user": UserOut.model_validate(user),
        "metrics": {
            "documents_analyzed": documents_count,
            "active_medications": medications_count,
            "abnormal_lab_findings": abnormal_labs_count,
            "recorded_diagnoses": diagnoses_count
        },
        "recent_timeline": [TimelineEventOut.model_validate(t) for t in recent_timeline]
    }

# --- Health Summary ---
@router.get("/summaries/{document_id}")
def get_summary(document_id: int, lang: str = "en", db: Session = Depends(get_db)):
    summary = db.query(Summary).filter(Summary.document_id == document_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")

    base_summary = {
        "document_contains": summary.summary_text,
        "key_findings": summary.key_findings.split("\n") if summary.key_findings else [],
        "abnormal_values": summary.abnormal_explanation.split("\n") if summary.abnormal_explanation else [],
        "what_this_may_mean": summary.plain_language_meaning,
        "suggested_next_steps": summary.suggested_next_steps
    }

    if lang in ["te", "hi"]:
        return TranslationService.translate_summary(base_summary, lang)
    return base_summary

# --- Medications ---
@router.get("/medications", response_model=List[MedicationSchema])
def get_medications(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Medication)
    if user_id:
        doc_ids = [d.id for d in db.query(Document.id).filter(Document.user_id == user_id).all()]
        query = query.filter(Medication.document_id.in_(doc_ids))
    return query.order_by(Medication.created_at.desc()).all()

# --- Lab Results ---
@router.get("/lab-results", response_model=List[LabResultSchema])
def get_lab_results(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(LabResult)
    if user_id:
        doc_ids = [d.id for d in db.query(Document.id).filter(Document.user_id == user_id).all()]
        query = query.filter(LabResult.document_id.in_(doc_ids))
    return query.order_by(LabResult.created_at.desc()).all()

# --- Diagnoses ---
@router.get("/diagnoses", response_model=List[DiagnosisSchema])
def get_diagnoses(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Diagnosis)
    if user_id:
        doc_ids = [d.id for d in db.query(Document.id).filter(Document.user_id == user_id).all()]
        query = query.filter(Diagnosis.document_id.in_(doc_ids))
    return query.order_by(Diagnosis.created_at.desc()).all()

# --- Timeline ---
@router.get("/timeline", response_model=List[TimelineEventOut])
def get_timeline(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(TimelineEvent)
    if user_id:
        query = query.filter(TimelineEvent.user_id == user_id)
    return query.order_by(TimelineEvent.event_date.desc()).all()

# --- ABHA Profile ---
@router.get("/abha/profile", response_model=AbhaProfileOut)
def get_abha_profile(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = ensure_default_user(db)
    
    fhir_bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": user.abha_id,
                    "name": [{"text": user.name}],
                    "gender": (user.gender or "female").lower(),
                    "birthDate": user.dob
                }
            }
        ]
    }

    return AbhaProfileOut(
        abha_id=user.abha_id or "91-4820-1129-9384",
        name=user.name,
        gender=user.gender or "Female",
        dob=user.dob or "1995-01-01",
        mobile=user.phone or "+91 9876543210",
        status="ABDM Verified (Mock)",
        fhir_resources=fhir_bundle
    )

# --- SEED SYNTHETIC DEMO DATA (Multi-document trend & pattern scenario) ---
@router.post("/demo/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    ensure_default_user(db)
    
    existing = db.query(Document).filter(Document.original_filename.like("Sample_%")).first()
    if existing:
        return {"message": "Demo data already seeded.", "document_id": existing.id}

    ai_extractor = GroqAIExtractor()

    # 1. Document 1 (Oct 1): Initial CBC & Vitamin Report (Low Hemoglobin, Low MCV, Low Ferritin)
    doc1 = Document(
        user_id=1,
        filename="sample_cbc_oct1.pdf",
        original_filename="Sample_Blood_Report_Oct01.pdf",
        file_type="application/pdf",
        file_path="uploaded_documents/sample_cbc_oct1.pdf",
        upload_date=datetime(2026, 10, 1),
        document_type="Lab Report",
        processing_status=ProcessingStatus.COMPLETED,
        ocr_text="""ALTRIX CENTRAL CLINICAL LABS - BLOOD REPORT
Date: 2026-10-01 | Patient: Rahul Sharma | Age: 34

COMPLETE BLOOD COUNT & FERRITIN
Hemoglobin (Hb): 10.2 g/dL (Reference Range: 12.0 - 15.0 g/dL) [LOW]
MCV: 75 fL (Reference Range: 80 - 100 fL) [LOW]
Ferritin: 10 ng/mL (Reference Range: 15 - 150 ng/mL) [LOW]
Vitamin D (25-OH): 14.0 ng/mL (Reference Range: 30 - 100 ng/mL) [LOW]
Total WBC: 6,800 /uL (Reference Range: 4,000 - 11,000) [NORMAL]""",
        confidence=0.96
    )
    db.add(doc1)
    db.commit()
    db.refresh(doc1)

    l1_1 = LabResult(document_id=doc1.id, test_name="Hemoglobin", value="10.2", unit="g/dL", reference_range="12-15 g/dL", status="Low", test_date="2026-10-01", verification_status=VerificationStatus.VERIFIED)
    l1_2 = LabResult(document_id=doc1.id, test_name="MCV", value="75", unit="fL", reference_range="80-100 fL", status="Low", test_date="2026-10-01", verification_status=VerificationStatus.VERIFIED)
    l1_3 = LabResult(document_id=doc1.id, test_name="Ferritin", value="10", unit="ng/mL", reference_range="15-150 ng/mL", status="Low", test_date="2026-10-01", verification_status=VerificationStatus.VERIFIED)
    l1_4 = LabResult(document_id=doc1.id, test_name="Vitamin D (25-OH)", value="14.0", unit="ng/mL", reference_range="30-100 ng/mL", status="Low", test_date="2026-10-01", verification_status=VerificationStatus.VERIFIED)
    db.add_all([l1_1, l1_2, l1_3, l1_4])

    doc1_facts = {
        "document_type": "Lab Report",
        "document_date": "2026-10-01",
        "lab_results": [
            {"test_name": "Hemoglobin", "value": "10.2", "unit": "g/dL", "reference_range": "12-15 g/dL", "status": "Low", "test_date": "2026-10-01"},
            {"test_name": "MCV", "value": "75", "unit": "fL", "reference_range": "80-100 fL", "status": "Low", "test_date": "2026-10-01"},
            {"test_name": "Ferritin", "value": "10", "unit": "ng/mL", "reference_range": "15-150 ng/mL", "status": "Low", "test_date": "2026-10-01"},
            {"test_name": "Vitamin D (25-OH)", "value": "14.0", "unit": "ng/mL", "reference_range": "30-100 ng/mL", "status": "Low", "test_date": "2026-10-01"}
        ]
    }
    intel1 = ai_extractor.analyze_stage2_health_copilot(doc1_facts, [], {"id": str(doc1.id), "original_filename": doc1.original_filename, "document_date": "2026-10-01"})
    doc1.stage2_intelligence = json.dumps(intel1)

    s1 = Summary(
        document_id=doc1.id,
        summary_text=intel1.get("overall_summary", ""),
        key_findings="\n".join([k.get("explanation", "") for k in intel1.get("key_insights", [])]),
        abnormal_explanation="\n".join([f"{a['test_name']}: {a['what_this_means']}" for a in intel1.get("abnormal_findings", [])]),
        plain_language_meaning=intel1.get("overall_summary", ""),
        suggested_next_steps="\n".join(intel1.get("questions_for_doctor", [])),
        language="en"
    )
    db.add(s1)
    t1 = TimelineEvent(user_id=1, document_id=doc1.id, event_type="Lab Report", event_date="2026-10-01", title="Blood Test (Oct 01)", description="Hemoglobin: 10.2 g/dL (Low), MCV: 75 fL (Low), Ferritin: 10 ng/mL (Low)")
    db.add(t1)

    # 2. Document 2 (Oct 4): Prescription
    doc2 = Document(
        user_id=1,
        filename="sample_prescription.pdf",
        original_filename="Sample_Prescription_Dr_Mehta.pdf",
        file_type="application/pdf",
        file_path="uploaded_documents/sample_prescription.pdf",
        upload_date=datetime(2026, 10, 4),
        document_type="Prescription",
        processing_status=ProcessingStatus.COMPLETED,
        ocr_text="""CARE HEALTH CLINIC - PRESCRIPTION
Dr. Ananya Mehta, MD | Date: 2026-10-04 | Patient: Rahul Sharma

Rx:
1. Metformin Hydrochloride 500 mg - 1 tablet twice daily (1-0-1) after meals for 30 days.
2. Elemental Iron Supplement 100 mg - 1 tablet daily (1-0-0) after breakfast for 60 days.
3. Vitamin D3 60,000 IU - 1 capsule weekly for 8 weeks with milk.""",
        confidence=0.92
    )
    db.add(doc2)
    db.commit()
    db.refresh(doc2)

    m1 = Medication(document_id=doc2.id, medicine_name="Metformin", generic_name="Metformin Hydrochloride", strength="500 mg", dosage="1 tablet", frequency="1-0-1", route="Oral", duration="30 days", instructions="Take after food", start_date="2026-10-04", verification_status=VerificationStatus.VERIFIED)
    m2 = Medication(document_id=doc2.id, medicine_name="Iron Supplement", generic_name="Ferrous Ascorbate", strength="100 mg", dosage="1 tablet", frequency="1-0-0", route="Oral", duration="60 days", instructions="Take after breakfast", start_date="2026-10-04", verification_status=VerificationStatus.VERIFIED)
    m3 = Medication(document_id=doc2.id, medicine_name="Vitamin D3", generic_name="Cholecalciferol", strength="60,000 IU", dosage="1 capsule", frequency="1-0-0 Weekly", route="Oral", duration="8 weeks", instructions="Take weekly with milk", start_date="2026-10-04", verification_status=VerificationStatus.VERIFIED)
    db.add_all([m1, m2, m3])

    doc2_facts = {
        "document_type": "Prescription",
        "document_date": "2026-10-04",
        "medications": [
            {"medicine_name": "Metformin", "strength": "500 mg", "frequency": "1-0-1", "instructions": "Take after food"},
            {"medicine_name": "Iron Supplement", "strength": "100 mg", "frequency": "1-0-0", "instructions": "Take after breakfast"},
            {"medicine_name": "Vitamin D3", "strength": "60,000 IU", "frequency": "1-0-0 Weekly", "instructions": "Take weekly with milk"}
        ]
    }
    intel2 = ai_extractor.analyze_stage2_health_copilot(doc2_facts, [doc1_facts], {"id": str(doc2.id), "original_filename": doc2.original_filename, "document_date": "2026-10-04"})
    doc2.stage2_intelligence = json.dumps(intel2)

    s2 = Summary(document_id=doc2.id, summary_text=intel2.get("overall_summary", ""), key_findings="Prescribed Metformin 500mg, Iron Supplement 100mg, Vitamin D3 60,000 IU.", abnormal_explanation="", plain_language_meaning=intel2.get("overall_summary", ""), suggested_next_steps="Follow prescribed administration schedule.", language="en")
    db.add(s2)
    t2 = TimelineEvent(user_id=1, document_id=doc2.id, event_type="Prescription", event_date="2026-10-04", title="Prescription by Dr. Ananya Mehta", description="Metformin 500mg (1-0-1), Iron 100mg (1-0-0), Vitamin D3 60,000 IU (Weekly)")
    db.add(t2)

    # 3. Document 3 (Oct 20): Follow-up Blood Report (Showing Hemoglobin Improvement to 11.1 g/dL!)
    doc3 = Document(
        user_id=1,
        filename="sample_cbc_oct20.pdf",
        original_filename="Sample_Followup_Blood_Report_Oct20.pdf",
        file_type="application/pdf",
        file_path="uploaded_documents/sample_cbc_oct20.pdf",
        upload_date=datetime(2026, 10, 20),
        document_type="Lab Report",
        processing_status=ProcessingStatus.COMPLETED,
        ocr_text="""ALTRIX DIAGNOSTICS - FOLLOW-UP BLOOD REPORT
Date: 2026-10-20 | Patient: Rahul Sharma

COMPLETE BLOOD COUNT FOLLOW-UP
Hemoglobin (Hb): 11.1 g/dL (Reference Range: 12.0 - 15.0 g/dL) [LOW - IMPROVING]
MCV: 78 fL (Reference Range: 80 - 100 fL) [LOW - IMPROVING]
Ferritin: 18 ng/mL (Reference Range: 15 - 150 ng/mL) [NORMAL]""",
        confidence=0.96
    )
    db.add(doc3)
    db.commit()
    db.refresh(doc3)

    l3_1 = LabResult(document_id=doc3.id, test_name="Hemoglobin", value="11.1", unit="g/dL", reference_range="12-15 g/dL", status="Low", test_date="2026-10-20", verification_status=VerificationStatus.VERIFIED)
    l3_2 = LabResult(document_id=doc3.id, test_name="MCV", value="78", unit="fL", reference_range="80-100 fL", status="Low", test_date="2026-10-20", verification_status=VerificationStatus.VERIFIED)
    l3_3 = LabResult(document_id=doc3.id, test_name="Ferritin", value="18", unit="ng/mL", reference_range="15-150 ng/mL", status="Normal", test_date="2026-10-20", verification_status=VerificationStatus.VERIFIED)
    db.add_all([l3_1, l3_2, l3_3])

    doc3_facts = {
        "document_type": "Lab Report",
        "document_date": "2026-10-20",
        "lab_results": [
            {"test_name": "Hemoglobin", "value": "11.1", "unit": "g/dL", "reference_range": "12-15 g/dL", "status": "Low", "test_date": "2026-10-20"},
            {"test_name": "MCV", "value": "78", "unit": "fL", "reference_range": "80-100 fL", "status": "Low", "test_date": "2026-10-20"},
            {"test_name": "Ferritin", "value": "18", "unit": "ng/mL", "reference_range": "15-150 ng/mL", "status": "Normal", "test_date": "2026-10-20"}
        ]
    }
    intel3 = ai_extractor.analyze_stage2_health_copilot(doc3_facts, [doc1_facts, doc2_facts], {"id": str(doc3.id), "original_filename": doc3.original_filename, "document_date": "2026-10-20"})
    doc3.stage2_intelligence = json.dumps(intel3)

    s3 = Summary(document_id=doc3.id, summary_text=intel3.get("overall_summary", ""), key_findings="Hemoglobin improved from 10.2 to 11.1 g/dL (+0.9 g/dL). Ferritin normalized to 18 ng/mL.", abnormal_explanation="Hemoglobin remains slightly below reference cutoff.", plain_language_meaning=intel3.get("overall_summary", ""), suggested_next_steps="Discuss trend with doctor.", language="en")
    db.add(s3)
    t3 = TimelineEvent(user_id=1, document_id=doc3.id, event_type="Lab Report", event_date="2026-10-20", title="Follow-up Blood Report (Oct 20)", description="Hemoglobin: 11.1 g/dL (+0.9 g/dL improvement), Ferritin: 18 ng/mL (Normal)")
    db.add(t3)

    db.commit()
    return {"status": "success", "message": "Multi-document demo profile seeded with historical trends & patterns."}

# --- AI Copilot Chat Endpoint ---
@router.post("/copilot/chat")
def copilot_chat(payload: dict, db: Session = Depends(get_db)):
    user_query = payload.get("query", "")
    target_lang = payload.get("lang", "en")
    if not user_query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    documents = db.query(Document).all()
    medications = db.query(Medication).all()
    lab_results = db.query(LabResult).all()

    context_str = "USER MEDICAL CONTEXT & UPLOADED DOCUMENTS:\n\n"
    for d in documents:
        context_str += f"--- Document: {d.original_filename} (Uploaded: {d.upload_date.strftime('%Y-%m-%d') if d.upload_date else ''}, Type: {d.document_type}) ---\n"
        if d.ocr_text:
            context_str += f"DOCUMENT EXTRACTED OCR TEXT:\n{d.ocr_text}\n"
        if d.stage2_intelligence:
            context_str += f"HEALTH COPILOT STAGE 2 INTELLIGENCE:\n{d.stage2_intelligence}\n"
        context_str += "\n"

    if medications:
        context_str += "EXTRACTED MEDICATIONS:\n"
        for m in medications:
            context_str += f"- {m.medicine_name}: {m.strength or ''}, Schedule: {m.frequency or ''}, Instructions: {m.instructions or ''}\n"
        context_str += "\n"

    if lab_results:
        context_str += "EXTRACTED LAB RESULTS:\n"
        for l in lab_results:
            context_str += f"- {l.test_name}: {l.value} {l.unit or ''} (Ref Range: {l.reference_range or 'N/A'}) -> Status: {l.status}\n"
        context_str += "\n"

    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_api_key)
            system_prompt = """You are Altrix HealthCopilot, speaking directly to the user as a warm, knowledgeable, empathetic doctor explaining their uploaded medical records in a consultation.

YOU HAVE FULL ACCESS TO THE USER'S UPLOADED DOCUMENTS AND OCR EXTRACTED TEXT PROVIDED IN THE CONTEXT BELOW.
- NEVER say "I am not able to view the image" or "I cannot see your document".
- Answer the user's questions directly based on the extracted text and health intelligence of their uploaded records!
- Speak simply, clearly, and supportively like a caring physician.
- If all values are normal, tell them clearly everything looks healthy.
- If values are low or high, explain what is low/high, what it means in daily terms, and what to discuss with their physician.
- Never diagnose the user directly or recommend changing prescribed medication doses.
"""
            if target_lang == "te":
                system_prompt += "\n\nCRITICAL: ANSWER THE USER'S QUESTION IN FLUENT, CLEAR TELUGU (తెలుగు) alongside English test/medication names in parentheses!"
            elif target_lang == "hi":
                system_prompt += "\n\nCRITICAL: ANSWER THE USER'S QUESTION IN FLUENT, CLEAR HINDI (हिन्दी) alongside English test/medication names in parentheses!"

            active_models = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"]
            for m_name in active_models:
                try:
                    resp = client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"{context_str}\nUser Question: {user_query}"}
                        ],
                        model=m_name,
                        temperature=0.2,
                        max_tokens=1024
                    )
                    return {"reply": resp.choices[0].message.content}
                except Exception as model_err:
                    print(f"[CopilotChat] Model {m_name} error: {model_err}")
        except Exception as e:
            print(f"[CopilotChat] Groq API error: {e}")

    return {
        "reply": f"Based on your uploaded medical records ({len(documents)} document(s)), here is key guidance for your question '{user_query}':\n\n• Your uploaded document text and extracted findings have been parsed into your health record.\n• You can review the exact extracted values, abnormal findings breakdown, and suggested doctor discussion points on your AI Health Copilot dashboard.\n\nNote: Always consult your physician for personalized medical advice."
    }
