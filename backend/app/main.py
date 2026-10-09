import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router, ensure_default_user
from app.db.database import Base, engine, SessionLocal

app = FastAPI(
    title="Altrix Labs — AI-Powered Personal Health Copilot API",
    description="Backend API for document OCR, Groq AI medical extraction, health summaries, and ABHA readiness.",
    version="1.0.0"
)

# Robust CORS Configuration supporting localhost, 127.0.0.1 and dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_default_user(db)
    finally:
        db.close()

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": "Altrix Labs — AI-Powered Personal Health Copilot",
        "status": "online",
        "health_check": "/api/health",
        "docs": "/docs"
    }
