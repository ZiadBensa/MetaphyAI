"""
Data models for the text humanizer tool.
"""
from typing import Optional
from pydantic import BaseModel

class HumanizeRequest(BaseModel):
    """Request model for text humanization."""
    text: str
    tone: str = "casual"
    model: Optional[str] = "regex"

class HumanizeResponse(BaseModel):
    """Response model for text humanization."""
    humanized_text: str
    tone: str
    model: str
    processing_time: Optional[float] = None

class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    model_loaded: bool
    tool: str = "text_humanizer" 