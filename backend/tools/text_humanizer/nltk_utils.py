"""
Robust NLTK utilities with fallback mechanisms.
"""
import os
import sys
from typing import List, Optional, Tuple
from core.dependencies import get_logger

logger = get_logger(__name__)

# NLTK data requirements
NLTK_DATA_REQUIREMENTS = [
    'tokenizers/punkt',
    'corpora/wordnet',
    'corpora/stopwords'
]

def ensure_nltk_data():
    """Ensure all required NLTK data is available with fallback mechanisms."""
    try:
        import nltk
        
        # Try to download all required NLTK data
        for data_path in NLTK_DATA_REQUIREMENTS:
            try:
                nltk.data.find(data_path)
                logger.debug(f"NLTK data found: {data_path}")
            except LookupError:
                logger.info(f"Downloading NLTK data: {data_path}")
                try:
                    nltk.download(data_path.split('/')[1], quiet=True)
                    logger.info(f"Successfully downloaded: {data_path}")
                except Exception as e:
                    logger.warning(f"Failed to download {data_path}: {e}")
                    return False
        
        return True
        
    except ImportError:
        logger.error("NLTK is not installed. Please install it with: pip install nltk")
        return False
    except Exception as e:
        logger.error(f"Error setting up NLTK: {e}")
        return False

def safe_sent_tokenize(text: str) -> List[str]:
    """Safely tokenize text into sentences with fallback."""
    try:
        import nltk
        from nltk.tokenize import sent_tokenize
        
        # Ensure NLTK data is available
        if not ensure_nltk_data():
            return fallback_sent_tokenize(text)
        
        return sent_tokenize(text)
        
    except Exception as e:
        logger.warning(f"NLTK sentence tokenization failed: {e}")
        return fallback_sent_tokenize(text)

def safe_word_tokenize(text: str) -> List[str]:
    """Safely tokenize text into words with fallback."""
    try:
        import nltk
        from nltk.tokenize import word_tokenize
        
        # Ensure NLTK data is available
        if not ensure_nltk_data():
            return fallback_word_tokenize(text)
        
        return word_tokenize(text)
        
    except Exception as e:
        logger.warning(f"NLTK word tokenization failed: {e}")
        return fallback_word_tokenize(text)

def safe_stopwords() -> set:
    """Safely get stopwords with fallback."""
    try:
        import nltk
        from nltk.corpus import stopwords
        
        # Ensure NLTK data is available
        if not ensure_nltk_data():
            return fallback_stopwords()
        
        return set(stopwords.words('english'))
        
    except Exception as e:
        logger.warning(f"NLTK stopwords failed: {e}")
        return fallback_stopwords()

def safe_wordnet_similarity(word1: str, word2: str) -> float:
    """Safely calculate WordNet similarity with fallback."""
    try:
        import nltk
        from nltk.corpus import wordnet
        
        # Ensure NLTK data is available
        if not ensure_nltk_data():
            return fallback_similarity(word1, word2)
        
        # Get synsets for both words
        synsets1 = wordnet.synsets(word1.lower())
        synsets2 = wordnet.synsets(word2.lower())
        
        if not synsets1 or not synsets2:
            return fallback_similarity(word1, word2)
        
        # Calculate maximum similarity between any synset pair
        max_similarity = 0.0
        for syn1 in synsets1:
            for syn2 in synsets2:
                similarity = syn1.path_similarity(syn2)
                if similarity and similarity > max_similarity:
                    max_similarity = similarity
        
        return max_similarity
        
    except Exception as e:
        logger.warning(f"WordNet similarity failed: {e}")
        return fallback_similarity(word1, word2)

# Fallback functions when NLTK is not available
def fallback_sent_tokenize(text: str) -> List[str]:
    """Simple sentence tokenization fallback."""
    import re
    
    # Split on sentence endings with some intelligence
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]

def fallback_word_tokenize(text: str) -> List[str]:
    """Simple word tokenization fallback."""
    import re
    
    # Simple word splitting with punctuation handling
    words = re.findall(r'\b\w+\b', text.lower())
    return words

def fallback_stopwords() -> set:
    """Fallback stopwords list."""
    return {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'will', 'with', 'i', 'you', 'your', 'they', 'them',
        'their', 'we', 'our', 'us', 'me', 'my', 'this', 'these', 'those',
        'but', 'not', 'have', 'had', 'do', 'does', 'did', 'would', 'could',
        'should', 'can', 'may', 'might', 'must', 'shall', 'will', 'am',
        'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
        'might', 'must', 'can', 'shall'
    }

def fallback_similarity(word1: str, word2: str) -> float:
    """Simple similarity fallback based on character overlap."""
    word1_lower = word1.lower()
    word2_lower = word2.lower()
    
    # If words are identical, return high similarity
    if word1_lower == word2_lower:
        return 1.0
    
    # Calculate character overlap similarity
    set1 = set(word1_lower)
    set2 = set(word2_lower)
    
    if not set1 or not set2:
        return 0.0
    
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    
    if union == 0:
        return 0.0
    
    return intersection / union

def is_nltk_available() -> bool:
    """Check if NLTK is available and working."""
    try:
        import nltk
        return ensure_nltk_data()
    except ImportError:
        return False

def get_nltk_status() -> dict:
    """Get detailed NLTK status information."""
    status = {
        "nltk_installed": False,
        "data_available": False,
        "missing_data": [],
        "recommendations": []
    }
    
    try:
        import nltk
        status["nltk_installed"] = True
        
        # Check each required data component
        for data_path in NLTK_DATA_REQUIREMENTS:
            try:
                nltk.data.find(data_path)
            except LookupError:
                status["missing_data"].append(data_path)
        
        status["data_available"] = len(status["missing_data"]) == 0
        
        if status["missing_data"]:
            status["recommendations"].append("Run: python -c 'import nltk; nltk.download(\"punkt\"); nltk.download(\"wordnet\"); nltk.download(\"stopwords\")'")
        
    except ImportError:
        status["recommendations"].append("Install NLTK: pip install nltk")
    
    return status 