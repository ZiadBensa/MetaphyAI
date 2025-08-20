# AI Tools Platform - Text Humanization, PDF Summarization & Image Generation

A comprehensive web application featuring AI-powered text humanization, PDF summarization, and local image generation using Stable Diffusion.

## 🚀 Features

### Text Humanization
- **Gemini AI (Advanced)**: Google's Gemini AI for sophisticated text restructuring
- **Semantic Enhanced**: AI-powered semantic analysis with context awareness
- **Basic Regex**: Simple rule-based transformations

### AI Content Detection
- **Statistical Analysis**: Advanced statistical methods for AI detection
- **Hugging Face Models**: Fallback detection using pre-trained models
- **Comprehensive Scoring**: Perplexity, repetition, formality, and more

### PDF Summarization
- **AI-powered Summarization**: Intelligent text summarization using advanced models
- **Key Points Extraction**: Automatic extraction of important points
- **Question Generation**: Generate questions from PDF content
- **Chat Interface**: Interactive chat with PDF content

### Image Generation
- **Local Stable Diffusion**: CPU-based image generation (no API costs)
- **Multiple Styles**: Realistic, Artistic, Abstract, Cartoon, Anime, and more
- **Custom Prompts**: Full control over image generation
- **High Quality**: Professional-grade image output

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Gemini AI**: Google's advanced language model
- **Stable Diffusion**: Local image generation with diffusers
- **NLTK**: Natural language processing
- **Pydantic**: Data validation
- **PyTorch**: Deep learning framework

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern styling
- **Shadcn/ui**: Beautiful UI components

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Gemini API key (for text humanization)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python install_deps.py  # Install additional dependencies for image generation
```

### Frontend Setup
```bash
npm install
```

### Environment Configuration
Create `backend/config.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
HUGGINGFACE_API_TOKEN=your_hf_token_here  # Optional for local image generation
```

## 🚀 Running the Application

### Backend
```bash
cd backend
python main.py
```
Server runs on `http://localhost:8000`

### Frontend
```bash
npm run dev
```
App runs on `http://localhost:3000`

## 🔧 API Endpoints

### Text Humanization
- `POST /text-humanizer/humanize`
  - Body: `{"text": "your text", "model": "gemini|semantic|regex", "tone": "neutral"}`
  - Returns: Humanized text with AI detection

### AI Detection
- `POST /text-humanizer/detect-ai`
  - Body: `{"text": "your text"}`
  - Returns: AI detection analysis

### PDF Summarization
- `POST /pdf-summarizer/upload` - Upload PDF file
- `POST /pdf-summarizer/summarize` - Generate summary
- `POST /pdf-summarizer/key-points` - Extract key points
- `POST /pdf-summarizer/questions` - Generate questions
- `POST /pdf-summarizer/chat` - Chat with PDF content

### Image Generation
- `POST /image-generator/generate` - Generate images
- `GET /image-generator/models` - Get available models
- `GET /image-generator/styles` - Get available styles
- `GET /image-generator/health` - Health check

### Health Check
- `GET /health`
- `GET /text-humanizer/health`
- `GET /pdf-summarizer/health`
- `GET /image-generator/health`

## 🎯 Usage

1. **Text Humanization**: Transform AI-generated text to sound more natural
2. **AI Detection**: Paste text to detect if it's AI-generated
3. **PDF Summarization**: Upload PDFs and get intelligent summaries
4. **Image Generation**: Create stunning images with local Stable Diffusion

## 🎨 Image Generation Features

### Available Styles
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

### Generation Settings
- **Inference Steps**: 10-100 (higher = better quality, slower generation)
- **Guidance Scale**: 1.0-20.0 (controls creativity vs. prompt adherence)
- **Aspect Ratios**: Square, Landscape, Portrait, Wide, Ultrawide
- **Generation Time**: ~7-8 minutes per image (CPU-based)

## 📊 AI Detection Features

- **Perplexity Analysis**: Measures text predictability
- **Repetition Detection**: Identifies repetitive patterns
- **Formality Scoring**: Analyzes writing style
- **Sentence Variety**: Checks sentence structure diversity
- **Semantic Coherence**: Evaluates logical flow
- **Lexical Diversity**: Measures vocabulary variety

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

---

**Built with ❤️ using modern AI technologies** 