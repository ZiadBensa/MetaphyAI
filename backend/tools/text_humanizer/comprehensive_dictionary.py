"""
Comprehensive dictionary system for text humanization using NLTK WordNet.
"""
import json
import re
from typing import Dict, List, Set, Optional
from core.dependencies import get_logger

logger = get_logger(__name__)

class ComprehensiveDictionary:
    """Comprehensive dictionary system using NLTK WordNet and curated mappings."""
    
    def __init__(self):
        """Initialize the comprehensive dictionary system."""
        self.formal_to_casual = self._get_formal_to_casual_mappings()
        self.wordnet_synonyms = {}
        self.cache = {}
        
    def _get_formal_to_casual_mappings(self) -> Dict[str, List[str]]:
        """Get comprehensive formal to casual word mappings."""
        return {
            # Academic/Formal → Casual
            "implementation": ["putting in place", "setting up", "establishing", "creating"],
            "methodology": ["approach", "method", "procedure", "technique"],
            "necessitates": ["requires", "needs", "calls for", "demands"],
            "evaluation": ["assessment", "review", "analysis", "examination"],
            "comprehensive": ["thorough", "complete", "detailed", "extensive"],
            "understanding": ["knowledge", "grasp", "comprehension", "awareness"],
            "endeavors": ["tries", "attempts", "seeks", "aims"],
            "leverage": ["use", "utilize", "take advantage of", "make use of"],
            "empirical": ["real-world", "practical", "actual", "observed"],
            "qualitative": ["descriptive", "detailed", "in-depth", "thorough"],
            "proposed": ["suggested", "recommended", "planned", "intended"],
            "extensive": ["thorough", "comprehensive", "detailed", "complete"],
            "existing": ["current", "present", "available", "on hand"],
            "framework": ["structure", "system", "approach", "method"],
            "furthermore": ["also", "additionally", "moreover", "besides"],
            "bridge": ["connect", "link", "join", "unite"],
            "gap": ["difference", "disconnect", "separation", "divide"],
            "utilize": ["use", "make use of", "take advantage of", "employ"],
            "establish": ["set up", "create", "found", "start"],
            "maintain": ["keep up", "preserve", "sustain", "hold"],
            "demonstrate": ["show", "prove", "display", "exhibit"],
            "accomplish": ["achieve", "complete", "finish", "do"],
            "facilitate": ["help", "make easier", "assist", "enable"],
            "enhance": ["improve", "boost", "upgrade", "better"],
            "optimize": ["improve", "make better", "enhance", "fine-tune"],
            "streamline": ["simplify", "make easier", "smooth out", "improve"],
            "deploy": ["put out", "release", "launch", "roll out"],
            "monitor": ["watch", "keep track of", "check", "observe"],
            "analyze": ["look at", "examine", "study", "review"],
            "evaluate": ["assess", "judge", "rate", "check out"],
            "coordinate": ["organize", "arrange", "set up", "manage"],
            "collaborate": ["work together", "team up", "join forces", "partner"],
            "innovate": ["come up with new ideas", "create", "invent", "develop"],
            "strategize": ["plan", "figure out", "work out", "design"],
            "execute": ["carry out", "do", "perform", "complete"],
            "deliver": ["provide", "give", "supply", "hand over"],
            "ensure": ["make sure", "guarantee", "see to it", "check"],
            "maximize": ["get the most out of", "optimize", "boost", "increase"],
            "minimize": ["reduce", "cut down", "lessen", "lower"],
            "prioritize": ["put first", "focus on", "emphasize", "highlight"],
            "standardize": ["make consistent", "normalize", "regularize", "uniform"],
            "customize": ["tailor", "adapt", "modify", "adjust"],
            "integrate": ["combine", "merge", "unite", "join"],
            "validate": ["check", "verify", "confirm", "test"],
            "document": ["write down", "record", "note", "log"],
            "communicate": ["talk", "speak", "discuss", "share"],
            
            # Business/Professional → Casual
            "implement": ["put in place", "set up", "establish", "create"],
            "provide": ["give", "supply", "offer", "deliver"],
            "request": ["ask for", "seek", "apply for", "petition"],
            "consider": ["look at", "think about", "examine", "review"],
            "experience": ["background", "history", "track record", "expertise"],
            "commence": ["start", "begin", "launch", "initiate"],
            "purchase": ["buy", "acquire", "obtain", "get"],
            "extended": ["pushed back", "delayed", "postponed", "lengthened"],
            "experiencing": ["having", "going through", "facing", "encountering"],
            "available": ["possible", "accessible", "obtainable", "ready"],
            "difficulties": ["problems", "issues", "challenges", "troubles"],
            "options": ["choices", "alternatives", "possibilities", "selections"],
            "position": ["job", "role", "post", "assignment"],
            "genuine": ["real", "authentic", "sincere", "true"],
            "express": ["show", "demonstrate", "indicate", "convey"],
            "interest": ["curiosity", "enthusiasm", "desire", "motivation"],
            "opportunity": ["chance", "possibility", "opening", "shot"],
            "discuss": ["talk about", "explore", "review", "examine"],
            "collaboration": ["teamwork", "partnership", "cooperation", "alliance"],
            "mission": ["goal", "purpose", "objective", "aim"],
            "align": ["match", "fit", "correspond", "agree"],
            "results": ["outcomes", "achievements", "accomplishments", "successes"],
            
            # Common Phrases
            "writing to": ["wanting to", "hoping to", "aiming to", "seeking to"],
            "drew me to": ["attracted me to", "interested me in", "appealed to me", "caught my attention"],
            "years of": ["extensive", "considerable", "substantial", "significant"],
            "operational support": ["operational assistance", "operational help", "operational guidance"],
            "bring energy": ["provide enthusiasm", "offer drive", "contribute motivation"],
            "adaptability": ["flexibility", "versatility", "adjustability", "resilience"],
            "great results": ["excellent outcomes", "outstanding achievements", "superior accomplishments"],
            "strong collaboration": ["effective teamwork", "productive partnership", "successful cooperation"],
            "love the opportunity": ["welcome the chance", "appreciate the possibility", "value the prospect"],
            "further discuss": ["continue talking about", "explore in more detail", "delve deeper into"],
            
            # Contractions and Informal Patterns
            "I would like to": ["I want to", "I'd like to", "I'm hoping to"],
            "I am": ["I'm"],
            "I will": ["I'll"],
            "We are": ["We're"],
            "We will": ["We'll"],
            "It is": ["It's"],
            "That is": ["That's"],
            "There is": ["There's"],
            "You are": ["You're"],
            "They are": ["They're"],
            "Cannot": ["Can't"],
            "Will not": ["Won't"],
            "Do not": ["Don't"],
            "Does not": ["Doesn't"],
            "Is not": ["Isn't"],
            "Are not": ["Aren't"],
            "Please provide": ["Please give", "Please share", "Please send"],
            "The meeting will commence": ["The meeting will start", "The meeting will begin"],
            "The project deadline has been extended": ["The project deadline was pushed back", "The project deadline was delayed"],
            "The system is experiencing technical difficulties": ["The system is having technical problems", "The system is having issues"],
            "We should consider all available options": ["We should look at all the options", "We should check out all the choices"],
        }
    
    def get_synonyms_from_wordnet(self, word: str) -> List[str]:
        """Get synonyms from NLTK WordNet."""
        try:
            from nltk.corpus import wordnet
            
            synonyms = set()
            synsets = wordnet.synsets(word.lower())
            
            for synset in synsets:
                # Get lemma names (synonyms)
                for lemma in synset.lemmas():
                    synonym = lemma.name()
                    # Filter out the original word and very long synonyms
                    if synonym.lower() != word.lower() and len(synonym.split()) <= 3:
                        synonyms.add(synonym)
            
            return list(synonyms)[:5]  # Limit to 5 synonyms
            
        except Exception as e:
            logger.warning(f"WordNet lookup failed for '{word}': {e}")
            return []
    
    def get_casual_alternatives(self, word: str) -> List[str]:
        """Get casual alternatives for a formal word."""
        word_lower = word.lower()
        
        # Check cache first
        if word_lower in self.cache:
            return self.cache[word_lower]
        
        # Check formal-to-casual mappings
        if word_lower in self.formal_to_casual:
            result = self.formal_to_casual[word_lower]
            self.cache[word_lower] = result
            return result
        
        # Try WordNet for additional synonyms
        wordnet_synonyms = self.get_synonyms_from_wordnet(word)
        if wordnet_synonyms:
            # Filter for more casual alternatives
            casual_synonyms = [s for s in wordnet_synonyms if len(s.split()) <= 2]
            if casual_synonyms:
                self.cache[word_lower] = casual_synonyms[:3]
                return casual_synonyms[:3]
        
        # No alternatives found
        return []
    
    def get_comprehensive_dictionary(self) -> Dict[str, List[str]]:
        """Get comprehensive dictionary combining formal-to-casual mappings and WordNet."""
        comprehensive_dict = {}
        
        # Add all formal-to-casual mappings
        for formal_word, casual_alternatives in self.formal_to_casual.items():
            comprehensive_dict[formal_word] = casual_alternatives
        
        # Add WordNet synonyms for common formal words
        common_formal_words = [
            "implement", "provide", "request", "consider", "experience",
            "commence", "purchase", "extend", "experience", "available",
            "difficulty", "option", "position", "genuine", "express",
            "interest", "opportunity", "discuss", "collaborate", "mission",
            "align", "result", "utilize", "establish", "maintain",
            "demonstrate", "accomplish", "facilitate", "enhance", "optimize"
        ]
        
        for word in common_formal_words:
            if word not in comprehensive_dict:
                synonyms = self.get_synonyms_from_wordnet(word)
                if synonyms:
                    comprehensive_dict[word] = synonyms
        
        return comprehensive_dict
    
    def save_comprehensive_dictionary(self, filepath: str = "comprehensive_synonyms.json"):
        """Save the comprehensive dictionary to a JSON file."""
        comprehensive_dict = self.get_comprehensive_dictionary()
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(comprehensive_dict, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Comprehensive dictionary saved with {len(comprehensive_dict)} words")
            return True
            
        except Exception as e:
            logger.error(f"Error saving comprehensive dictionary: {e}")
            return False
    
    def get_stats(self) -> Dict:
        """Get statistics about the comprehensive dictionary."""
        comprehensive_dict = self.get_comprehensive_dictionary()
        
        return {
            "total_words": len(comprehensive_dict),
            "formal_to_casual_mappings": len(self.formal_to_casual),
            "cached_words": len(self.cache),
            "average_synonyms_per_word": sum(len(synonyms) for synonyms in comprehensive_dict.values()) / len(comprehensive_dict) if comprehensive_dict else 0,
            "words_with_synonyms": sum(1 for synonyms in comprehensive_dict.values() if synonyms)
        }

# Global instance
comprehensive_dictionary = ComprehensiveDictionary()

def get_comprehensive_synonyms() -> Dict[str, List[str]]:
    """Get comprehensive synonyms dictionary."""
    return comprehensive_dictionary.get_comprehensive_dictionary()

def save_comprehensive_dictionary(filepath: str = "comprehensive_synonyms.json") -> bool:
    """Save comprehensive dictionary to file."""
    return comprehensive_dictionary.save_comprehensive_dictionary(filepath) 