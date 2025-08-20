# Replicate API Setup Guide

## Quick Start

### 1. Create a Replicate Account

1. Go to [replicate.com](https://replicate.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Token

1. Go to [Account Settings](https://replicate.com/account/api-tokens)
2. Click "Create API token"
3. Give it a name (e.g., "Image Generator")
4. Copy the token (it starts with `r8_`)

### 3. Set Environment Variable

Add the token to your environment:

```bash
# Linux/Mac
export REPLICATE_API_TOKEN="r8_your_token_here"

# Windows (PowerShell)
$env:REPLICATE_API_TOKEN="r8_your_token_here"

# Windows (Command Prompt)
set REPLICATE_API_TOKEN=r8_your_token_here
```

### 4. Test the Setup

1. Start your backend server
2. Go to the Image Generator tool
3. Click "Check API Status" to verify everything is working

## Free Tier Benefits

- **500 requests per month** (very generous!)
- **No credit card required** for free tier
- **Pay-as-you-go** after free tier ($0.0001/second)
- **High-quality models** including Stable Diffusion XL

## Cost Comparison

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Replicate** | 500 requests/month | $0.0001/second |
| Hugging Face | ~100 requests/month | $9/month |
| OpenAI DALL-E | $5 credit/month | $0.02/image |
| Stability AI | Limited | $0.002/image |

## Why Replicate?

✅ **Most generous free tier** (500 requests vs 100-200 elsewhere)  
✅ **No credit card required** for free tier  
✅ **Pay-as-you-go** pricing (no monthly commitments)  
✅ **High-quality models** (Stable Diffusion XL, etc.)  
✅ **Reliable API** with good uptime  
✅ **Simple setup** and documentation  

## Troubleshooting

### "Invalid API token"
- Make sure your token starts with `r8_`
- Check that the environment variable is set correctly
- Verify the token in your Replicate account

### "API credit limit exceeded"
- Check your usage at [replicate.com/account/billing](https://replicate.com/account/billing)
- Add credits if needed
- Wait until next month for free tier reset

### "Rate limit exceeded"
- Wait a few seconds between requests
- Replicate has rate limits to prevent abuse

## Next Steps

1. **Test with simple prompts** first
2. **Try different styles** to see what works best
3. **Experiment with logo generation** using the Custom style
4. **Monitor your usage** in the billing dashboard

## Support

- [Replicate Documentation](https://replicate.com/docs)
- [Replicate Community](https://github.com/replicate/replicate)
- [Billing Support](https://replicate.com/account/billing)

