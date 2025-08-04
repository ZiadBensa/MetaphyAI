"""
Router for advanced regex-based text humanizer integration.
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

router = APIRouter(prefix="/lucie7b-humanizer", tags=["lucie7b-humanizer"])

# No model variables needed for regex-based approach

def load_lucie7b_model():
    """Load the semantic-enhanced dictionary-based humanization system."""
    try:
        logger.info("Loading semantic-enhanced dictionary-based humanization system...")
        # Load the semantic-enhanced regex system with dictionary
        from .semantic_enhanced_regex import SemanticEnhancedRegexHumanizer
        semantic_enhanced_humanizer = SemanticEnhancedRegexHumanizer()
        stats = semantic_enhanced_humanizer.get_dictionary_stats()
        logger.info(f"Semantic-enhanced dictionary loaded with {stats['total_words']} words, {stats['total_patterns']} patterns, and semantic checking enabled!")
        return True
    except Exception as e:
        logger.error(f"Error loading humanization system: {e}")
        return False

async def humanize_with_lucie7b(text: str, tone: str = "casual") -> str:
    """Use semantic-enhanced regex-based text humanization with dictionary."""
    logger.info(f"Using semantic-enhanced regex-based humanization with tone: {tone}")
    
    try:
        # Use the semantic-enhanced regex system
        from .semantic_enhanced_regex import humanize_with_semantic_enhanced_regex
        humanized_text = humanize_with_semantic_enhanced_regex(text, tone)
        
        logger.info(f"Semantic-enhanced regex model processed text")
        logger.info(f"Humanized text: {humanized_text[:100]}...")
        return humanized_text
        
    except Exception as e:
        logger.error(f"Error with semantic-enhanced regex model: {e}")
        return apply_basic_humanization(text)

def apply_improved_paraphrasing(text: str) -> str:
    """Apply improved paraphrasing transformations."""
    import re
    
    # Common paraphrasing patterns
    paraphrasing_rules = [
        # Formal to casual
        (r'\bI would like to\b', 'I want to'),
        (r'\bI am going to\b', 'I\'m going to'),
        (r'\bI am currently\b', 'I\'m currently'),
        (r'\bWe need to\b', 'We have to'),
        (r'\bPlease provide\b', 'Please give'),
        (r'\bThe meeting will commence\b', 'The meeting will start'),
        (r'\bThe project deadline has been extended\b', 'The project deadline was pushed back'),
        (r'\bThe system is experiencing technical difficulties\b', 'The system is having technical problems'),
        (r'\bWe should consider all available options\b', 'We should look at all the options'),
        
        # Word replacements
        (r'\bpurchase\b', 'buy'),
        (r'\bcommence\b', 'start'),
        (r'\bimplement\b', 'put in place'),
        (r'\bprovide\b', 'give'),
        (r'\brequest\b', 'ask for'),
        (r'\bextended\b', 'pushed back'),
        (r'\bexperiencing\b', 'having'),
        (r'\bconsider\b', 'look at'),
        (r'\bavailable\b', 'possible'),
        (r'\bdifficulties\b', 'problems'),
        (r'\boptions\b', 'choices'),
        
        # Contractions
        (r'\bI am\b', 'I\'m'),
        (r'\bI will\b', 'I\'ll'),
        (r'\bWe are\b', 'We\'re'),
        (r'\bWe will\b', 'We\'ll'),
        (r'\bIt is\b', 'It\'s'),
        (r'\bThat is\b', 'That\'s'),
        (r'\bThere is\b', 'There\'s'),
        
        # Additional patterns for common phrases
        (r'\bwriting to express\b', 'writing to show'),
        (r'\bgenuine interest\b', 'real interest'),
        (r'\bposition at\b', 'job at'),
        (r'\bJunior Project Manager\b', 'Project Manager'),
        (r'\bI\'m writing to\b', 'I want to'),
        (r'\bexpress my\b', 'show my'),
        (r'\bgenuine interest in\b', 'real interest in'),
    ]
    
    # Apply paraphrasing rules
    paraphrased_text = text
    changes_made = 0
    for pattern, replacement in paraphrasing_rules:
        new_text = re.sub(pattern, replacement, paraphrased_text, flags=re.IGNORECASE)
        if new_text != paraphrased_text:
            changes_made += 1
        paraphrased_text = new_text
    
    # Log if no changes were made
    if changes_made == 0:
        logger.info(f"No paraphrasing patterns matched for text: {text[:50]}...")
    
    return paraphrased_text

# Removed unused functions since we're using regex-based approach

# Removed unused fallback function

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=True  # Always true for regex-based system
    )

@router.post("/load-model")
async def load_model():
    """Load the semantic-enhanced dictionary-based humanization system."""
    try:
        success = load_lucie7b_model()
        if success:
            return {"status": "success", "message": "Semantic-enhanced dictionary-based system loaded successfully"}
        else:
            return {"status": "error", "message": "Failed to load semantic-enhanced dictionary-based system"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/humanize", response_model=HumanizeResponse)
async def humanize_text(request: HumanizeRequest):
    """
    Rewrites AI-generated text to sound more natural using semantic-enhanced dictionary-based system.
    """
    start_time = time.time()
    
    # Validate inputs
    text = validate_text_input(request.text)
    tone = validate_tone_input(request.tone)
    
    logger.info(f"Humanizing text with semantic-enhanced dictionary-based system, tone: {tone}")
    logger.info(f"Original text: {text[:100]}...")

    # Use semantic-enhanced dictionary-based system for humanization
    humanized_text = await humanize_with_lucie7b(text, tone)

    processing_time = time.time() - start_time
    logger.info(f"Humanized text: {humanized_text[:100]}...")

    return HumanizeResponse(
        humanized_text=humanized_text,
        tone=tone,
        model="lucie7b",
        processing_time=processing_time
    ) 