"""
AI PDF Summarizer Module

Uses Google's Gemini AI to generate intelligent summaries from PDF text
with multiple styles and customization options.
"""
import google.generativeai as genai
import time
import logging
from typing import Optional
from .models import SummaryStyle

logger = logging.getLogger(__name__)


class PDFSummarizer:
    """Handles AI-powered PDF summarization using Gemini."""
    
    def __init__(self, api_key: str):
        """Initialize the summarizer with Gemini API key."""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-1.5-flash')
        
        # Define summary style prompts
        self.style_prompts = {
            SummaryStyle.CONCISE: """
            Create a concise summary of the following text in {language}. 
            Focus on the main points and key insights. Keep it brief but informative.
            Maximum length: {max_length} words.
            
            Text to summarize:
            {text}
            """,
            
            SummaryStyle.DETAILED: """
            Create a detailed summary of the following text in {language}.
            Include important details, examples, and supporting information.
            Maintain the logical flow and structure of the original content.
            Maximum length: {max_length} words.
            
            Text to summarize:
            {text}
            """,
            
            SummaryStyle.BULLET_POINTS: """
            Create a bullet-point summary of the following text in {language}.
            Organize the main points and key insights into clear, concise bullet points.
            Use proper formatting with • or - for bullets.
            Maximum length: {max_length} words.
            
            Text to summarize:
            {text}
            """,
            
            SummaryStyle.EXECUTIVE: """
            Create an executive summary of the following text in {language}.
            Focus on high-level insights, conclusions, and actionable recommendations.
            Write in a professional, business-oriented tone.
            Maximum length: {max_length} words.
            
            Text to summarize:
            {text}
            """,
            
            SummaryStyle.ACADEMIC: """
            Create an academic summary of the following text in {language}.
            Include methodology, findings, conclusions, and implications.
            Use formal academic language and structure.
            Maximum length: {max_length} words.
            
            Text to summarize:
            {text}
            """
        }
    
    def summarize(self, text: str, style: SummaryStyle = SummaryStyle.CONCISE, 
                 max_length: int = 500, language: str = "en") -> dict:
        """
        Generate a summary of the provided text.
        
        Args:
            text: Text to summarize
            style: Summary style to use
            max_length: Maximum summary length in words
            language: Output language
            
        Returns:
            Dictionary containing summary and metadata
        """
        start_time = time.time()
        
        try:
            # Prepare the prompt
            prompt = self.style_prompts[style].format(
                text=text,
                max_length=max_length,
                language=language
            )
            
            # Generate summary
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise ValueError("No summary generated")
            
            summary = response.text.strip()
            processing_time = time.time() - start_time
            
            # Calculate metrics
            original_length = len(text.split())
            summary_length = len(summary.split())
            
            result = {
                'summary': summary,
                'style': style,
                'original_length': original_length,
                'summary_length': summary_length,
                'processing_time': processing_time,
                'compression_ratio': round((1 - summary_length / original_length) * 100, 1) if original_length > 0 else 0
            }
            
            logger.info(f"Summary generated successfully in {processing_time:.2f}s")
            logger.info(f"Original: {original_length} words, Summary: {summary_length} words")
            
            return result
            
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            raise RuntimeError(f"Failed to generate summary: {str(e)}")
    
    def chat_about_pdf(self, messages: list, pdf_context: str) -> dict:
        """
        Chat with AI about PDF content.
        
        Args:
            messages: List of chat messages
            pdf_context: PDF content for context
            
        Returns:
            Dictionary containing AI response and metadata
        """
        start_time = time.time()
        
        try:
            # Build context-aware prompt
            context_prompt = f"""
            You are an AI assistant that helps users understand PDF documents. 
            Here is the content of the PDF they're asking about:
            
            {pdf_context}
            
            Please answer their questions based on this content. If the question cannot be answered 
            from the PDF content, politely say so. Be helpful, accurate, and concise.
            """
            
            # Combine context with conversation history
            full_prompt = context_prompt + "\n\nConversation:\n"
            for msg in messages:
                # Handle both dict and object formats
                if isinstance(msg, dict):
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                else:
                    role = getattr(msg, 'role', 'user')
                    content = getattr(msg, 'content', '')
                full_prompt += f"{role.title()}: {content}\n"
            
            full_prompt += "\nAssistant:"
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            if not response.text:
                raise ValueError("No response generated")
            
            ai_response = response.text.strip()
            processing_time = time.time() - start_time
            
            result = {
                'response': ai_response,
                'processing_time': processing_time
            }
            
            logger.info(f"Chat response generated in {processing_time:.2f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Chat generation failed: {e}")
            raise RuntimeError(f"Failed to generate chat response: {str(e)}")
    
    def extract_key_points(self, text: str, max_points: int = 10) -> list:
        """
        Extract key points from PDF text.
        
        Args:
            text: Text to analyze
            max_points: Maximum number of key points to extract
            
        Returns:
            List of key points
        """
        try:
            prompt = f"""
            Extract the {max_points} most important key points from the following text.
            Present them as a numbered list of concise statements.
            
            Text:
            {text}
            """
            
            response = self.model.generate_content(prompt)
            
            if not response.text:
                return []
            
            # Parse the response into a list
            lines = response.text.strip().split('\n')
            key_points = []
            
            for line in lines:
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('•') or line.startswith('-')):
                    # Remove numbering/bullets and clean up
                    cleaned = line.lstrip('0123456789.-• ').strip()
                    if cleaned:
                        key_points.append(cleaned)
            
            return key_points[:max_points]
            
        except Exception as e:
            logger.error(f"Key points extraction failed: {e}")
            return []
    
    def generate_questions(self, text: str, num_questions: int = 5) -> list:
        """
        Generate questions about the PDF content.
        
        Args:
            text: Text to analyze
            num_questions: Number of questions to generate
            
        Returns:
            List of questions
        """
        try:
            prompt = f"""
            Generate {num_questions} insightful questions about the following text.
            These should be questions that someone might ask to better understand the content.
            
            Text:
            {text}
            """
            
            response = self.model.generate_content(prompt)
            
            if not response.text:
                return []
            
            # Parse the response into a list
            lines = response.text.strip().split('\n')
            questions = []
            
            for line in lines:
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('•') or line.startswith('-')):
                    # Remove numbering/bullets and clean up
                    cleaned = line.lstrip('0123456789.-• ').strip()
                    if cleaned and cleaned.endswith('?'):
                        questions.append(cleaned)
            
            return questions[:num_questions]
            
        except Exception as e:
            logger.error(f"Question generation failed: {e}")
            return []

