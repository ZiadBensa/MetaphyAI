"""
Improved semantic rules for context-aware text humanization.
"""
import re
import json
from typing import Dict, List, Optional
from core.dependencies import get_logger

logger = get_logger(__name__)

def get_context_aware_dictionary() -> Dict[str, List[str]]:
    """Get context-aware dictionary with enhanced synonyms."""
    return {
        "implement": ["put in place", "set up", "establish", "create", "follow through"],
        "provide": ["give", "supply", "offer", "deliver", "hand over"],
        "request": ["ask for", "seek", "apply for", "petition", "call for"],
        "consider": ["look at", "think about", "examine", "review", "check out"],
        "experience": ["background", "history", "track record", "expertise", "know-how"],
        "commence": ["start", "begin", "launch", "initiate", "kick off"],
        "purchase": ["buy", "acquire", "obtain", "get", "pick up"],
        "extended": ["pushed back", "delayed", "postponed", "lengthened", "put off"],
        "experiencing": ["having", "going through", "facing", "encountering", "dealing with"],
        "available": ["possible", "accessible", "obtainable", "ready", "on hand"],
        "difficulties": ["problems", "issues", "challenges", "troubles", "hurdles"],
        "options": ["choices", "alternatives", "possibilities", "selections", "picks"],
        "position": ["job", "role", "post", "assignment", "spot"],
        "genuine": ["real", "authentic", "sincere", "true", "legitimate"],
        "express": ["show", "demonstrate", "indicate", "convey", "get across"],
        "interest": ["curiosity", "enthusiasm", "desire", "motivation", "eagerness"],
        "opportunity": ["chance", "possibility", "opening", "shot", "break"],
        "utilize": ["use", "make use of", "take advantage of", "employ", "apply"],
        "establish": ["set up", "create", "found", "start", "build"],
        "maintain": ["keep up", "preserve", "sustain", "hold", "continue"],
        "demonstrate": ["show", "prove", "display", "exhibit", "present"],
        "accomplish": ["achieve", "complete", "finish", "do", "pull off"],
        "facilitate": ["help", "make easier", "assist", "enable", "support"],
        "enhance": ["improve", "boost", "upgrade", "better", "strengthen"],
        "optimize": ["improve", "make better", "enhance", "fine-tune", "perfect"],
        "leverage": ["use", "take advantage of", "utilize", "exploit", "capitalize on"],
        "streamline": ["simplify", "make easier", "smooth out", "improve", "optimize"],
        "deploy": ["put out", "release", "launch", "roll out", "set up"],
        "monitor": ["watch", "keep track of", "check", "observe", "follow"],
        "analyze": ["look at", "examine", "study", "review", "check out"],
        "evaluate": ["assess", "judge", "rate", "check out", "look at"],
        "coordinate": ["organize", "arrange", "set up", "manage", "handle"],
        "collaborate": ["work together", "team up", "join forces", "partner", "cooperate"],
        "innovate": ["come up with new ideas", "create", "invent", "develop", "design"],
        "strategize": ["plan", "figure out", "work out", "design", "map out"],
        "execute": ["carry out", "do", "perform", "complete", "finish"],
        "deliver": ["provide", "give", "supply", "hand over", "pass on"],
        "ensure": ["make sure", "guarantee", "see to it", "check", "verify"],
        "maximize": ["get the most out of", "optimize", "boost", "increase", "improve"],
        "minimize": ["reduce", "cut down", "lessen", "lower", "decrease"],
        "prioritize": ["put first", "focus on", "emphasize", "highlight", "stress"],
        "standardize": ["make consistent", "normalize", "regularize", "uniform", "set standards"],
        "customize": ["tailor", "adapt", "modify", "adjust", "personalize"],
        "integrate": ["combine", "merge", "unite", "join", "connect"],
        "validate": ["check", "verify", "confirm", "test", "prove"],
        "document": ["write down", "record", "note", "log", "keep track of"],
        "communicate": ["talk", "speak", "discuss", "share", "convey"],
        "facilitate": ["help", "assist", "support", "enable", "make easier"],
        "implement": ["put in place", "set up", "establish", "create", "carry out"],
        "maintain": ["keep up", "preserve", "sustain", "hold", "continue"],
        "optimize": ["improve", "make better", "enhance", "fine-tune", "perfect"],
        "leverage": ["use", "take advantage of", "utilize", "exploit", "capitalize on"],
        "streamline": ["simplify", "make easier", "smooth out", "improve", "optimize"],
        "deploy": ["put out", "release", "launch", "roll out", "set up"],
        "monitor": ["watch", "keep track of", "check", "observe", "follow"],
        "analyze": ["look at", "examine", "study", "review", "check out"],
        "evaluate": ["assess", "judge", "rate", "check out", "look at"],
        "coordinate": ["organize", "arrange", "set up", "manage", "handle"],
        "collaborate": ["work together", "team up", "join forces", "partner", "cooperate"],
        "innovate": ["come up with new ideas", "create", "invent", "develop", "design"],
        "strategize": ["plan", "figure out", "work out", "design", "map out"],
        "execute": ["carry out", "do", "perform", "complete", "finish"],
        "deliver": ["provide", "give", "supply", "hand over", "pass on"],
        "ensure": ["make sure", "guarantee", "see to it", "check", "verify"],
        "maximize": ["get the most out of", "optimize", "boost", "increase", "improve"],
        "minimize": ["reduce", "cut down", "lessen", "lower", "decrease"],
        "prioritize": ["put first", "focus on", "emphasize", "highlight", "stress"],
        "standardize": ["make consistent", "normalize", "regularize", "uniform", "set standards"],
        "customize": ["tailor", "adapt", "modify", "adjust", "personalize"],
        "integrate": ["combine", "merge", "unite", "join", "connect"],
        "validate": ["check", "verify", "confirm", "test", "prove"],
        "document": ["write down", "record", "note", "log", "keep track of"],
        "communicate": ["talk", "speak", "discuss", "share", "convey"]
    }

