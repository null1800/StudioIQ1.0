import { NextRequest, NextResponse } from 'next/server';
import { analyzeChannel, getChannelDetails } from '@/modules/analytics/analysis-service';
import { persistAnalysisResult } from '@/modules/analytics/repository';
import { handleYouTubeError } from '@/modules/analytics/error-handler';
import { tokenService } from '@/lib/tokens';
import { authService } from '@/lib/auth';
import { TokenFeature } from '@/types';
import { checkRateLimit } from '@/lib/redis';

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

    // ── Rate limit ────────────────────────────────────────────────────────
    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // ── Feature availability ──────────────────────────────────────────────
    const availability = await tokenService.checkFeatureAvailability(
      user.id,
      user.tier,
      'channel_analysis'
    );
    if (!availability.available) {
      return NextResponse.json(
        { success: false, error: availability.reason, requiresUpgrade: true },
        { status: 403 }
      );
    }

    // ── Input validation ──────────────────────────────────────────────────
    const body = await request.json();
    const { channelUrl, channelName } = body;
    if (!channelUrl && !channelName) {
      return NextResponse.json(
        { success: false, error: 'Channel URL or name required' },
        { status: 400 }
      );
    }

    // ── Token deduction ───────────────────────────────────────────────────
    const tokenResult = await tokenService.deductTokens(
      user.id,
      'channel_analysis',
      { channelUrl, channelName }
    );
    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, error: tokenResult.error },
        { status: 402 }
      );
    }

    try {
      const identifier = channelUrl || channelName;

      // ── Core analysis ─────────────────────────────────────────────────
      const [analysis, channel] = await Promise.all([
        analyzeChannel(user.id, identifier),
        getChannelDetails(identifier),
      ]);

      // ── Persist to Supabase ───────────────────────────────────────────
      const { analysis: savedAnalysis } = await persistAnalysisResult(channel, analysis);

      // ── Log success ────────────────────────────────────────────────────
      await tokenService.logUsage(
        user.id,
        'channel_analysis',
        tokenResult.tokensDeducted || 0,
        { channelUrl, channelName },
        { analysisId: savedAnalysis?.id ?? analysis.id },
        true,
        null
      );

      return NextResponse.json({
        success: true,
        data: savedAnalysis ?? analysis,
        tokensRemaining: tokenResult.balance,
      });

    } catch (error) {
      // ── Token refund on failure ────────────────────────────────────────
      await tokenService.refundTokens(
        user.id,
        'channel_analysis',
        error instanceof Error ? error.message : 'Analysis failed'
      );

      await tokenService.logUsage(
        user.id,
        'channel_analysis',
        tokenResult.tokensDeducted || 0,
        { channelUrl, channelName },
        null,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }

  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
