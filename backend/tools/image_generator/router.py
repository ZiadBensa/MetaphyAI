"""
FastAPI router for Image Generator endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import os
import logging
from typing import List

from .models import (
    GenerateImageRequest, GenerateImageResponse, ImageVariationRequest,
    ModelInfo, StyleInfo, HealthResponse
)
from .generator import ImageGenerator

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/image-generator", tags=["Image Generator"])

# Global image generator instance
_image_generator = None

def get_image_generator() -> ImageGenerator:
    """Dependency to get image generator instance."""
    global _image_generator
    
    if _image_generator is None:
        # Initialize with or without API token (local mode works without it)
        api_token = os.getenv("HUGGINGFACE_API_TOKEN")
        _image_generator = ImageGenerator(api_token)
        
        # Load the local model
        logger.info("Loading local Stable Diffusion model...")
        if not _image_generator.local_generator.load_model():
            raise HTTPException(
                status_code=500,
                detail="Failed to load local Stable Diffusion model. Check your installation."
            )
        logger.info("Local model loaded successfully!")
    
    return _image_generator

@router.get("/health", response_model=HealthResponse)
async def health_check(generator: ImageGenerator = Depends(get_image_generator)):
    """
    Health check endpoint for the image generator service.
    
    Returns:
        Service health status and available models
    """
    try:
        health_info = generator.health_check()
        return HealthResponse(**health_info)
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.get("/models", response_model=List[ModelInfo])
async def get_models(generator: ImageGenerator = Depends(get_image_generator)):
    """
    Get information about available image generation models.
    
    Returns:
        List of available models with their capabilities
    """
    try:
        return generator.get_available_models()
    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get models: {str(e)}")

@router.get("/styles", response_model=List[StyleInfo])
async def get_styles(generator: ImageGenerator = Depends(get_image_generator)):
    """
    Get information about available image generation styles.
    
    Returns:
        List of available styles with examples
    """
    try:
        return generator.get_available_styles()
    except Exception as e:
        logger.error(f"Failed to get styles: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get styles: {str(e)}")

@router.post("/generate", response_model=GenerateImageResponse)
async def generate_images(
    request: GenerateImageRequest,
    generator: ImageGenerator = Depends(get_image_generator)
):
    """
    Generate images based on the provided prompt and parameters.
    
    Args:
        request: Image generation request with prompt and parameters
        generator: Image generator instance
        
    Returns:
        Generated images with metadata
    """
    try:
        logger.info(f"Image generation request received: {request.prompt[:100]}...")
        
        # Validate request
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        if request.num_images < 1 or request.num_images > 4:
            raise HTTPException(status_code=400, detail="Number of images must be between 1 and 4")
        
        # Generate images
        response = generator.generate_images(request)
        
        logger.info(f"Successfully generated {response.total_images} images in {response.processing_time:.2f}s")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@router.post("/variations", response_model=GenerateImageResponse)
async def generate_variations(
    request: ImageVariationRequest,
    generator: ImageGenerator = Depends(get_image_generator)
):
    """
    Generate variations of an existing image.
    
    Args:
        request: Image variation request
        generator: Image generator instance
        
    Returns:
        Generated image variations
    """
    try:
        logger.info(f"Image variation request received for {request.image_url[:50]}...")
        
        # For now, we'll implement a simple variation by modifying the prompt
        # In a full implementation, you'd use img2img capabilities
        
        # Create a variation request
        variation_request = GenerateImageRequest(
            prompt=request.prompt or "variation of the provided image",
            style="realistic",  # Default style for variations
            aspect_ratio="1:1",  # Default aspect ratio
            model=request.model,
            num_images=request.num_variations,
            guidance_scale=7.5,
            num_inference_steps=50
        )
        
        # Generate variations
        response = generator.generate_images(variation_request)
        
        logger.info(f"Successfully generated {response.total_images} variations in {response.processing_time:.2f}s")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image variation generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image variation generation failed: {str(e)}")

@router.get("/prompt-suggestions")
async def get_prompt_suggestions():
    """
    Get suggested prompts for different use cases.
    
    Returns:
        List of prompt suggestions organized by category
    """
    suggestions = {
        "business": [
            "Professional business presentation with charts and graphs",
            "Modern office workspace with technology",
            "Corporate meeting room with team collaboration",
            "Business dashboard with analytics and data visualization",
            "Professional headshot in corporate setting"
        ],
        "creative": [
            "Abstract geometric patterns with flowing lines",
            "Futuristic cityscape with neon lights and flying cars",
            "Magical forest with glowing mushrooms and fairy lights",
            "Underwater scene with colorful coral reef and fish",
            "Space scene with planets, stars, and nebula"
        ],
        "nature": [
            "Serene mountain landscape at sunset",
            "Tropical beach with palm trees and crystal clear water",
            "Autumn forest with colorful leaves falling",
            "Snow-covered mountain peaks with clear blue sky",
            "Flower garden with butterflies and bees"
        ],
        "technology": [
            "Futuristic robot with advanced AI features",
            "Cybersecurity concept with digital locks and shields",
            "Virtual reality headset with immersive environment",
            "Smart home automation system with connected devices",
            "Artificial intelligence neural network visualization"
        ],
        "artistic": [
            "Oil painting of a serene landscape",
            "Watercolor painting of flowers in a vase",
            "Digital art of a fantasy character",
            "Sketch of an architectural masterpiece",
            "Abstract expressionist painting with bold colors"
        ],
        "logos": [
            "Simple gear icon, minimal design, flat style, white background",
            "Modern company logo with clean typography, professional",
            "App icon design, rounded corners, vibrant colors",
            "Minimalist logo with geometric shapes, clean lines",
            "Professional business logo, corporate style, clean design"
        ]
    }
    
    return {
        "categories": suggestions,
        "total_suggestions": sum(len(prompts) for prompts in suggestions.values())
    }

@router.get("/usage-stats")
async def get_usage_stats():
    """
    Get usage statistics for the image generator.
    
    Returns:
        Usage statistics and limits
    """
    # This would typically connect to a database to get real usage stats
    # For now, return mock data
    return {
        "total_generations": 0,
        "images_generated": 0,
        "popular_models": ["stabilityai/stable-diffusion-2-1"],
        "popular_styles": ["realistic", "artistic"],
        "average_generation_time": 15.5,
        "api_limits": {
            "requests_per_minute": 60,
            "requests_per_hour": 1000,
            "max_images_per_request": 4
        }
    }



@router.get("/test")
async def test_endpoint():
    """
    Simple test endpoint to verify the router is working.
    """
    return {
        "status": "working",
        "message": "Local image generator router is working",
        "local_mode": True,
        "model_loaded": _image_generator is not None
    }
