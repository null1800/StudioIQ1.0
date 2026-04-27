import { youtube_v3 } from 'googleapis';

export function transformChannel(data: youtube_v3.Schema$Channel) {
  return {
    youtube_id: data.id!,
    title: data.snippet?.title || '',
    subscriber_count: Number(data.statistics?.subscriberCount || 0),
    video_count: Number(data.statistics?.videoCount || 0),
    view_count: Number(data.statistics?.viewCount || 0),
  };
}

export function transformVideo(data: youtube_v3.Schema$Video) {
  return {
    youtube_id: data.id!,
    title: data.snippet?.title || '',
    view_count: Number(data.statistics?.viewCount || 0),
    like_count: Number(data.statistics?.likeCount || 0),
    comment_count: Number(data.statistics?.commentCount || 0),
    published_at: data.snippet?.publishedAt!,
    duration: data.contentDetails?.duration,
    tags: data.snippet?.tags || [],
  };
}
