"""
Pydantic models for PDF Summarizer API.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from enum import Enum


class SummaryStyle(str, Enum):
    """Available summary styles."""
    CONCISE = "concise"
    DETAILED = "detailed"
    BULLET_POINTS = "bullet_points"
    EXECUTIVE = "executive"
    ACADEMIC = "academic"


class SummarizeRequest(BaseModel):
    """Request model for PDF summarization."""
    text: str = Field(..., description="Extracted text from PDF")
    style: SummaryStyle = Field(default=SummaryStyle.CONCISE, description="Summary style")
    max_length: Optional[int] = Field(default=500, description="Maximum summary length")
    language: Optional[str] = Field(default="en", description="Output language")


class SummarizeResponse(BaseModel):
    """Response model for PDF summarization."""
    summary: str = Field(..., description="Generated summary")
    style: SummaryStyle = Field(..., description="Used summary style")
    original_length: int = Field(..., description="Original text length")
    summary_length: int = Field(..., description="Summary length")
    processing_time: float = Field(..., description="Processing time in seconds")


class ChatMessage(BaseModel):
    """Model for chat messages."""
    role: Literal["user", "assistant"] = Field(..., description="Message role")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = Field(default=None, description="Message timestamp")


class ChatRequest(BaseModel):
    """Request model for PDF chat."""
    messages: List[ChatMessage] = Field(..., description="Chat history")
    pdf_context: str = Field(..., description="PDF content context")


class ChatResponse(BaseModel):
    """Response model for PDF chat."""
    response: str = Field(..., description="AI response")
    processing_time: float = Field(..., description="Processing time in seconds")


class PDFInfo(BaseModel):
    """Model for PDF metadata."""
    filename: str = Field(..., description="PDF filename")
    pages: int = Field(..., description="Number of pages")
    size_bytes: int = Field(..., description="File size in bytes")
    text_length: int = Field(..., description="Extracted text length")
    extraction_time: float = Field(..., description="Text extraction time")


class PDFExtractResponse(BaseModel):
    """Response model for PDF text extraction."""
    text: str = Field(..., description="Extracted text")
    info: PDFInfo = Field(..., description="PDF metadata")

