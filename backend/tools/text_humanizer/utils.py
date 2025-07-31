"""
Utility functions for text humanization.
"""
import re
import logging
from typing import Optional
from core.dependencies import get_logger

logger = get_logger(__name__)

def apply_casual_tone(text: str) -> str:
    """Apply casual tone transformations."""
    result = text
    
    # Contractions
    contractions = {
        r'\bI am\b': "I'm",
        r'\byou are\b': "you're",
        r'\bit is\b': "it's",
        r'\bthat is\b': "that's",
        r'\bwe are\b': "we're",
        r'\bthey are\b': "they're",
        r'\bcannot\b': "can't",
        r'\bwill not\b': "won't",
        r'\bdo not\b': "don't",
        r'\bdoes not\b': "doesn't",
        r'\bis not\b': "isn't",
        r'\bare not\b': "aren't",
        r'\bwas not\b': "wasn't",
        r'\bwere not\b': "weren't",
        r'\bhave not\b': "haven't",
        r'\bhas not\b': "hasn't",
        r'\bhad not\b': "hadn't",
        r'\bwould not\b': "wouldn't",
        r'\bcould not\b': "couldn't",
        r'\bshould not\b': "shouldn't",
        r'\bmight not\b': "mightn't",
        r'\bmust not\b': "mustn't"
    }
    
    for pattern, replacement in contractions.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Casual language patterns - More pronounced
    casual_replacements = {
        r'\bFurthermore\b': "Also",
        r'\bMoreover\b': "Plus",
        r'\bIn addition\b': "Also",
        r'\bAdditionally\b': "Also",
        r'\bHowever\b': "But",
        r'\bNevertheless\b': "Still",
        r'\bConsequently\b': "So",
        r'\bTherefore\b': "So",
        r'\bThus\b': "So",
        r'\bHence\b': "So",
        r'\bSubsequently\b': "Then",
        r'\bUtilize\b': "Use",
        r'\bImplement\b': "Use",
        r'\bFacilitate\b': "Help",
        r'\bSubstantial\b': "Big",
        r'\bSignificant\b': "Important",
        r'\bConsiderable\b': "A lot",
        r'\bNumerous\b': "Many",
        r'\bSubsequent\b': "Next",
        r'\bPrior\b': "Before",
        r'\bSubsequent to\b': "After",
        r'\bPrior to\b': "Before",
        # Add more casual expressions
        r'\bHello\b': "Hey",
        r'\bGoodbye\b': "See ya",
        r'\bThank you\b': "Thanks",
        r'\bYou are welcome\b': "No problem",
        r'\bI apologize\b': "Sorry",
        r'\bI am sorry\b': "I'm sorry",
        r'\bExcellent\b': "Great",
        r'\bOutstanding\b': "Awesome",
        r'\bRemarkable\b': "Cool",
        r'\bExtraordinary\b': "Amazing"
    }
    
    for pattern, replacement in casual_replacements.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_friendly_tone(text: str) -> str:
    """Apply friendly tone transformations."""
    result = apply_casual_tone(text)
    
    # Add friendly expressions - More pronounced
    friendly_patterns = {
        r'\bHello\b': "Hi there",
        r'\bGoodbye\b': "See you later",
        r'\bThank you\b': "Thanks",
        r'\bYou are welcome\b': "You're welcome",
        r'\bI apologize\b': "Sorry",
        r'\bI am sorry\b': "I'm sorry",
        # Add more friendly expressions
        r'\bGreat\b': "Wonderful",
        r'\bGood\b': "Nice",
        r'\bExcellent\b': "Fantastic",
        r'\bAmazing\b': "Incredible",
        r'\bAwesome\b': "Brilliant",
        r'\bCool\b': "Lovely",
        r'\bInteresting\b': "Fascinating",
        r'\bImportant\b': "Valuable",
        r'\bBig\b': "Huge",
        r'\bMany\b': "Lots of",
        r'\bA lot\b': "Plenty of",
        # Add friendly connectors
        r'\bHowever\b': "But",
        r'\bNevertheless\b': "Still",
        r'\bTherefore\b': "So",
        r'\bThus\b': "So",
        r'\bHence\b': "So"
    }
    
    for pattern, replacement in friendly_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_professional_tone(text: str) -> str:
    """Apply professional tone transformations."""
    result = text
    
    # Professional language patterns - More pronounced
    professional_patterns = {
        r'\bI\'m\b': "I am",
        r'\bYou\'re\b': "You are",
        r'\bIt\'s\b': "It is",
        r'\bThat\'s\b': "That is",
        r'\bWe\'re\b': "We are",
        r'\bThey\'re\b': "They are",
        r'\bCan\'t\b': "Cannot",
        r'\bWon\'t\b': "Will not",
        r'\bDon\'t\b': "Do not",
        r'\bDoesn\'t\b': "Does not",
        r'\bIsn\'t\b': "Is not",
        r'\bAren\'t\b': "Are not",
        r'\bWasn\'t\b': "Was not",
        r'\bWeren\'t\b': "Were not",
        r'\bHaven\'t\b': "Have not",
        r'\bHasn\'t\b': "Has not",
        r'\bHadn\'t\b': "Had not",
        r'\bWouldn\'t\b': "Would not",
        r'\bCouldn\'t\b': "Could not",
        r'\bShouldn\'t\b': "Should not",
        # Add more professional expressions
        r'\bHey\b': "Hello",
        r'\bHi\b': "Hello",
        r'\bThanks\b': "Thank you",
        r'\bNo problem\b': "You are welcome",
        r'\bSorry\b': "I apologize",
        r'\bI\'m sorry\b': "I apologize",
        r'\bGreat\b': "Excellent",
        r'\bGood\b': "Satisfactory",
        r'\bNice\b': "Pleasant",
        r'\bCool\b': "Impressive",
        r'\bAwesome\b': "Outstanding",
        r'\bAmazing\b': "Remarkable",
        r'\bFantastic\b': "Exceptional",
        r'\bWonderful\b': "Commendable",
        r'\bBrilliant\b': "Exceptional",
        r'\bLovely\b': "Pleasant",
        r'\bFascinating\b': "Intriguing",
        r'\bValuable\b': "Beneficial",
        r'\bHuge\b': "Substantial",
        r'\bLots of\b': "Numerous",
        r'\bPlenty of\b': "A significant amount of",
        r'\bBig\b': "Considerable",
        r'\bMany\b': "Multiple",
        r'\bA lot\b': "A substantial amount of"
    }
    
    for pattern, replacement in professional_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_enthusiastic_tone(text: str) -> str:
    """Apply enthusiastic tone transformations."""
    result = apply_casual_tone(text)
    
    # Add enthusiastic expressions - More pronounced
    enthusiastic_patterns = {
        r'\bGreat\b': "AMAZING",
        r'\bGood\b': "EXCELLENT",
        r'\bNice\b': "FANTASTIC",
        r'\bCool\b': "AWESOME",
        r'\bInteresting\b': "FASCINATING",
        r'\bImportant\b': "CRUCIAL",
        r'\bBig\b': "HUGE",
        r'\bMany\b': "TONS OF",
        r'\bA lot\b': "A TREMENDOUS AMOUNT OF",
        r'\bExcellent\b': "INCREDIBLE",
        r'\bAmazing\b': "PHENOMENAL",
        r'\bAwesome\b': "SPECTACULAR",
        r'\bFantastic\b': "OUTSTANDING",
        r'\bWonderful\b': "MAGNIFICENT",
        r'\bBrilliant\b': "GENIUS",
        r'\bLovely\b': "BEAUTIFUL",
        r'\bFascinating\b': "MIND-BLOWING",
        r'\bValuable\b': "INVALUABLE",
        r'\bHuge\b': "MASSIVE",
        r'\bLots of\b': "ABUNDANT",
        r'\bPlenty of\b': "OVERFLOWING WITH"
    }
    
    for pattern, replacement in enthusiastic_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_neutral_tone(text: str) -> str:
    """Apply neutral tone transformations."""
    result = text
    
    # Balance formal and informal language
    result = apply_casual_tone(result)
    
    # Remove overly casual expressions
    neutral_patterns = {
        r'\bAwesome\b': "Great",
        r'\bFantastic\b': "Good",
        r'\bAmazing\b': "Excellent",
        r'\bTons of\b': "Many",
        r'\bA tremendous amount of\b': "A lot"
    }
    
    for pattern, replacement in neutral_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_basic_humanization(text: str) -> str:
    """Basic humanization as fallback."""
    result = text
    
    # Simple contractions
    basic_contractions = {
        "I am": "I'm",
        "you are": "you're",
        "it is": "it's",
        "that is": "that's",
        "we are": "we're",
        "they are": "they're",
        "cannot": "can't",
        "will not": "won't",
        "do not": "don't",
        "does not": "doesn't",
        "is not": "isn't",
        "are not": "aren't"
    }
    
    for formal, informal in basic_contractions.items():
        result = result.replace(f" {formal} ", f" {informal} ")
        result = result.replace(f" {formal}.", f" {informal}.")
        result = result.replace(f" {formal},", f" {informal},")
    
    return result

