"""
Core image generation logic using Local Stable Diffusion.
"""
import os
import time
import base64
import logging
from typing import List, Dict, Any, Optional
from PIL import Image
import io
import json

from .models import (
    GenerateImageRequest, GeneratedImage, GenerateImageResponse,
    ImageStyle, AspectRatio, ImageModel, ModelInfo, StyleInfo
)
from .local_generator import LocalImageGenerator

logger = logging.getLogger(__name__)

class ImageGenerator:
    """Image generation service using Local Stable Diffusion."""
    
    def __init__(self, api_token: str = None):
        # Initialize local generator
        self.local_generator = LocalImageGenerator()
        self.api_token = api_token  # Keep for compatibility
        

        
        # Style prompts for enhancement
        self.style_prompts = {
            ImageStyle.REALISTIC: "realistic, high quality, detailed, professional",
            ImageStyle.ARTISTIC: "artistic, creative, beautiful, masterpiece",
            ImageStyle.ABSTRACT: "abstract, modern, contemporary, artistic",
            ImageStyle.CARTOON: "cartoon style, colorful, fun, animated",
            ImageStyle.ANIME: "anime style, manga, Japanese animation",
            ImageStyle.PHOTOGRAPHIC: "photographic, camera shot, professional photography",
            ImageStyle.PAINTING: "oil painting, canvas, artistic, painterly",
            ImageStyle.DIGITAL_ART: "digital art, digital painting, concept art",
            ImageStyle.SKETCH: "sketch, pencil drawing, line art, monochrome",
            ImageStyle.WATERCOLOR: "watercolor painting, soft colors, artistic",
            ImageStyle.CUSTOM: "clean, simple, minimal, professional, high quality"
        }
        

    
    def _enhance_prompt(self, prompt: str, style: ImageStyle) -> str:
        """Enhance the prompt with style-specific keywords."""
        style_keywords = self.style_prompts.get(style, "")
        if style_keywords:
            return f"{prompt}, {style_keywords}"
        return prompt
    

    






    def generate_images(self, request: GenerateImageRequest) -> GenerateImageResponse:
        """Generate images based on the request using local model."""
        try:
            # Use local generator
            return self.local_generator.generate_images(request)
        except Exception as e:
            logger.error(f"Local image generation failed: {e}")
            raise Exception(f"Image generation failed: {str(e)}")
    
    def get_available_models(self) -> List[ModelInfo]:
        """Get information about available models."""
        # Return local model info
        return [ModelInfo(
            model_id="local-stable-diffusion",
            name="Local Stable Diffusion",
            description="Local CPU-based Stable Diffusion model",
            max_resolution="512x512",
            speed="Slow (CPU)",
            quality="High",
            best_for=["Development", "Testing", "Stable generation"]
        )]
    
    def get_available_styles(self) -> List[StyleInfo]:
        """Get information about available styles."""
        styles = []
        style_descriptions = {
            ImageStyle.REALISTIC: "Generate realistic, lifelike images",
            ImageStyle.ARTISTIC: "Create artistic and creative images",
            ImageStyle.ABSTRACT: "Generate abstract and modern images",
            ImageStyle.CARTOON: "Create cartoon-style images",
            ImageStyle.ANIME: "Generate anime and manga-style images",
            ImageStyle.PHOTOGRAPHIC: "Create photographic-style images",
            ImageStyle.PAINTING: "Generate oil painting-style images",
            ImageStyle.DIGITAL_ART: "Create digital art and concept art",
            ImageStyle.SKETCH: "Generate sketch and line art images",
            ImageStyle.WATERCOLOR: "Create watercolor painting-style images",
            ImageStyle.CUSTOM: "Optimized for logos, icons, and clean designs with minimal style enhancement"
        }
        
        example_prompts = {
            ImageStyle.REALISTIC: "A professional business presentation with charts and graphs",
            ImageStyle.ARTISTIC: "A beautiful sunset over mountains with vibrant colors",
            ImageStyle.ABSTRACT: "Abstract geometric patterns with flowing lines",
            ImageStyle.CARTOON: "A cute cartoon character in a colorful environment",
            ImageStyle.ANIME: "An anime character with detailed facial features",
            ImageStyle.PHOTOGRAPHIC: "A professional product photograph with studio lighting",
            ImageStyle.PAINTING: "An oil painting of a serene landscape",
            ImageStyle.DIGITAL_ART: "A futuristic cityscape with neon lights",
            ImageStyle.SKETCH: "A detailed pencil sketch of a portrait",
            ImageStyle.WATERCOLOR: "A soft watercolor painting of flowers",
            ImageStyle.CUSTOM: "A simple gear icon, minimal design, flat style, white background"
        }
        
        for style_id, description in style_descriptions.items():
            style_info = StyleInfo(
                style_id=style_id,
                name=style_id.replace("_", " ").title(),
                description=description,
                example_prompt=example_prompts.get(style_id, ""),
                tags=[style_id, "image generation"]
            )
            styles.append(style_info)
        
        return styles
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check of the service."""
        try:
            # Check local model status
            local_status = self.local_generator.health_check()
            return {
                "status": local_status["status"],
                "models_available": ["local-stable-diffusion"],
                "api_status": "local",
                "version": "1.0.0",
                "device": local_status.get("device", "cpu")
            }
        except Exception as e:
            return {
                "status": "error",
                "models_available": [],
                "api_status": f"error: {str(e)}",
                "version": "1.0.0"
            }
