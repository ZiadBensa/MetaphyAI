"""
Enhanced regex-based text humanization using reliable dictionary.
"""
import re
import json
import random
from typing import Dict, List, Tuple
from core.dependencies import get_logger

logger = get_logger(__name__)

class EnhancedRegexHumanizer:
    """Enhanced regex-based text humanizer using dictionary."""
    
    def __init__(self, dictionary_path: str = "simple_synonyms.json"):
        """Initialize with dictionary."""
        self.dictionary = self._load_dictionary(dictionary_path)
        self.regex_patterns = self._create_regex_patterns()
        
    def _load_dictionary(self, path: str) -> Dict[str, List[str]]:
        """Load synonym dictionary from JSON file."""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Dictionary file {path} not found, using built-in dictionary")
            return self._get_builtin_dictionary()
        except Exception as e:
            logger.error(f"Error loading dictionary: {e}")
            return self._get_builtin_dictionary()
    
    def _get_builtin_dictionary(self) -> Dict[str, List[str]]:
        """Fallback built-in dictionary."""
        return {
            "implement": ["put in place", "set up", "establish"],
            "provide": ["give", "supply", "offer"],
            "request": ["ask for", "seek", "apply for"],
            "consider": ["look at", "think about", "examine"],
            "experience": ["background", "history", "track record"],
            "commence": ["start", "begin", "launch"],
            "purchase": ["buy", "acquire", "obtain"],
            "extended": ["pushed back", "delayed", "postponed"],
            "experiencing": ["having", "going through", "facing"],
            "available": ["possible", "accessible", "obtainable"],
            "difficulties": ["problems", "issues", "challenges"],
            "options": ["choices", "alternatives", "possibilities"],
            "position": ["job", "role", "post"],
            "genuine": ["real", "authentic", "sincere"],
            "express": ["show", "demonstrate", "indicate"],
            "interest": ["curiosity", "enthusiasm", "desire"],
            "opportunity": ["chance", "possibility", "prospect"],
            "discuss": ["talk about", "explore", "review"],
            "collaboration": ["teamwork", "partnership", "cooperation"],
            "mission": ["goal", "purpose", "objective"],
            "align": ["match", "fit", "correspond"],
            "results": ["outcomes", "achievements", "accomplishments"],
        }
    
    def _create_regex_patterns(self) -> List[Tuple[str, str]]:
        """Create regex patterns from dictionary."""
        patterns = []
        
        # Add dictionary-based patterns
        for word, synonyms in self.dictionary.items():
            if synonyms:
                # Choose a random synonym for variety
                replacement = random.choice(synonyms)
                pattern = rf'\b{re.escape(word)}\b'
                patterns.append((pattern, replacement))
        
        # Add additional common patterns
        additional_patterns = [
            # Contractions
            (r'\bI am\b', 'I\'m'),
            (r'\bI will\b', 'I\'ll'),
            (r'\bWe are\b', 'We\'re'),
            (r'\bWe will\b', 'We\'ll'),
            (r'\bIt is\b', 'It\'s'),
            (r'\bThat is\b', 'That\'s'),
            (r'\bThere is\b', 'There\'s'),
            (r'\bYou are\b', 'You\'re'),
            (r'\bThey are\b', 'They\'re'),
            (r'\bCannot\b', 'Can\'t'),
            (r'\bWill not\b', 'Won\'t'),
            (r'\bDo not\b', 'Don\'t'),
            (r'\bDoes not\b', 'Doesn\'t'),
            (r'\bIs not\b', 'Isn\'t'),
            (r'\bAre not\b', 'Aren\'t'),
            
            # Common phrases
            (r'\bI would like to\b', 'I want to'),
            (r'\bI am going to\b', 'I\'m going to'),
            (r'\bI am currently\b', 'I\'m currently'),
            (r'\bWe need to\b', 'We have to'),
            (r'\bPlease provide\b', 'Please give'),
            (r'\bThe meeting will commence\b', 'The meeting will start'),
            (r'\bThe project deadline has been extended\b', 'The project deadline was pushed back'),
            (r'\bThe system is experiencing technical difficulties\b', 'The system is having technical problems'),
            (r'\bWe should consider all available options\b', 'We should look at all the options'),
            
            # Writing patterns
            (r'\bwriting to express\b', 'writing to show'),
            (r'\bgenuine interest\b', 'real interest'),
            (r'\bposition at\b', 'job at'),
            (r'\bJunior Project Manager\b', 'Project Manager'),
            (r'\bI\'m writing to\b', 'I want to'),
            (r'\bexpress my\b', 'show my'),
            (r'\bgenuine interest in\b', 'real interest in'),
        ]
        
        patterns.extend(additional_patterns)
        return patterns
    
    def humanize_text(self, text: str, tone: str = "neutral") -> str:
        """Humanize text using enhanced regex patterns."""
        logger.info(f"Enhanced regex humanization with tone: {tone}")
        
        try:
            # Split text into sentences for better processing
            sentences = self._split_sentences(text)
            
            humanized_sentences = []
            for sentence in sentences:
                if not sentence.strip():
                    continue
                
                # Apply enhanced paraphrasing
                humanized_sentence = self._apply_enhanced_paraphrasing(sentence.strip())
                humanized_sentences.append(humanized_sentence)
            
            # Join sentences with proper spacing
            humanized_text = ' '.join(humanized_sentences)
            
            # Clean up the text
            humanized_text = self._clean_text(humanized_text)
            
            logger.info(f"Enhanced regex processed {len(sentences)} sentences")
            return humanized_text
            
        except Exception as e:
            logger.error(f"Error with enhanced regex: {e}")
            return text
    
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences."""
        try:
            import nltk
            from nltk.tokenize import sent_tokenize
            
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt')
            
            return sent_tokenize(text)
        except Exception:
            # Fallback to simple sentence splitting
            return [s.strip() for s in text.split('.') if s.strip()]
    
    def _apply_enhanced_paraphrasing(self, text: str) -> str:
        """Apply enhanced paraphrasing transformations."""
        paraphrased_text = text
        changes_made = 0
        
        # Apply regex patterns
        for pattern, replacement in self.regex_patterns:
            new_text = re.sub(pattern, replacement, paraphrased_text, flags=re.IGNORECASE)
            if new_text != paraphrased_text:
                changes_made += 1
            paraphrased_text = new_text
        
        # Log if no changes were made
        if changes_made == 0:
            logger.info(f"No enhanced patterns matched for text: {text[:50]}...")
        
        return paraphrased_text
    
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
        """Get statistics about the dictionary."""
        return {
            "total_words": len(self.dictionary),
            "total_patterns": len(self.regex_patterns),
            "words_with_synonyms": sum(1 for synonyms in self.dictionary.values() if synonyms),
            "average_synonyms_per_word": sum(len(synonyms) for synonyms in self.dictionary.values()) / len(self.dictionary) if self.dictionary else 0
        }

# Global instance
enhanced_humanizer = EnhancedRegexHumanizer()

def humanize_with_enhanced_regex(text: str, tone: str = "neutral") -> str:
    """Convenience function to use enhanced regex humanization."""
    return enhanced_humanizer.humanize_text(text, tone) 