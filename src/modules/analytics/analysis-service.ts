import { youtube } from './youtube-client';
import { resolveChannelId } from './channel-resolver';
import { fetchChannelVideos } from './video-fetcher';
import { transformChannel, transformVideo } from './transformer';
import {
  calculateAverageViews,
  calculateEngagement,
  calculateUploadFrequency,
} from './metrics-engine';
import { ChannelAnalysis, YouTubeChannel } from '@/types';
import { cacheGet, cacheSet } from '@/lib/redis';

// --------------------------------------------------------------------------
// getChannelDetails
// Returns a full YouTubeChannel object for DB persistence.
// --------------------------------------------------------------------------
export async function getChannelDetails(identifier: string): Promise<YouTubeChannel | null> {
  const cacheKey = `yt_channel_details_${identifier}`;
  const cached = await cacheGet<YouTubeChannel>(cacheKey);
  if (cached) return cached;

  const channelId = await resolveChannelId(identifier);
  if (!channelId) return null;

  const res = await youtube.channels.list({
    part: ['snippet', 'statistics', 'brandingSettings'],
    id: [channelId],
  });

  const data = res.data.items?.[0];
  if (!data) return null;

  const transformed = transformChannel(data);
  const result = {
    ...transformed,
    id: crypto.randomUUID(),
    description: data.snippet?.description || null,
    thumbnail_url:
      data.snippet?.thumbnails?.high?.url ||
      data.snippet?.thumbnails?.medium?.url ||
      data.snippet?.thumbnails?.default?.url ||
      null,
    custom_url: data.snippet?.customUrl || null,
    country: data.snippet?.country || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await cacheSet(cacheKey, result, 21600); // 6 hours
  return result;
}

// --------------------------------------------------------------------------
// analyzeChannel
// Full orchestration: resolve → fetch → transform → compute metrics.
// --------------------------------------------------------------------------
export async function analyzeChannel(
  userId: string,
  identifier: string
): Promise<ChannelAnalysis> {
  const cacheKey = `yt_analysis_${identifier}`;
  const cached = await cacheGet<ChannelAnalysis>(cacheKey);
  
  if (cached) {
    return {
      ...cached,
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: new Date().toISOString()
    };
  }

  const channelId = await resolveChannelId(identifier);
  if (!channelId) throw new Error('Channel not found');

  const channelRes = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    id: [channelId],
  });

  const channelData = channelRes.data.items?.[0];
  if (!channelData) throw new Error('Channel data unavailable');

  const channel = transformChannel(channelData);
  const rawVideos = await fetchChannelVideos(channelId, 50);
  const videos = rawVideos.map(transformVideo);

  const result: ChannelAnalysis = {
    id: crypto.randomUUID(),
    user_id: userId,
    channel_id: channelId,
    niche: null,
    content_style: null,
    upload_frequency: calculateUploadFrequency(videos),
    avg_views_per_video: calculateAverageViews(videos),
    engagement_rate: calculateEngagement(videos),
    growth_signals: [],
    top_performing_topics: [],
    best_upload_times: [],
    analysis_data: {
      total_videos_analyzed: videos.length,
      channel_stats: {
        subscriber_count: channel.subscriber_count,
        total_views: channel.view_count,
        video_count: channel.video_count,
      },
      recent_video_performance: videos.slice(0, 10).map(v => ({
        title: v.title,
        views: v.view_count,
        likes: v.like_count,
        published_at: v.published_at,
      })),
    },
    created_at: new Date().toISOString(),
  };

  await cacheSet(cacheKey, result, 21600); // 6 hours
  return result;
}
