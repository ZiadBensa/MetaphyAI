# Hugging Face Model Integration

This document explains how the Vamsi/T5_Paraphrase_Paws model has been integrated into the text humanizer.

## Model Details

- **Model**: Vamsi/T5_Paraphrase_Paws
- **Purpose**: Advanced text paraphrasing and humanization
- **Type**: T5-based transformer model
- **Source**: Hugging Face Hub

## Features Added

### Backend Changes

1. **New Dependencies** (requirements.txt):
   - `transformers>=4.35.0`
   - `torch>=2.0.0`
   - `accelerate>=0.24.0`

2. **Model Loading** (routers/ai.py):
   - `load_huggingface_model()`: Loads the model on startup
   - `humanize_with_huggingface()`: Uses the model for text humanization
   - Automatic fallback to regex-based humanization if model fails

3. **API Updates**:
   - Added `model` field to `HumanizeRequest` schema
   - Updated `/humanize/` endpoint to support model selection
   - Added `/health` and `/load-model` endpoints

### Frontend Changes

1. **Model Selection** (components/text-humanizer.tsx):
   - Added dropdown to choose between "Regex-based" and "T5 Paraphrase"
   - Real-time model switching with automatic re-humanization
   - Enhanced UI with model descriptions

## Usage

### For Users

1. **Select Model**: Choose between:
   - **Regex-based**: Fast, rule-based transformation
   - **T5 Paraphrase**: Advanced AI model (Vamsi/T5_Paraphrase_Paws)

2. **Choose Tone**: Select from casual, friendly, professional, enthusiastic, or neutral

3. **Humanize**: The system will use the selected model to transform your text

### For Developers

#### Testing the Model

```bash
cd backend
python test_huggingface.py
```

#### Manual Model Loading

```python
from routers.ai import load_huggingface_model
success = load_huggingface_model()
```

#### API Usage

```bash
# Health check
curl http://localhost:8000/ai/health

# Load model manually
curl -X POST http://localhost:8000/ai/load-model

# Humanize with Hugging Face model
curl -X POST http://localhost:8000/ai/humanize/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am going to the store to purchase some groceries.",
    "tone": "casual",
    "model": "huggingface"
  }'
```

## Model Performance

### Advantages
- **Advanced AI**: Uses state-of-the-art transformer model
- **Better Quality**: More natural and contextually appropriate paraphrasing
- **Flexible**: Can handle complex sentence structures

### Considerations
- **Slower**: Takes longer to process than regex-based approach
- **Resource Intensive**: Requires more memory and CPU/GPU
- **Dependency**: Requires internet connection for initial model download

## Fallback Strategy

If the Hugging Face model fails to load or process text:
1. System automatically falls back to regex-based humanization
2. User is notified via logs and UI
3. Service remains functional with basic humanization

## Installation

1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Start the backend server:
   ```bash
   python main.py
   ```

3. The model will be automatically loaded on startup

## Troubleshooting

### Common Issues

1. **Model Download Fails**:
   - Check internet connection
   - Verify Hugging Face Hub access
   - Check available disk space

2. **Memory Issues**:
   - Reduce model parameters in `humanize_with_huggingface()`
   - Use smaller input text chunks
   - Consider using CPU-only inference

3. **Performance Issues**:
   - Use regex-based model for faster processing
   - Implement text chunking for long inputs
   - Consider model quantization

### Debug Commands

```bash
# Test model loading
python test_huggingface.py

# Check backend health
curl http://localhost:8000/ai/health

# View backend logs
tail -f backend.log
``` 