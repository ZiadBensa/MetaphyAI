"""
Main FastAPI application for AI Tools Backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from core.config import settings
from core.dependencies import get_logger
from tools.text_humanizer.router import router as text_humanizer_router

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("🚀 Starting AI Tools Backend...")
    logger.info("📦 Loading semantic-enhanced dictionary-based humanization system...")
    
    # The semantic-enhanced dictionary system loads instantly
    logger.info("✅ Semantic-enhanced dictionary-based humanization system ready!")
    
    logger.info(f"🌐 Backend will be available at: http://{settings.HOST}:{settings.PORT}")
    logger.info(f"📚 API documentation at: http://{settings.HOST}:{settings.PORT}/docs")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI Tools Backend...")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(text_humanizer_router)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Tools Backend",
        "version": settings.VERSION,
        "docs": "/docs",
        "tools": ["text-humanizer"]
    }

@app.get("/health")
async def health_check():
    """Global health check endpoint."""
    return {
        "status": "healthy",
        "message": "Backend is running",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
