"""
FastAPI router for PDF Summarizer endpoints.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import os
import logging
from typing import Optional

from .models import (
    SummarizeRequest, SummarizeResponse, ChatRequest, ChatResponse,
    PDFExtractResponse, PDFInfo, SummaryStyle
)
from .pdf_extractor import PDFExtractor
from .summarizer import PDFSummarizer

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/pdf-summarizer", tags=["PDF Summarizer"])

# Initialize components
pdf_extractor = PDFExtractor()

def get_summarizer() -> PDFSummarizer:
    """Dependency to get PDF summarizer instance."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    return PDFSummarizer(api_key)


@router.post("/upload", response_model=PDFExtractResponse)
async def upload_and_extract_pdf(
    file: UploadFile = File(...),
    summarizer: PDFSummarizer = Depends(get_summarizer)
):
    """
    Upload a PDF file and extract its text content.
    
    Args:
        file: PDF file to upload
        summarizer: PDF summarizer instance
        
    Returns:
        Extracted text and PDF metadata
    """
    try:
        # Validate file
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read file content
        file_content = await file.read()
        
        # Validate PDF
        if not pdf_extractor.validate_pdf(file_content, file.filename):
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file")
        
        # Extract text
        text, metadata = pdf_extractor.extract_text(file_content, file.filename)
        
        if not text or len(text.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract sufficient text from PDF. The PDF might be scanned or image-based."
            )
        
        # Create response
        pdf_info = PDFInfo(
            filename=metadata['filename'],
            pages=metadata['pages'],
            size_bytes=metadata['size_bytes'],
            text_length=metadata['text_length'],
            extraction_time=metadata['extraction_time']
        )
        
        return PDFExtractResponse(text=text, info=pdf_info)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF upload and extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(
    request: SummarizeRequest,
    summarizer: PDFSummarizer = Depends(get_summarizer)
):
    """
    Generate a summary of the provided text.
    
    Args:
        request: Summarization request with text and parameters
        summarizer: PDF summarizer instance
        
    Returns:
        Generated summary and metadata
    """
    try:
        # Validate input
        if not request.text or len(request.text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Text must be at least 50 characters long")
        
        # Generate summary
        result = summarizer.summarize(
            text=request.text,
            style=request.style,
            max_length=request.max_length,
            language=request.language
        )
        
        return SummarizeResponse(
            summary=result['summary'],
            style=result['style'],
            original_length=result['original_length'],
            summary_length=result['summary_length'],
            processing_time=result['processing_time']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat_about_pdf(
    request: ChatRequest,
    summarizer: PDFSummarizer = Depends(get_summarizer)
):
    """
    Chat with AI about PDF content.
    
    Args:
        request: Chat request with messages and PDF context
        summarizer: PDF summarizer instance
        
    Returns:
        AI response and metadata
    """
    try:
        # Validate input
        if not request.messages:
            raise HTTPException(status_code=400, detail="At least one message is required")
        
        if not request.pdf_context or len(request.pdf_context.strip()) < 50:
            raise HTTPException(status_code=400, detail="PDF context must be at least 50 characters long")
        
        # Generate chat response
        result = summarizer.chat_about_pdf(
            messages=request.messages,
            pdf_context=request.pdf_context
        )
        
        return ChatResponse(
            response=result['response'],
            processing_time=result['processing_time']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Chat generation failed: {error_msg}")
        
        # Check for specific error types and return appropriate status codes
        if "quota" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(status_code=429, detail="API quota exceeded. Please wait a few minutes or check your billing plan.")
        elif "rate limit" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait before making another request.")
        elif "model" in error_msg.lower() and "not found" in error_msg.lower():
            raise HTTPException(status_code=503, detail="AI model not available. Please check the model configuration.")
        elif "api key" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Invalid API key. Please check your Gemini API configuration.")
        else:
            raise HTTPException(status_code=500, detail=f"Failed to generate chat response: {error_msg}")


@router.post("/key-points")
async def extract_key_points(
    text: str,
    max_points: int = 10,
    summarizer: PDFSummarizer = Depends(get_summarizer)
):
    """
    Extract key points from PDF text.
    
    Args:
        text: Text to analyze
        max_points: Maximum number of key points to extract
        summarizer: PDF summarizer instance
        
    Returns:
        List of key points
    """
    try:
        if not text or len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Text must be at least 50 characters long")
        
        key_points = summarizer.extract_key_points(text, max_points)
        
        return {
            "key_points": key_points,
            "count": len(key_points)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Key points extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract key points: {str(e)}")


@router.post("/questions")
async def generate_questions(
    text: str,
    num_questions: int = 5,
    summarizer: PDFSummarizer = Depends(get_summarizer)
):
    """
    Generate questions about PDF content.
    
    Args:
        text: Text to analyze
        num_questions: Number of questions to generate
        summarizer: PDF summarizer instance
        
    Returns:
        List of questions
    """
    try:
        if not text or len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Text must be at least 50 characters long")
        
        questions = summarizer.generate_questions(text, num_questions)
        
        return {
            "questions": questions,
            "count": len(questions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")


@router.get("/styles")
async def get_summary_styles():
    """
    Get available summary styles.
    
    Returns:
        List of available summary styles
    """
    return {
        "styles": [
            {
                "value": style.value,
                "label": style.value.replace("_", " ").title(),
                "description": get_style_description(style)
            }
            for style in SummaryStyle
        ]
    }


def get_style_description(style: SummaryStyle) -> str:
    """Get description for a summary style."""
    descriptions = {
        SummaryStyle.CONCISE: "Brief, focused summary highlighting main points",
        SummaryStyle.DETAILED: "Comprehensive summary with important details and examples",
        SummaryStyle.BULLET_POINTS: "Organized summary in bullet-point format",
        SummaryStyle.EXECUTIVE: "High-level summary for business and decision-making",
        SummaryStyle.ACADEMIC: "Formal academic summary with methodology and findings"
    }
    return descriptions.get(style, "Standard summary")


@router.get("/health")
async def health_check():
    """Health check endpoint for PDF summarizer."""
    return {
        "status": "healthy",
        "service": "PDF Summarizer",
        "features": [
            "PDF text extraction",
            "AI summarization",
            "Chat interface",
            "Key points extraction",
            "Question generation"
        ]
    }

@router.get("/debug")
async def debug_info():
    """Debug endpoint to check API configuration."""
    try:
        import os
        import google.generativeai as genai
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {
                "status": "error",
                "message": "GEMINI_API_KEY not found in environment variables",
                "api_key_configured": False
            }
        
        # Test API connection
        genai.configure(api_key=api_key)
        models = genai.list_models()
        available_models = [model.name for model in models if "gemini" in model.name.lower()]
        
        return {
            "status": "healthy",
            "message": "API configuration check completed",
            "api_key_configured": True,
            "api_key_length": len(api_key) if api_key else 0,
            "available_gemini_models": available_models,
            "current_model": "gemini-1.5-pro",
            "model_available": "gemini-1.5-pro" in available_models
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Debug check failed: {str(e)}",
            "api_key_configured": False
        }

