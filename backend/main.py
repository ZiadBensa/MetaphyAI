from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging

# Fix relative imports by using absolute imports
from database import engine, Base, get_db
import models
import schemas
from routers import ai
from dependencies import get_current_user_id

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Text Tools Backend",
    description="FastAPI backend for text extraction and humanization with user history.",
    version="1.0.0",
)

# Configure CORS for frontend communication
origins = [
    "http://localhost:3000",  # Your Next.js frontend
    "http://localhost:8000",  # For local testing of backend directly
    # Add your production frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai.router, prefix="/ai", tags=["AI Tools"])

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Text Tools Backend!"}

# Example of a protected route to test authentication
@app.get("/protected-test")
async def protected_test(user_id: str = Depends(get_current_user_id)):
    return {"message": f"Hello, user {user_id}! You are authenticated."}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting AgoraAI FastAPI Backend...")
    logger.info("Backend will be available at: http://localhost:8000")
    logger.info("API documentation at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
