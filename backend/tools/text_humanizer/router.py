"""
Router for the text humanizer tool.
"""
import time
import asyncio
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from .nltk_utils import safe_sent_tokenize

from .models import HumanizeRequest, HumanizeResponse, HealthResponse, AIDetectionRequest, AIDetectionResponse
from .utils import apply_basic_humanization
from core.dependencies import get_logger, validate_text_input, validate_tone_input

logger = get_logger(__name__)

router = APIRouter(prefix="/text-humanizer", tags=["text-humanizer"])

# No model variables needed for regex-based approach

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    from .nltk_utils import get_nltk_status
    
    nltk_status = get_nltk_status()
    
    return HealthResponse(
        status="healthy",
        model_loaded=True,  # Always true for regex-based system
        nltk_status=nltk_status
    )

@router.post("/load-model")
async def load_model():
    """Load the semantic-enhanced regex system."""
    try:
        from .semantic_enhanced_regex import SemanticEnhancedRegexHumanizer
        humanizer = SemanticEnhancedRegexHumanizer()
        stats = humanizer.get_dictionary_stats()
        return {
            "status": "success", 
            "message": f"Semantic-enhanced regex system loaded successfully with {stats['total_words']} words and {stats['total_patterns']} patterns"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/detect-ai", response_model=AIDetectionResponse)
async def detect_ai_content_endpoint(request: AIDetectionRequest):
    """
    Detect if text is AI-generated using statistical analysis.
    """
    start_time = time.time()
    
    # Validate input
    text = validate_text_input(request.text)
    
    logger.info(f"AI detection started for text: {text[:100]}...")
    
    try:
        # Try statistical method first (more reliable), fallback to Hugging Face model
        try:
            from .ai_detector import detect_ai_content
            result = detect_ai_content(text)
        except Exception as e:
            logger.warning(f"Failed to load statistical AI detector, falling back to Hugging Face method: {e}")
            from .huggingface_ai_detector import detect_ai_content as fallback_detect
            result = fallback_detect(text)
        
        processing_time = time.time() - start_time
        logger.info(f"AI detection completed in {processing_time:.3f}s")
        
        return AIDetectionResponse(
            is_ai_generated=result["is_ai_generated"],
            confidence=result["confidence"],
            scores=result["scores"],
            analysis=result["analysis"]
        )
        
    except Exception as e:
        logger.error(f"Error in AI detection: {e}")
        import traceback
        traceback.print_exc()
        
        # Return fallback response
        return AIDetectionResponse(
            is_ai_generated=False,
            confidence=0.0,
            scores={
                "perplexity": 0.0,
                "repetition": 0.0,
                "formality": 0.0,
                "sentence_variety": 0.0
            },
            analysis="Error occurred during analysis"
        )

@router.post("/detect-ai-semantic", response_model=AIDetectionResponse)
async def detect_ai_content_semantic_endpoint(request: AIDetectionRequest):
    """
    Detect if text is AI-generated using semantic pattern analysis.
    """
    start_time = time.time()
    
    # Validate input
    text = validate_text_input(request.text)
    
    logger.info(f"Semantic AI detection started for text: {text[:100]}...")
    
    try:
        from .semantic_ai_detector import detect_ai_content
        result = detect_ai_content(text)
        
        processing_time = time.time() - start_time
        logger.info(f"Semantic AI detection completed in {processing_time:.3f}s")
        
        return AIDetectionResponse(
            is_ai_generated=result["is_ai_generated"],
            confidence=result["confidence"],
            scores=result["scores"],
            analysis=result["analysis"]
        )
        
    except Exception as e:
        logger.error(f"Error in semantic AI detection: {e}")
        import traceback
        traceback.print_exc()
        
        # Return fallback response
        return AIDetectionResponse(
            is_ai_generated=False,
            confidence=0.0,
            scores={
                "ai_probability": 0.0,
                "human_probability": 1.0
            },
            analysis="Semantic detection failed"
        )

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
    logger.info(f"Request model: {request.model}")

    try:
        # Route to appropriate humanizer based on model selection
        if request.model == "gemini":
            try:
                from .gemini_humanizer import humanize_with_gemini, GEMINI_AVAILABLE
                logger.info(f"Gemini available: {GEMINI_AVAILABLE}")
                if not GEMINI_AVAILABLE:
                    raise Exception("Gemini is not available - missing google-generativeai package")
                
                logger.info("Calling Gemini humanizer...")
                humanized_text = humanize_with_gemini(text)
                logger.info(f"Gemini result: {humanized_text[:100]}...")
                logger.info(f"Same as original? {humanized_text == text}")
                
                if humanized_text == text:
                    raise Exception("Gemini returned the same text - transformation failed")
                    
            except Exception as e:
                logger.error(f"Gemini humanizer failed: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Gemini humanization failed: {str(e)}"
                )
        else:
            # Use semantic-enhanced regex humanizer as default
            from .semantic_enhanced_regex import humanize_with_semantic_enhanced_regex
            humanized_text = humanize_with_semantic_enhanced_regex(text, tone)
        
        logger.info(f"Humanization completed successfully")
        logger.info(f"Humanized text: {humanized_text[:100]}...")
        
        processing_time = time.time() - start_time
        
        # Perform AI detection using statistical method first (more reliable)
        try:
            from .ai_detector import detect_ai_content
            ai_detection = detect_ai_content(text)
        except Exception as e:
            logger.warning(f"Failed to load statistical AI detector, falling back to Hugging Face method: {e}")
            try:
                from .huggingface_ai_detector import detect_ai_content as fallback_detect
                ai_detection = fallback_detect(text)
            except Exception as e2:
                logger.warning(f"Failed to load Hugging Face AI detector, trying semantic detector: {e2}")
                try:
                    from .semantic_ai_detector import detect_ai_content as semantic_detect
                    ai_detection = semantic_detect(text)
                except Exception as e3:
                    logger.error(f"All AI detectors failed: {e3}")
                    ai_detection = {
                        "is_ai_generated": False,
                        "confidence": 0.0,
                        "scores": {"ai_probability": 0.0},
                        "analysis": "AI detection unavailable"
                    }
        
        return HumanizeResponse(
            humanized_text=humanized_text,
            tone=tone,
            model=request.model or "semantic",
            processing_time=processing_time,
            ai_detection=ai_detection
        )
        
    except Exception as e:
        logger.error(f"Error in humanization: {e}")
        import traceback
        traceback.print_exc()
        
        # Return original text as fallback
        processing_time = time.time() - start_time
        
        # Perform AI detection even on fallback
        try:
            from .ai_detector import detect_ai_content
            ai_detection = detect_ai_content(text)
        except Exception as e:
            logger.warning(f"Failed to load statistical AI detector, falling back to Hugging Face method: {e}")
            from .huggingface_ai_detector import detect_ai_content as fallback_detect
            ai_detection = fallback_detect(text)
        
        return HumanizeResponse(
            humanized_text=text,
            tone=tone,
            model=request.model or "semantic",
            processing_time=processing_time,
            ai_detection=ai_detection
        ) 