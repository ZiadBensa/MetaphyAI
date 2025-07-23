from pydantic import BaseModel
from typing import Optional

# Schemas for AI Interaction History
class AIInteractionCreate(BaseModel):
    interaction_type: str
    input_text: Optional[str] = None
    input_filename: Optional[str] = None
    output_text: str
    tone: Optional[str] = None

class AIInteractionResponse(AIInteractionCreate):
    id: str
    user_id: str
    created_at: str # Will be formatted as string

    class Config:
        orm_mode = True # Enable ORM mode for SQLAlchemy models

# Schemas for AI Endpoints
class HumanizeRequest(BaseModel):
    text: str
    tone: str

class HumanizeResponse(BaseModel):
    humanized_text: str
    tone: str

class ExtractResponse(BaseModel):
    text: str
    filename: str
