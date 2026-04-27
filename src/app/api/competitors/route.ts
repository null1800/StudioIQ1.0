import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarChannels, compareChannels } from '@/modules/analytics/competitor-service';
import { insertCompetitors } from '@/modules/analytics/repository';
import { handleYouTubeError } from '@/modules/analytics/error-handler';
import { aiService } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // ── Tier gate ─────────────────────────────────────────────────────────
    if (user.tier === 'free_trial') {
      return NextResponse.json(
        {
          success: false,
          error: 'Competitor analysis requires Standard plan or higher',
          requiresUpgrade: true,
          preview: true,
        },
        { status: 403 }
      );
    }

    // ── Input validation ──────────────────────────────────────────────────
    const body = await request.json();
    const { analysisId } = body;
    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'Analysis ID required' },
        { status: 400 }
      );
    }

    // ── Load analysis + channel from DB ───────────────────────────────────
    const { data, error } = await supabase
      .from('channel_analyses')
      .select(`*, youtube_channels (*)`)
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    const analysis = data as any;

    if (error || !analysis) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found' },
        { status: 404 }
      );
    }

    const channelId = analysis.youtube_channels?.youtube_id || analysis.channel_id;
    const maxResults = user.tier === 'standard' ? 3 : 10;

    // ── Search + compare ──────────────────────────────────────────────────
    const similarChannels = await searchSimilarChannels(
      analysis.niche || 'general',
      analysis.content_style || 'entertainment',
      maxResults
    );

    const comparisons = await compareChannels(
      analysisId,
      channelId,
      similarChannels
    );

    // ── Persist competitors via repository ────────────────────────────────
    await insertCompetitors(comparisons);

    // ── AI insights (premium only) ────────────────────────────────────────
    let insights = null;
    if (user.tier === 'premium') {
      const competitorData = similarChannels.slice(0, 3).map((c, i) => ({
        title: c.title || 'Unknown',
        metrics: comparisons[i]?.comparison_data as Record<string, number> || {},
      }));
      insights = await aiService.generateCompetitorInsights(analysis, competitorData);
    }

    return NextResponse.json({
      success: true,
      data: {
        competitors: similarChannels.slice(0, maxResults),
        comparisons,
        insights,
        depth: user.tier === 'premium' ? 'full' : 'basic',
      },
    });

  } catch (error) {
    console.error('Competitors API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
