import { youtube } from './youtube-client';
import { fetchChannelVideos } from './video-fetcher';
import { transformChannel, transformVideo } from './transformer';
import {
  calculateAverageViews,
  calculateEngagement,
  calculateUploadFrequency,
} from './metrics-engine';
import { CompetitorChannel, ComparisonMetrics, YouTubeChannel } from '@/types';
import { cacheGet, cacheSet } from '@/lib/redis';

// --------------------------------------------------------------------------
// searchSimilarChannels
// Uses YouTube search (100 quota) then fetches channel stats (1 quota).
// --------------------------------------------------------------------------
export async function searchSimilarChannels(
  niche: string,
  contentStyle: string,
  maxResults: number = 10
): Promise<Partial<YouTubeChannel>[]> {
  const cacheKey = `yt_similar_${niche}_${contentStyle}_${maxResults}`.replace(/\s+/g, '_').toLowerCase();
  const cached = await cacheGet<Partial<YouTubeChannel>[]>(cacheKey);
  
  if (cached) {
    // Generate fresh UUIDs for the returned cached objects
    return cached.map(c => ({ ...c, id: crypto.randomUUID() }));
  }

  const searchRes = await youtube.search.list({
    part: ['snippet'],
    q: `${niche} ${contentStyle} channel`,
    type: ['channel'],
    maxResults,
    order: 'relevance',
  });

  const channelIds = searchRes.data.items
    ?.map(item => item.id?.channelId)
    .filter(Boolean) as string[];

  if (!channelIds.length) return [];

  const channelsRes = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    id: channelIds,
  });

  const result = channelsRes.data.items?.map(channel => {
    const transformed = transformChannel(channel);
    return {
      ...transformed,
      id: crypto.randomUUID(),
      thumbnail_url: channel.snippet?.thumbnails?.default?.url || null,
    };
  }) || [];

  await cacheSet(cacheKey, result, 86400); // Cache for 24h
  return result;
}

// --------------------------------------------------------------------------
// compareChannels
// Compares target channel against up to 3 competitor channels.
// --------------------------------------------------------------------------
export async function compareChannels(
  analysisId: string,
  targetChannelId: string,
  competitorChannels: Partial<YouTubeChannel>[]
): Promise<CompetitorChannel[]> {
  const targetRaw = await fetchChannelVideos(targetChannelId, 30);
  const targetVideos = targetRaw.map(transformVideo);
  const targetMetrics = {
    uploadFrequency: calculateUploadFrequency(targetVideos),
    engagementRate: calculateEngagement(targetVideos),
    avgViews: calculateAverageViews(targetVideos),
  };

  const comparisons: CompetitorChannel[] = [];

  for (const competitor of competitorChannels.slice(0, 3)) {
    if (!competitor.youtube_id) continue;

    try {
      const compRaw = await fetchChannelVideos(competitor.youtube_id, 30);
      const compVideos = compRaw.map(transformVideo);
      const compMetrics = {
        uploadFrequency: calculateUploadFrequency(compVideos),
        engagementRate: calculateEngagement(compVideos),
        avgViews: calculateAverageViews(compVideos),
      };

      // Tag overlap for content_format_overlap
      const targetTags = new Set(targetVideos.flatMap(v => v.tags));
      const compTags = new Set(compVideos.flatMap(v => v.tags));
      const intersection = [...targetTags].filter(t => compTags.has(t)).length;
      const union = new Set([...targetTags, ...compTags]).size;
      const contentOverlap = union > 0 ? (intersection / union) * 100 : 0;

      const comparisonData: ComparisonMetrics = {
        upload_frequency_delta: compMetrics.uploadFrequency - targetMetrics.uploadFrequency,
        engagement_rate_delta: compMetrics.engagementRate - targetMetrics.engagementRate,
        subscriber_growth_delta: 0,
        view_velocity_delta: compMetrics.avgViews - targetMetrics.avgViews,
        content_format_overlap: contentOverlap,
      };

      // Weighted similarity score
      const freqScore = Math.max(0, 1 - Math.abs(comparisonData.upload_frequency_delta) / 7);
      const engScore = Math.max(0, 1 - Math.abs(comparisonData.engagement_rate_delta) / 10);
      const viewScore =
        comparisonData.view_velocity_delta >= 0
          ? Math.min(1, 1 / (1 + comparisonData.view_velocity_delta / 10000))
          : Math.max(0, 1 + comparisonData.view_velocity_delta / 10000);
      const similarityScore = (freqScore * 0.25 + engScore * 0.35 + viewScore * 0.4) * 100;

      comparisons.push({
        id: crypto.randomUUID(),
        analysis_id: analysisId,
        youtube_channel_id: competitor.youtube_id,
        similarity_score: similarityScore,
        comparison_data: comparisonData as unknown as Record<string, unknown>,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`Error comparing with ${competitor.title}:`, err);
    }
  }

  return comparisons.sort((a, b) => b.similarity_score - a.similarity_score);
}
