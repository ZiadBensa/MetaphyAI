# AgoraAI FastAPI Backend

This is the FastAPI backend for AgoraAI, featuring advanced text humanization using regex-based transformations.

## Features

- **Text Humanization**: Uses advanced regex-based transformations to rewrite AI-generated text with different tones
- **Multiple Tone Support**: Casual, Friendly, Professional, Enthusiastic, and Neutral tones
- **File Upload & Text Extraction**: Upload files and extract text (simulated)
- **User Authentication**: Protected endpoints with user session management
- **Database Integration**: Stores interaction history in PostgreSQL

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: No heavy AI models required! The text humanization uses efficient regex-based transformations.

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/agoraai_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Database Setup

Make sure your PostgreSQL database is running and the tables are created:

```bash
# The tables will be created automatically when you run the app
# thanks to Base.metadata.create_all(bind=engine) in main.py
```

### 4. Run the Backend

```bash
# Option 1: Using the run script
python run_backend.py

# Option 2: Direct uvicorn command
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Text Humanization
- **POST** `/ai/humanize/`
  - **Body**: `{"text": "AI generated text", "tone": "casual"}`
  - **Response**: `{"humanized_text": "Humanized version", "tone": "casual"}`

### File Upload & Extraction
- **POST** `/ai/extract/upload`
  - **Form Data**: `file` (PDF, DOCX, image)
  - **Response**: `{"text": "Extracted text", "filename": "file.pdf"}`

### Authentication
- **GET** `/protected-test` - Test authenticated endpoint

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Text Humanization Features

The text humanization system uses advanced regex-based transformations:

### Supported Tones:
- **Casual**: Converts formal language to casual contractions and simpler words
- **Friendly**: Adds warm, approachable language patterns
- **Professional**: Converts casual language to formal, business-like expressions
- **Enthusiastic**: Uses energetic and positive language
- **Neutral**: Balances formal and informal language

### Transformation Examples:
- "I am going" → "I'm going" (casual)
- "Furthermore" → "Also" (casual)
- "Hello" → "Hi there" (friendly)
- "I'm" → "I am" (professional)
- "Good" → "Excellent" (enthusiastic)

## Troubleshooting

### Performance
The regex-based approach is very fast and doesn't require heavy computational resources.

### CORS Issues
The backend is configured to allow requests from:
- http://localhost:3000 (Next.js frontend)
- http://localhost:8000 (direct backend access)

Add your production frontend URL to the `origins` list in `main.py` if needed. 