# StudioIQ - AI Creator Intelligence Platform

A production-grade SaaS platform that combines YouTube analytics intelligence, AI content strategy generation, and virtual production studio simulation with a token-based internal economy.

## 🎯 Core Features

- **Real YouTube Analytics**: Connect to YouTube Data API v3 for accurate channel metrics
- **AI Content Generation**: Generate scripts, thumbnail concepts, and video ideas
- **Studio Simulation**: Realistic and architectural (Unreal Engine-style) production planning
- **Token Economy**: Pay-per-feature with transparent pricing ($0.02 per token)
- **Competitor Intelligence**: Compare against successful channels in your niche

## 🏗️ System Architecture

```
Frontend (Next.js 14 + TailwindCSS)
├── Dashboard UI
├── Landing Page
├── Auth System
└── Real-time Token Balance

Backend (Node.js + TypeScript)
├── YouTube API Service
├── AI Engine (Claude API)
├── Token Economy System
├── Auth Service (Supabase)
└── Billing Integration (Stripe)

Database (Supabase PostgreSQL)
├── Users & Auth
├── Token Balances & Transactions
├── YouTube Channel Data
├── AI Generated Content
└── Usage Analytics
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- YouTube Data API v3 key
- Anthropic Claude API key
- Supabase account
- Stripe account (for billing)

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# YouTube Data API v3
YOUTUBE_API_KEY=your-youtube-api-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Database Setup

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  tier text default 'free_trial',
  trial_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Token balances
create table public.token_balances (
  user_id uuid references public.users on delete cascade primary key,
  balance integer default 0,
  lifetime_earned integer default 0,
  lifetime_spent integer default 0,
  last_reset_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Token transactions
create table public.token_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade,
  amount integer not null,
  type text not null,
  feature text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- YouTube channels
create table public.youtube_channels (
  id uuid default gen_random_uuid() primary key,
  youtube_id text unique not null,
  title text not null,
  description text,
  thumbnail_url text,
  subscriber_count bigint,
  video_count integer default 0,
  view_count bigint default 0,
  custom_url text,
  country text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Channel analyses
create table public.channel_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade,
  channel_id uuid references public.youtube_channels,
  niche text,
  content_style text,
  upload_frequency numeric,
  avg_views_per_video bigint,
  engagement_rate numeric,
  growth_signals text[],
  top_performing_topics text[],
  best_upload_times text[],
  analysis_data jsonb default '{}',
  created_at timestamptz default now()
);

-- Enable RLS and create policies
alter table public.users enable row level security;
alter table public.token_balances enable row level security;
alter table public.token_transactions enable row level security;
alter table public.channel_analyses enable row level security;

-- Users can only access their own data
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);
```

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 💰 Token Economy

| Feature | Tokens | USD Value |
|---------|--------|-----------|
| Channel Analysis | 3 | $0.06 |
| Content Ideas | 5 | $0.10 |
| Thumbnail Generation | 6 | $0.12 |
| Script Generation | 8 | $0.16 |
| Production Setup | 10 | $0.20 |
| Studio Simulation | 15 | $0.30 |
| Video Preview | 25 | $0.50 |

## 📊 Pricing Tiers

### Free Trial (14 days)
- 1 channel analysis/day
- 2 content ideas/day
- 1 thumbnail concept/day
- 20 starting tokens

### Standard ($12/month)
- 5 channel analyses/day
- 10 content ideas/month
- 5 scripts/month
- Basic thumbnails
- Realistic studio mode
- 1 video preview/month

### Premium ($29/month)
- 20 channel analyses/day
- Unlimited content ideas & scripts
- Advanced thumbnails
- Both studio modes
- 5 video previews/month
- Full competitor intelligence

## 🔐 Security Features

- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) on all tables
- API rate limiting
- Input validation with Zod
- Secure Stripe webhooks
- Token deduction before execution (retry-safe)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   └── providers/         # Context providers
├── lib/                   # Utility functions & services
│   ├── ai.ts             # Claude AI integration
│   ├── auth.ts           # Authentication service
│   ├── supabase.ts       # Supabase client
│   ├── tokens.ts         # Token economy system
│   ├── utils.ts          # Helper functions
│   └── youtube.ts        # YouTube API service
└── types/                 # TypeScript types
    ├── index.ts          # Main type definitions
    └── supabase.ts       # Database types
```

## 🧪 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

## 📚 API Documentation

### Authentication
- `POST /api/auth` - Sign up, sign in, sign out

### Channel Analysis
- `POST /api/analyze` - Analyze YouTube channel (3 tokens)

### Content Generation
- `POST /api/content` - Generate ideas, scripts, thumbnails

### Studio
- `POST /api/studio` - Generate production setups

### Tokens
- `GET /api/tokens` - Get balance and transaction history
- `POST /api/tokens` - Purchase tokens

### Competitors
- `POST /api/competitors` - Compare with similar channels

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 🆘 Support

For support, email support@studioiq.com or open an issue on GitHub.
