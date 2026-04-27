import { createServerClient } from '@supabase/ssr'
import { auth } from '@clerk/nextjs/server'
import { Database } from '@/types/supabase'

export async function createClient() {
  const { getToken } = await auth();
  const supabaseToken = await getToken({ template: 'supabase' });

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: supabaseToken ? { Authorization: `Bearer ${supabaseToken}` } : {},
      },
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          // Cookies are managed by Clerk now
        },
      },
    }
  )
}