def detect_context(text: str) -> str:
    """Detect the context of the text to choose appropriate replacements."""
    text_lower = text.lower()
    
    # Professional/formal indicators
    professional_indicators = [
        "business", "corporate", "professional", "formal", "official", "meeting",
        "presentation", "report", "document", "proposal", "strategy", "management",
        "executive", "director", "manager", "supervisor", "team lead", "project",
        "deadline", "milestone", "deliverable", "stakeholder", "client", "customer"
    ]
    
    # Casual/informal indicators
    casual_indicators = [
        "hey", "hi", "hello", "thanks", "cool", "awesome", "great", "nice",
        "friend", "buddy", "pal", "guys", "folks", "team", "chat", "message",
        "quick", "simple", "easy", "fun", "exciting", "interesting", "amazing"
    ]
    
    # Technical indicators
    technical_indicators = [
        "code", "programming", "development", "software", "application", "system",
        "database", "api", "interface", "algorithm", "function", "method", "class",
        "variable", "parameter", "configuration", "deployment", "server", "client",
        "framework", "library", "module", "component", "architecture", "design pattern"
    ]
    
    # Academic indicators
    academic_indicators = [
        "research", "study", "analysis", "investigation", "examination", "review",
        "literature", "methodology", "findings", "conclusion", "hypothesis", "theory",
        "data", "results", "statistics", "survey", "interview", "observation"
    ]
    
    # Count matches for each context
    professional_count = sum(1 for indicator in professional_indicators if indicator in text_lower)
    casual_count = sum(1 for indicator in casual_indicators if indicator in text_lower)
    technical_count = sum(1 for indicator in technical_indicators if indicator in text_lower)
    academic_count = sum(1 for indicator in academic_indicators if indicator in text_lower)
    
    # Determine the most likely context
    context_scores = {
        "professional": professional_count,
        "casual": casual_count,
        "technical": technical_count,
        "academic": academic_count
    }
    
    max_context = max(context_scores, key=context_scores.get)
    max_score = context_scores[max_context]
    
    # If no clear context is detected, default to professional
    if max_score == 0:
        return "professional"
    
    return max_context

