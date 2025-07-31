# AI Tools Backend

A modular FastAPI backend for AI-powered tools with a clean, organized structure.

## 🏗️ Project Structure

```
backend/
├── core/                    # Core application modules
│   ├── __init__.py
│   ├── config.py           # Application settings
│   └── dependencies.py     # Shared utilities and dependencies
├── tools/                   # AI tools modules
│   ├── __init__.py
│   └── text_humanizer/     # Text humanization tool
│       ├── __init__.py
│       ├── models.py       # Data models
│       ├── router.py       # API endpoints
│       └── utils.py        # Utility functions
├── main.py                 # Main FastAPI application
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

1. **Clone the repository** (if not already done)
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the backend:**
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
- **Two Models:** Regex-based (fast) and T5 AI model (advanced)
- **Chunking:** Handles long texts by processing sentence by sentence
- **Real-time Processing:** Shows loading states during processing

#### API Endpoints:

- `GET /text-humanizer/health` - Health check
- `POST /text-humanizer/load-model` - Load AI model
- `POST /text-humanizer/humanize` - Humanize text

#### Example Request:
```json
{
  "text": "I am going to the store to purchase some groceries.",
  "tone": "casual",
  "model": "huggingface"
}
```

#### Example Response:
```json
{
  "humanized_text": "I'm going to the store to grab some groceries.",
  "tone": "casual",
  "model": "huggingface",
  "processing_time": 1.23
}
```

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
- **Tool Health:** `GET /text-humanizer/health`

## 🐛 Troubleshooting

### Common Issues:

1. **Model Loading Failed:**
   - The app will fallback to regex-based humanization
   - Check your internet connection for model download

2. **Port Already in Use:**
   - Change the port in `core/config.py`
   - Or kill the process using the port

3. **Dependencies Issues:**
   - Try: `pip install --upgrade -r requirements.txt`
   - On Windows, some packages might need Visual Studio Build Tools

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

## 🤝 Contributing

1. Follow the existing structure for new tools
2. Add proper error handling and validation
3. Include tests for new functionality
4. Update this README for new features

## 📄 License

This project is part of the AI Tools Backend system. 