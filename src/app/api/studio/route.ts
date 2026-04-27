import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai';
import { tokenService } from '@/lib/tokens';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { ContentIdea, ProductionSetup, StudioMode } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ideaId, mode, budget } = body;

    switch (action) {
      case 'generate-setup':
        return await generateProductionSetup(user.id, user.tier, ideaId, mode, budget);

      case 'compare-modes':
        return await compareStudioModes(user.id, user.tier, ideaId);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Studio API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateProductionSetup(
  userId: string,
  tier: string,
  ideaId: string,
  mode: StudioMode,
  budget: 'budget' | 'mid' | 'premium'
) {
  // Check studio feature availability
  const availability = await tokenService.checkFeatureAvailability(
    userId,
    tier as any,
    'production_setup'
  );

  if (!availability.available) {
    return NextResponse.json(
      { success: false, error: availability.reason, requiresUpgrade: true },
      { status: 403 }
    );
  }

  // Check architectural mode permission
  if (mode === 'architectural' && tier !== 'premium') {
    return NextResponse.json(
      { success: false, error: 'Architectural mode requires Premium plan', requiresUpgrade: true },
      { status: 403 }
    );
  }

  // Get idea
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

  // Deduct tokens
  const tokenResult = await tokenService.deductTokens(
    userId,
    'production_setup',
    { ideaId, mode, budget }
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
      budget
    );

    const { data: saved, error: saveError } = await supabase
      .from('production_setups')
      .insert({
        user_id: userId,
        content_idea_id: ideaId,
        mode,
        ...setup,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      throw new Error('Failed to save production setup');
    }

    await tokenService.logUsage(
      userId,
      'production_setup',
      tokenResult.tokensDeducted || 0,
      { ideaId, mode, budget },
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
    await tokenService.refundTokens(userId, 'production_setup', 'Generation failed');
    throw error;
  }
}

async function compareStudioModes(
  userId: string,
  tier: string,
  ideaId: string
) {
  if (tier !== 'premium') {
    return NextResponse.json(
      { success: false, error: 'Studio comparison requires Premium plan', requiresUpgrade: true },
      { status: 403 }
    );
  }

  // Get idea
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

  // Deduct tokens for both modes
  const tokenResult = await tokenService.deductTokens(
    userId,
    'studio_simulation',
    { ideaId, comparison: true }
  );

  if (!tokenResult.success) {
    return NextResponse.json(
      { success: false, error: tokenResult.error },
      { status: 402 }
    );
  }

  try {
    // Generate both modes
    const [realisticSetup, architecturalSetup] = await Promise.all([
      aiService.generateProductionSetup(idea as ContentIdea, 'realistic', 'mid'),
      aiService.generateProductionSetup(idea as ContentIdea, 'architectural', 'mid'),
    ]);

    const timestamp = new Date().toISOString();
    
    const { data: realistic, error: rError } = await supabase
      .from('production_setups')
      .insert({
        user_id: userId,
        content_idea_id: ideaId,
        mode: 'realistic',
        ...realisticSetup,
        created_at: timestamp,
      })
      .select()
      .single();

    const { data: architectural, error: aError } = await supabase
      .from('production_setups')
      .insert({
        user_id: userId,
        content_idea_id: ideaId,
        mode: 'architectural',
        ...architecturalSetup,
        created_at: timestamp,
      })
      .select()
      .single();

    if (rError || aError) {
      throw new Error('Failed to save production setups');
    }

    await tokenService.logUsage(
      userId,
      'studio_simulation',
      tokenResult.tokensDeducted || 0,
      { ideaId, comparison: true },
      { realisticId: realistic?.id, architecturalId: architectural?.id },
      true,
      null
    );

    return NextResponse.json({
      success: true,
      data: {
        realistic,
        architectural,
      },
      tokensRemaining: tokenResult.balance,
    });

  } catch (error) {
    await tokenService.refundTokens(userId, 'studio_simulation', 'Generation failed');
    throw error;
  }
}