def apply_tone_adjustments(text: str, tone: str) -> str:
    """Apply tone-specific adjustments to the model output."""
    if tone == "casual":
        return apply_casual_tone(text)
    elif tone == "friendly":
        return apply_friendly_tone(text)
    elif tone == "professional":
        return apply_professional_tone(text)
    elif tone == "enthusiastic":
        return apply_enthusiastic_tone(text)
    else:
        return text 

def correct_grammar(text: str) -> str:
    """Correct common grammar issues in the text."""
    result = text
    
    # Fix common grammar issues
    grammar_fixes = {
        # Subject-verb agreement
        r'\b(I|you|he|she|it|we|they) (is|was)\b': r'\1 \2',  # These are correct
        r'\b(I|you|he|she|it|we|they) (are|were)\b': r'\1 \2',  # These are correct
        r'\b(I|you|he|she|it|we|they) (have|has)\b': r'\1 \2',  # These are correct
        
        # Fix "I is" -> "I am"
        r'\bI is\b': "I am",
        r'\bI was\b': "I am",  # Keep as is, but fix if needed
        r'\bI has\b': "I have",
        
        # Fix "you is" -> "you are"
        r'\byou is\b': "you are",
        r'\byou has\b': "you have",
        
        # Fix "he/she/it are" -> "he/she/it is"
        r'\b(he|she|it) are\b': r'\1 is',
        r'\b(he|she|it) have\b': r'\1 has',
        
        # Fix "we/they is" -> "we/they are"
        r'\b(we|they) is\b': r'\1 are',
        r'\b(we|they) has\b': r'\1 have',
        
        # Fix double negatives
        r'\bnot\s+\w+\s+not\b': "not",
        r'\bnever\s+\w+\s+not\b': "never",
        
        # Fix "a" vs "an"
        r'\ba\s+([aeiouAEIOU])': r'an \1',
        r'\ban\s+([^aeiouAEIOU])': r'a \1',
        
        # Fix common word confusions
        r'\btheir\s+is\b': "there is",
        r'\btheir\s+are\b': "there are",
        r'\byour\s+is\b': "you are",
        r'\byour\s+are\b': "you are",
        
        # Fix capitalization after periods
        r'\.\s+([a-z])': lambda m: f'. {m.group(1).upper()}',
        
        # Fix spacing around punctuation
        r'\s+([,.!?])': r'\1',
        r'([,.!?])([A-Za-z])': r'\1 \2',
        
        # Fix common typos
        r'\bteh\b': "the",
        r'\bthier\b': "their",
        r'\byuo\b': "you",
        r'\bthier\b': "their",
        r'\bthier\b': "their",
        r'\bthier\b': "their",
        
        # Fix "its" vs "it's"
        r'\bit\'s\s+(not|going|coming|doing|working)\b': r"it's \1",  # Keep it's for contractions
        r'\bits\s+(the|a|an|this|that|my|your|his|her|our|their)\b': r"it's \1",  # Fix when it should be it's
        
        # Fix "your" vs "you're"
        r'\byou\'re\s+(the|a|an|this|that|my|your|his|her|our|their)\b': r"you're \1",  # Keep you're for contractions
        r'\byour\s+(going|coming|doing|working|not)\b': r"you're \1",  # Fix when it should be you're
        
        # Fix "their" vs "they're"
        r'\bthey\'re\s+(the|a|an|this|that|my|your|his|her|our|their)\b': r"they're \1",  # Keep they're for contractions
        r'\btheir\s+(going|coming|doing|working|not)\b': r"they're \1",  # Fix when it should be they're
        
        # Fix "whose" vs "who's"
        r'\bwho\'s\s+(the|a|an|this|that|my|your|his|her|our|their)\b': r"who's \1",  # Keep who's for contractions
        r'\bwhose\s+(going|coming|doing|working|not)\b': r"who's \1",  # Fix when it should be who's
    }
    
    for pattern, replacement in grammar_fixes.items():
        if callable(replacement):
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        else:
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Fix sentence structure issues
    result = fix_sentence_structure(result)
    
    # Fix punctuation and spacing
    result = fix_punctuation(result)
    
    return result

