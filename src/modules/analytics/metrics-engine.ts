export function calculateEngagement(videos: any[]) {
  let totalViews = 0;
  let totalEngagement = 0;

  videos.forEach(v => {
    totalViews += v.view_count;
    totalEngagement += (v.like_count || 0) + (v.comment_count || 0);
  });

  return totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
}

export function calculateAverageViews(videos: any[]) {
  if (!videos.length) return 0;
  return Math.round(videos.reduce((a, b) => a + b.view_count, 0) / videos.length);
}

export function calculateUploadFrequency(videos: any[]) {
  if (videos.length < 2) return 0;

  const sorted = [...videos].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  const days =
    (new Date(sorted[0].published_at).getTime() -
      new Date(sorted[sorted.length - 1].published_at).getTime()) /
    (1000 * 60 * 60 * 24);

  return days > 0 ? sorted.length / days : 0;
}
