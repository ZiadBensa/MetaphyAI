"""
Shared dependencies and utilities for the backend application.
"""
import logging
from typing import Optional
from fastapi import HTTPException, status

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a specific module."""
    return logging.getLogger(name)

def validate_text_input(text: str, max_length: int = 2048) -> str:
    """Validate and clean text input."""
    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Text cannot be empty."
        )
    
    cleaned_text = text.strip()
    if len(cleaned_text) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Text too long. Maximum length is {max_length} characters."
        )
    
    return cleaned_text

def validate_tone_input(tone: str) -> str:
    """Validate tone input."""
    valid_tones = ["casual", "friendly", "professional", "enthusiastic", "neutral"]
    if tone not in valid_tones:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tone. Must be one of: {', '.join(valid_tones)}"
        )
    return tone 