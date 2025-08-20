"""
Local CPU-based image generator using Stable Diffusion
"""
import torch
import time
import io
import base64
import logging
from typing import List, Dict, Any, Optional
from diffusers import StableDiffusionPipeline
from PIL import Image

from .models import (
    GenerateImageRequest, GeneratedImage, GenerateImageResponse,
    ImageStyle, AspectRatio, ImageModel
)

logger = logging.getLogger(__name__)

class LocalImageGenerator:
    """Local CPU-based image generation service."""
    
    def __init__(self, model_id: str = "runwayml/stable-diffusion-v1-5"):
        self.model_id = model_id
        self.pipe = None
        self.device = "cpu"
        
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
        
        # Aspect ratio configurations (optimized for CPU)
        self.aspect_ratios = {
            AspectRatio.SQUARE: {"width": 512, "height": 512},
            AspectRatio.LANDSCAPE: {"width": 512, "height": 288},
            AspectRatio.PORTRAIT: {"width": 288, "height": 512},
            AspectRatio.WIDE: {"width": 512, "height": 384},
            AspectRatio.ULTRAWIDE: {"width": 512, "height": 219}
        }
    
    def load_model(self):
        """Load the model (call once at startup)"""
        try:
            logger.info(f"Loading {self.model_id} on {self.device}...")
            
            self.pipe = StableDiffusionPipeline.from_pretrained(
                self.model_id,
                torch_dtype=torch.float32,  # Use float32 for CPU stability
                safety_checker=None,
                requires_safety_checker=False
            )
            
            # CPU optimizations for memory efficiency
            self.pipe.enable_attention_slicing()
            self.pipe.enable_vae_slicing()
            
            logger.info("Model loaded successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False
    
    def _enhance_prompt(self, prompt: str, style: ImageStyle) -> str:
        """Enhance the prompt with style-specific keywords."""
        style_keywords = self.style_prompts.get(style, "")
        if style_keywords:
            return f"{prompt}, {style_keywords}"
        return prompt
    
    def _get_dimensions(self, aspect_ratio: AspectRatio) -> Dict[str, int]:
        """Get dimensions based on aspect ratio (CPU optimized)."""
        return self.aspect_ratios[aspect_ratio]
    
    def _image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL image to base64 string."""
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    def generate_images(self, request: GenerateImageRequest) -> GenerateImageResponse:
        """Generate images based on the request."""
        start_time = time.time()
        
        try:
            if self.pipe is None:
                raise Exception("Model not loaded. Call load_model() first.")
            
            # Enhance prompt with style
            enhanced_prompt = self._enhance_prompt(request.prompt, request.style)
            
            # Get dimensions
            dimensions = self._get_dimensions(request.aspect_ratio)
            
            logger.info(f"Generating {request.num_images} images with prompt: {enhanced_prompt[:50]}...")
            
            # Generate images
            all_images = []
            for i in range(request.num_images):
                try:
                    # Generate single image
                    result = self.pipe(
                        prompt=enhanced_prompt,
                        negative_prompt=request.negative_prompt or "",
                        num_inference_steps=min(request.num_inference_steps, 30),  # Cap at 30 for CPU
                        guidance_scale=request.guidance_scale,
                        width=dimensions["width"],
                        height=dimensions["height"]
                    )
                    
                    image = result.images[0]
                    image_base64 = self._image_to_base64(image)
                    
                    # Create generated image object
                    generated_image = GeneratedImage(
                        image_url=image_base64,
                        image_data=image_base64,
                        prompt=enhanced_prompt,
                        model=f"local-{self.model_id}",
                        seed=request.seed,
                        metadata={
                            "width": dimensions["width"],
                            "height": dimensions["height"],
                            "guidance_scale": request.guidance_scale,
                            "num_inference_steps": request.num_inference_steps,
                            "style": request.style,
                            "aspect_ratio": request.aspect_ratio,
                            "device": self.device
                        }
                    )
                    
                    all_images.append(generated_image)
                    logger.info(f"Generated image {i+1}/{request.num_images}")
                    
                except Exception as e:
                    logger.warning(f"Failed to generate image {i+1}: {e}")
                    # Continue with remaining images
            
            processing_time = time.time() - start_time
            
            return GenerateImageResponse(
                images=all_images,
                prompt=request.prompt,
                model=f"local-{self.model_id}",
                processing_time=processing_time,
                total_images=len(all_images),
                metadata={
                    "enhanced_prompt": enhanced_prompt,
                    "dimensions": dimensions,
                    "style": request.style,
                    "aspect_ratio": request.aspect_ratio,
                    "device": self.device,
                    "optimizations": ["attention_slicing", "vae_slicing"]
                }
            )
            
        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            raise Exception(f"Image generation failed: {str(e)}")
    
    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get information about available models."""
        return [{
            "model_id": self.model_id,
            "name": "Local Stable Diffusion",
            "description": "Local CPU-based Stable Diffusion model",
            "max_resolution": "512x512",
            "speed": "Slow (CPU)",
            "quality": "High",
            "best_for": ["Development", "Testing", "Stable generation"]
        }]
    
    def get_available_styles(self) -> List[Dict[str, Any]]:
        """Get information about available styles."""
        styles = []
        for style_id, prompt in self.style_prompts.items():
            styles.append({
                "style_id": style_id,
                "name": style_id.replace("_", " ").title(),
                "description": f"Generate {style_id} style images",
                "example_prompt": f"example {style_id} image",
                "tags": [style_id, "local generation"]
            })
        return styles
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check of the service."""
        try:
            if self.pipe is None:
                return {
                    "status": "not_loaded",
                    "message": "Model not loaded",
                    "device": self.device
                }
            
            return {
                "status": "healthy",
                "message": "Local model is ready",
                "device": self.device,
                "model": self.model_id,
                "optimizations": ["attention_slicing", "vae_slicing"]
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "device": self.device
            }
