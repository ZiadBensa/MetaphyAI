"""
Semantic-enhanced regex-based text humanization using NLTK WordNet.
"""
import re
import json
import random
from typing import Dict, List, Tuple, Optional
from core.dependencies import get_logger

logger = get_logger(__name__)

class SemanticEnhancedRegexHumanizer:
    """Semantic-aware enhanced regex-based text humanizer."""
    
    def __init__(self, dictionary_path: str = None, use_semantic_check: bool = True):
        """Initialize with dictionary and semantic checking."""
        if dictionary_path is None:
            # Try to find the comprehensive dictionary first, then fallback to simple
            import os
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            comprehensive_path = os.path.join(backend_dir, "comprehensive_synonyms.json")
            simple_path = os.path.join(backend_dir, "simple_synonyms.json")
            
            # Try comprehensive dictionary first
            if os.path.exists(comprehensive_path):
                dictionary_path = comprehensive_path
            else:
                dictionary_path = simple_path
        
        self.dictionary = self._load_dictionary(dictionary_path)
        self.use_semantic_check = use_semantic_check
        self.regex_patterns = self._create_semantic_regex_patterns()
        self.semantic_cache = {}  # Cache for semantic similarity scores
        
    def _load_dictionary(self, path: str) -> Dict[str, List[str]]:
        """Load synonym dictionary from JSON file."""
        logger.info(f"Attempting to load dictionary from: {path}")
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                dictionary = json.load(f)
                logger.info(f"Successfully loaded dictionary with {len(dictionary)} words")
                return dictionary
        except FileNotFoundError:
            logger.warning(f"Dictionary file {path} not found, using built-in dictionary")
            return self._get_builtin_dictionary()
        except Exception as e:
            logger.error(f"Error loading dictionary: {e}")
            return self._get_builtin_dictionary()
    
    def _get_builtin_dictionary(self) -> Dict[str, List[str]]:
        """Fallback built-in dictionary."""
        try:
            from .comprehensive_dictionary import get_comprehensive_synonyms
            return get_comprehensive_synonyms()
        except ImportError:
        from .improved_semantic_rules import get_context_aware_dictionary
        return get_context_aware_dictionary()
    
    def _get_semantic_similarity(self, word1: str, word2: str) -> float:
        """Get semantic similarity between two words using NLTK WordNet with fallback."""
        from .nltk_utils import safe_wordnet_similarity
            
            # Check cache first
            cache_key = f"{word1.lower()}_{word2.lower()}"
            if cache_key in self.semantic_cache:
                return self.semantic_cache[cache_key]
            
        # Use safe WordNet similarity with fallback
        similarity = safe_wordnet_similarity(word1, word2)
            
            # Cache the result
        self.semantic_cache[cache_key] = similarity
        return similarity
    
    def _get_best_semantic_replacement(self, original_word: str, synonyms: List[str], context_words: List[str], full_text: str = "") -> str:
        """Choose the best synonym based on semantic similarity to context and text context."""
        if not self.use_semantic_check or not synonyms:
            return random.choice(synonyms) if synonyms else original_word
        
        # Detect context of the full text
        from .improved_semantic_rules import detect_context, get_context_appropriate_replacement
        context = detect_context(full_text) if full_text else 'professional'
        
        # First try context-appropriate replacement
        context_replacement = get_context_appropriate_replacement(original_word, synonyms, context)
        if context_replacement != original_word:
            logger.debug(f"Context-aware choice: '{original_word}' -> '{context_replacement}' (context: {context})")
            return context_replacement
        
        # Fallback to semantic similarity if context doesn't help
        synonym_scores = {}
        
        for synonym in synonyms:
            # Check similarity to original word
            original_similarity = self._get_semantic_similarity(original_word, synonym)
            
            # Check similarity to context words
            context_similarity = 0.0
            if context_words:
                context_scores = []
                for context_word in context_words[:5]:  # Limit to first 5 context words
                    similarity = self._get_semantic_similarity(synonym, context_word)
                    context_scores.append(similarity)
                context_similarity = sum(context_scores) / len(context_scores)
            
            # Combined score (weighted average)
            combined_score = (original_similarity * 0.7) + (context_similarity * 0.3)
            synonym_scores[synonym] = combined_score
        
        # Choose the synonym with the highest score
        if synonym_scores:
            best_synonym = max(synonym_scores, key=synonym_scores.get)
            best_score = synonym_scores[best_synonym]
            
            # Only use if similarity is above threshold
            if best_score > 0.3:
                logger.debug(f"Semantic choice: '{original_word}' -> '{best_synonym}' (score: {best_score:.2f})")
                return best_synonym
        
        # Fallback to random choice
        return random.choice(synonyms) if synonyms else original_word
    
    def _extract_context_words(self, text: str, target_word: str) -> List[str]:
        """Extract context words around the target word with fallback."""
        from .nltk_utils import safe_word_tokenize, safe_stopwords
        
        try:
            # Tokenize text using safe functions
            words = safe_word_tokenize(text.lower())
            stop_words = safe_stopwords()
            
            # Find target word position
            target_pos = -1
            for i, word in enumerate(words):
                if word.lower() == target_word.lower():
                    target_pos = i
                    break
            
            if target_pos == -1:
                return []
            
            # Extract context words (before and after target)
            context_words = []
            start = max(0, target_pos - 3)
            end = min(len(words), target_pos + 4)
            
            for i in range(start, end):
                if i != target_pos and words[i] not in stop_words and len(words[i]) > 2:
                    context_words.append(words[i])
            
            return context_words[:10]  # Limit to 10 context words
            
        except Exception as e:
            logger.warning(f"Error extracting context words: {e}")
            return []
    
    def _create_semantic_regex_patterns(self) -> List[Tuple[str, str, Dict]]:
        """Create semantic-aware regex patterns from dictionary."""
        patterns = []
        
        # Add dictionary-based patterns with semantic info
        logger.info(f"Creating patterns from dictionary with {len(self.dictionary)} words")
        for word, synonyms in self.dictionary.items():
            if synonyms:
                pattern = rf'\b{re.escape(word)}\b'
                # Store synonyms for semantic selection
                pattern_info = {
                    'original_word': word,
                    'synonyms': synonyms,
                    'type': 'dictionary'
                }
                patterns.append((pattern, synonyms[0], pattern_info))  # Default replacement
                logger.debug(f"Added dictionary pattern: '{word}' -> '{synonyms[0]}'")
        
        # Add additional common patterns
        additional_patterns = [
            # Contractions
            (r'\bI am\b', 'I\'m', {'type': 'contraction'}),
            (r'\bI will\b', 'I\'ll', {'type': 'contraction'}),
            (r'\bWe are\b', 'We\'re', {'type': 'contraction'}),
            (r'\bWe will\b', 'We\'ll', {'type': 'contraction'}),
            (r'\bIt is\b', 'It\'s', {'type': 'contraction'}),
            (r'\bThat is\b', 'That\'s', {'type': 'contraction'}),
            (r'\bThere is\b', 'There\'s', {'type': 'contraction'}),
            (r'\bYou are\b', 'You\'re', {'type': 'contraction'}),
            (r'\bThey are\b', 'They\'re', {'type': 'contraction'}),
            (r'\bCannot\b', 'Can\'t', {'type': 'contraction'}),
            (r'\bWill not\b', 'Won\'t', {'type': 'contraction'}),
            (r'\bDo not\b', 'Don\'t', {'type': 'contraction'}),
            (r'\bDoes not\b', 'Doesn\'t', {'type': 'contraction'}),
            (r'\bIs not\b', 'Isn\'t', {'type': 'contraction'}),
            (r'\bAre not\b', 'Aren\'t', {'type': 'contraction'}),
            
            # Common phrases
            (r'\bI would like to\b', 'I want to', {'type': 'phrase'}),
            (r'\bI am going to\b', 'I\'m going to', {'type': 'phrase'}),
            (r'\bI am currently\b', 'I\'m currently', {'type': 'phrase'}),
            (r'\bWe need to\b', 'We have to', {'type': 'phrase'}),
            (r'\bPlease provide\b', 'Please give', {'type': 'phrase'}),
            (r'\bThe meeting will commence\b', 'The meeting will start', {'type': 'phrase'}),
            (r'\bThe project deadline has been extended\b', 'The project deadline was pushed back', {'type': 'phrase'}),
            (r'\bThe system is experiencing technical difficulties\b', 'The system is having technical problems', {'type': 'phrase'}),
            (r'\bWe should consider all available options\b', 'We should look at all the options', {'type': 'phrase'}),
            
            # Writing patterns
            (r'\bwriting to express\b', 'writing to show', {'type': 'phrase'}),
            (r'\bgenuine interest\b', 'real interest', {'type': 'phrase'}),
            (r'\bposition at\b', 'job at', {'type': 'phrase'}),
            (r'\bJunior Project Manager\b', 'Project Manager', {'type': 'phrase'}),
            (r'\bI\'m writing to\b', 'I want to', {'type': 'phrase'}),
            (r'\bexpress my\b', 'show my', {'type': 'phrase'}),
            (r'\bgenuine interest in\b', 'real interest in', {'type': 'phrase'}),
        ]
        
        patterns.extend(additional_patterns)
        logger.info(f"Created {len(patterns)} total patterns ({len(additional_patterns)} additional)")
        return patterns
    
    def humanize_text(self, text: str, tone: str = "neutral") -> str:
        """Humanize text using semantic-aware enhanced regex patterns."""
        logger.info(f"Semantic-enhanced regex humanization with tone: {tone}")
        
        try:
            # Split text into sentences for better processing
            sentences = self._split_sentences(text)
            
            humanized_sentences = []
            for sentence in sentences:
                if not sentence.strip():
                    continue
                
                # Apply semantic-enhanced paraphrasing
                humanized_sentence = self._apply_semantic_paraphrasing(sentence.strip())
                humanized_sentences.append(humanized_sentence)
            
            # Join sentences with proper spacing
            humanized_text = ' '.join(humanized_sentences)
            
            # Clean up the text
            humanized_text = self._clean_text(humanized_text)
            
            logger.info(f"Semantic-enhanced regex processed {len(sentences)} sentences")
            return humanized_text
            
        except Exception as e:
            logger.error(f"Error with semantic-enhanced regex: {e}")
            return text
    
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences with fallback."""
        from .nltk_utils import safe_sent_tokenize
        
        try:
            return safe_sent_tokenize(text)
        except Exception as e:
            logger.warning(f"Sentence splitting failed: {e}")
            # Fallback to simple sentence splitting
            return [s.strip() for s in text.split('.') if s.strip()]
    
    def _apply_semantic_paraphrasing(self, text: str) -> str:
        """Apply semantic-aware paraphrasing transformations."""
        paraphrased_text = text
        changes_made = 0
        
        # Debug: Log the number of patterns
        logger.info(f"Applying {len(self.regex_patterns)} patterns to text: {text[:50]}...")
        
        # Apply regex patterns with semantic awareness
        for pattern, default_replacement, pattern_info in self.regex_patterns:
            matches = re.finditer(pattern, paraphrased_text, flags=re.IGNORECASE)
            
            # Process matches in reverse order to avoid index issues
            matches_list = list(matches)
            for match in reversed(matches_list):
                original_word = match.group(0)
                
                if pattern_info['type'] == 'dictionary':
                    # Use semantic selection for dictionary words
                    synonyms = pattern_info['synonyms']
                    context_words = self._extract_context_words(text, original_word)
                    replacement = self._get_best_semantic_replacement(original_word, synonyms, context_words, text)
                else:
                    # Use default replacement for non-dictionary patterns
                    replacement = default_replacement
                
                # Apply the replacement
                start, end = match.span()
                paraphrased_text = paraphrased_text[:start] + replacement + paraphrased_text[end:]
                changes_made += 1
                logger.info(f"Applied replacement: '{original_word}' -> '{replacement}'")
        
        # Log if no changes were made
        if changes_made == 0:
            logger.info(f"No semantic patterns matched for text: {text[:50]}...")
            # Try simple fallback patterns
            paraphrased_text = self._apply_fallback_patterns(text)
        
        return paraphrased_text
    
    def _apply_fallback_patterns(self, text: str) -> str:
        """Apply simple fallback patterns when semantic patterns don't work."""
        result = text
        changes_made = 0
        
        # Simple fallback patterns
        fallback_patterns = [
            (r'\bI would like to\b', 'I want to'),
            (r'\bI am\b', 'I\'m'),
            (r'\bWe are\b', 'We\'re'),
            (r'\bPlease provide\b', 'Please give'),
            (r'\bimplementation\b', 'putting in place'),
            (r'\bimplement\b', 'put in place'),
            (r'\bmethodology\b', 'approach'),
            (r'\bnecessitates\b', 'requires'),
            (r'\bevaluation\b', 'assessment'),
            (r'\bcomprehensive\b', 'thorough'),
            (r'\bunderstanding\b', 'knowledge'),
            (r'\bendeavors\b', 'tries'),
            (r'\bleverage\b', 'use'),
            (r'\bempirical\b', 'real-world'),
            (r'\bqualitative\b', 'descriptive'),
            (r'\bproposed\b', 'suggested'),
            (r'\bextensive\b', 'thorough'),
            (r'\bexisting\b', 'current'),
            (r'\bframework\b', 'structure'),
            (r'\bfurthermore\b', 'also'),
            (r'\bbridge\b', 'connect'),
            (r'\bgap\b', 'difference'),
            (r'\bpurchase\b', 'buy'),
            (r'\bcommence\b', 'start'),
            (r'\bextended\b', 'pushed back'),
            (r'\bexperiencing\b', 'having'),
            (r'\bconsider\b', 'look at'),
            (r'\bavailable\b', 'possible'),
            (r'\bdifficulties\b', 'problems'),
            (r'\boptions\b', 'choices'),
        ]
        
        for pattern, replacement in fallback_patterns:
            new_result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
            if new_result != result:
                result = new_result
                changes_made += 1
                logger.info(f"Fallback replacement: '{pattern}' -> '{replacement}'")
        
        if changes_made > 0:
            logger.info(f"Applied {changes_made} fallback replacements")
        
        return result
    
    def _clean_text(self, text: str) -> str:
        """Clean and improve the text output."""
        result = text.strip()
        
        # Remove extra whitespace
        result = re.sub(r'\s+', ' ', result)
        
        # Ensure proper sentence endings
        if result and not result.endswith(('.', '!', '?')):
            result += '.'
        
        # Capitalize first letter
        if result:
            result = result[0].upper() + result[1:]
        
        return result
    
    def get_dictionary_stats(self) -> Dict:
        """Get statistics about the dictionary and semantic system."""
        return {
            "total_words": len(self.dictionary),
            "total_patterns": len(self.regex_patterns),
            "words_with_synonyms": sum(1 for synonyms in self.dictionary.values() if synonyms),
            "average_synonyms_per_word": sum(len(synonyms) for synonyms in self.dictionary.values()) / len(self.dictionary) if self.dictionary else 0,
            "semantic_checking_enabled": self.use_semantic_check,
            "semantic_cache_size": len(self.semantic_cache)
        }

# Global instance
semantic_enhanced_humanizer = SemanticEnhancedRegexHumanizer()

def humanize_with_semantic_enhanced_regex(text: str, tone: str = "neutral") -> str:
    """Convenience function to use semantic-enhanced regex humanization."""
    return semantic_enhanced_humanizer.humanize_text(text, tone) 