# Image Generator Tool

This tool provides AI-powered image generation using Hugging Face's Stable Diffusion models.

## Features

- **Multiple Models**: Support for Stable Diffusion XL and Stable Diffusion 2.1
- **Various Styles**: Realistic, artistic, abstract, cartoon, anime, and more
- **Logo Optimization**: Custom style optimized for logos and icons
- **Flexible Parameters**: Adjustable guidance scale, inference steps, and aspect ratios
- **Error Handling**: Comprehensive error handling with helpful user guidance

## API Credit Management

### Understanding Hugging Face API Credits

Hugging Face offers a free tier with limited requests per month. After that, you pay only for what you use.

### What to Do When Credits Are Exceeded

1. **Check Your Status**: Use the "Check API Status" button in the UI to verify your current status
2. **Add Credits**: Purchase additional credits for your account
3. **Check Usage**: Review your billing dashboard to see usage patterns
4. **Upgrade Plan**: Consider a paid plan for higher usage

### Pricing Information

- **Free Tier**: 500 requests per month
- **Pay-as-you-go**: $0.0001 per second of compute time
- **Pro Plan**: $20/month for 10,000 requests
- **Enterprise**: Custom pricing for high-volume usage

Visit [Replicate Pricing](https://replicate.com/pricing) for more details.

## Setup

### Environment Variables

Set your Hugging Face API token:

```bash
export HUGGINGFACE_API_TOKEN="your_token_here"
```

### Getting an API Token

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new API token
3. Copy the token and set it as an environment variable

## API Endpoints

### Generate Images
```
POST /image-generator/generate
```

### Check API Status
```
GET /image-generator/api-status
```

### Get Available Models
```
GET /image-generator/models
```

### Get Available Styles
```
GET /image-generator/styles
```

### Get Prompt Suggestions
```
GET /image-generator/prompt-suggestions
```

## Error Handling

The tool provides specific error messages for common issues:

- **402 Payment Required**: API credit limit exceeded
- **401 Unauthorized**: Invalid API token
- **429 Too Many Requests**: Rate limit exceeded
- **503 Service Unavailable**: Model is loading

## Logo Generation Tips

For best results when generating logos:

1. **Use Custom Style**: Select "Custom (Logo & Icon Optimized)" style
2. **Be Specific**: Include details about colors, style, and background
3. **Use Negative Prompts**: Add "text, words, letters, complex background, noise, blurry, low quality"
4. **Example Prompts**:
   - "Simple gear icon, minimal design, flat style, white background"
   - "Modern company logo with clean typography, professional"
   - "App icon design, rounded corners, vibrant colors"

## Troubleshooting

### Common Issues

1. **"API credit limit exceeded"**
   - Solution: Add credits to your Replicate account

2. **"Invalid API token"**
   - Solution: Check your REPLICATE_API_TOKEN environment variable

3. **"Model is loading"**
   - Solution: Wait a few moments and try again

4. **"Rate limit exceeded"**
   - Solution: Wait a moment before making another request

### Getting Help

- Check the API status using the UI button
- Review your Replicate account settings
- Visit [Replicate Documentation](https://replicate.com/docs)
- Contact Replicate support for account issues
