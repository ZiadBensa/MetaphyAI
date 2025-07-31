#!/usr/bin/env python3
"""
Script to run the FastAPI backend with T5 model integration.
Make sure to install dependencies first: pip install -r requirements.txt
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("Starting AgoraAI FastAPI Backend...")
    print("Loading T5 paraphrasing model...")
    print("Backend will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 