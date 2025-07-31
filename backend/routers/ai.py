from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import logging
import re

# Fix relative imports by using absolute imports
from database import get_db
import models
import schemas
from dependencies import get_current_user_id

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Helper function for AI processing ---
async def simulate_ai_processing(input_data: str, process_type: str, tone: Optional[str] = None) -> str:
    """Simulates an AI model processing text for extraction."""
    # In a real application, you would integrate with your actual AI models here.
    # This could involve calling an external API (e.g., OpenAI, Hugging Face)
    # or running a local model.
    import asyncio
    await asyncio.sleep(1) # Simulate network latency/processing time

    if process_type == "extract":
        return f"Extracted text from file: '{input_data[:50]}...' (Simulated AI)"
    return "Simulated AI output."

async def humanize_text_with_model(text: str, tone: str = "casual") -> str:
    """Uses advanced text transformation to humanize text."""
    logger.info(f"Humanizing text with tone: {tone}")
    logger.info(f"Original text: {text[:100]}...")
    
    try:
        # Apply tone-specific transformations
        if tone == "casual":
            humanized = apply_casual_tone(text)
        elif tone == "friendly":
            humanized = apply_friendly_tone(text)
        elif tone == "professional":
            humanized = apply_professional_tone(text)
        elif tone == "enthusiastic":
            humanized = apply_enthusiastic_tone(text)
        else:  # neutral
            humanized = apply_neutral_tone(text)
        
        logger.info(f"Humanized text: {humanized[:100]}...")
        return humanized
        
    except Exception as e:
        logger.error(f"Error in humanization: {e}")
        # Fallback to basic transformation
        return apply_basic_humanization(text)

