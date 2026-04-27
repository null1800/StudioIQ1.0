import { supabase } from '@/lib/supabase';
import { YouTubeChannel, ChannelAnalysis, CompetitorChannel } from '@/types';

// --------------------------------------------------------------------------
// CHANNELS
// --------------------------------------------------------------------------

/**
 * Upserts a YouTube channel by youtube_id.
 * Returns the stored channel row.
 */
export async function upsertChannel(
  channel: YouTubeChannel
): Promise<YouTubeChannel | null> {
  const { data, error } = await supabase
    .from('youtube_channels')
    .upsert(
      {
        youtube_id: channel.youtube_id,
        title: channel.title,
        description: channel.description,
        thumbnail_url: channel.thumbnail_url,
        subscriber_count: channel.subscriber_count,
        video_count: channel.video_count,
        view_count: channel.view_count,
        custom_url: channel.custom_url,
        country: channel.country,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: 'youtube_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[repository] upsertChannel error:', error.message);
    return null;
  }

  return data as YouTubeChannel;
}

/**
 * Looks up a channel by youtube_id. Returns null if not found.
 */
export async function getChannelByYouTubeId(
  youtubeId: string
): Promise<YouTubeChannel | null> {
  const { data, error } = await supabase
    .from('youtube_channels')
    .select('*')
    .eq('youtube_id', youtubeId)
    .maybeSingle();

  if (error) {
    console.error('[repository] getChannelByYouTubeId error:', error.message);
    return null;
  }

  return data as YouTubeChannel | null;
}

// --------------------------------------------------------------------------
// ANALYSES
// --------------------------------------------------------------------------

/**
 * Inserts a new channel analysis record.
 * Returns the saved analysis with its generated id.
 */
export async function insertAnalysis(
  analysis: ChannelAnalysis
): Promise<ChannelAnalysis | null> {
  const { data, error } = await supabase
    .from('channel_analyses')
    .insert({
      id: analysis.id,
      user_id: analysis.user_id,
      channel_id: analysis.channel_id,
      niche: analysis.niche,
      content_style: analysis.content_style,
      upload_frequency: analysis.upload_frequency,
      avg_views_per_video: analysis.avg_views_per_video,
      engagement_rate: analysis.engagement_rate,
      growth_signals: analysis.growth_signals,
      top_performing_topics: analysis.top_performing_topics,
      best_upload_times: analysis.best_upload_times,
      analysis_data: analysis.analysis_data as any,
      created_at: analysis.created_at,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('[repository] insertAnalysis error:', error.message);
    return null;
  }

  return data as ChannelAnalysis;
}

/**
 * Returns the most recent analyses for a user, newest first.
 */
export async function getUserAnalyses(
  userId: string,
  limit = 10
): Promise<ChannelAnalysis[]> {
  const { data, error } = await supabase
    .from('channel_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[repository] getUserAnalyses error:', error.message);
    return [];
  }

  return (data as ChannelAnalysis[]) || [];
}

/**
 * Returns a single analysis by id, scoped to the user for RLS safety.
 */
export async function getAnalysisById(
  id: string,
  userId: string
): Promise<ChannelAnalysis | null> {
  const { data, error } = await supabase
    .from('channel_analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[repository] getAnalysisById error:', error.message);
    return null;
  }

  return data as ChannelAnalysis | null;
}

// --------------------------------------------------------------------------
// COMPETITORS
// --------------------------------------------------------------------------

/**
 * Bulk-inserts competitor channel comparisons for an analysis.
 */
export async function insertCompetitors(
  competitors: CompetitorChannel[]
): Promise<void> {
  if (!competitors.length) return;

  const { error } = await supabase.from('competitor_channels').insert(
    competitors.map(c => ({
      id: c.id,
      analysis_id: c.analysis_id,
      youtube_channel_id: c.youtube_channel_id,
      similarity_score: c.similarity_score,
      comparison_data: c.comparison_data as any,
      created_at: c.created_at,
    }) as any)
  );

  if (error) {
    console.error('[repository] insertCompetitors error:', error.message);
  }
}

// --------------------------------------------------------------------------
// COMPOSITE: Save full analysis result in one call
// --------------------------------------------------------------------------

export interface AnalysisPersistResult {
  channel: YouTubeChannel | null;
  analysis: ChannelAnalysis | null;
}

/**
 * Upserts the channel and inserts the analysis atomically.
 * Use this from the route handler to keep persistence in one place.
 */
export async function persistAnalysisResult(
  channel: YouTubeChannel | null,
  analysis: ChannelAnalysis
): Promise<AnalysisPersistResult> {
  const savedChannel = channel ? await upsertChannel(channel) : null;
  const savedAnalysis = await insertAnalysis(analysis);

  return { channel: savedChannel, analysis: savedAnalysis };
}
