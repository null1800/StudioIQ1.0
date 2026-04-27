import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function extractYouTubeChannelId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /youtube\.com\/channel\/(UC[\w-]+)/,
    /youtube\.com\/c\/([\w-]+)/,
    /youtube\.com\/user\/([\w-]+)/,
    /youtube\.com\/@([\w-]+)/,
    /youtube\.com\/([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // If it's just an ID
  if (/^UC[\w-]+$/.test(url)) {
    return url;
  }

  return null;
}

export function calculateEngagementRate(
  viewCount: number,
  likeCount: number | null,
  commentCount: number | null
): number {
  if (viewCount === 0) return 0;
  
  const likes = likeCount || 0;
  const comments = commentCount || 0;
  const totalEngagement = likes + comments;
  
  return (totalEngagement / viewCount) * 100;
}

export function calculateGrowthVelocity(
  currentViews: number,
  previousViews: number,
  daysBetween: number
): number {
  if (previousViews === 0 || daysBetween === 0) return 0;
  
  const growthRate = ((currentViews - previousViews) / previousViews) * 100;
  const dailyVelocity = growthRate / daysBetween;
  
  return dailyVelocity;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getStartOfDay(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function getEndOfDay(): Date {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
}

export function isTrialExpired(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return true;
  return new Date(trialEndsAt) < new Date();
}

export function getDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const end = new Date(trialEndsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  return fn().catch(async (err) => {
    if (retries === 0) throw err;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  });
}
