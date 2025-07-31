"""
Router for the text humanizer tool.
"""
import time
import asyncio
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import nltk

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
from nltk.tokenize import sent_tokenize

from .models import HumanizeRequest, HumanizeResponse, HealthResponse
from .utils import apply_tone_adjustments, apply_basic_humanization
from core.dependencies import get_logger, validate_text_input, validate_tone_input

logger = get_logger(__name__)

router = APIRouter(prefix="/text-humanizer", tags=["text-humanizer"])

# Global variables for the model
model = None
tokenizer = None

def load_huggingface_model():
    """Load the T5 model from Hugging Face."""
    global model, tokenizer
    try:
        logger.info("Loading t5-small model...")
        model_name = "t5-small"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        logger.info("Model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return False

async def humanize_with_huggingface(text: str, tone: str = "casual") -> str:
    """Use the T5 model to humanize text with chunking for long texts."""
    global model, tokenizer
    
    if model is None or tokenizer is None:
        logger.warning("Model not loaded, falling back to regex-based humanization")
        return await humanize_text_with_regex(text, tone)
    
    try:
        # Split text into sentences (chunks)
        try:
            sentences = sent_tokenize(text)
        except Exception:
            # Fallback to simple sentence splitting
            sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if not sentences:
            # If no sentences found, treat the whole text as one sentence
            sentences = [text]
        
        paraphrased_sentences = []
        for sentence in sentences:
            if not sentence.strip():
                continue
                
            # Use summarize task for paraphrasing
            input_text = f"summarize: {sentence.strip()}"
            
            inputs = tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_length=512,
                    num_beams=4,
                    no_repeat_ngram_size=2,
                    do_sample=True,
                    top_k=50,
                    top_p=0.9,
                    temperature=0.8,
                    num_return_sequences=1,
                    early_stopping=True
                )
            
            humanized_sentence = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Apply tone adjustments
            if tone != "neutral":
                humanized_sentence = apply_tone_adjustments(humanized_sentence, tone)
            
            paraphrased_sentences.append(humanized_sentence)
        
        # Join sentences with proper spacing
        humanized_text = ' '.join(paraphrased_sentences)
        
        # Clean up the text and apply grammar corrections
        from .utils import clean_text_output
        humanized_text = clean_text_output(humanized_text)
        
        logger.info(f"HuggingFace model processed {len(sentences)} sentences")
        logger.info(f"Humanized text: {humanized_text[:100]}...")
        return humanized_text
        
    except Exception as e:
        logger.error(f"Error with HuggingFace model: {e}")
        # Fallback to regex-based humanization
        return await humanize_text_with_regex(text, tone)

async def humanize_text_with_regex(text: str, tone: str = "casual") -> str:
    """Uses advanced text transformation to humanize text."""
    logger.info(f"Humanizing text with tone: {tone}")
    logger.info(f"Original text: {text[:100]}...")
    
    try:
        # Apply tone-specific transformations
        if tone == "casual":
            from .utils import apply_casual_tone
            humanized = apply_casual_tone(text)
        elif tone == "friendly":
            from .utils import apply_friendly_tone
            humanized = apply_friendly_tone(text)
        elif tone == "professional":
            from .utils import apply_professional_tone
            humanized = apply_professional_tone(text)
        elif tone == "enthusiastic":
            from .utils import apply_enthusiastic_tone
            humanized = apply_enthusiastic_tone(text)
        else:  # neutral
            from .utils import apply_neutral_tone
            humanized = apply_neutral_tone(text)
        
        # Apply grammar corrections
        from .utils import clean_text_output
        humanized = clean_text_output(humanized)
        
        logger.info(f"Humanized text: {humanized[:100]}...")
        return humanized
        
    except Exception as e:
        logger.error(f"Error in humanization: {e}")
        # Fallback to basic transformation
        return apply_basic_humanization(text)

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None and tokenizer is not None
    )

@router.post("/load-model")
async def load_model():
    """Load the Hugging Face model."""
    try:
        success = load_huggingface_model()
        if success:
            return {"status": "success", "message": "Model loaded successfully"}
        else:
            return {"status": "error", "message": "Failed to load model"}
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

    # Use the selected model for humanization
    if request.model == "huggingface":
        humanized_text = await humanize_with_huggingface(text, tone)
    else:
        # Use the advanced text transformation for humanization
        humanized_text = await humanize_text_with_regex(text, tone)

    processing_time = time.time() - start_time
    logger.info(f"Humanized text: {humanized_text[:100]}...")

    return HumanizeResponse(
        humanized_text=humanized_text,
        tone=tone,
        model=request.model or "regex",
        processing_time=processing_time
    ) 