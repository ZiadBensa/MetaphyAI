from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import models
from .routers import ai
from .dependencies import get_current_user_id # Import the dependency

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
