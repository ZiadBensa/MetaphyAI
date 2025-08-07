"""
Hugging Face AI Content Detector using transformer-based models.
"""
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Dict, Any, Optional
from core.dependencies import get_logger

logger = get_logger(__name__)

class HuggingFaceAIDetector:
    """AI content detector using pre-trained transformer models."""
    
    def __init__(self, model_name: str = "fakespot-ai/roberta-base-ai-text-detection-v1"):
        """Initialize the Hugging Face AI detector."""
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._load_model()
    
    def _load_model(self):
        """Load the pre-trained model and tokenizer."""
        try:
            logger.info(f"Loading AI detection model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            logger.info(f"AI detection model loaded successfully on {self.device}")
        except Exception as e:
            logger.error(f"Error loading AI detection model: {e}")
            raise
    
    def detect_ai_content(self, text: str) -> Dict[str, Any]:
        """Detect if text is AI-generated using the transformer model."""
        if not text.strip():
            return {
                "is_ai_generated": False,
                "confidence": 0.0,
                "scores": {"ai_probability": 0.0},
                "analysis": "Empty text provided"
            }
        
        try:
            # Tokenize the text
            inputs = self.tokenizer(
                text,
                truncation=True,
                padding=True,
                max_length=512,
                return_tensors="pt"
            ).to(self.device)
            
            # Get model predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                probabilities = torch.softmax(outputs.logits, dim=1)
            
            # Extract AI probability (assuming binary classification: human=0, ai=1)
            ai_probability = probabilities[0][1].item()
            human_probability = probabilities[0][0].item()
            
            # Use a more sensitive threshold for AI detection
            # Flag as AI if probability is > 0.55 (more sensitive)
            is_ai_generated = ai_probability > 0.55
            
            # Calculate confidence based on how far from threshold
            # More sensitive confidence calculation
            if is_ai_generated:
                confidence = min((ai_probability - 0.55) * 2.22, 1.0)  # Scale to 0-1
            else:
                confidence = min((0.55 - ai_probability) * 2.22, 1.0)  # Scale to 0-1
            
            # Generate analysis
            analysis = self._generate_analysis(ai_probability, is_ai_generated)
            
            return {
                "is_ai_generated": is_ai_generated,
                "confidence": confidence,
                "scores": {
                    "ai_probability": ai_probability,
                    "human_probability": human_probability
                },
                "analysis": analysis
            }
            
        except Exception as e:
            logger.error(f"Error in AI detection: {e}")
            return {
                "is_ai_generated": False,
                "confidence": 0.0,
                "scores": {"ai_probability": 0.0, "human_probability": 1.0},
                "analysis": f"Error occurred during analysis: {str(e)}"
            }
    
    def _generate_analysis(self, ai_probability: float, is_ai_generated: bool) -> str:
        """Generate human-readable analysis of the detection results."""
        if ai_probability > 0.9:
            return "Very high confidence that this text was AI-generated. The language patterns strongly indicate automated content creation."
        elif ai_probability > 0.8:
            return "High confidence that this text was AI-generated. Multiple patterns suggest automated content."
        elif ai_probability > 0.7:
            return "Moderate confidence that this text was AI-generated. Some patterns suggest automated content."
        elif ai_probability > 0.6:
            return "Low confidence in AI detection. The text shows some automated characteristics but could be human-written."
        elif ai_probability > 0.55:
            return "Slight indication of AI generation. The text shows some automated characteristics."
        elif ai_probability > 0.5:
            return "Very low confidence in AI detection. The text shows mixed characteristics typical of human writing."
        elif ai_probability > 0.4:
            return "Low probability of AI generation. The text appears to be human-written with natural language patterns."
        elif ai_probability > 0.2:
            return "Very low probability of AI generation. The text shows strong human writing characteristics."
        else:
            return "Extremely low probability of AI generation. The text shows very strong human writing characteristics."

# Global instance for reuse
_ai_detector_instance: Optional[HuggingFaceAIDetector] = None

def get_ai_detector() -> HuggingFaceAIDetector:
    """Get or create the global AI detector instance."""
    global _ai_detector_instance
    if _ai_detector_instance is None:
        _ai_detector_instance = HuggingFaceAIDetector()
    return _ai_detector_instance

def detect_ai_content(text: str) -> Dict[str, Any]:
    """Convenience function to detect AI content."""
    detector = get_ai_detector()
    return detector.detect_ai_content(text) 