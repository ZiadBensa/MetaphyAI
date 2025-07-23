from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user_id

router = APIRouter()

# --- Helper function to simulate AI processing ---
async def simulate_ai_processing(input_data: str, process_type: str, tone: Optional[str] = None) -> str:
    """Simulates an AI model processing text."""
    # In a real application, you would integrate with your actual AI models here.
    # This could involve calling an external API (e.g., OpenAI, Hugging Face)
    # or running a local model.
    import asyncio
    await asyncio.sleep(1) # Simulate network latency/processing time

    if process_type == "extract":
        return f"Extracted text from file: '{input_data[:50]}...' (Simulated AI)"
    elif process_type == "humanize":
        return f"Humanized text with '{tone}' tone: '{input_data[:50]}...' (Simulated AI)"
    return "Simulated AI output."

# --- AI Endpoints ---

@router.post("/extract/upload", response_model=schemas.ExtractResponse)
async def upload_and_extract(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id), # Protect this endpoint
    db: Session = Depends(get_db)
):
    """
    Uploads a file (PDF, DOCX, image) and returns extracted text.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file uploaded.")

    # In a real scenario, you'd read the file content and pass it to your
    # actual text extraction AI model.
    # For simulation, we'll just use the filename as input.
    file_content_preview = f"File: {file.filename}, Type: {file.content_type}, Size: {file.size} bytes"

    extracted_text = await simulate_ai_processing(file_content_preview, "extract")

    # Store interaction history
    db_interaction = models.AIInteraction(
        user_id=user_id,
        interaction_type="extract",
        input_filename=file.filename,
        output_text=extracted_text,
    )
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)

    return schemas.ExtractResponse(text=extracted_text, filename=file.filename)

@router.post("/humanize/", response_model=schemas.HumanizeResponse)
async def humanize_text(
    request: schemas.HumanizeRequest,
    user_id: str = Depends(get_current_user_id), # Protect this endpoint
    db: Session = Depends(get_db)
):
    """
    Rewrites AI-generated text to sound more natural based on a chosen tone.
    """
    if not request.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty.")
    if not request.tone.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tone cannot be empty.")

    humanized_text = await simulate_ai_processing(request.text, "humanize", request.tone)

    # Store interaction history
    db_interaction = models.AIInteraction(
        user_id=user_id,
        interaction_type="humanize",
        input_text=request.text,
        output_text=humanized_text,
        tone=request.tone,
    )
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)

    return schemas.HumanizeResponse(humanized_text=humanized_text, tone=request.tone)
