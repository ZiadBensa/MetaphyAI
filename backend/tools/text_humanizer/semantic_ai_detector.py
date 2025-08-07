"""
Semantic AI Content Detector with pattern analysis.
"""
import re
from typing import Dict, Any, Optional, List
from core.dependencies import get_logger

logger = get_logger(__name__)

class SemanticAIDetector:
    """AI content detector using semantic pattern analysis."""
    
    def __init__(self):
        """Initialize the semantic AI detector."""
        
        # AI-specific patterns that LLMs commonly use
        self.ai_patterns = {
            "formal_phrases": [
                "it is important to note", "furthermore", "moreover", "additionally",
                "in conclusion", "to summarize", "it should be noted", "it is worth mentioning",
                "as a result", "consequently", "therefore", "thus", "hence",
                "in order to", "for the purpose of", "with regard to", "in terms of",
                "in the context of", "it is evident that", "it is clear that",
                "the implementation of", "the utilization of", "the demonstration of",
                "comprehensive framework", "systematic approach", "methodological approach",
                "optimal solution", "efficient methodology", "robust analysis"
            ],
            "academic_phrases": [
                "research methodology", "data collection", "statistical analysis",
                "quantitative analysis", "qualitative analysis", "mixed-methods approach",
                "correlation analysis", "regression analysis", "hypothesis testing",
                "literature review", "theoretical framework", "conceptual model",
                "empirical evidence", "statistical significance", "confidence interval",
                "standard deviation", "mean value", "median value", "mode analysis"
            ],
            "business_phrases": [
                "key performance indicators", "operational efficiency", "strategic planning",
                "market analysis", "competitive advantage", "stakeholder engagement",
                "risk assessment", "cost-benefit analysis", "return on investment",
                "scalable solution", "best practices", "industry standards",
                "quality assurance", "continuous improvement", "process optimization"
            ],
            "repetitive_patterns": [
                "the analysis shows", "the analysis reveals", "the analysis demonstrates",
                "the analysis indicates", "the analysis suggests", "the analysis confirms",
                "the results show", "the results reveal", "the results demonstrate",
                "the findings show", "the findings reveal", "the findings demonstrate",
                "it is important to", "it is crucial to", "it is essential to",
                "it is necessary to", "it is vital to", "it is fundamental to"
            ],
            "ai_specific_words": [
                "algorithm", "optimization", "implementation", "methodology",
                "framework", "paradigm", "protocol", "infrastructure",
                "architecture", "system", "mechanism", "process",
                "procedure", "technique", "approach", "strategy"
            ]
        }
        
        # Human-like patterns that indicate natural writing
        self.human_patterns = {
            "casual_phrases": [
                "you know", "like", "um", "uh", "well", "so", "basically",
                "actually", "literally", "honestly", "frankly", "seriously",
                "anyway", "anyhow", "whatever", "stuff", "things", "gonna",
                "wanna", "gotta", "kinda", "sorta", "pretty much"
            ],
            "personal_pronouns": [
                "i", "me", "my", "mine", "myself", "we", "us", "our", "ours",
                "you", "your", "yours", "yourself", "yourselves"
            ],
            "emotional_words": [
                "love", "hate", "like", "dislike", "enjoy", "hate", "feel",
                "think", "believe", "hope", "wish", "want", "need", "crazy",
                "awesome", "amazing", "terrible", "horrible", "great", "good",
                "bad", "nice", "cool", "sweet", "awesome", "fantastic"
            ],
            "contractions": [
                "don't", "can't", "won't", "isn't", "aren't", "wasn't", "weren't",
                "hasn't", "haven't", "hadn't", "doesn't", "didn't", "wouldn't",
                "couldn't", "shouldn't", "mightn't", "mustn't", "shan't"
            ]
        }
        

    
    def _analyze_semantic_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze text for AI and human semantic patterns."""
        text_lower = text.lower()
        words = text.split()
        
        # Count AI patterns
        ai_scores = {}
        for pattern_type, patterns in self.ai_patterns.items():
            count = 0
            for pattern in patterns:
                count += len(re.findall(r'\b' + re.escape(pattern.lower()) + r'\b', text_lower))
            ai_scores[pattern_type] = count
        
        # Count human patterns
        human_scores = {}
        for pattern_type, patterns in self.human_patterns.items():
            count = 0
            for pattern in patterns:
                count += len(re.findall(r'\b' + re.escape(pattern.lower()) + r'\b', text_lower))
            human_scores[pattern_type] = count
        
        # Calculate pattern densities
        total_words = len(words)
        ai_pattern_density = sum(ai_scores.values()) / max(total_words, 1)
        human_pattern_density = sum(human_scores.values()) / max(total_words, 1)
        
        # Calculate formality score
        formal_indicators = (
            ai_scores.get('formal_phrases', 0) +
            ai_scores.get('academic_phrases', 0) +
            ai_scores.get('business_phrases', 0)
        )
        casual_indicators = (
            human_scores.get('casual_phrases', 0) +
            human_scores.get('emotional_words', 0) +
            human_scores.get('contractions', 0)
        )
        
        formality_score = formal_indicators / max(total_words, 1)
        casual_score = casual_indicators / max(total_words, 1)
        
        # Calculate repetition score
        repetition_score = ai_scores.get('repetitive_patterns', 0) / max(total_words, 1)
        
        return {
            "ai_pattern_density": ai_pattern_density,
            "human_pattern_density": human_pattern_density,
            "formality_score": formality_score,
            "casual_score": casual_score,
            "repetition_score": repetition_score,
            "ai_scores": ai_scores,
            "human_scores": human_scores
        }
    
    def _calculate_semantic_confidence(self, semantic_analysis: Dict[str, Any]) -> float:
        """Calculate confidence based on semantic pattern analysis."""
        ai_density = semantic_analysis["ai_pattern_density"]
        human_density = semantic_analysis["human_pattern_density"]
        formality = semantic_analysis["formality_score"]
        casual = semantic_analysis["casual_score"]
        repetition = semantic_analysis["repetition_score"]
        
        # Weight the factors
        ai_confidence = min(ai_density * 10, 1.0)  # Scale up density
        human_confidence = min(human_density * 5, 1.0)  # Scale up density
        formality_confidence = min(formality * 20, 1.0)  # Scale up formality
        casual_confidence = min(casual * 10, 1.0)  # Scale up casual
        
        # Calculate overall semantic confidence
        semantic_confidence = (
            ai_confidence * 0.3 +
            formality_confidence * 0.3 +
            repetition * 0.2 +
            (1.0 - human_confidence) * 0.1 +
            (1.0 - casual_confidence) * 0.1
        )
        
        return min(semantic_confidence, 1.0)
    
    def detect_ai_content(self, text: str) -> Dict[str, Any]:
        """Detect if text is AI-generated using semantic pattern analysis."""
        if not text.strip():
            return {
                "is_ai_generated": False,
                "confidence": 0.0,
                "scores": {"ai_probability": 0.0},
                "analysis": "Empty text provided"
            }
        
        # Perform semantic pattern analysis
        semantic_analysis = self._analyze_semantic_patterns(text)
        semantic_confidence = self._calculate_semantic_confidence(semantic_analysis)
        
        return self._semantic_response(semantic_analysis, semantic_confidence)
    
    def _semantic_response(self, semantic_analysis: Dict[str, Any], semantic_confidence: float) -> Dict[str, Any]:
        """Generate response using semantic analysis."""
        # Use semantic confidence to determine AI generation
        is_ai_generated = semantic_confidence > 0.6
        
        analysis = self._generate_semantic_analysis(semantic_analysis, is_ai_generated)
        
        return {
            "is_ai_generated": is_ai_generated,
            "confidence": round(semantic_confidence, 3),
            "scores": {
                "ai_probability": round(semantic_confidence, 3),
                "human_probability": round(1.0 - semantic_confidence, 3),
                "semantic_confidence": round(semantic_confidence, 3)
            },
            "semantic_analysis": semantic_analysis,
            "analysis": analysis
        }
    
    def _generate_semantic_analysis(self, semantic_analysis: Dict[str, Any], is_ai_generated: bool) -> str:
        """Generate analysis based on semantic patterns only."""
        ai_density = semantic_analysis["ai_pattern_density"]
        human_density = semantic_analysis["human_pattern_density"]
        formality = semantic_analysis["formality_score"]
        repetition = semantic_analysis["repetition_score"]
        
        analysis_parts = []
        
        if ai_density > 0.1:
            analysis_parts.append(f"High AI pattern density ({ai_density:.3f})")
        elif ai_density > 0.05:
            analysis_parts.append(f"Moderate AI pattern density ({ai_density:.3f})")
        
        if human_density > 0.05:
            analysis_parts.append(f"Human pattern indicators ({human_density:.3f})")
        
        if formality > 0.1:
            analysis_parts.append(f"High formality ({formality:.3f})")
        
        if repetition > 0.05:
            analysis_parts.append(f"Repetitive patterns ({repetition:.3f})")
        
        if is_ai_generated:
            analysis_parts.append("Semantic analysis suggests AI generation")
        else:
            analysis_parts.append("Semantic analysis suggests human writing")
        
        return ". ".join(analysis_parts) + "."
    
# Global instance for reuse
_semantic_detector_instance: Optional[SemanticAIDetector] = None

def get_semantic_detector() -> SemanticAIDetector:
    """Get or create the global semantic detector instance."""
    global _semantic_detector_instance
    if _semantic_detector_instance is None:
        _semantic_detector_instance = SemanticAIDetector()
    return _semantic_detector_instance

def detect_ai_content(text: str) -> Dict[str, Any]:
    """Convenience function to detect AI content using semantic analysis."""
    detector = get_semantic_detector()
    return detector.detect_ai_content(text) 