#!/usr/bin/env python3
"""
Enhanced FastAPI server for text humanization.
This version uses more sophisticated transformations to avoid AI detection.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import random
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AgoraAI Text Humanizer",
    description="Advanced text humanization API",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class HumanizeRequest(BaseModel):
    text: str
    tone: str

class HumanizeResponse(BaseModel):
    humanized_text: str
    tone: str

# Enhanced text transformation functions
def add_natural_variations(text: str) -> str:
    """Add natural human-like variations to text."""
    variations = [
        # Sentence starters
        (r'\b(I am|I\'m)\b', lambda m: random.choice([
            "I'm", "I am", "I've been", "I'll be", "I'm actually"
        ])),
        (r'\b(you are|you\'re)\b', lambda m: random.choice([
            "you're", "you are", "you seem to be", "you appear to be"
        ])),
        # Connectors
        (r'\b(However|Nevertheless|Nonetheless)\b', lambda m: random.choice([
            "But", "Still", "That said", "On the other hand", "Though", "Yet"
        ])),
        (r'\b(Furthermore|Moreover|Additionally)\b', lambda m: random.choice([
            "Also", "Plus", "What's more", "Besides", "On top of that", "Not to mention"
        ])),
        # Common phrases
        (r'\b(It is important to note|It should be noted)\b', lambda m: random.choice([
            "Keep in mind", "Remember", "Note that", "It's worth mentioning", "Don't forget"
        ])),
        (r'\b(In conclusion|To conclude|Finally)\b', lambda m: random.choice([
            "So", "All in all", "At the end of the day", "Bottom line", "In the end"
        ]))
    ]
    
    result = text
    for pattern, replacement in variations:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def restructure_sentences(text: str) -> str:
    """Restructure sentences to sound more natural."""
    sentences = re.split(r'[.!?]+', text)
    restructured = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        # Random sentence restructuring
        if random.random() < 0.3:  # 30% chance to restructure
            # Add natural fillers
            fillers = ["you know", "like", "basically", "actually", "honestly"]
            if random.random() < 0.2:
                sentence = f"{random.choice(fillers)}, {sentence.lower()}"
            
            # Passive to active voice (sometimes)
            if random.random() < 0.15:
                sentence = re.sub(r'\b(It is|It\'s) (.*?)(ed|ing)\b', r'\2', sentence, flags=re.IGNORECASE)
        
        restructured.append(sentence)
    
    return '. '.join(restructured) + ('.' if text.endswith('.') else '')

def add_human_quirks(text: str) -> str:
    """Add human-like quirks and imperfections."""
    quirks = [
        # Informal contractions
        (r'\b(will not|won\'t)\b', lambda m: random.choice(["won't", "will not", "ain't gonna"])),
        (r'\b(cannot|can\'t)\b', lambda m: random.choice(["can't", "cannot", "ain't"])),
        (r'\b(do not|don\'t)\b', lambda m: random.choice(["don't", "do not", "ain't"])),
        
        # Casual expressions
        (r'\b(very|extremely)\b', lambda m: random.choice(["really", "super", "pretty", "quite"])),
        (r'\b(good|excellent)\b', lambda m: random.choice(["good", "great", "awesome", "cool", "nice"])),
        (r'\b(bad|terrible)\b', lambda m: random.choice(["bad", "terrible", "awful", "not great", "rough"])),
        
        # Natural repetitions and emphasis
        (r'\b(important|crucial)\b', lambda m: random.choice([
            "important", "really important", "super important", "key"
        ])),
    ]
    
    result = text
    for pattern, replacement in quirks:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def apply_context_aware_transformations(text: str, tone: str) -> str:
    """Apply context-aware transformations based on tone and content."""
    result = text
    
    # Detect content type and apply appropriate transformations
    if any(word in text.lower() for word in ['business', 'professional', 'meeting', 'report']):
        # Business context
        business_patterns = {
            r'\b(utilize|implement)\b': "use",
            r'\b(facilitate)\b': "help",
            r'\b(substantial)\b': "big",
            r'\b(significant)\b': "important",
            r'\b(considerable)\b': "a lot",
            r'\b(numerous)\b': "many",
        }
        for pattern, replacement in business_patterns.items():
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    elif any(word in text.lower() for word in ['friend', 'family', 'personal', 'casual']):
        # Personal context
        personal_patterns = {
            r'\b(hello|greetings)\b': "hey",
            r'\b(goodbye|farewell)\b': "see you",
            r'\b(thank you)\b': "thanks",
            r'\b(you are welcome)\b': "no problem",
        }
        for pattern, replacement in personal_patterns.items():
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Tone-specific enhancements
    if tone == "casual":
        result = add_casual_enhancements(result)
    elif tone == "friendly":
        result = add_friendly_enhancements(result)
    elif tone == "professional":
        result = add_professional_enhancements(result)
    elif tone == "enthusiastic":
        result = add_enthusiastic_enhancements(result)
    
    return result

def add_casual_enhancements(text: str) -> str:
    """Add casual language enhancements."""
    casual_patterns = {
        r'\b(I am|I\'m)\b': "I'm",
        r'\b(you are|you\'re)\b': "you're",
        r'\b(it is|it\'s)\b': "it's",
        r'\b(that is|that\'s)\b': "that's",
        r'\b(we are|we\'re)\b': "we're",
        r'\b(they are|they\'re)\b': "they're",
        r'\b(cannot|can\'t)\b': "can't",
        r'\b(will not|won\'t)\b': "won't",
        r'\b(do not|don\'t)\b': "don't",
        r'\b(does not|doesn\'t)\b': "doesn't",
        r'\b(is not|isn\'t)\b': "isn't",
        r'\b(are not|aren\'t)\b': "aren't",
        r'\b(was not|wasn\'t)\b': "wasn't",
        r'\b(were not|weren\'t)\b': "weren't",
        r'\b(have not|haven\'t)\b': "haven't",
        r'\b(has not|hasn\'t)\b': "hasn't",
        r'\b(had not|hadn\'t)\b': "hadn't",
        r'\b(would not|wouldn\'t)\b': "wouldn't",
        r'\b(could not|couldn\'t)\b': "couldn't",
        r'\b(should not|shouldn\'t)\b': "shouldn't",
        r'\b(might not|mightn\'t)\b': "mightn't",
        r'\b(must not|mustn\'t)\b': "mustn't",
        # Casual language patterns
        r'\b(Furthermore|Moreover)\b': "Also",
        r'\b(In addition|Additionally)\b': "Plus",
        r'\b(However|Nevertheless)\b': "But",
        r'\b(Consequently|Therefore|Thus|Hence)\b': "So",
        r'\b(Subsequently)\b': "Then",
        r'\b(Utilize|Implement)\b': "Use",
        r'\b(Facilitate)\b': "Help",
        r'\b(Substantial)\b': "Big",
        r'\b(Significant)\b': "Important",
        r'\b(Considerable)\b': "A lot",
        r'\b(Numerous)\b': "Many",
        r'\b(Subsequent)\b': "Next",
        r'\b(Prior)\b': "Before",
    }
    
    result = text
    for pattern, replacement in casual_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def add_friendly_enhancements(text: str) -> str:
    """Add friendly language enhancements."""
    result = add_casual_enhancements(text)
    
    friendly_patterns = {
        r'\b(Hello|Hi)\b': "Hey",
        r'\b(Goodbye|Bye)\b': "See you later",
        r'\b(Thank you|Thanks)\b': "Thanks",
        r'\b(You are welcome|You\'re welcome)\b': "No problem",
        r'\b(I apologize|I am sorry)\b': "Sorry",
        r'\b(Please)\b': "Could you",
        r'\b(Would you mind)\b': "Can you",
    }
    
    for pattern, replacement in friendly_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def add_professional_enhancements(text: str) -> str:
    """Add professional language enhancements."""
    professional_patterns = {
        r'\b(I\'m|I am)\b': "I am",
        r'\b(You\'re|You are)\b': "You are",
        r'\b(It\'s|It is)\b': "It is",
        r'\b(That\'s|That is)\b': "That is",
        r'\b(We\'re|We are)\b': "We are",
        r'\b(They\'re|They are)\b': "They are",
        r'\b(Can\'t|Cannot)\b': "Cannot",
        r'\b(Won\'t|Will not)\b': "Will not",
        r'\b(Don\'t|Do not)\b': "Do not",
        r'\b(Doesn\'t|Does not)\b': "Does not",
        r'\b(Isn\'t|Is not)\b': "Is not",
        r'\b(Aren\'t|Are not)\b': "Are not",
        r'\b(Wasn\'t|Was not)\b': "Was not",
        r'\b(Weren\'t|Were not)\b': "Were not",
        r'\b(Haven\'t|Have not)\b': "Have not",
        r'\b(Hasn\'t|Has not)\b': "Has not",
        r'\b(Hadn\'t|Had not)\b': "Had not",
        r'\b(Wouldn\'t|Would not)\b': "Would not",
        r'\b(Couldn\'t|Could not)\b': "Could not",
        r'\b(Shouldn\'t|Should not)\b': "Should not",
    }
    
    result = text
    for pattern, replacement in professional_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def add_enthusiastic_enhancements(text: str) -> str:
    """Add enthusiastic language enhancements."""
    result = add_casual_enhancements(text)
    
    enthusiastic_patterns = {
        r'\b(Great|Good)\b': "Amazing",
        r'\b(Nice|Cool)\b': "Awesome",
        r'\b(Interesting)\b': "Fascinating",
        r'\b(Important)\b': "Crucial",
        r'\b(Big)\b': "Huge",
        r'\b(Many)\b': "Tons of",
        r'\b(A lot)\b': "A tremendous amount of",
        r'\b(Really)\b': "Absolutely",
        r'\b(Very)\b': "Incredibly",
    }
    
    for pattern, replacement in enthusiastic_patterns.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def humanize_text(text: str, tone: str) -> str:
    """Enhanced main humanization function."""
    logger.info(f"Humanizing text with tone: {tone}")
    logger.info(f"Original text: {text[:100]}...")
    
    try:
        # Step 1: Apply tone-specific transformations
        if tone == "casual":
            humanized = add_casual_enhancements(text)
        elif tone == "friendly":
            humanized = add_friendly_enhancements(text)
        elif tone == "professional":
            humanized = add_professional_enhancements(text)
        elif tone == "enthusiastic":
            humanized = add_enthusiastic_enhancements(text)
        else:  # neutral
            humanized = add_casual_enhancements(text)
        
        # Step 2: Add context-aware transformations
        humanized = apply_context_aware_transformations(humanized, tone)
        
        # Step 3: Add natural variations
        humanized = add_natural_variations(humanized)
        
        # Step 4: Add human quirks
        humanized = add_human_quirks(humanized)
        
        # Step 5: Restructure sentences (sometimes)
        if random.random() < 0.4:  # 40% chance
            humanized = restructure_sentences(humanized)
        
        logger.info(f"Humanized text: {humanized[:100]}...")
        return humanized
        
    except Exception as e:
        logger.error(f"Error in humanization: {e}")
        return text  # Return original text if transformation fails

# API Endpoints
@app.get("/")
async def root():
    return {"message": "AgoraAI Enhanced Text Humanizer API is running!"}

@app.get("/test")
async def test():
    """Test endpoint."""
    test_text = "I am going to the store to purchase some groceries. Furthermore, I will not be able to return until later."
    humanized = humanize_text(test_text, "casual")
    return {
        "original": test_text,
        "humanized": humanized,
        "status": "working"
    }

@app.post("/humanize", response_model=HumanizeResponse)
async def humanize_text_endpoint(request: HumanizeRequest):
    """Humanize text endpoint."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    if not request.tone.strip():
        raise HTTPException(status_code=400, detail="Tone cannot be empty.")

    humanized_text = humanize_text(request.text, request.tone)
    
    return HumanizeResponse(
        humanized_text=humanized_text,
        tone=request.tone
    )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AgoraAI Enhanced Text Humanizer API...")
    print("📍 API will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print("🔧 Enhanced text humanization ready!")
    print("🎯 Anti-AI detection features enabled!")
    print("-" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info") 