# Blaze Chat Assistant Setup

## Overview
The Blaze Sports Intel chat assistant uses Claude Sonnet 4.5 to help site visitors navigate the platform, answer questions about analytics, and troubleshoot issues.

## Features
- **AI-Powered**: Uses Claude Sonnet 4.5 (claude-sonnet-4-20250514)
- **Site Knowledge**: Knows about all pages, features, and analytics methodology
- **Contextual**: Maintains conversation history
- **Responsive**: Mobile-friendly chat widget
- **Blaze Design**: Matches the burnt orange aesthetic

## Environment Setup

### Required Environment Variable
You need to set your Anthropic API key as an environment variable in Cloudflare Pages:

1. Go to Cloudflare Dashboard → Pages → blazesportsintel
2. Go to Settings → Environment Variables
3. Add a new variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key (starts with `sk-ant-...`)
   - **Environment**: Production (and Preview if needed)

### Getting an Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Go to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-ant-`)

## Files Structure

```
/functions/api/chat.js        - Cloudflare Worker endpoint (calls Claude API)
/lib/chat-widget.js            - Frontend chat widget UI and logic
```

## How It Works

1. **User sends message** → Frontend widget captures input
2. **POST to /api/chat** → Cloudflare Worker function receives request
3. **Call Claude API** → Worker sends conversation to Anthropic
4. **Stream response** → Claude generates helpful response
5. **Display to user** → Widget shows formatted response

## System Prompt
The assistant knows about:
- Site structure (/, /analytics, /about, /contact, /privacy, /terms)
- Features (Monte Carlo simulations, live data, advanced metrics)
- Sports coverage (MLB, NFL, NCAA Baseball, Track & Field)
- Analytics methodology (Pythagorean expectations, SOS)
- Contact information (email, phone, social)

## Customization

### Update Site Knowledge
Edit the `systemPrompt` in `/functions/api/chat.js` to add new pages or features.

### Styling
Modify `/lib/chat-widget.js` CSS injection to match design changes.

### Response Length
Adjust `max_tokens` in the API call (default: 1024 tokens ≈ 750 words).

## Testing

### Local Testing
1. Set environment variable: `export ANTHROPIC_API_KEY="sk-ant-..."`
2. Run: `wrangler pages dev .`
3. Open http://localhost:8788
4. Click chat button in bottom-right

### Production Testing
1. Deploy to Cloudflare Pages
2. Verify environment variable is set
3. Visit blazesportsintel.com
4. Test chat functionality

## Usage Examples

**Navigation Help:**
- "How do I view analytics?"
- "Where's the contact page?"

**Feature Explanation:**
- "What are Monte Carlo simulations?"
- "How do you calculate playoff odds?"

**Technical Questions:**
- "What data sources do you use?"
- "How often is data updated?"

## Troubleshooting

### Chat button doesn't appear
- Check browser console for JavaScript errors
- Verify `/lib/chat-widget.js` is loading (Network tab)
- Check FontAwesome is loaded for icons

### "Failed to get response" error
- Verify `ANTHROPIC_API_KEY` environment variable is set
- Check Cloudflare Functions logs for API errors
- Ensure API key has credits available

### Styling issues
- Clear browser cache
- Check for CSS conflicts with existing styles
- Verify viewport meta tag for mobile

## Cost Management

Claude Sonnet 4 pricing (as of 2025):
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

Average conversation:
- User message: ~50 tokens
- Assistant response: ~150 tokens
- **Cost per message**: ~$0.0005 (half a cent)

For 1,000 daily conversations:
- **Monthly cost**: ~$15

## Security

- ✅ API key stored as environment variable (never in code)
- ✅ CORS headers configured
- ✅ Rate limiting (implement if needed)
- ✅ Input sanitization
- ⚠️ Consider adding authentication for heavy usage

## Future Enhancements

- [ ] Add conversation analytics (track common questions)
- [ ] Implement rate limiting per IP
- [ ] Add typing indicator improvements
- [ ] Save conversation history to D1 database
- [ ] Add suggested questions/quick replies
- [ ] Implement feedback thumbs up/down
- [ ] Add file upload support (screenshots for troubleshooting)
- [ ] Multi-language support

## Support

For issues with the chat assistant:
- Email: ahump20@outlook.com
- Twitter/X: @BISportsIntel
