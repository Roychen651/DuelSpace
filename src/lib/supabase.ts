import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[DealSpace] Missing Supabase env vars. ' +
    'Copy .env.example → .env.local and fill in your project credentials.'
  )
}

// Singleton client — safe to import anywhere
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage so users stay logged in across tabs/devices
    persistSession: true,
    // Auto-refresh tokens 60 s before expiry — zero session drops
    autoRefreshToken: true,
    // Detect OAuth/magic-link tokens in the URL on load
    detectSessionInUrl: true,
    // Use PKCE flow for max security (prevents auth code interception)
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'dealspace',
    },
  },
})

/** Convenience: the current authenticated user id, or null */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}
