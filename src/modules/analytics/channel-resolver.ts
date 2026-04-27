import { youtube } from './youtube-client';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function resolveChannelId(identifier: string): Promise<string | null> {
  // Case 1: Already a channel ID — no lookup needed
  if (identifier.startsWith('UC')) return identifier;

  // Cache key per identifier
  const cacheKey = `yt_channel_id_${identifier}`;
  const cached = await cacheGet<string>(cacheKey);
  if (cached) return cached;

  let channelId: string | null = null;

  // Case 2: @handle → search (costs 100 quota, so we cache aggressively)
  if (identifier.startsWith('@')) {
    const res = await youtube.search.list({
      part: ['snippet'],
      q: identifier,
      type: ['channel'],
      maxResults: 1,
    });
    channelId = res.data.items?.[0]?.id?.channelId || null;
  } else {
    // Case 3: forUsername lookup (CHEAP: 1 quota)
    const res = await youtube.channels.list({
      part: ['snippet'],
      forUsername: identifier,
    });
    channelId = res.data.items?.[0]?.id || null;
  }

  if (channelId) {
    await cacheSet(cacheKey, channelId, 86400); // 24 hours
  }

  return channelId;
}
