import { supabase } from './supabase';
import { 
  TokenBalance, 
  TokenTransaction, 
  TokenFeature, 
  TOKEN_COSTS,
  UsageLog,
  SubscriptionTier,
  PLAN_LIMITS,
  DailyUsage 
} from '@/types';
import { getStartOfDay, getEndOfDay } from './utils';

export interface TokenOperationResult {
  success: boolean;
  balance: number;
  tokensDeducted?: number;
  error?: string;
}

export class TokenService {
  async getBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Create balance if doesn't exist
      await this.initializeBalance(userId);
      return 0;
    }

    return data.balance;
  }

  async initializeBalance(userId: string, initialBalance: number = 0): Promise<void> {
    const { error } = await supabase
      .from('token_balances')
      .upsert({
        user_id: userId,
        balance: initialBalance,
        lifetime_earned: initialBalance,
        lifetime_spent: 0,
        last_reset_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error initializing token balance:', error);
      throw new Error('Failed to initialize token balance');
    }
  }

  async deductTokens(
    userId: string,
    feature: TokenFeature,
    metadata: Record<string, unknown> = {}
  ): Promise<TokenOperationResult> {
    const cost = TOKEN_COSTS[feature];
    
    // Start transaction
    const { data: balance, error: balanceError } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (balanceError || !balance) {
      return { success: false, balance: 0, error: 'Failed to retrieve balance' };
    }

    if (balance.balance < cost) {
      return { 
        success: false, 
        balance: balance.balance, 
        error: `Insufficient tokens. Required: ${cost}, Available: ${balance.balance}` 
      };
    }

    const newBalance = balance.balance - cost;

    // Update balance
    const { error: updateError } = await supabase
      .from('token_balances')
      .update({
        balance: newBalance,
        lifetime_spent: supabase.rpc('increment', { amount: cost }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      return { success: false, balance: balance.balance, error: 'Failed to update balance' };
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: -cost,
        type: 'deduction',
        feature,
        metadata,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      // Attempt to refund
      console.error('Failed to record transaction:', transactionError);
    }

    return { success: true, balance: newBalance, tokensDeducted: cost };
  }

  async refundTokens(
    userId: string,
    feature: TokenFeature,
    reason: string
  ): Promise<TokenOperationResult> {
    const amount = TOKEN_COSTS[feature];

    const { data: balance, error: balanceError } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (balanceError || !balance) {
      return { success: false, balance: 0, error: 'Failed to retrieve balance' };
    }

    const newBalance = balance.balance + amount;

    const { error: updateError } = await supabase
      .from('token_balances')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      return { success: false, balance: balance.balance, error: 'Failed to update balance' };
    }

    // Record refund transaction
    await supabase.from('token_transactions').insert({
      user_id: userId,
      amount,
      type: 'refund',
      feature,
      metadata: { reason },
      created_at: new Date().toISOString(),
    });

    return { success: true, balance: newBalance, tokensDeducted: -amount };
  }

  async addTokens(
    userId: string,
    amount: number,
    type: 'purchase' | 'bonus',
    metadata: Record<string, unknown> = {}
  ): Promise<TokenOperationResult> {
    const { data: balance, error: balanceError } = await supabase
      .from('token_balances')
      .select('balance, lifetime_earned')
      .eq('user_id', userId)
      .single();

    if (balanceError || !balance) {
      await this.initializeBalance(userId, amount);
      return { success: true, balance: amount };
    }

    const newBalance = balance.balance + amount;
    const newLifetimeEarned = balance.lifetime_earned + amount;

    const { error: updateError } = await supabase
      .from('token_balances')
      .update({
        balance: newBalance,
        lifetime_earned: newLifetimeEarned,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      return { success: false, balance: balance.balance, error: 'Failed to add tokens' };
    }

    // Record transaction
    await supabase.from('token_transactions').insert({
      user_id: userId,
      amount,
      type,
      feature: null,
      metadata,
      created_at: new Date().toISOString(),
    });

    return { success: true, balance: newBalance };
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<TokenTransaction[]> {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  async logUsage(
    userId: string,
    feature: TokenFeature,
    tokensSpent: number,
    requestData: Record<string, unknown>,
    responseData: Record<string, unknown> | null,
    success: boolean,
    errorMessage: string | null = null
  ): Promise<void> {
    const { error } = await supabase.from('usage_logs').insert({
      user_id: userId,
      feature,
      tokens_spent: tokensSpent,
      request_data: requestData,
      response_data: responseData,
      success,
      error_message: errorMessage,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error logging usage:', error);
    }
  }

  async getDailyUsage(userId: string, date: Date = new Date()): Promise<DailyUsage> {
    const startOfDay = getStartOfDay();
    startOfDay.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    
    const endOfDay = getEndOfDay();
    endOfDay.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

    const { data, error } = await supabase
      .from('usage_logs')
      .select('feature')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .eq('success', true);

    if (error || !data) {
      return {
        user_id: userId,
        date: date.toISOString().split('T')[0],
        channel_analyses: 0,
        content_ideas: 0,
        thumbnail_concepts: 0,
        scripts: 0,
        competitor_analyses: 0,
        studio_simulations: 0,
        video_previews: 0,
      };
    }

    const counts: Record<string, number> = {};
    data.forEach((log: { feature: string }) => {
      const feature = log.feature;
      counts[feature] = (counts[feature] || 0) + 1;
    });

    return {
      user_id: userId,
      date: date.toISOString().split('T')[0],
      channel_analyses: counts['channel_analysis'] || 0,
      content_ideas: counts['content_ideas'] || 0,
      thumbnail_concepts: counts['thumbnail_generation'] || 0,
      scripts: counts['script_generation'] || 0,
      competitor_analyses: 0, // Tracked separately
      studio_simulations: counts['studio_simulation'] || 0,
      video_previews: counts['video_preview'] || 0,
    };
  }

  async checkFeatureAvailability(
    userId: string,
    tier: SubscriptionTier,
    feature: TokenFeature
  ): Promise<{ available: boolean; reason?: string; currentUsage?: number; limit?: number }> {
    const limits = PLAN_LIMITS[tier];
    const dailyUsage = await this.getDailyUsage(userId);

    // Check feature-specific limits
    switch (feature) {
      case 'channel_analysis':
        if (dailyUsage.channel_analyses >= limits.daily_channel_analyses) {
          return {
            available: false,
            reason: `Daily limit reached (${limits.daily_channel_analyses} analyses/day)`,
            currentUsage: dailyUsage.channel_analyses,
            limit: limits.daily_channel_analyses,
          };
        }
        break;

      case 'content_ideas':
        if (limits.monthly_content_ideas !== null) {
          const monthlyUsage = await this.getMonthlyUsage(userId, feature);
          if (monthlyUsage >= limits.monthly_content_ideas) {
            return {
              available: false,
              reason: `Monthly limit reached (${limits.monthly_content_ideas} ideas/month)`,
              currentUsage: monthlyUsage,
              limit: limits.monthly_content_ideas,
            };
          }
        }
        break;

      case 'script_generation':
        if (tier === 'free_trial') {
          return {
            available: false,
            reason: 'Script generation requires Standard plan or higher',
          };
        }
        if (limits.monthly_scripts !== null) {
          const monthlyUsage = await this.getMonthlyUsage(userId, feature);
          if (monthlyUsage >= limits.monthly_scripts) {
            return {
              available: false,
              reason: `Monthly limit reached (${limits.monthly_scripts} scripts/month)`,
              currentUsage: monthlyUsage,
              limit: limits.monthly_scripts,
            };
          }
        }
        break;

      case 'thumbnail_generation':
        if (limits.monthly_thumbnails !== null) {
          const monthlyUsage = await this.getMonthlyUsage(userId, feature);
          if (monthlyUsage >= limits.monthly_thumbnails) {
            return {
              available: false,
              reason: `Monthly limit reached (${limits.monthly_thumbnails} thumbnails/month)`,
              currentUsage: monthlyUsage,
              limit: limits.monthly_thumbnails,
            };
          }
        }
        break;

      case 'studio_simulation':
        if (!limits.studio_simulation) {
          return {
            available: false,
            reason: 'Studio simulation requires Standard plan or higher',
          };
        }
        break;

      case 'video_preview':
        if (!limits.monthly_video_previews) {
          return {
            available: false,
            reason: 'Video preview requires Standard plan or higher',
          };
        }
        const monthlyUsage = await this.getMonthlyUsage(userId, feature);
        if (monthlyUsage >= (limits.monthly_video_previews || 0)) {
          return {
            available: false,
            reason: `Monthly limit reached (${limits.monthly_video_previews} previews/month)`,
            currentUsage: monthlyUsage,
            limit: limits.monthly_video_previews || 0,
          };
        }
        break;
    }

    return { available: true };
  }

  private async getMonthlyUsage(userId: string, feature: TokenFeature): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const { count, error } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature', feature)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())
      .eq('success', true);

    if (error) {
      console.error('Error fetching monthly usage:', error);
      return 0;
    }

    return count || 0;
  }

  async expireOldTokens(userId: string): Promise<number> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: transactions, error } = await supabase
      .from('token_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'purchase')
      .lt('created_at', oneMonthAgo.toISOString())
      .not('metadata->expired', 'eq', 'true');

    if (error || !transactions?.length) {
      return 0;
    }

    const expiredAmount = transactions.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);

    // Deduct expired tokens
    const { data: balance } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (balance) {
      const newBalance = Math.max(0, balance.balance - expiredAmount);
      await supabase
        .from('token_balances')
        .update({
          balance: newBalance,
          last_reset_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }

    // Mark transactions as expired
    await supabase
      .from('token_transactions')
      .update({ metadata: { expired: true } })
      .eq('user_id', userId)
      .lt('created_at', oneMonthAgo.toISOString());

    return expiredAmount;
  }
}

export const tokenService = new TokenService();