def get_context_appropriate_replacement(original_word: str, synonyms: List[str], context: str) -> str:
    """Choose the most appropriate synonym based on context."""
    if not synonyms:
        return original_word
    
    # Context-specific synonym preferences
    context_preferences = {
        "professional": {
            "implement": ["establish", "set up", "put in place"],
            "provide": ["deliver", "supply", "offer"],
            "request": ["apply for", "seek", "petition"],
            "consider": ["examine", "review", "evaluate"],
            "experience": ["background", "expertise", "track record"],
            "commence": ["initiate", "launch", "begin"],
            "purchase": ["acquire", "obtain", "procure"],
            "extended": ["postponed", "delayed", "rescheduled"],
            "experiencing": ["encountering", "facing", "undergoing"],
            "available": ["accessible", "obtainable", "ready"],
            "difficulties": ["challenges", "issues", "obstacles"],
            "options": ["alternatives", "possibilities", "selections"],
            "position": ["role", "assignment", "post"],
            "genuine": ["authentic", "sincere", "legitimate"],
            "express": ["demonstrate", "indicate", "convey"],
            "interest": ["enthusiasm", "motivation", "commitment"],
            "opportunity": ["possibility", "prospect", "opening"]
        },
        "casual": {
            "implement": ["put in place", "set up", "create"],
            "provide": ["give", "hand over", "pass on"],
            "request": ["ask for", "look for", "get"],
            "consider": ["think about", "look at", "check out"],
            "experience": ["background", "history", "know-how"],
            "commence": ["start", "begin", "kick off"],
            "purchase": ["buy", "get", "pick up"],
            "extended": ["pushed back", "put off", "delayed"],
            "experiencing": ["having", "going through", "dealing with"],
            "available": ["ready", "on hand", "possible"],
            "difficulties": ["problems", "troubles", "hurdles"],
            "options": ["choices", "picks", "alternatives"],
            "position": ["job", "spot", "role"],
            "genuine": ["real", "true", "legitimate"],
            "express": ["show", "get across", "convey"],
            "interest": ["curiosity", "eagerness", "enthusiasm"],
            "opportunity": ["chance", "shot", "break"]
        },
        "technical": {
            "implement": ["deploy", "set up", "configure"],
            "provide": ["deliver", "supply", "offer"],
            "request": ["call", "invoke", "fetch"],
            "consider": ["evaluate", "assess", "analyze"],
            "experience": ["expertise", "background", "skills"],
            "commence": ["initialize", "start", "launch"],
            "purchase": ["acquire", "obtain", "procure"],
            "extended": ["delayed", "postponed", "rescheduled"],
            "experiencing": ["encountering", "facing", "undergoing"],
            "available": ["accessible", "ready", "obtainable"],
            "difficulties": ["issues", "challenges", "problems"],
            "options": ["alternatives", "possibilities", "selections"],
            "position": ["role", "assignment", "function"],
            "genuine": ["authentic", "legitimate", "valid"],
            "express": ["represent", "indicate", "denote"],
            "interest": ["motivation", "commitment", "enthusiasm"],
            "opportunity": ["possibility", "prospect", "opening"]
        },
        "academic": {
            "implement": ["establish", "institute", "create"],
            "provide": ["supply", "deliver", "offer"],
            "request": ["apply for", "seek", "petition"],
            "consider": ["examine", "review", "analyze"],
            "experience": ["background", "expertise", "qualifications"],
            "commence": ["initiate", "begin", "launch"],
            "purchase": ["acquire", "obtain", "procure"],
            "extended": ["postponed", "delayed", "rescheduled"],
            "experiencing": ["undergoing", "encountering", "facing"],
            "available": ["accessible", "obtainable", "ready"],
            "difficulties": ["challenges", "obstacles", "issues"],
            "options": ["alternatives", "possibilities", "selections"],
            "position": ["role", "assignment", "post"],
            "genuine": ["authentic", "sincere", "legitimate"],
            "express": ["demonstrate", "indicate", "convey"],
            "interest": ["motivation", "commitment", "enthusiasm"],
            "opportunity": ["possibility", "prospect", "opening"]
        }
    }
    
    # Get context-specific preferences
    context_prefs = context_preferences.get(context, {})
    word_prefs = context_prefs.get(original_word.lower(), [])
    
    # Try to find a preferred synonym for this context
    for preferred in word_prefs:
        if preferred in synonyms:
            logger.debug(f"Context-aware choice: '{original_word}' -> '{preferred}' (context: {context})")
            return preferred
    
    # If no context-specific preference, return the first available synonym
    return synonyms[0] if synonyms else original_word

def get_enhanced_semantic_rules() -> Dict[str, List[str]]:
    """Get enhanced semantic rules with more sophisticated patterns."""
    return {
        # Formal to casual transformations
        "formal_phrases": {
            "I would like to": "I want to",
            "I am going to": "I'm going to",
            "I am currently": "I'm currently",
            "We need to": "We have to",
            "Please provide": "Please give",
            "The meeting will commence": "The meeting will start",
            "The project deadline has been extended": "The project deadline was pushed back",
            "The system is experiencing technical difficulties": "The system is having technical problems",
            "We should consider all available options": "We should look at all the options"
        },
        
        # Word-level transformations
        "word_replacements": {
            "purchase": "buy",
            "commence": "start",
            "implement": "put in place",
            "provide": "give",
            "request": "ask for",
            "extended": "pushed back",
            "experiencing": "having",
            "consider": "look at",
            "available": "possible",
            "difficulties": "problems",
            "options": "choices"
        },
        
        # Contraction patterns
        "contractions": {
            "I am": "I'm",
            "I will": "I'll",
            "We are": "We're",
            "We will": "We'll",
            "It is": "It's",
            "That is": "That's",
            "There is": "There's",
            "You are": "You're",
            "They are": "They're",
            "Cannot": "Can't",
            "Will not": "Won't",
            "Do not": "Don't",
            "Does not": "Doesn't",
            "Is not": "Isn't",
            "Are not": "Aren't"
        }
    } 