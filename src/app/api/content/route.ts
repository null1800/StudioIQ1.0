import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai';
import { tokenService } from '@/lib/tokens';
import { createClient } from '@/utils/supabase/server';
import { authService } from '@/lib/auth';
import { ChannelAnalysis, ContentIdea, Script, Thumbnail, StudioMode } from '@/types';
import { checkRateLimit } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, analysisId, ideaId, preferences } = body;

    switch (action) {
      case 'generate-ideas':
        return await generateContentIdeas(user.id, user.tier, analysisId);

      case 'generate-script':
        return await generateScript(user.id, user.tier, ideaId, preferences);

      case 'generate-thumbnail':
        return await generateThumbnail(user.id, user.tier, ideaId);
        
      case 'generate-setup':
        return await generateSetup(user.id, user.tier, ideaId, preferences);

      case 'save-idea':
        return await savePredefinedIdea(user.id, body.idea, analysisId);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateContentIdeas(
  userId: string,
  tier: string,
  analysisId: string
) {
  // Check availability
  const availability = await tokenService.checkFeatureAvailability(
    userId,
    tier as any,
    'content_ideas'
  );

  if (!availability.available) {
    return NextResponse.json(
      { success: false, error: availability.reason, requiresUpgrade: true },
      { status: 403 }
    );
  }

  // Get analysis
  const supabase = await createClient();
  const { data: analysis, error } = await supabase
    .from('channel_analyses')
    .select('*')
    .eq('id', analysisId)
    .eq('user_id', userId)
    .single();

  if (error || !analysis) {
    return NextResponse.json(
      { success: false, error: 'Analysis not found' },
      { status: 404 }
    );
  }

  // Deduct tokens
  const tokenResult = await tokenService.deductTokens(
    userId,
    'content_ideas',
    { analysisId }
  );

  if (!tokenResult.success) {
    return NextResponse.json(
      { success: false, error: tokenResult.error },
      { status: 402 }
    );
  }

  try {
    const count = tier === 'free_trial' ? 2 : tier === 'standard' ? 3 : 5;
    const ideas = await aiService.generateContentIdeas(analysis as ChannelAnalysis, count);

    // Save ideas
    const savedIdeas: ContentIdea[] = [];
    for (const idea of ideas) {
      const { data: saved, error: saveError } = await supabase
        .from('content_ideas')
        .insert({
          user_id: userId,
          channel_analysis_id: analysisId,
          ...idea,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!saveError && saved) {
        savedIdeas.push(saved);
      }
    }

    await tokenService.logUsage(
      userId,
      'content_ideas',
      tokenResult.tokensDeducted || 0,
      { analysisId, count },
      { ideasGenerated: ideas.length },
      true,
      null
    );

    return NextResponse.json({
      success: true,
      data: savedIdeas,
      tokensRemaining: tokenResult.balance,
    });

  } catch (error) {
    await tokenService.refundTokens(userId, 'content_ideas', 'Generation failed');
    throw error;
  }
}

async function generateScript(
  userId: string,
  tier: string,
  ideaId: string,
  preferences: { tone?: string; duration?: number }
) {
  if (tier === 'free_trial') {
    return NextResponse.json(
      { success: false, error: 'Script generation requires Standard plan', requiresUpgrade: true },
      { status: 403 }
    );
  }

  const availability = await tokenService.checkFeatureAvailability(
    userId,
    tier as any,
    'script_generation'
  );

  if (!availability.available) {
    return NextResponse.json(
      { success: false, error: availability.reason, requiresUpgrade: true },
      { status: 403 }
    );
  }

  // Get idea
  const supabase = await createClient();
  const { data: idea, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('id', ideaId)
    .eq('user_id', userId)
    .single();

  if (error || !idea) {
    return NextResponse.json(
      { success: false, error: 'Content idea not found' },
      { status: 404 }
    );
  }

  const tokenResult = await tokenService.deductTokens(
    userId,
    'script_generation',
    { ideaId }
  );

  if (!tokenResult.success) {
    return NextResponse.json(
      { success: false, error: tokenResult.error },
      { status: 402 }
    );
  }

  try {
    const script = await aiService.generateScript(
      idea as ContentIdea,
      preferences.tone,
      preferences.duration
    );

    const { data: saved, error: saveError } = await supabase
      .from('scripts')
      .insert({
        user_id: userId,
        content_idea_id: ideaId,
        ...script,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      throw new Error('Failed to save script');
    }

    await tokenService.logUsage(
      userId,
      'script_generation',
      tokenResult.tokensDeducted || 0,
      { ideaId, preferences },
      { scriptId: saved.id },
      true,
      null
    );

    return NextResponse.json({
      success: true,
      data: saved,
      tokensRemaining: tokenResult.balance,
    });

  } catch (error) {
    await tokenService.refundTokens(userId, 'script_generation', 'Generation failed');
    throw error;
  }
}

async function generateThumbnail(
  userId: string,
  tier: string,
  ideaId: string
) {
  const availability = await tokenService.checkFeatureAvailability(
    userId,
    tier as any,
    'thumbnail_generation'
  );

  if (!availability.available) {
    return NextResponse.json(
      { success: false, error: availability.reason, requiresUpgrade: true },
      { status: 403 }
    );
  }

  // Get idea
  const supabase = await createClient();
  const { data: idea, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('id', ideaId)
    .eq('user_id', userId)
    .single();

  if (error || !idea) {
    return NextResponse.json(
      { success: false, error: 'Content idea not found' },
      { status: 404 }
    );
  }

  const tokenResult = await tokenService.deductTokens(
    userId,
    'thumbnail_generation',
    { ideaId }
  );

  if (!tokenResult.success) {
    return NextResponse.json(
      { success: false, error: tokenResult.error },
      { status: 402 }
    );
  }

  try {
    const thumbnail = await aiService.generateThumbnail(idea as ContentIdea);

    const { data: saved, error: saveError } = await supabase
      .from('thumbnails')
      .insert({
        user_id: userId,
        content_idea_id: ideaId,
        ...thumbnail,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      throw new Error('Failed to save thumbnail');
    }

    await tokenService.logUsage(
      userId,
      'thumbnail_generation',
      tokenResult.tokensDeducted || 0,
      { ideaId },
      { thumbnailId: saved.id },
      true,
      null
    );

    return NextResponse.json({
      success: true,
      data: saved,
      tokensRemaining: tokenResult.balance,
    });

  } catch (error) {
    await tokenService.refundTokens(userId, 'thumbnail_generation', 'Generation failed');
    throw error;
  }
}

async function generateSetup(
  userId: string,
  tier: string,
  ideaId: string,
  preferences: { mode?: StudioMode; budget?: 'budget' | 'mid' | 'premium' }
) {
  const mode = preferences?.mode || 'realistic';
  
  if (mode === 'architectural' && tier !== 'premium') {
    return NextResponse.json(
      { success: false, error: 'Architectural mode requires Premium plan', requiresUpgrade: true },
      { status: 403 }
    );
  }

  const availability = await tokenService.checkFeatureAvailability(
    userId,
    tier as any,
    'studio_simulation'
  );

  if (!availability.available) {
    return NextResponse.json(
      { success: false, error: availability.reason, requiresUpgrade: true },
      { status: 403 }
    );
  }

  // Get idea
  const supabase = await createClient();
  const { data: idea, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('id', ideaId)
    .eq('user_id', userId)
    .single();

  if (error || !idea) {
    return NextResponse.json(
      { success: false, error: 'Content idea not found' },
      { status: 404 }
    );
  }

  const tokenResult = await tokenService.deductTokens(
    userId,
    'studio_simulation',
    { ideaId }
  );

  if (!tokenResult.success) {
    return NextResponse.json(
      { success: false, error: tokenResult.error },
      { status: 402 }
    );
  }

  try {
    const setup = await aiService.generateProductionSetup(
      idea as ContentIdea,
      mode,
      preferences?.budget || 'mid'
    );

    const { data: saved, error: saveError } = await supabase
      .from('production_setups')
      .insert({
        user_id: userId,
        content_idea_id: ideaId,
        mode: setup.mode,
        setup_details: setup,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      throw new Error('Failed to save production setup');
    }

    await tokenService.logUsage(
      userId,
      'studio_simulation',
      tokenResult.tokensDeducted || 0,
      { ideaId, preferences },
      { setupId: saved.id },
      true,
      null
    );

    return NextResponse.json({
      success: true,
      data: saved,
      tokensRemaining: tokenResult.balance,
    });

  } catch (error) {
    await tokenService.refundTokens(userId, 'studio_simulation', 'Generation failed');
    throw error;
  }
}

async function savePredefinedIdea(userId: string, idea: any, analysisId: string | undefined) {
  if (!idea) {
    return NextResponse.json(
      { success: false, error: 'Idea object is required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: saved, error: saveError } = await supabase
    .from('content_ideas')
    .insert({
      user_id: userId,
      channel_analysis_id: analysisId || null,
      title: idea.title,
      hook: idea.hook,
      description: idea.description,
      target_audience: idea.target_audience,
      estimated_engagement: idea.estimated_engagement,
      format: idea.format,
      tags: idea.tags,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (saveError) {
    console.error('Save template error:', saveError);
    return NextResponse.json(
      { success: false, error: 'Failed to save template' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: saved,
  });
}