def apply_casual_tone(text: str) -> str:
    """Apply casual tone transformations."""
    result = text
    
    # Contractions
    contractions = {
        r'\bI am\b': "I'm",
        r'\byou are\b': "you're",
        r'\bit is\b': "it's",
        r'\bthat is\b': "that's",
        r'\bwe are\b': "we're",
        r'\bthey are\b': "they're",
        r'\bcannot\b': "can't",
        r'\bwill not\b': "won't",
        r'\bdo not\b': "don't",
        r'\bdoes not\b': "doesn't",
        r'\bis not\b': "isn't",
        r'\bare not\b': "aren't",
        r'\bwas not\b': "wasn't",
        r'\bwere not\b': "weren't",
        r'\bhave not\b': "haven't",
        r'\bhas not\b': "hasn't",
        r'\bhad not\b': "hadn't",
        r'\bwould not\b': "wouldn't",
        r'\bcould not\b': "couldn't",
        r'\bshould not\b': "shouldn't",
        r'\bmight not\b': "mightn't",
        r'\bmust not\b': "mustn't"
    }
    
    for pattern, replacement in contractions.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Casual language patterns
    casual_replacements = {
        r'\bFurthermore\b': "Also",
        r'\bMoreover\b': "Plus",
        r'\bIn addition\b': "Also",
        r'\bAdditionally\b': "Also",
        r'\bHowever\b': "But",
        r'\bNevertheless\b': "Still",
        r'\bConsequently\b': "So",
        r'\bTherefore\b': "So",
        r'\bThus\b': "So",
        r'\bHence\b': "So",
        r'\bSubsequently\b': "Then",
        r'\bUtilize\b': "Use",
        r'\bImplement\b': "Use",
        r'\bFacilitate\b': "Help",
        r'\bSubstantial\b': "Big",
        r'\bSignificant\b': "Important",
        r'\bConsiderable\b': "A lot",
        r'\bNumerous\b': "Many",
        r'\bSubsequent\b': "Next",
        r'\bPrior\b': "Before",
        r'\bSubsequent to\b': "After",
        r'\bPrior to\b': "Before"
    }
    
    for pattern, replacement in casual_replacements.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_friendly_tone(text: str) -> str:
    """Apply friendly tone transformations."""
    result = apply_casual_tone(text)
    
    # Add friendly expressions
    friendly_patterns = {
        r'\bHello\b': "Hi there",
        r'\bGoodbye\b': "See you later",
        r'\bThank you\b': "Thanks",
        r'\bYou are welcome\b': "You're welcome",
        r'\bI apologize\b': "Sorry",
        r'\bI am sorry\b': "I'm sorry"
    }
    
    for pattern, replacement in friendly_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_professional_tone(text: str) -> str:
    """Apply professional tone transformations."""
    result = text
    
    # Professional language patterns
    professional_patterns = {
        r'\bI\'m\b': "I am",
        r'\bYou\'re\b': "You are",
        r'\bIt\'s\b': "It is",
        r'\bThat\'s\b': "That is",
        r'\bWe\'re\b': "We are",
        r'\bThey\'re\b': "They are",
        r'\bCan\'t\b': "Cannot",
        r'\bWon\'t\b': "Will not",
        r'\bDon\'t\b': "Do not",
        r'\bDoesn\'t\b': "Does not",
        r'\bIsn\'t\b': "Is not",
        r'\bAren\'t\b': "Are not",
        r'\bWasn\'t\b': "Was not",
        r'\bWeren\'t\b': "Were not",
        r'\bHaven\'t\b': "Have not",
        r'\bHasn\'t\b': "Has not",
        r'\bHadn\'t\b': "Had not",
        r'\bWouldn\'t\b': "Would not",
        r'\bCouldn\'t\b': "Could not",
        r'\bShouldn\'t\b': "Should not"
    }
    
    for pattern, replacement in professional_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_enthusiastic_tone(text: str) -> str:
    """Apply enthusiastic tone transformations."""
    result = apply_casual_tone(text)
    
    # Add enthusiastic expressions
    enthusiastic_patterns = {
        r'\bGreat\b': "Amazing",
        r'\bGood\b': "Excellent",
        r'\bNice\b': "Fantastic",
        r'\bCool\b': "Awesome",
        r'\bInteresting\b': "Fascinating",
        r'\bImportant\b': "Crucial",
        r'\bBig\b': "Huge",
        r'\bMany\b': "Tons of",
        r'\bA lot\b': "A tremendous amount of"
    }
    
    for pattern, replacement in enthusiastic_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_neutral_tone(text: str) -> str:
    """Apply neutral tone transformations."""
    result = text
    
    # Balance formal and informal language
    result = apply_casual_tone(result)
    
    # Remove overly casual expressions
    neutral_patterns = {
        r'\bAwesome\b': "Great",
        r'\bFantastic\b': "Good",
        r'\bAmazing\b': "Excellent",
        r'\bTons of\b': "Many",
        r'\bA tremendous amount of\b': "A lot"
    }
    
    for pattern, replacement in neutral_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_basic_humanization(text: str) -> str:
    """Basic humanization as fallback."""
    result = text
    
    # Simple contractions
    basic_contractions = {
        "I am": "I'm",
        "you are": "you're",
        "it is": "it's",
        "that is": "that's",
        "we are": "we're",
        "they are": "they're",
        "cannot": "can't",
        "will not": "won't",
        "do not": "don't",
        "does not": "doesn't",
        "is not": "isn't",
        "are not": "aren't"
    }
    
    for formal, informal in basic_contractions.items():
        result = result.replace(f" {formal} ", f" {informal} ")
        result = result.replace(f" {formal}.", f" {informal}.")
        result = result.replace(f" {formal},", f" {informal},")
    
    return result

# --- AI Endpoints ---

@router.get("/test-humanize")
async def test_humanize():
    """
    Test endpoint to verify the humanization is working.
    """
    test_text = "I am going to the store to purchase some groceries. Furthermore, I will not be able to return until later."
    try:
        humanized = await humanize_text_with_model(test_text, "casual")
        return {
            "original": test_text,
            "humanized": humanized,
            "status": "working"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "failed"
        }

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
    Rewrites AI-generated text to sound more natural using advanced text transformation.
    """
    if not request.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty.")
    if not request.tone.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tone cannot be empty.")

    logger.info(f"Humanizing text with tone: {request.tone}")
    logger.info(f"Original text: {request.text[:100]}...")

    # Use the advanced text transformation for humanization
    humanized_text = await humanize_text_with_model(request.text, request.tone)

    logger.info(f"Humanized text: {humanized_text[:100]}...")

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
