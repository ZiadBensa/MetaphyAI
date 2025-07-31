#!/usr/bin/env python3
"""
Simple test script to check if the text humanization works.
"""

import re

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
    
    # Casual language patterns
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
        r'\bPrior to\b': "Before"
    }
    
    for pattern, replacement in casual_replacements.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_friendly_tone(text: str) -> str:
    """Apply friendly tone transformations."""
    result = apply_casual_tone(text)
    
    # Add friendly expressions
    friendly_patterns = {
        r'\bHello\b': "Hi there",
        r'\bGoodbye\b': "See you later",
        r'\bThank you\b': "Thanks",
        r'\bYou are welcome\b': "You're welcome",
        r'\bI apologize\b': "Sorry",
        r'\bI am sorry\b': "I'm sorry"
    }
    
    for pattern, replacement in friendly_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_professional_tone(text: str) -> str:
    """Apply professional tone transformations."""
    result = text
    
    # Professional language patterns
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
        r'\bShouldn\'t\b': "Should not"
    }
    
    for pattern, replacement in professional_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_enthusiastic_tone(text: str) -> str:
    """Apply enthusiastic tone transformations."""
    result = apply_casual_tone(text)
    
    # Add enthusiastic expressions
    enthusiastic_patterns = {
        r'\bGreat\b': "Amazing",
        r'\bGood\b': "Excellent",
        r'\bNice\b': "Fantastic",
        r'\bCool\b': "Awesome",
        r'\bInteresting\b': "Fascinating",
        r'\bImportant\b': "Crucial",
        r'\bBig\b': "Huge",
        r'\bMany\b': "Tons of",
        r'\bA lot\b': "A tremendous amount of"
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

def test_humanization():
    """Test all tone transformations."""
    print("Testing text humanization...")
    print("=" * 60)
    
    test_cases = [
        ("I am going to the store to purchase some groceries. Furthermore, I will not be able to return until later.", "casual"),
        ("Hello, I am sorry for the inconvenience. Thank you for your patience.", "friendly"),
        ("I'm going to the store. It's going to be great!", "professional"),
        ("This is a good idea. It's very important for our project.", "enthusiastic"),
        ("I am working on the project. It is going well.", "neutral")
    ]
    
    all_working = True
    
    for text, tone in test_cases:
        print(f"\n--- Testing {tone.upper()} tone ---")
        print(f"Original: {text}")
        
        if tone == "casual":
            humanized = apply_casual_tone(text)
        elif tone == "friendly":
            humanized = apply_friendly_tone(text)
        elif tone == "professional":
            humanized = apply_professional_tone(text)
        elif tone == "enthusiastic":
            humanized = apply_enthusiastic_tone(text)
        else:  # neutral
            humanized = apply_neutral_tone(text)
        
        print(f"Humanized: {humanized}")
        
        if humanized != text:
            print(f"✅ {tone.title()} tone transformation successful!")
        else:
            print(f"❌ {tone.title()} tone didn't change anything")
            all_working = False
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    if all_working:
        print("🎉 All tone transformations are working!")
    else:
        print("⚠️  Some tone transformations need improvement")
    
    return all_working

if __name__ == "__main__":
    test_humanization() 