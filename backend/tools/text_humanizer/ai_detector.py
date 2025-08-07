"""
Enhanced AI Content Detector with multi-layer detection for improved accuracy.
"""
import re
import math
import statistics
from typing import Dict, List, Tuple, Optional
from collections import Counter, defaultdict
from core.dependencies import get_logger

logger = get_logger(__name__)

class AIContentDetector:
    """Multi-layer AI content detector with improved accuracy."""
    
    def __init__(self):
        """Initialize the enhanced AI content detector."""
        # Enhanced AI indicators with more specific patterns
        self.ai_indicators = {
            "formal_phrases": [
                "it is important to note", "furthermore", "moreover", "in addition",
                "it should be noted", "it is worth mentioning", "as previously mentioned",
                "in conclusion", "to summarize", "in essence", "it can be argued",
                "it is evident that", "it is clear that", "it is apparent that",
                "it is obvious that", "it is noteworthy that", "it is significant that",
                "it is crucial that", "it is essential that", "it is imperative that",
                "it is important to emphasize", "it should be emphasized", "it is worth noting",
                "it is important to highlight", "it is crucial to note", "it is essential to mention",
                "it is imperative to emphasize", "it is important to consider", "it is worth considering",
                "it is important to understand", "it is crucial to understand", "it is essential to understand",
                "in order to", "for the purpose of", "with the aim of", "with the goal of",
                "in an effort to", "in an attempt to", "in a bid to", "in a move to",
                "as a means of", "as a way of", "as a method of", "as a strategy for",
                "this demonstrates", "this shows", "this indicates", "this suggests",
                "this reveals", "this illustrates", "this exemplifies", "this highlights",
                "it is worth emphasizing", "it should be highlighted", "it is crucial to emphasize",
                "it is essential to highlight", "it is important to stress", "it should be stressed",
                "it is worth stressing", "it is crucial to stress", "it is essential to stress"
            ],
            "academic_phrases": [
                "according to", "based on", "in terms of", "with respect to", "in relation to",
                "in the context of", "in light of", "in view of", "in consideration of",
                "as a result of", "as a consequence of", "due to the fact that",
                "in accordance with", "in compliance with", "in conformity with",
                "in line with", "in keeping with", "in agreement with", "in accordance with",
                "in response to", "in reaction to", "in reply to", "in answer to",
                "with regard to", "in reference to", "in connection with", "in association with",
                "in conjunction with", "in combination with", "in coordination with",
                "in collaboration with", "in partnership with", "in cooperation with"
            ],
            "complex_words": [
                "implementation", "methodology", "comprehensive", "analysis", "framework",
                "optimization", "utilization", "facilitate", "demonstrate", "illustrate",
                "elaborate", "subsequently", "consequently", "furthermore", "moreover",
                "additionally", "nevertheless", "nonetheless", "conversely", "alternatively",
                "specifically", "particularly", "especially", "notably", "significantly",
                "considerably", "substantially", "considerable", "significant", "substantial",
                "comprehensive", "extensive", "thorough", "detailed", "elaborate", "sophisticated",
                "advanced", "complex", "intricate", "nuanced", "sophisticated", "systematic",
                "methodical", "analytical", "theoretical", "conceptual", "empirical", "quantitative",
                "qualitative", "statistical", "probabilistic", "deterministic", "algorithmic",
                "methodological", "systematic", "structured", "organized", "coordinated",
                "integrated", "unified", "consolidated", "streamlined", "optimized"
            ],
            "ai_specific_patterns": [
                "the following", "as follows", "in the following", "the following are",
                "it should be noted that", "it is important to note that", "it is worth noting that",
                "in conclusion", "to conclude", "in summary", "to summarize",
                "firstly", "secondly", "thirdly", "finally", "lastly",
                "on the one hand", "on the other hand", "in contrast", "however",
                "nevertheless", "nonetheless", "despite this", "in spite of",
                "in addition to", "furthermore", "moreover", "additionally",
                "as a result", "consequently", "therefore", "thus", "hence",
                "for example", "for instance", "such as", "including", "specifically",
                "in particular", "especially", "notably", "significantly"
            ]
        }
        
        # Enhanced human indicators
        self.human_indicators = {
            "contractions": [
                "don't", "can't", "won't", "isn't", "aren't", "wasn't", "weren't",
                "hasn't", "haven't", "hadn't", "doesn't", "didn't", "wouldn't",
                "couldn't", "shouldn't", "mightn't", "mustn't", "shan't",
                "i'm", "you're", "he's", "she's", "it's", "we're", "they're",
                "i've", "you've", "we've", "they've", "i'd", "you'd", "he'd",
                "she'd", "we'd", "they'd", "i'll", "you'll", "he'll", "she'll",
                "we'll", "they'll", "that's", "there's", "here's", "where's"
            ],
            "informal_words": [
                "gonna", "wanna", "gotta", "lemme", "gimme", "kinda", "sorta",
                "yeah", "yep", "nope", "nah", "uh", "um", "hmm", "wow", "cool",
                "awesome", "amazing", "great", "good", "bad", "terrible", "horrible",
                "nice", "sweet", "dude", "guy", "buddy", "pal", "friend", "mate",
                "stuff", "thing", "things", "stuff", "guy", "guys", "girl", "girls",
                "kid", "kids", "mom", "dad", "bro", "sis", "fam", "fam", "fam"
            ],
            "emotional_words": [
                "love", "hate", "like", "dislike", "enjoy", "enjoyed", "enjoying",
                "happy", "sad", "angry", "excited", "worried", "scared", "nervous",
                "confused", "surprised", "shocked", "amazed", "disappointed",
                "frustrated", "annoyed", "irritated", "upset", "mad", "glad",
                "pleased", "satisfied", "content", "relieved", "anxious", "stressed",
                "furious", "livid", "ecstatic", "thrilled", "devastated", "heartbroken",
                "overjoyed", "delighted", "miserable", "terrified", "petrified"
            ],
            "filler_words": [
                "like", "you know", "i mean", "basically", "actually", "literally",
                "honestly", "frankly", "seriously", "obviously", "clearly", "apparently",
                "supposedly", "allegedly", "reportedly", "evidently", "presumably",
                "probably", "maybe", "perhaps", "possibly", "hopefully", "hopefully"
            ]
        }
    
    def _calculate_enhanced_perplexity(self, text: str) -> float:
        """Calculate enhanced perplexity using trigrams and smoothing."""
        words = text.lower().split()
        if len(words) < 3:
            return 0.0
        
        # Calculate trigram probabilities with smoothing
        trigrams = list(zip(words[:-2], words[1:-1], words[2:]))
        bigrams = list(zip(words[:-1], words[1:]))
        
        trigram_counts = Counter(trigrams)
        bigram_counts = Counter(bigrams)
        word_counts = Counter(words)
        
        total_trigrams = len(trigrams)
        if total_trigrams == 0:
            return 0.0
        
        # Add-1 smoothing
        vocab_size = len(word_counts)
        log_prob = 0.0
        
        for trigram in trigrams:
            bigram = (trigram[0], trigram[1])
            count_trigram = trigram_counts[trigram] + 1
            count_bigram = bigram_counts[bigram] + vocab_size
            prob = count_trigram / count_bigram
            log_prob += math.log(prob)
        
        perplexity = math.exp(-log_prob / total_trigrams)
        return perplexity
    
    def _calculate_advanced_repetition_score(self, text: str) -> float:
        """Calculate advanced repetition score with phrase analysis."""
        words = text.lower().split()
        if len(words) < 10:
            return 0.0
        
        # Word-level repetition
        word_count = Counter(words)
        total_words = len(words)
        unique_words = len(word_count)
        word_repetition = 1 - (unique_words / total_words)
        
        # Phrase-level repetition (2-4 word phrases)
        phrase_repetition = 0.0
        for phrase_length in range(2, 5):
            phrases = [' '.join(words[i:i+phrase_length]) for i in range(len(words)-phrase_length+1)]
            phrase_counts = Counter(phrases)
            if phrases:
                phrase_repetition += (1 - len(phrase_counts) / len(phrases)) / 3
        
        # Consecutive repetition
        consecutive_count = 0
        for i in range(len(words) - 1):
            if words[i] == words[i + 1]:
                consecutive_count += 1
        consecutive_ratio = consecutive_count / max(1, len(words) - 1)
        
        # Structural repetition (similar sentence patterns)
        sentences = re.split(r'[.!?]+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip() and len(s.split()) > 3]
        
        structural_repetition = 0.0
        if len(sentences) > 2:
            # Check for similar sentence structures
            sentence_patterns = []
            for sentence in sentences:
                words_in_sentence = sentence.lower().split()
                if len(words_in_sentence) > 3:
                    # Create pattern based on word types (simple heuristic)
                    pattern = []
                    for word in words_in_sentence[:5]:  # First 5 words
                        if word in ['the', 'a', 'an']:
                            pattern.append('DET')
                        elif word in ['is', 'are', 'was', 'were', 'be', 'been']:
                            pattern.append('BE')
                        elif word in ['and', 'or', 'but', 'so']:
                            pattern.append('CONJ')
                        else:
                            pattern.append('WORD')
                    sentence_patterns.append(' '.join(pattern))
            
            pattern_counts = Counter(sentence_patterns)
            if sentence_patterns:
                structural_repetition = 1 - (len(pattern_counts) / len(sentence_patterns))
        
        # Weighted combination
        return (word_repetition * 0.4 + phrase_repetition * 0.3 + 
                consecutive_ratio * 0.2 + structural_repetition * 0.1)
    
    def _calculate_enhanced_formality_score(self, text: str) -> float:
        """Calculate enhanced formality score with context awareness."""
        text_lower = text.lower()
        words = text_lower.split()
        
        if not words:
            return 0.0
        
        # Formal indicators
        formal_phrase_count = sum(text_lower.count(phrase) for phrase in self.ai_indicators["formal_phrases"])
        academic_phrase_count = sum(text_lower.count(phrase) for phrase in self.ai_indicators["academic_phrases"])
        complex_word_count = sum(words.count(word) for word in self.ai_indicators["complex_words"])
        ai_pattern_count = sum(text_lower.count(pattern) for pattern in self.ai_indicators["ai_specific_patterns"])
        
        # Human indicators
        contraction_count = sum(text_lower.count(contraction) for contraction in self.human_indicators["contractions"])
        informal_word_count = sum(words.count(word) for word in self.human_indicators["informal_words"])
        emotional_word_count = sum(words.count(word) for word in self.human_indicators["emotional_words"])
        filler_word_count = sum(text_lower.count(filler) for filler in self.human_indicators["filler_words"])
        
        # Calculate scores
        formal_score = (formal_phrase_count + academic_phrase_count + complex_word_count + ai_pattern_count) / len(words)
        human_score = (contraction_count + informal_word_count + emotional_word_count + filler_word_count) / len(words)
        
        # Enhanced normalization - More sensitive to AI patterns
        return min(1.0, max(0.0, formal_score - human_score + 0.35))
    
    def _calculate_advanced_sentence_variety(self, text: str) -> float:
        """Calculate advanced sentence variety with multiple metrics."""
        sentences = re.split(r'[.!?]+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 2:
            return 0.5
        
        # Sentence length variety
        lengths = [len(s.split()) for s in sentences]
        mean_length = statistics.mean(lengths)
        std_length = statistics.stdev(lengths) if len(lengths) > 1 else 0
        
        # Coefficient of variation for length
        cv_length = std_length / mean_length if mean_length > 0 else 0
        
        # Sentence structure variety
        structure_variety = 0.0
        if len(sentences) > 2:
            structures = []
            for sentence in sentences:
                words = sentence.lower().split()
                if len(words) > 3:
                    # Simple structure analysis
                    structure = []
                    for word in words[:5]:
                        if word in ['the', 'a', 'an']:
                            structure.append('DET')
                        elif word in ['is', 'are', 'was', 'were', 'be', 'been']:
                            structure.append('BE')
                        elif word in ['and', 'or', 'but', 'so']:
                            structure.append('CONJ')
                        else:
                            structure.append('WORD')
                    structures.append(' '.join(structure))
            
            if structures:
                unique_structures = len(set(structures))
                structure_variety = unique_structures / len(structures)
        
        # Punctuation variety
        punctuation_variety = 0.0
        if len(sentences) > 2:
            punct_patterns = []
            for sentence in sentences:
                # Count different punctuation marks
                punct_count = len(re.findall(r'[,.!?;:]', sentence))
                punct_patterns.append(punct_count)
            
            if punct_patterns:
                punct_std = statistics.stdev(punct_patterns) if len(punct_patterns) > 1 else 0
                punct_mean = statistics.mean(punct_patterns)
                punctuation_variety = punct_std / punct_mean if punct_mean > 0 else 0
        
        # Combine metrics
        length_variety = min(1.0, cv_length)
        combined_variety = (length_variety * 0.5 + structure_variety * 0.3 + punctuation_variety * 0.2)
        
        return min(1.0, combined_variety)
    
    def _calculate_semantic_coherence(self, text: str) -> float:
        """Calculate semantic coherence (AI texts tend to be more coherent)."""
        sentences = re.split(r'[.!?]+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) < 2:
            return 0.5
        
        # Simple semantic coherence based on word overlap between consecutive sentences
        coherence_scores = []
        for i in range(len(sentences) - 1):
            words1 = set(sentences[i].lower().split())
            words2 = set(sentences[i + 1].lower().split())
            
            if words1 and words2:
                overlap = len(words1.intersection(words2))
                union = len(words1.union(words2))
                jaccard = overlap / union if union > 0 else 0
                coherence_scores.append(jaccard)
        
        if coherence_scores:
            return statistics.mean(coherence_scores)
        return 0.5
    
    def _calculate_lexical_diversity(self, text: str) -> float:
        """Calculate lexical diversity (human texts tend to be more diverse)."""
        words = text.lower().split()
        if len(words) < 10:
            return 0.5
        
        # Type-token ratio
        unique_words = len(set(words))
        total_words = len(words)
        ttr = unique_words / total_words
        
        # Yule's K (measure of vocabulary richness)
        word_counts = Counter(words)
        k = 10000 * sum(count * (count - 1) for count in word_counts.values()) / (total_words * (total_words - 1))
        
        # Normalize K (lower K = more diverse vocabulary)
        normalized_k = max(0, 1 - (k / 100))
        
        return (ttr * 0.6 + normalized_k * 0.4)
    
    def _calculate_ai_pattern_density(self, text: str) -> float:
        """Calculate density of AI-specific patterns."""
        text_lower = text.lower()
        words = text_lower.split()
        
        if not words:
            return 0.0
        
        # Count AI-specific patterns
        pattern_count = 0
        for pattern in self.ai_indicators["ai_specific_patterns"]:
            pattern_count += text_lower.count(pattern)
        
        # Normalize by text length
        return min(1.0, pattern_count / len(words) * 10)  # Scale factor for sensitivity
    
    def detect_ai_content(self, text: str) -> Dict[str, any]:
        """Multi-layer AI content detection with improved accuracy."""
        if not text.strip():
            return {
                "is_ai_generated": False,
                "confidence": 0.0,
                "scores": {
                    "perplexity": 0.0,
                    "repetition": 0.0,
                    "formality": 0.0,
                    "sentence_variety": 0.0,
                    "semantic_coherence": 0.0,
                    "lexical_diversity": 0.0,
                    "ai_pattern_density": 0.0
                },
                "analysis": "Empty text provided"
            }
        
        # Calculate enhanced scores
        perplexity_score = self._calculate_enhanced_perplexity(text)
        repetition_score = self._calculate_advanced_repetition_score(text)
        formality_score = self._calculate_enhanced_formality_score(text)
        variety_score = self._calculate_advanced_sentence_variety(text)
        coherence_score = self._calculate_semantic_coherence(text)
        diversity_score = self._calculate_lexical_diversity(text)
        pattern_density = self._calculate_ai_pattern_density(text)
        
        # Normalize perplexity (lower perplexity = more AI-like)
        normalized_perplexity = max(0.0, 1.0 - (perplexity_score / 100))
        
        # Enhanced weighted confidence score with pattern density
        weights = {
            "perplexity": 0.20,
            "repetition": 0.15,
            "formality": 0.20,
            "sentence_variety": 0.10,
            "semantic_coherence": 0.10,
            "lexical_diversity": 0.10,
            "ai_pattern_density": 0.15  # New weight for pattern density
        }
        
        confidence = (
            normalized_perplexity * weights["perplexity"] +
            repetition_score * weights["repetition"] +
            formality_score * weights["formality"] +
            (1.0 - variety_score) * weights["sentence_variety"] +
            coherence_score * weights["semantic_coherence"] +
            (1.0 - diversity_score) * weights["lexical_diversity"] +
            pattern_density * weights["ai_pattern_density"]
        )
        
        # Multi-layer threshold system
        text_length = len(text.split())
        
        # Base threshold
        if text_length < 20:
            base_threshold = 0.68
        elif text_length < 100:
            base_threshold = 0.65
        else:
            base_threshold = 0.63
        
        # Pattern density bonus (if high AI patterns, lower threshold)
        if pattern_density > 0.3:
            threshold = base_threshold - 0.05
        elif pattern_density > 0.1:
            threshold = base_threshold - 0.02
        else:
            threshold = base_threshold
        
        # Formality bonus (if very formal, lower threshold)
        if formality_score > 0.6:
            threshold -= 0.03
        
        # Repetition bonus (if very repetitive, lower threshold)
        if repetition_score > 0.5:
            threshold -= 0.02
        
        is_ai_generated = confidence > threshold
        
        # Generate enhanced analysis
        analysis = self._generate_enhanced_analysis(
            confidence, perplexity_score, repetition_score, 
            formality_score, variety_score, coherence_score, diversity_score, pattern_density
        )
        
        return {
            "is_ai_generated": is_ai_generated,
            "confidence": round(confidence, 3),
            "scores": {
                "perplexity": round(normalized_perplexity, 3),
                "repetition": round(repetition_score, 3),
                "formality": round(formality_score, 3),
                "sentence_variety": round(variety_score, 3),
                "semantic_coherence": round(coherence_score, 3),
                "lexical_diversity": round(diversity_score, 3),
                "ai_pattern_density": round(pattern_density, 3)
            },
            "analysis": analysis
        }
    
    def _generate_enhanced_analysis(self, confidence: float, perplexity: float, 
                                   repetition: float, formality: float, variety: float,
                                   coherence: float, diversity: float, pattern_density: float) -> str:
        """Generate enhanced human-readable analysis."""
        
        if confidence > 0.90:
            level = "very highly likely"
        elif confidence > 0.80:
            level = "highly likely"
        elif confidence > 0.70:
            level = "likely"
        elif confidence > 0.60:
            level = "possibly"
        else:
            level = "unlikely"
        
        analysis_parts = []
        
        # Enhanced analysis with pattern density
        if pattern_density > 0.3:
            analysis_parts.append("contains many AI-specific language patterns")
        elif pattern_density > 0.1:
            analysis_parts.append("shows some AI-specific patterns")
        
        if formality > 0.75:
            analysis_parts.append("uses highly formal language and academic vocabulary")
        elif formality > 0.6:
            analysis_parts.append("shows formal language patterns")
        elif formality < 0.3:
            analysis_parts.append("uses casual and informal language")
        
        if repetition > 0.7:
            analysis_parts.append("contains significant repetitive patterns")
        elif repetition > 0.5:
            analysis_parts.append("shows some repetition")
        elif repetition < 0.2:
            analysis_parts.append("shows natural word variety")
        
        if variety < 0.25:
            analysis_parts.append("has very uniform sentence structures")
        elif variety < 0.45:
            analysis_parts.append("shows limited sentence variety")
        elif variety > 0.7:
            analysis_parts.append("shows natural sentence variety")
        
        if perplexity < 25:
            analysis_parts.append("uses highly predictable word combinations")
        elif perplexity < 40:
            analysis_parts.append("shows some word predictability")
        elif perplexity > 60:
            analysis_parts.append("shows natural word unpredictability")
        
        if coherence > 0.7:
            analysis_parts.append("shows high semantic coherence")
        elif coherence < 0.3:
            analysis_parts.append("shows natural topic shifts")
        
        if diversity < 0.3:
            analysis_parts.append("uses limited vocabulary")
        elif diversity > 0.7:
            analysis_parts.append("shows rich vocabulary diversity")
        
        if not analysis_parts:
            analysis_parts.append("shows mixed language patterns")
        
        return f"Text is {level} AI-generated. Analysis: {', '.join(analysis_parts)}."

# Global instance
ai_detector = AIContentDetector()

def detect_ai_content(text: str) -> Dict[str, any]:
    """Convenience function to detect AI content."""
    return ai_detector.detect_ai_content(text) 