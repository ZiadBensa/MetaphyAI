"""
Data models for the text humanizer tool.
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class HumanizeRequest(BaseModel):
    """Request model for text humanization."""
    text: str = Field(..., description="Text to humanize", min_length=1)
    tone: str = Field(default="casual", description="Tone for humanization")
    model: Optional[str] = Field(default="semantic", description="Model to use")

class HumanizeResponse(BaseModel):
    """Response model for text humanization."""
    humanized_text: str = Field(..., description="Humanized text")
    tone: str = Field(..., description="Tone used")
    model: str = Field(..., description="Model used")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    ai_detection: Optional[Dict[str, Any]] = Field(None, description="AI content detection results")

class HealthResponse(BaseModel):
    """Health check response model."""
    status: str = Field(..., description="Health status")
    model_loaded: bool = Field(..., description="Whether model is loaded")
    tool: str = Field(default="text_humanizer", description="Tool name")
    nltk_status: Optional[dict] = Field(None, description="NLTK status information")

class AIDetectionRequest(BaseModel):
    """Request model for AI content detection."""
    text: str = Field(..., description="Text to analyze", min_length=1)

class AIDetectionResponse(BaseModel):
    """Response model for AI content detection."""
    is_ai_generated: bool = Field(..., description="Whether text is AI-generated")
    confidence: float = Field(..., description="Confidence score (0-1)")
    scores: Dict[str, float] = Field(..., description="Individual analysis scores")
    analysis: str = Field(..., description="Human-readable analysis") 