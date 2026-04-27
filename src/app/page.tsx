import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { 
  Zap, 
  BarChart3, 
  Video, 
  Layers, 
  Coins, 
  Shield,
  ChevronRight,
  Play,
  Sparkles
} from 'lucide-react';

export default async function LandingPage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StudioIQ</span>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-ghost">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 mb-8">
            <Zap className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-brand-300">Powered by Real YouTube Data API</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Turn Your YouTube Channel Into a
            <span className="text-gradient block">Data-Driven Studio</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Analyze real performance metrics, generate AI-powered content strategies, 
            and simulate professional production environments—all in one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/auth/signup"} className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              {isLoggedIn ? "Go to Dashboard" : "Start Free Trial"}
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-4">
              See How It Works
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm">
            <span>14-day free trial</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>No credit card required</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From real-time analytics to AI-generated production setups, 
              StudioIQ gives creators the tools to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Real Analytics"
              description="Connect to real YouTube Data API for accurate performance metrics and growth tracking."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Content Ideas"
              description="Generate data-driven video concepts based on your channel's performance patterns."
            />
            <FeatureCard
              icon={<Video className="w-6 h-6" />}
              title="Script Generation"
              description="Get complete scripts with hooks, visual cues, and optimized structure."
            />
            <FeatureCard
              icon={<Layers className="w-6 h-6" />}
              title="Studio Simulation"
              description="Plan realistic or virtual production setups with detailed equipment recommendations."
            />
            <FeatureCard
              icon={<Coins className="w-6 h-6" />}
              title="Token Economy"
              description="Pay-per-feature with transparent token costs. Only pay for what you use."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Competitor Intel"
              description="Compare against similar channels and identify strategic opportunities."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How StudioIQ Works</h2>
            <p className="text-gray-400">Five simple steps to transform your content strategy</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {[
              { step: '01', title: 'Connect', desc: 'Enter your YouTube channel URL' },
              { step: '02', title: 'Analyze', desc: 'We fetch real performance data' },
              { step: '03', title: 'Compare', desc: 'See how you stack up to competitors' },
              { step: '04', title: 'Generate', desc: 'AI creates content ideas & scripts' },
              { step: '05', title: 'Produce', desc: 'Get studio setup recommendations' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-brand-400 font-bold">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Start free, upgrade when you are ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              tier="Free Trial"
              price="$0"
              period="14 days"
              description="Perfect for exploring the platform"
              features={[
                '1 channel analysis/day',
                '2 content ideas/day',
                '1 thumbnail concept/day',
                'Limited AI insights',
                'Basic analytics',
              ]}
              cta="Start Free"
              ctaLink={isLoggedIn ? "/billing" : "/auth/signup"}
              popular={false}
            />
            <PricingCard
              tier="Standard"
              price="$12"
              period="/month"
              description="For creators building consistently"
              features={[
                '5 channel analyses/day',
                '10 content ideas/month',
                '5 scripts/month',
                'Basic thumbnails',
                'Realistic studio mode',
                '1 video preview/month',
                'Competitor comparison (top 3)',
              ]}
              cta="Get Standard"
              ctaLink={isLoggedIn ? "/billing" : "/auth/signup?plan=standard"}
              popular={true}
            />
            <PricingCard
              tier="Premium"
              price="$29"
              period="/month"
              description="Full production studio access"
              features={[
                '20 channel analyses/day',
                'Unlimited content ideas',
                'Unlimited scripts',
                'Advanced thumbnails',
                'Both studio modes',
                '5 video previews/month',
                'Full competitor intel',
                'Architectural simulation',
              ]}
              cta="Get Premium"
              ctaLink={isLoggedIn ? "/billing" : "/auth/signup?plan=premium"}
              popular={false}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join creators using real data and AI to build channels that grow.
            Start your free 14-day trial today.
          </p>
          <Link href={isLoggedIn ? "/dashboard" : "/auth/signup"} className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            {isLoggedIn ? "Go to Dashboard" : "Start Free Trial"}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">StudioIQ</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 StudioIQ. Real data, real growth.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="card-hover">
      <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4">
        <div className="text-brand-400">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  period,
  description,
  features,
  cta,
  ctaLink,
  popular,
}: {
  tier: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular: boolean;
}) {
  return (
    <div className={`card p-6 relative ${popular ? 'border-brand-500/50 ring-1 ring-brand-500/20' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="badge-brand">Most Popular</span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">{tier}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-gray-400">{period}</span>
        </div>
        <p className="text-gray-400 text-sm mt-2">{description}</p>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
            <svg className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={ctaLink}
        className={`w-full py-3 rounded-lg font-medium text-center block transition-colors ${
          popular
            ? 'bg-brand-500 hover:bg-brand-600 text-white'
            : 'bg-dark-700 hover:bg-dark-600 text-white'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

