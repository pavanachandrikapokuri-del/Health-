# Altrix Labs — AI-Powered Personal Health Copilot

> Official Website Reference: [https://www.altrixlabs.ai/](https://www.altrixlabs.ai/)

An end-to-end AI-powered healthcare intelligence platform designed to help individuals understand, organize, and manage their healthcare journey through automated extraction and plain-language analysis of medical records, prescriptions, diagnostic reports, lab sheets, and discharge summaries while maintaining strict medical safety.

---

## 🌟 Key Features (Round 1 Scope)

1. **Medical Record Intelligence & OCR**:
   - Upload prescriptions, lab reports, discharge summaries, and diagnostic records (PDF, PNG, JPG).
   - Multi-stage OCR layer (`pypdf`, `pdfplumber`, `pytesseract` with contrast preprocessing) independent of Groq.
   - Best-effort OCR for scanned and handwritten prescriptions with confidence flags (`"Please verify extracted information"`).

2. **Groq AI Entity Extraction**:
   - **Medicines**: Name, generic name, strength, dosage, frequency (e.g. 1-0-1), route, duration, instructions.
   - **Lab Test Results**: Test parameter, result value, unit, reference range, status (`Normal`, `High`, `Low`, `Critical`, `Unknown`).
   - **Diagnoses**: Explicitly documented clinical conditions.
   - **Dates**: Report dates, prescription dates, test dates.
   - **Patient Info**: Name, age, gender, blood group, patient ID (never hallucinated).

3. **Plain-Language Health Summaries & Abnormal Explanations**:
   - Structured breakdown: *What this document contains*, *Key findings*, *Abnormal values highlighted*, *What this may mean*, and *Suggested next steps*.
   - Strictly cautious, non-diagnostic wording (e.g., *"Your hemoglobin is below the reference range shown in this report..."*).

4. **User Verification & Edit Flow**:
   - Interactive review screen allowing users to edit and confirm extracted dosages, test values, and reference ranges before saving to trusted database state (`Unverified` -> `Verified`).

5. **Unified Health Profile & Chronological Timeline**:
   - Aggregated dashboard presenting patient demographics, active medications, flagged lab alerts, and a vertical chronological health timeline linked back to source documents.

6. **Bilingual Support (English + Telugu)**:
   - Real-time language switcher affecting UI labels, health summaries, and explanations while preserving original medical terms.

7. **ABDM / ABHA Readiness & FHIR R4 Standard**:
   - Mock ABHA ID Card generator and HIE link simulator.
   - FHIR R4 JSON Resource export (`Patient`, `DocumentReference`, `Observation`, `MedicationStatement`, `Condition`, `DiagnosticReport`).

8. **Synthetic Hackathon Demo Data**:
   - One-click **"Seed Demo Data"** button in Navbar and Landing Page to populate sample lab reports (with low Hemoglobin & Vitamin D), prescriptions, and discharge summaries for instant judge demonstration.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons. (Deployed to **Vercel**).
- **Backend**: Python 3.12, FastAPI, SQLAlchemy ORM, Pydantic v2. (Deployed to **Render**).
- **AI Engine**: Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with Pydantic JSON schema enforcement and fallback parsing.
- **Database**: SQLite with SQLAlchemy ORM (PostgreSQL-ready).
- **OCR Engine**: `pypdf`, `pdfplumber`, `pytesseract`, PIL Image preprocessing.
- **Storage Abstraction**: `StorageService` layer for local disk or Render persistent disk.

---

## 📂 Project Structure

```
AURA/
├── backend/
│   ├── app/
│   │   ├── api/routes.py         # REST API Endpoints
│   │   ├── db/database.py        # SQLAlchemy & SQLite Connection
│   │   ├── models/models.py      # Database Schemas
│   │   ├── schemas/schemas.py    # Pydantic Schemas
│   │   ├── services/
│   │   │   ├── ai_extractor.py   # Groq AI Medical Intelligence
│   │   │   ├── ocr.py            # OCR Extraction Layer
│   │   │   ├── storage.py        # Storage Abstraction Service
│   │   │   └── translator.py     # English & Telugu Translation
│   │   └── main.py               # FastAPI App & CORS Setup
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, Dashboard, Upload, Details, Views
│   │   ├── services/api.js       # Axios/Fetch API Client
│   │   ├── utils/translations.js # English & Telugu Dictionaries
│   │   ├── App.jsx               # View Management & Main Container
│   │   └── index.css             # Tailwind CSS Configuration
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── architecture.md           # Architecture Diagrams & Flow
│   ├── data-model.md             # SQLite Schema & FHIR Mapping
│   └── api.md                    # REST API Endpoints Guide
├── .env.example
└── README.md
```

---

## 🚀 Local Setup & Quickstart

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Set environment variables:
```bash
# Set your Groq API Key (Optional: Graceful fallback parser activates if unconfigured)
export GROQ_API_KEY="your_groq_api_key_here"
```

Start backend server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`
Health check: `http://localhost:8000/api/health`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Deployment Instructions

### Deploy Backend to Render

1. Create a new **Web Service** on Render connected to your Git repository.
2. Build Command: `pip install -r backend/requirements.txt`
3. Start Command: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `GROQ_API_KEY`: `<YOUR_GROQ_API_KEY>`
   - `CORS_ORIGINS`: `https://<YOUR-VERCEL-APP>.vercel.app`

### Deploy Frontend to Vercel

1. Import your Git repository into Vercel.
2. Root Directory: `frontend`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://<YOUR-RENDER-BACKEND>.onrender.com`
4. Click **Deploy**.

---

## ⚠️ Medical Safety & Disclaimer

This AI Health Copilot provides informational assistance and is not a substitute for professional medical advice, diagnosis, or treatment. Extracted facts are clearly demarcated from AI plain-language explanations. Users are strongly encouraged to verify all extracted information and consult a qualified physician for clinical decisions.
