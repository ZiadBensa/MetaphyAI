from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from .database import Base

class AIInteraction(Base):
    __tablename__ = "ai_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True) # User ID from NextAuth session
    interaction_type = Column(String, nullable=False) # e.g., "extract", "humanize"
    input_text = Column(Text, nullable=True) # For humanize
    input_filename = Column(String, nullable=True) # For extract
    output_text = Column(Text, nullable=False)
    tone = Column(String, nullable=True) # For humanize
    created_at = Column(DateTime(timezone=True), server_default=func.now())
