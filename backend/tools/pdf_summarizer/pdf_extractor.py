"""
PDF Text Extraction Module

Handles extraction of text from various types of PDFs including:
- Text-based PDFs
- Scanned PDFs (OCR)
- PDFs with complex layouts
"""
import pdfplumber
import PyPDF2
import io
import time
import logging
from typing import Tuple, Optional
from pathlib import Path

# Try to import magic, but handle Windows compatibility
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False

logger = logging.getLogger(__name__)


class PDFExtractor:
    """Handles PDF text extraction with multiple fallback methods."""
    
    def __init__(self):
        self.supported_extensions = {'.pdf'}
    
    def extract_text(self, file_content: bytes, filename: str) -> Tuple[str, dict]:
        """
        Extract text from PDF file content.
        
        Args:
            file_content: PDF file bytes
            filename: Original filename
            
        Returns:
            Tuple of (extracted_text, metadata)
        """
        start_time = time.time()
        
        # Validate file extension
        file_path = Path(filename)
        if file_path.suffix.lower() not in self.supported_extensions:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")
        
        # Try pdfplumber first (better for complex layouts)
        text, metadata = self._extract_with_pdfplumber(file_content, filename)
        
        # If pdfplumber fails or returns minimal text, try PyPDF2
        if not text or len(text.strip()) < 100:
            logger.info("pdfplumber extraction yielded minimal text, trying PyPDF2")
            text, metadata = self._extract_with_pypdf2(file_content, filename)
        
        extraction_time = time.time() - start_time
        metadata['extraction_time'] = extraction_time
        metadata['text_length'] = len(text)
        
        logger.info(f"PDF extraction completed in {extraction_time:.2f}s, extracted {len(text)} characters")
        
        return text, metadata
    
    def _extract_with_pdfplumber(self, file_content: bytes, filename: str) -> Tuple[str, dict]:
        """Extract text using pdfplumber."""
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                text_parts = []
                pages = len(pdf.pages)
                
                for page_num, page in enumerate(pdf.pages, 1):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text_parts.append(page_text)
                        logger.debug(f"Extracted text from page {page_num}")
                    except Exception as e:
                        logger.warning(f"Failed to extract text from page {page_num}: {e}")
                        continue
                
                text = '\n\n'.join(text_parts)
                
                metadata = {
                    'filename': filename,
                    'pages': pages,
                    'size_bytes': len(file_content),
                    'method': 'pdfplumber'
                }
                
                return text, metadata
                
        except Exception as e:
            logger.error(f"pdfplumber extraction failed: {e}")
            return "", {}
    
    def _extract_with_pypdf2(self, file_content: bytes, filename: str) -> Tuple[str, dict]:
        """Extract text using PyPDF2 as fallback."""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text_parts = []
            pages = len(pdf_reader.pages)
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                    logger.debug(f"Extracted text from page {page_num} using PyPDF2")
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num} using PyPDF2: {e}")
                    continue
            
            text = '\n\n'.join(text_parts)
            
            metadata = {
                'filename': filename,
                'pages': pages,
                'size_bytes': len(file_content),
                'method': 'pypdf2'
            }
            
            return text, metadata
            
        except Exception as e:
            logger.error(f"PyPDF2 extraction failed: {e}")
            return "", {}
    
    def validate_pdf(self, file_content: bytes, filename: str) -> bool:
        """
        Validate if the file is a valid PDF.
        
        Args:
            file_content: File bytes
            filename: Original filename
            
        Returns:
            True if valid PDF, False otherwise
        """
        try:
            # Check file extension
            if not filename.lower().endswith('.pdf'):
                return False
            
            # Check PDF magic number
            if not file_content.startswith(b'%PDF'):
                return False
            
            # Try to open with pdfplumber
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                if len(pdf.pages) == 0:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"PDF validation failed: {e}")
            return False
    
    def get_pdf_info(self, file_content: bytes, filename: str) -> dict:
        """
        Get basic information about the PDF without extracting text.
        
        Args:
            file_content: PDF file bytes
            filename: Original filename
            
        Returns:
            Dictionary with PDF metadata
        """
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                return {
                    'filename': filename,
                    'pages': len(pdf.pages),
                    'size_bytes': len(file_content),
                    'valid': True
                }
        except Exception as e:
            logger.error(f"Failed to get PDF info: {e}")
            return {
                'filename': filename,
                'pages': 0,
                'size_bytes': len(file_content),
                'valid': False,
                'error': str(e)
            }

