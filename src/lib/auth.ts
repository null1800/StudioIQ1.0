import { createClient } from '@/utils/supabase/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { UserProfile, SubscriptionTier } from '@/types';
import { isTrialExpired, getDaysRemaining } from './utils';

export class AuthService {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      const supabase = await createClient();
      
      // Try to fetch existing profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUser.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // User doesn't exist in Supabase yet, provision them
        return await this.provisionNewUser(clerkUser);
      }

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Check trial expiration
      if (profile.tier === 'free_trial' && isTrialExpired(profile.trial_ends_at)) {
        await this.updateUserTier(profile.id, 'standard');
        profile.tier = 'standard';
      }

      return profile as UserProfile;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  private async provisionNewUser(clerkUser: any): Promise<UserProfile | null> {
    try {
      const supabase = await createClient();
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      const email = clerkUser.emailAddresses[0]?.emailAddress || 'no-email@example.com';
      const displayName = clerkUser.firstName 
        ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() 
        : email.split('@')[0];

      const newProfile = {
        id: clerkUser.id,
        email: email,
        display_name: displayName,
        avatar_url: clerkUser.imageUrl || null,
        tier: 'free_trial' as SubscriptionTier,
        trial_ends_at: trialEndsAt.toISOString(),
      };

      // Insert Profile
      const { error: insertError } = await supabase.from('users').insert({
        ...newProfile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error provisioning profile:', insertError);
        return null;
      }

      // Initialize Token Balance
      await supabase.from('token_balances').insert({
        user_id: clerkUser.id,
        balance: 20, // Starting tokens
        lifetime_earned: 20,
        lifetime_spent: 0,
        last_reset_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return newProfile as UserProfile;
    } catch (error) {
      console.error('Error provisioning user:', error);
      return null;
    }
  }

  async updateUserTier(userId: string, tier: SubscriptionTier): Promise<boolean> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('users')
        .update({
          tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Update tier error:', error);
      return false;
    }
  }

  async updateProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url'>>
  ): Promise<boolean> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  async getTrialStatus(userId: string): Promise<{
    isActive: boolean;
    daysRemaining: number;
    endsAt: string | null;
  }> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users')
        .select('tier, trial_ends_at')
        .eq('id', userId)
        .single();

      if (error || !data || data.tier !== 'free_trial') {
        return { isActive: false, daysRemaining: 0, endsAt: null };
      }

      const isActive = !isTrialExpired(data.trial_ends_at);
      const daysRemaining = getDaysRemaining(data.trial_ends_at);

      return { isActive, daysRemaining, endsAt: data.trial_ends_at };
    } catch (error) {
      console.error('Get trial status error:', error);
      return { isActive: false, daysRemaining: 0, endsAt: null };
    }
  }
}

export const authService = new AuthService();
