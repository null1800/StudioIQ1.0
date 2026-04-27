import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Edge function to expire old tokens and reset monthly usages
// To be run via pg_cron or Supabase Edge Functions scheduling

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // 1. Get all active unexpired purchases older than 1 month
    const { data: expiredTransactions, error: fetchError } = await supabaseClient
      .from('token_transactions')
      .select('id, user_id, amount')
      .eq('type', 'purchase')
      .lt('created_at', oneMonthAgo.toISOString())
      .not('metadata->expired', 'eq', 'true')

    if (fetchError) throw fetchError

    if (expiredTransactions && expiredTransactions.length > 0) {
      // Group by user
      const userExpirations = expiredTransactions.reduce((acc: any, t: any) => {
        if (!acc[t.user_id]) acc[t.user_id] = 0;
        acc[t.user_id] += t.amount;
        return acc;
      }, {});

      // Apply deductions
      for (const [userId, amount] of Object.entries(userExpirations)) {
        // Deduct from balance
        const { data: currentBalance } = await supabaseClient
          .from('token_balances')
          .select('balance')
          .eq('user_id', userId)
          .single()
        
        if (currentBalance) {
          const newBalance = Math.max(0, currentBalance.balance - (amount as number));
          await supabaseClient
            .from('token_balances')
            .update({ 
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      }

      // Mark transactions as expired
      const txIds = expiredTransactions.map((t: any) => t.id);
      await supabaseClient
        .from('token_transactions')
        .update({ metadata: { expired: true } })
        .in('id', txIds);
    }

    // 2. Reset standard limits (just logic here as an example)
    // Could track resetting logic if needed

    return new Response(
      JSON.stringify({ success: true, expiredCount: expiredTransactions?.length || 0 }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
