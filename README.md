# AI Text Tools - Text Humanization & AI Detection

A modern web application for detecting AI-generated content and humanizing text using advanced AI models.

## 🚀 Features

### Text Humanization
- **Gemini AI (Advanced)**: Google's Gemini AI for sophisticated text restructuring
- **Semantic Enhanced**: AI-powered semantic analysis with context awareness
- **Basic Regex**: Simple rule-based transformations

### AI Content Detection
- **Statistical Analysis**: Advanced statistical methods for AI detection
- **Hugging Face Models**: Fallback detection using pre-trained models
- **Comprehensive Scoring**: Perplexity, repetition, formality, and more

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Gemini AI**: Google's advanced language model
- **NLTK**: Natural language processing
- **Pydantic**: Data validation

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern styling
- **Shadcn/ui**: Beautiful UI components

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Gemini API key

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
npm install
```

### Environment Configuration
Create `backend/config.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
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

### Health Check
- `GET /health`
- `GET /text-humanizer/health`

## 🎯 Usage

1. **AI Detection**: Paste text to detect if it's AI-generated
2. **Text Humanization**: Transform AI-generated text to sound more natural
3. **Model Selection**: Choose between Gemini AI, Semantic Enhanced, or Basic Regex
4. **Real-time Analysis**: Get instant feedback with processing times

## 🔍 Models

### Gemini AI (Advanced)
- Uses Google's Gemini 2.5 Flash model
- Sophisticated text restructuring
- Maintains meaning while changing words
- Best for complex transformations

### Semantic Enhanced
- Rule-based with semantic analysis
- Context-aware word replacement
- Fast and reliable
- Good for simple to moderate transformations

### Basic Regex
- Simple pattern matching
- Fastest processing
- Basic word replacement
- Good for quick transformations

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