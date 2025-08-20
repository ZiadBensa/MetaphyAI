# 🚀 Local Image Generation Setup Guide

## 🎯 **Available Models**

### **Image Generation Models (Recommended)**
1. **`runwayml/stable-diffusion-v1-5`** (2.4M downloads)
   - Size: ~4GB
   - Quality: Excellent
   - Speed: Medium (with GPU), Slow (CPU only)

2. **`CompVis/stable-diffusion-v1-4`** (967K downloads)
   - Size: ~4GB
   - Quality: Very Good
   - Speed: Medium (with GPU), Slow (CPU only)

### **Lightweight Text Models (for testing)**
- `distilbert-base-uncased` (12.8M downloads) - 66MB
- `gpt2` (11.4M downloads) - 124MB
- `microsoft/DialoGPT-small` (178K downloads) - 117MB

## 📦 **Setup Requirements**

### **Python Dependencies**
```bash
pip install torch torchvision torchaudio
pip install diffusers transformers accelerate
pip install huggingface_hub
pip install pillow
```

### **Hardware Requirements**
- **GPU (Recommended)**: NVIDIA GPU with 4GB+ VRAM
- **CPU**: 8GB+ RAM, slower but works
- **Storage**: 10GB+ free space for models

## 🔧 **Implementation Options**

### **Option 1: Full Stable Diffusion (Best Quality)**
```python
from diffusers import StableDiffusionPipeline
import torch

# Load model
model_id = "runwayml/stable-diffusion-v1-5"
pipe = StableDiffusionPipeline.from_pretrained(
    model_id, 
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)

# Move to GPU if available
if torch.cuda.is_available():
    pipe = pipe.to("cuda")
else:
    pipe = pipe.to("cpu")

# Generate image
prompt = "red apple"
image = pipe(prompt).images[0]
image.save("generated_image.png")
```

### **Option 2: Optimized for CPU (Slower but Works)**
```python
from diffusers import StableDiffusionPipeline
import torch

# Load with optimizations
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float32,  # Use float32 for CPU
    safety_checker=None,  # Disable safety checker for speed
    requires_safety_checker=False
)

# CPU optimizations
pipe.enable_attention_slicing()
pipe.enable_sequential_cpu_offload()

# Generate
image = pipe("red apple", num_inference_steps=20).images[0]
```

### **Option 3: Ultra-Lightweight (Experimental)**
```python
# For very limited resources
from diffusers import DiffusionPipeline

# Use a smaller model variant
pipe = DiffusionPipeline.from_pretrained(
    "CompVis/stable-diffusion-v1-4",
    torch_dtype=torch.float16,
    variant="fp16"
)

# Aggressive optimizations
pipe.enable_attention_slicing()
pipe.enable_vae_slicing()
pipe.enable_model_cpu_offload()

# Generate with minimal steps
image = pipe("red apple", num_inference_steps=10).images[0]
```

## 🎨 **Integration with Your Backend**

### **Updated Image Generator Class**
```python
import torch
from diffusers import StableDiffusionPipeline
from PIL import Image
import io
import base64

class LocalImageGenerator:
    def __init__(self, model_id="runwayml/stable-diffusion-v1-5"):
        self.model_id = model_id
        self.pipe = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def load_model(self):
        """Load the model (call once at startup)"""
        print(f"Loading {self.model_id} on {self.device}...")
        
        self.pipe = StableDiffusionPipeline.from_pretrained(
            self.model_id,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
        )
        
        if self.device == "cuda":
            self.pipe = self.pipe.to("cuda")
        else:
            # CPU optimizations
            self.pipe.enable_attention_slicing()
            self.pipe.enable_sequential_cpu_offload()
            
        print("Model loaded successfully!")
    
    def generate_image(self, prompt, negative_prompt="", num_steps=20, guidance_scale=7.5):
        """Generate a single image"""
        if self.pipe is None:
            raise Exception("Model not loaded. Call load_model() first.")
        
        # Generate image
        result = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_steps,
            guidance_scale=guidance_scale
        )
        
        image = result.images[0]
        
        # Convert to base64 for API response
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def generate_multiple(self, prompt, num_images=1, **kwargs):
        """Generate multiple images"""
        images = []
        for i in range(num_images):
            image_data = self.generate_image(prompt, **kwargs)
            images.append(image_data)
        return images
```

### **Updated FastAPI Endpoint**
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time

app = FastAPI()

# Global model instance
image_generator = None

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    global image_generator
    image_generator = LocalImageGenerator()
    image_generator.load_model()

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    num_images: int = 1
    num_steps: int = 20
    guidance_scale: float = 7.5

@app.post("/generate")
async def generate_images(request: GenerateRequest):
    """Generate images locally"""
    try:
        start_time = time.time()
        
        images = image_generator.generate_multiple(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_images=request.num_images,
            num_steps=request.num_steps,
            guidance_scale=request.guidance_scale
        )
        
        processing_time = time.time() - start_time
        
        return {
            "images": images,
            "processing_time": processing_time,
            "total_images": len(images),
            "model": "local-stable-diffusion"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## ⚡ **Performance Optimization Tips**

### **For GPU Users**
```python
# Enable memory efficient attention
pipe.enable_xformers_memory_efficient_attention()

# Use mixed precision
pipe = pipe.to(dtype=torch.float16)

# Batch processing
images = pipe(["prompt1", "prompt2"], num_images_per_prompt=1)
```

### **For CPU Users**
```python
# Reduce memory usage
pipe.enable_attention_slicing()
pipe.enable_vae_slicing()

# Use fewer steps
num_inference_steps = 10  # Instead of 50

# Smaller image size
width, height = 512, 512  # Instead of 768x768
```

### **Model Quantization (Advanced)**
```python
# Quantize model for smaller size
from torch.quantization import quantize_dynamic

# Load and quantize
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")
pipe.unet = quantize_dynamic(pipe.unet, {torch.nn.Linear}, dtype=torch.qint8)
```

## 🚀 **Quick Start Commands**

### **1. Install Dependencies**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install diffusers transformers accelerate
```

### **2. Test Basic Setup**
```python
# test_local.py
from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)

if torch.cuda.is_available():
    pipe = pipe.to("cuda")
else:
    pipe.enable_attention_slicing()

image = pipe("red apple", num_inference_steps=20).images[0]
image.save("test_image.png")
print("Image generated successfully!")
```

### **3. Update Your Backend**
Replace the Hugging Face API calls with local inference in your `generator.py`.

## 💡 **Benefits of Local Inference**

✅ **No API costs**  
✅ **No rate limits**  
✅ **Privacy (data stays local)**  
✅ **Faster after initial load**  
✅ **Works offline**  
✅ **Full control over parameters**  

## ⚠️ **Considerations**

❌ **Large model size (4GB)**  
❌ **Requires good hardware**  
❌ **Slower initial load**  
❌ **More complex setup**  
❌ **Memory intensive**  

## 🎯 **Recommended Next Steps**

1. **Start with CPU version** to test
2. **Upgrade to GPU** if available
3. **Optimize parameters** for your use case
4. **Add model caching** for faster startup
5. **Implement batch processing** for efficiency

