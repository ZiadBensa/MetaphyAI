"""
Configuration settings for the backend application.
"""
import os
from typing import Optional

class Settings:
    """Application settings."""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Tools Backend"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for AI-powered tools"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    # Model Settings
    DEFAULT_MODEL: str = "t5-small"
    MAX_TEXT_LENGTH: int = 2048
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    # Database Settings (for future use)
    DATABASE_URL: Optional[str] = None
    
    class Config:
        case_sensitive = True

settings = Settings() 