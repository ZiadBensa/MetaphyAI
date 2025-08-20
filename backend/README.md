# AI Tools Backend

A modular FastAPI backend for AI-powered tools including text humanization, PDF summarization, and local image generation.

## 🏗️ Project Structure

```
backend/
├── core/                    # Core application modules
│   ├── __init__.py
│   ├── config.py           # Application settings
│   └── dependencies.py     # Shared utilities and dependencies
├── tools/                   # AI tools modules
│   ├── __init__.py
│   ├── text_humanizer/     # Text humanization tool
│   │   ├── __init__.py
│   │   ├── models.py       # Data models
│   │   ├── router.py       # API endpoints
│   │   └── utils.py        # Utility functions
│   ├── pdf_summarizer/     # PDF summarization tool
│   │   ├── __init__.py
│   │   ├── models.py       # Data models
│   │   ├── router.py       # API endpoints
│   │   ├── pdf_extractor.py # PDF text extraction
│   │   └── summarizer.py   # AI summarization logic
│   └── image_generator/    # Local image generation tool
│       ├── __init__.py
│       ├── models.py       # Data models
│       ├── router.py       # API endpoints
│       ├── generator.py    # Main generator class
│       └── local_generator.py # Local Stable Diffusion
├── main.py                 # Main FastAPI application
├── requirements.txt        # Python dependencies
├── install_deps.py         # Additional dependencies installer
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- pip
- Gemini API key (for text humanization)

### Installation

1. **Clone the repository** (if not already done)
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   python install_deps.py  # Install additional dependencies for image generation
   ```

3. **Set up environment variables:**
   Create `config.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   HUGGINGFACE_API_TOKEN=your_hf_token_here  # Optional for local image generation
   ```

4. **Run the backend:**
   ```bash
   python main.py
   ```

The server will start at `http://localhost:8000`

## 🛠️ Available Tools

### Text Humanizer

**Endpoint:** `/text-humanizer`

Transforms AI-generated text to sound more natural and human-like.

#### Features:
- **Multiple Tones:** Casual, Friendly, Professional, Enthusiastic, Neutral
- **Three Models:** Regex-based (fast), Semantic Enhanced (advanced), Gemini AI (sophisticated)
- **AI Detection:** Comprehensive AI content detection
- **Real-time Processing:** Shows loading states during processing

#### API Endpoints:

- `GET /text-humanizer/health` - Health check
- `POST /text-humanizer/humanize` - Humanize text
- `POST /text-humanizer/detect-ai` - Detect AI-generated content

### PDF Summarizer

**Endpoint:** `/pdf-summarizer`

Intelligent PDF processing with AI-powered summarization and analysis.

#### Features:
- **AI-powered Summarization:** Intelligent text summarization
- **Key Points Extraction:** Automatic extraction of important points
- **Question Generation:** Generate questions from PDF content
- **Chat Interface:** Interactive chat with PDF content
- **Multiple Formats:** Support for various PDF structures

#### API Endpoints:

- `GET /pdf-summarizer/health` - Health check
- `POST /pdf-summarizer/upload` - Upload PDF file
- `POST /pdf-summarizer/summarize` - Generate summary
- `POST /pdf-summarizer/key-points` - Extract key points
- `POST /pdf-summarizer/questions` - Generate questions
- `POST /pdf-summarizer/chat` - Chat with PDF content

### Image Generator

**Endpoint:** `/image-generator`

Local CPU-based image generation using Stable Diffusion (no API costs).

#### Features:
- **Local Generation:** CPU-based Stable Diffusion (no external API costs)
- **Multiple Styles:** Realistic, Artistic, Abstract, Cartoon, Anime, and more
- **Custom Prompts:** Full control over image generation
- **High Quality:** Professional-grade image output
- **Multiple Aspect Ratios:** Square, Landscape, Portrait, Wide, Ultrawide

#### API Endpoints:

- `GET /image-generator/health` - Health check
- `GET /image-generator/models` - Get available models
- `GET /image-generator/styles` - Get available styles
- `POST /image-generator/generate` - Generate images

#### Example Request:
```json
{
  "prompt": "A beautiful sunset over mountains",
  "style": "realistic",
  "aspect_ratio": "landscape",
  "num_images": 1,
  "guidance_scale": 7.5,
  "num_inference_steps": 20
}
```

## 🎨 Image Generation Styles

- **Realistic**: High-quality, photorealistic images
- **Artistic**: Creative, artistic interpretations
- **Abstract**: Modern, abstract designs
- **Cartoon**: Fun, animated style
- **Anime**: Japanese animation style
- **Photographic**: Professional photography style
- **Painting**: Oil painting aesthetic
- **Digital Art**: Digital illustration style
- **Sketch**: Pencil drawing style
- **Watercolor**: Soft, watercolor painting style
- **Custom**: Clean, minimal designs (perfect for logos)

## 🔧 Adding New Tools

To add a new AI tool:

1. **Create a new tool directory:**
   ```bash
   mkdir tools/your_tool_name
   ```

2. **Create the tool structure:**
   ```
   tools/your_tool_name/
   ├── __init__.py
   ├── models.py      # Data models
   ├── router.py      # API endpoints
   └── utils.py       # Utility functions
   ```

3. **Include the router in main.py:**
   ```python
   from tools.your_tool_name.router import router as your_tool_router
   app.include_router(your_tool_router)
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## 🔍 Health Checks

- **Global Health:** `GET /health`
- **Text Humanizer:** `GET /text-humanizer/health`
- **PDF Summarizer:** `GET /pdf-summarizer/health`
- **Image Generator:** `GET /image-generator/health`

## 🐛 Troubleshooting

### Common Issues:

1. **Model Loading Failed:**
   - Text humanizer will fallback to regex-based humanization
   - Image generator requires stable internet for initial model download
   - Check your internet connection for model downloads

2. **Port Already in Use:**
   - Change the port in `core/config.py`
   - Or kill the process using the port

3. **Dependencies Issues:**
   - Try: `pip install --upgrade -r requirements.txt`
   - Run: `python install_deps.py` for additional dependencies
   - On Windows, some packages might need Visual Studio Build Tools

4. **Image Generation Slow:**
   - CPU-based generation takes 7-8 minutes per image
   - Reduce inference steps for faster generation
   - Consider GPU setup for faster generation (requires CUDA)

## 🏗️ Architecture

### Core Module (`core/`)
- **config.py:** Centralized configuration management
- **dependencies.py:** Shared utilities, validation functions

### Tools Module (`tools/`)
- Each tool is self-contained with its own models, router, and utilities
- Easy to add new tools without affecting existing ones
- Consistent API patterns across all tools

### Benefits:
- ✅ **Modular:** Easy to add new tools
- ✅ **Maintainable:** Clean separation of concerns
- ✅ **Scalable:** Each tool can be developed independently
- ✅ **Testable:** Isolated components for better testing
- ✅ **Documented:** Clear structure and documentation
- ✅ **Cost-effective:** Local image generation (no API costs)

## 🤝 Contributing

1. Follow the existing structure for new tools
2. Add proper error handling and validation
3. Include tests for new functionality
4. Update this README for new features

## 📄 License

This project is part of the AI Tools Backend system. 