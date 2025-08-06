"""
Gemini API Humanizer for text humanization using Google's Gemini model.
"""
import os
import logging
import re
from typing import Optional, List

logger = logging.getLogger(__name__)

# Try to import Gemini, fall back gracefully if not available
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    logger.warning("google-generativeai not available, Gemini humanizer will fall back to semantic humanizer")
    GEMINI_AVAILABLE = False

class GeminiHumanizer:
    def __init__(self):
        self.model = None
        self.api_key = None
        if GEMINI_AVAILABLE:
            self._load_gemini()
        
    def _load_gemini(self):
        """Load Gemini API configuration"""
        if not GEMINI_AVAILABLE:
            logger.error("Gemini not available - missing google-generativeai package")
            return False
            
        try:
            # Try to get API key from environment variable first
            self.api_key = os.getenv('GEMINI_API_KEY')
            
            # If not found, try to load from config file
            if not self.api_key:
                config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'config.env')
                if os.path.exists(config_path):
                    with open(config_path, 'r') as f:
                        for line in f:
                            if line.startswith('GEMINI_API_KEY='):
                                self.api_key = line.split('=', 1)[1].strip()
                                break
            
            if not self.api_key:
                logger.error("GEMINI_API_KEY not found in environment or config file")
                return False
            
            # Configure Gemini
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            logger.info("Gemini API configured successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load Gemini API: {e}")
            return False
    
    def _create_humanization_prompt(self, text: str) -> str:
        """Create a specialized prompt for humanization using Gemini"""
        prompt = f"""Task: Completely rewrite this text using different words and simpler language while keeping the exact same meaning. Change as many words as possible.

Text: {text}

Rewritten version:"""
        return prompt
    
    def _clean_output(self, text: str, original: str) -> str:
        """Clean the generated output to remove artifacts"""
        # Remove the prompt from the output
        if "Rewritten version:" in text:
            text = text.split("Rewritten version:")[-1].strip()
        
        # Remove any repetitive patterns
        lines = text.split('\n')
        if len(lines) > 1:
            # Take only the first meaningful line
            text = lines[0].strip()
        
        # Remove any remaining prompt artifacts
        text = text.replace("Task: Completely rewrite this text using different words and simpler language while keeping the exact same meaning. Change as many words as possible.", "").strip()
        text = text.replace("Text:", "").strip()
        text = text.replace("Rewritten version:", "").strip()
        
        # Remove excessive punctuation and artifacts
        text = text.replace(":::", "").replace("::", "").replace(":", "")
        text = text.replace("...", "").replace("..", "")
        
        # Remove repetitive words
        words = text.split()
        cleaned_words = []
        for i, word in enumerate(words):
            if i > 0 and word == words[i-1]:
                continue
            cleaned_words.append(word)
        
        text = " ".join(cleaned_words)
        
        # Final cleanup
        text = text.strip()
        
        return text
    
    def _segment_text(self, text: str) -> List[str]:
        """Segment long text into smaller chunks"""
        # Split by sentences first
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            # If adding this sentence would exceed max length, start a new chunk
            if len(current_chunk) + len(sentence) > 1000:  # Gemini has longer context
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence
            else:
                current_chunk += " " + sentence if current_chunk else sentence
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks if chunks else [text]
    
    def _humanize_chunk(self, chunk: str) -> str:
        """Humanize a single text chunk using Gemini"""
        if not GEMINI_AVAILABLE:
            logger.warning("Gemini not available, falling back to semantic humanizer for chunk: " + chunk)
            return chunk # Fallback to semantic humanizer

        try:
            if not self.model:
                logger.error("Gemini model not loaded")
                return chunk
            
            prompt = self._create_humanization_prompt(chunk)
            logger.info(f"Gemini prompt: {prompt[:100]}...")
            
            # Generate response using Gemini
            response = self.model.generate_content(prompt)
            logger.info(f"Gemini raw response: {response.text[:100]}...")
            
            if response.text:
                # Clean the output
                humanized_part = self._clean_output(response.text, chunk)
                logger.info(f"Cleaned response: {humanized_part[:100]}...")
                
                # Safety check - only check for empty or very short responses
                if len(humanized_part.strip()) < 3:
                    logger.warning(f"Gemini output too short: '{humanized_part}'")
                    raise Exception("Gemini returned empty or invalid response")
                
                logger.info(f"Gemini transformation successful: '{chunk}' -> '{humanized_part}'")
                return humanized_part
            else:
                logger.warning("Gemini returned empty response")
                return chunk
                
        except Exception as e:
            logger.error(f"Error humanizing chunk with Gemini: {e}")
            return chunk
    
    def humanize_text(self, text: str) -> str:
        """Humanize text by changing words and sentence structure while preserving meaning"""
        if not GEMINI_AVAILABLE:
            logger.error("Gemini not available, cannot humanize text.")
            return text # Fallback to semantic humanizer

        if not text.strip():
            return text
        
        logger.info(f"Humanizing text with Gemini: {text[:100]}...")
        
        # Segment text if it's too long
        chunks = self._segment_text(text)
        logger.info(f"Text segmented into {len(chunks)} chunks")
        
        humanized_chunks = []
        for i, chunk in enumerate(chunks):
            logger.info(f"Processing chunk {i+1}/{len(chunks)}")
            humanized_chunk = self._humanize_chunk(chunk)
            humanized_chunks.append(humanized_chunk)
        
        # Combine chunks
        humanized_text = " ".join(humanized_chunks)
        
        # Clean up extra spaces
        humanized_text = re.sub(r'\s+', ' ', humanized_text).strip()
        
        logger.info(f"Gemini humanization completed. Original: {len(text)} chars, Humanized: {len(humanized_text)} chars")
        
        return humanized_text

# Global instance
gemini_humanizer = GeminiHumanizer()

def humanize_with_gemini(text: str) -> str:
    """Main function to humanize text using Gemini API"""
    return gemini_humanizer.humanize_text(text) 