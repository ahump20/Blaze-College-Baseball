# Deployment Guide - College Baseball Live

This guide covers deploying the College Baseball Live app to Cloudflare Pages with Workers Functions.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Git repository connected to Cloudflare Pages

## Quick Deploy

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 3. Deploy to Cloudflare Pages

```bash
npm run deploy
```

Or manually with Wrangler:

```bash
wrangler pages deploy dist
```

## Cloudflare Pages Setup

### Initial Setup

1. **Connect Repository**
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect your GitHub repository
   - Select the `Blaze-College-Baseball` repository

2. **Build Configuration**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Environment Variables**
   ```
   ENVIRONMENT=production
   ```

### KV Namespace Setup

The app uses Cloudflare KV for caching. Ensure the KV namespace is configured in `wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "KV", id = "a53c3726fc3044be82e79d2d1e371d26" }
]
```

If you need to create a new KV namespace:

```bash
wrangler kv:namespace create "CACHE"
```

Then update the `id` in `wrangler.toml` with the returned namespace ID.

## API Functions

The API functions are automatically deployed from the `functions/` directory:

- `/api/college-baseball/games` → `functions/api/college-baseball/games.js`
- `/api/college-baseball/boxscore` → `functions/api/college-baseball/boxscore.js`
- `/api/college-baseball/standings` → `functions/api/college-baseball/standings.js`

### Testing API Functions Locally

```bash
# Start Wrangler dev server
wrangler pages dev dist --kv=CACHE

# In another terminal, test endpoints
curl http://localhost:8787/api/college-baseball/games
curl http://localhost:8787/api/college-baseball/standings?conference=SEC
```

## Custom Domain Setup

1. **Add Custom Domain**
   - Cloudflare Dashboard → Pages → Your Project
   - Click "Custom domains"
   - Add your domain (e.g., `baseball.blazesportsintel.com`)

2. **DNS Configuration**
   - CNAME record pointing to your Pages project
   - Cloudflare will handle SSL/TLS automatically

## Environment-Specific Configuration

### Development
```bash
npm run dev
# Runs Vite dev server on port 3000
# API proxy configured to port 8787 for Workers
```

### Production
```bash
npm run build
npm run preview
# Preview production build locally
```

## Performance Optimization

### Caching Strategy

The app implements intelligent caching:

- **Live Games**: 30 seconds (frequent updates needed)
- **Final Games**: 1 hour (data won't change)
- **Standings**: 5 minutes (balance between freshness and load)

These are configured in the API functions and use Cloudflare KV for storage.

### CDN Configuration

Cloudflare Pages automatically:
- Serves static assets from edge locations worldwide
- Compresses assets (Brotli/Gzip)
- Caches at edge for fast global delivery

## Monitoring and Analytics

### Cloudflare Analytics

View in Dashboard:
- Page views and unique visitors
- Bandwidth usage
- Geographic distribution
- Performance metrics

### API Function Logs

```bash
# Tail function logs
wrangler pages deployment tail
```

### Error Tracking

All API errors are logged with:
- Timestamp
- Error message
- Request context

## Rollback Procedure

If a deployment has issues:

1. **Via Cloudflare Dashboard**
   - Pages → Your Project → Deployments
   - Find previous working deployment
   - Click "⋯" → "Rollback to this deployment"

2. **Via Wrangler**
   ```bash
   # List deployments
   wrangler pages deployment list
   
   # Rollback to specific deployment
   wrangler pages deployment rollback
   ```

## Continuous Deployment

Cloudflare Pages automatically deploys on:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

Each PR gets a unique preview URL for testing.

## Troubleshooting

### Build Fails

**Issue**: Vite build errors  
**Solution**: Check Node.js version (requires 18+)
```bash
node --version
npm install
npm run build
```

### API Functions Not Working

**Issue**: 404 on `/api/college-baseball/*` endpoints  
**Solution**: Verify `functions/` directory structure matches URL paths

```bash
# Check structure
ls -la functions/api/college-baseball/
```

### KV Binding Error

**Issue**: "KV namespace not found"  
**Solution**: Verify KV namespace ID in `wrangler.toml`

```bash
# List KV namespaces
wrangler kv:namespace list
```

### Stale Data

**Issue**: App showing old data  
**Solution**: Clear KV cache

```bash
# Delete specific key
wrangler kv:key delete --binding=KV "college-baseball:games:2025-10-15:all:all:all"

# Or clear all (use with caution)
wrangler kv:key list --binding=KV
```

## Security

### Headers

The app sets security headers:
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection`

These are configured in the API gateway.

### CORS

CORS is configured to allow requests from:
- `https://blazesportsintel.com`
- `https://www.blazesportsintel.com`

To add more origins, update `corsHeaders` in API functions.

## Cost Considerations

Cloudflare Pages Free Tier includes:
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 100,000 KV reads/day
- 1,000 KV writes/day

This is typically sufficient for moderate traffic. Monitor usage in dashboard.

## Backup and Recovery

### Code Backup
- GitHub repository serves as primary backup
- Enable branch protection for `main`

### Data Backup
- KV data is automatically replicated
- No manual backup needed
- Export KV data if needed:
  ```bash
  wrangler kv:key list --binding=KV > kv-backup.json
  ```

## Support

For deployment issues:
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/
- GitHub Issues: Report problems in repository

---

**Last Updated**: October 2025  
**Deployment Target**: Cloudflare Pages + Workers  
**Build Tool**: Vite 5.x  
**Node Version**: 18+
