"""
Router for the text humanizer tool.
"""
import time
import asyncio
from typing import Optional
from fastapi import APIRouter, HTTPException, status
import nltk

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
from nltk.tokenize import sent_tokenize

from .models import HumanizeRequest, HumanizeResponse, HealthResponse
from .utils import apply_basic_humanization
from core.dependencies import get_logger, validate_text_input, validate_tone_input

logger = get_logger(__name__)

router = APIRouter(prefix="/text-humanizer", tags=["text-humanizer"])

# No model variables needed for regex-based approach

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=True  # Always true for regex-based system
    )

@router.post("/load-model")
async def load_model():
    """Load the advanced regex-based system."""
    try:
        from .lucie7b_router import load_lucie7b_model
        success = load_lucie7b_model()
        if success:
            return {"status": "success", "message": "Advanced regex system loaded successfully"}
        else:
            return {"status": "error", "message": "Failed to load advanced regex system"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/humanize", response_model=HumanizeResponse)
async def humanize_text(request: HumanizeRequest):
    """
    Rewrites AI-generated text to sound more natural using advanced text transformation.
    """
    start_time = time.time()
    
    # Validate inputs
    text = validate_text_input(request.text)
    tone = validate_tone_input(request.tone)
    
    logger.info(f"Humanizing text with tone: {tone}")
    logger.info(f"Original text: {text[:100]}...")

    # Use the improved regex-based humanization system
    from .lucie7b_router import humanize_with_lucie7b
    humanized_text = await humanize_with_lucie7b(text, tone)

    processing_time = time.time() - start_time
    logger.info(f"Humanized text: {humanized_text[:100]}...")

    return HumanizeResponse(
        humanized_text=humanized_text,
        tone=tone,
        model=request.model or "regex",
        processing_time=processing_time
    ) 