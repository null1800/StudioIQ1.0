/**
 * Environment variable validation
 * Run this early to catch missing config
 */

export function checkEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'YOUTUBE_API_KEY',
    'ANTHROPIC_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function checkStripeEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function warnStripeMissing(): void {
  console.warn('⚠️  Stripe environment variables not set. Billing features will be disabled.');
}
