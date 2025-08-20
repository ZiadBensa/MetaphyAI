"""
Data models for the image generator tool.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class ImageStyle(str, Enum):
    """Available image generation styles."""
    REALISTIC = "realistic"
    ARTISTIC = "artistic"
    ABSTRACT = "abstract"
    CARTOON = "cartoon"
    ANIME = "anime"
    PHOTOGRAPHIC = "photographic"
    PAINTING = "painting"
    DIGITAL_ART = "digital_art"
    SKETCH = "sketch"
    WATERCOLOR = "watercolor"
    CUSTOM = "custom"

class AspectRatio(str, Enum):
    """Available aspect ratios for image generation."""
    SQUARE = "1:1"
    LANDSCAPE = "16:9"
    PORTRAIT = "9:16"
    WIDE = "4:3"
    ULTRAWIDE = "21:9"

class ImageModel(str, Enum):
    """Available image generation models."""
    LOCAL_SD = "local-stable-diffusion"

class GenerateImageRequest(BaseModel):
    """Request model for image generation."""
    prompt: str = Field(..., description="Text prompt for image generation", min_length=1, max_length=1000)
    negative_prompt: Optional[str] = Field(default="", description="Negative prompt (what to avoid)")
    style: ImageStyle = Field(default=ImageStyle.REALISTIC, description="Image style")
    aspect_ratio: AspectRatio = Field(default=AspectRatio.SQUARE, description="Image aspect ratio")
    model: ImageModel = Field(default=ImageModel.LOCAL_SD, description="Model to use for generation")
    num_images: int = Field(default=1, description="Number of images to generate", ge=1, le=4)
    guidance_scale: float = Field(default=7.5, description="Guidance scale for generation", ge=1.0, le=20.0)
    num_inference_steps: int = Field(default=50, description="Number of inference steps", ge=10, le=100)
    seed: Optional[int] = Field(default=None, description="Random seed for reproducible results")

class GeneratedImage(BaseModel):
    """Model for a single generated image."""
    image_url: str = Field(..., description="URL to the generated image")
    image_data: Optional[str] = Field(default=None, description="Base64 encoded image data")
    prompt: str = Field(..., description="Prompt used for generation")
    model: str = Field(..., description="Model used for generation")
    seed: Optional[int] = Field(default=None, description="Seed used for generation")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class GenerateImageResponse(BaseModel):
    """Response model for image generation."""
    images: List[GeneratedImage] = Field(..., description="Generated images")
    prompt: str = Field(..., description="Original prompt")
    model: str = Field(..., description="Model used")
    processing_time: float = Field(..., description="Processing time in seconds")
    total_images: int = Field(..., description="Total number of images generated")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class ImageVariationRequest(BaseModel):
    """Request model for image variations."""
    image_url: str = Field(..., description="URL of the base image")
    prompt: Optional[str] = Field(default=None, description="Optional new prompt for variation")
    strength: float = Field(default=0.8, description="Variation strength", ge=0.0, le=1.0)
    num_variations: int = Field(default=1, description="Number of variations to generate", ge=1, le=4)
    model: ImageModel = Field(default=ImageModel.LOCAL_SD, description="Model to use")

class ModelInfo(BaseModel):
    """Information about available models."""
    model_id: str = Field(..., description="Model identifier")
    name: str = Field(..., description="Display name")
    description: str = Field(..., description="Model description")
    max_resolution: str = Field(..., description="Maximum resolution")
    speed: str = Field(..., description="Generation speed")
    quality: str = Field(..., description="Image quality")
    best_for: List[str] = Field(..., description="Best use cases")

class StyleInfo(BaseModel):
    """Information about available styles."""
    style_id: str = Field(..., description="Style identifier")
    name: str = Field(..., description="Display name")
    description: str = Field(..., description="Style description")
    example_prompt: str = Field(..., description="Example prompt for this style")
    tags: List[str] = Field(..., description="Style tags")

class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(..., description="Service status")
    models_available: List[str] = Field(..., description="Available models")
    api_status: str = Field(..., description="Replicate API status")
    version: str = Field(..., description="Tool version")
