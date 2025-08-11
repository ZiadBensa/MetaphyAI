# PDF Summarizer Tool

A comprehensive AI-powered PDF processing tool that provides text extraction, summarization, chat functionality, and insights generation.

## Features

### 📄 PDF Text Extraction
- **Multi-engine extraction**: Uses both `pdfplumber` and `PyPDF2` for robust text extraction
- **Fallback mechanism**: Automatically switches between extraction methods for best results
- **File validation**: Validates PDF files and provides detailed metadata
- **Error handling**: Graceful handling of corrupted or unsupported PDFs

### 🤖 AI-Powered Summarization
- **Multiple styles**: 5 different summary styles to choose from
  - **Concise**: Brief, focused summary highlighting main points
  - **Detailed**: Comprehensive summary with important details and examples
  - **Bullet Points**: Organized summary in bullet-point format
  - **Executive**: High-level summary for business and decision-making
  - **Academic**: Formal academic summary with methodology and findings
- **Customizable length**: Adjustable maximum word count (100-2000 words)
- **Multi-language support**: Generate summaries in different languages
- **Performance metrics**: Processing time and compression ratio tracking

### 💬 PDF Chat Interface
- **Context-aware responses**: AI understands the PDF content for accurate answers
- **Conversation history**: Maintains chat context across multiple messages
- **Real-time responses**: Fast, interactive chat experience
- **Question validation**: Ensures questions can be answered from PDF content

### 🔍 Key Insights Generation
- **Key points extraction**: Automatically identifies and extracts main points
- **Question generation**: Creates insightful questions about the content
- **Customizable counts**: Adjustable number of points and questions
- **Structured output**: Clean, organized presentation of insights

## API Endpoints

### POST `/pdf-summarizer/upload`
Upload and extract text from a PDF file.

**Request:**
- `file`: PDF file (multipart/form-data)

**Response:**
```json
{
  "text": "Extracted text content...",
  "info": {
    "filename": "document.pdf",
    "pages": 5,
    "size_bytes": 1024000,
    "text_length": 15000,
    "extraction_time": 2.5
  }
}
```

### POST `/pdf-summarizer/summarize`
Generate a summary of extracted text.

**Request:**
```json
{
  "text": "Text to summarize...",
  "style": "concise",
  "max_length": 500,
  "language": "en"
}
```

**Response:**
```json
{
  "summary": "Generated summary...",
  "style": "concise",
  "original_length": 1500,
  "summary_length": 250,
  "processing_time": 3.2
}
```

### POST `/pdf-summarizer/chat`
Chat with AI about PDF content.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "What is the main topic?"}
  ],
  "pdf_context": "PDF content..."
}
```

**Response:**
```json
{
  "response": "AI response...",
  "processing_time": 2.1
}
```

### POST `/pdf-summarizer/key-points`
Extract key points from text.

**Request:**
```json
{
  "text": "Text to analyze...",
  "max_points": 10
}
```

**Response:**
```json
{
  "key_points": ["Point 1", "Point 2", ...],
  "count": 10
}
```

### POST `/pdf-summarizer/questions`
Generate questions about text content.

**Request:**
```json
{
  "text": "Text to analyze...",
  "num_questions": 5
}
```

**Response:**
```json
{
  "questions": ["Question 1?", "Question 2?", ...],
  "count": 5
}
```

### GET `/pdf-summarizer/styles`
Get available summary styles.

**Response:**
```json
{
  "styles": [
    {
      "value": "concise",
      "label": "Concise",
      "description": "Brief, focused summary highlighting main points"
    }
  ]
}
```

## Technical Architecture

### Backend Components

1. **PDFExtractor** (`pdf_extractor.py`)
   - Handles PDF text extraction using multiple engines
   - Provides file validation and metadata extraction
   - Implements fallback mechanisms for robust extraction

2. **PDFSummarizer** (`summarizer.py`)
   - Integrates with Google Gemini AI for text processing
   - Manages different summary styles and prompts
   - Handles chat functionality and insights generation

3. **API Router** (`router.py`)
   - FastAPI router with comprehensive endpoint definitions
   - Input validation and error handling
   - Response formatting and metadata

4. **Data Models** (`models.py`)
   - Pydantic models for request/response validation
   - Type safety and API documentation
   - Enum definitions for summary styles

### Frontend Components

1. **PDF Summarizer Page** (`/app/pdf-summarizer/page.tsx`)
   - Modern, responsive UI with tabbed interface
   - File upload with drag-and-drop support
   - Real-time progress indicators and error handling

2. **API Routes** (`/app/api/pdf-summarizer/`)
   - Next.js API routes for backend communication
   - Request validation and error handling
   - Response formatting and status codes

## Dependencies

### Backend
- `fastapi`: Web framework
- `pdfplumber`: Primary PDF text extraction
- `PyPDF2`: Fallback PDF text extraction
- `google-generativeai`: Gemini AI integration
- `python-multipart`: File upload handling

### Frontend
- `next.js`: React framework
- `@radix-ui`: UI components
- `lucide-react`: Icons
- `tailwindcss`: Styling

## Configuration

### Environment Variables
```bash
GEMINI_API_KEY=your_gemini_api_key_here
BACKEND_URL=http://localhost:8000
```

### File Size Limits
- Maximum PDF size: 10MB
- Minimum text length: 50 characters
- Maximum summary length: 2000 words

## Usage Examples

### Basic Summarization
1. Upload a PDF file
2. Choose summary style (concise, detailed, etc.)
3. Set maximum length
4. Generate summary
5. Copy or download result

### Chat with PDF
1. Upload and process PDF
2. Navigate to Chat tab
3. Ask questions about the content
4. Get AI-powered responses based on PDF context

### Generate Insights
1. Upload and process PDF
2. Navigate to Insights tab
3. Generate key points and questions
4. Use insights for further analysis

## Error Handling

The tool includes comprehensive error handling for:
- Invalid PDF files
- File size limits
- Text extraction failures
- AI API errors
- Network connectivity issues

## Performance Considerations

- **Text extraction**: Optimized for speed with fallback mechanisms
- **AI processing**: Configurable timeouts and retry logic
- **File handling**: Efficient memory usage for large files
- **Caching**: Consider implementing response caching for repeated requests

## Future Enhancements

- [ ] OCR support for scanned PDFs
- [ ] Batch processing for multiple PDFs
- [ ] Export to different formats (Word, Markdown)
- [ ] Advanced analytics and insights
- [ ] User preference saving
- [ ] Collaborative features

