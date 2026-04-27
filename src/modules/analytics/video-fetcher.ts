import { youtube } from './youtube-client';
import { cacheGet, cacheSet } from '@/lib/redis';
import { youtube_v3 } from 'googleapis';

export async function fetchChannelVideos(
  channelId: string,
  max = 50
): Promise<youtube_v3.Schema$Video[]> {
  const cacheKey = `yt_videos_${channelId}_${max}`;
  const cached = await cacheGet<youtube_v3.Schema$Video[]>(cacheKey);
  if (cached) return cached;

  const channel = await youtube.channels.list({
    part: ['contentDetails'],
    id: [channelId],
  });

  const uploads = channel.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return [];

  const playlist = await youtube.playlistItems.list({
    part: ['snippet', 'contentDetails'],
    playlistId: uploads,
    maxResults: max,
  });

  const ids = playlist.data.items?.map(i => i.contentDetails?.videoId).filter(Boolean) as string[];

  if (!ids.length) return [];

  const videos = await youtube.videos.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    id: ids,
  });

  const result = videos.data.items || [];
  
  await cacheSet(cacheKey, result, 21600); // Cache for 6h
  return result;
}

