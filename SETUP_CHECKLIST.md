# StudioIQ Setup Checklist

## Phase 1: Environment Setup (Required)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in all values.

### 3. Set Up Supabase Database
Run the complete SQL from README.md in your Supabase SQL Editor (lines marked "Database Setup").

### 4. Start Development Server
```bash
npm run dev
```

## Phase 2: Validation Checklist

### Core Functionality
- [ ] Can sign up a new user
- [ ] Trial tokens (20) appear in balance
- [ ] Can analyze a YouTube channel (3 tokens deducted)
- [ ] Error displays if insufficient tokens
- [ ] Token balance updates in real-time

### AI Features
- [ ] Can generate content ideas (5 tokens)
- [ ] Can generate scripts (8 tokens)
- [ ] Can generate thumbnails (6 tokens)
- [ ] AI outputs are structured JSON

### Studio System
- [ ] Realistic mode accessible (Standard+)
- [ ] Architectural mode shows "Premium only" for free users
- [ ] Can generate production setups (10 tokens)

### Tier Enforcement
- [ ] Free trial users have daily limits
- [ ] Standard users can access realistic studio
- [ ] Premium users can access both studio modes
- [ ] Attempting over-limit shows upgrade prompt

## Phase 3: Known Limitations (Acceptable for MVP)

1. **Stripe Integration**: Billing routes exist but need webhook endpoint setup
2. **Video Previews**: Placeholder (25 tokens) - requires video generation API
3. **Email Templates**: Auth emails use Supabase defaults
4. **Rate Limiting**: Basic implementation, needs Redis for production scale
5. **Caching**: No Redis/cache layer yet

## Phase 4: Production Readiness

Before launching:
- [ ] Add Redis for rate limiting & caching
- [ ] Set up Stripe webhooks
- [ ] Configure email templates
- [ ] Add Sentry for error tracking
- [ ] Set up monitoring (e.g., Vercel Analytics)
- [ ] Run security audit
- [ ] Load test API routes
- [ ] Add comprehensive tests

## Common Issues

**"Cannot find module" errors**: Run `npm install`

**Database connection errors**: Check Supabase URL and keys

**YouTube API errors**: Verify API key is enabled for YouTube Data API v3

**AI generation fails**: Check Anthropic API key and rate limits