def fix_sentence_structure(text: str) -> str:
    """Fix common sentence structure issues."""
    result = text
    
    # Fix sentence fragments
    sentence_fixes = {
        # Fix sentences that start with lowercase
        r'^([a-z])': lambda m: m.group(1).upper(),
        
        # Fix sentences that don't end with proper punctuation
        r'([a-zA-Z])\s*$': r'\1.',
        
        # Fix run-on sentences (basic)
        r'([.!?])\s*([a-z])': lambda m: f"{m.group(1)} {m.group(2).upper()}",
        
        # Fix missing articles
        r'\b(is|was|are|were)\s+([a-z]+)\s+(the|a|an)\b': r'\1 \3 \2',
    }
    
    for pattern, replacement in sentence_fixes.items():
        if callable(replacement):
            result = re.sub(pattern, replacement, result)
        else:
            result = re.sub(pattern, replacement, result)
    
    return result

def fix_punctuation(text: str) -> str:
    """Fix punctuation and spacing issues."""
    result = text
    
    # Fix spacing around punctuation
    punctuation_fixes = {
        # Remove extra spaces before punctuation
        r'\s+([,.!?;:])': r'\1',
        
        # Add space after punctuation (but not at end of sentence)
        r'([,.!?;:])([A-Za-z])': r'\1 \2',
        
        # Fix multiple punctuation marks
        r'([.!?])\1+': r'\1',
        r'([,;:])\1+': r'\1',
        
        # Fix spacing around quotes
        r'"\s+': '"',
        r'\s+"': '"',
        r"'\s+": "'",
        r"\s+'": "'",
        
        # Fix spacing around parentheses
        r'\(\s+': '(',
        r'\s+\)': ')',
        
        # Fix spacing around dashes
        r'\s+-\s+': ' - ',
    }
    
    for pattern, replacement in punctuation_fixes.items():
        result = re.sub(pattern, replacement, result)
    
    return result

def clean_text_output(text: str) -> str:
    """Clean and improve the model output text."""
    result = text.strip()
    
    # Apply grammar corrections
    result = correct_grammar(result)
    
    # Remove extra whitespace
    result = re.sub(r'\s+', ' ', result)
    
    # Ensure proper sentence endings
    if result and not result.endswith(('.', '!', '?')):
        result += '.'
    
    # Capitalize first letter
    if result:
        result = result[0].upper() + result[1:]
    
    return result 