import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
export type PlanTier = 'free' | 'pro' | 'unlimited'

interface AuthState {
  user: User | null
  session: Session | null
  status: AuthStatus
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
  deleteAccount: () => Promise<void>
  clearError: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      session: null,
      status: 'idle',
      error: null,

      // ── Initialize: called once on app mount ──────────────────────────────
      initialize: async () => {
        set({ status: 'loading' })

        // Subscribe FIRST to avoid race: if getSession() resolves after the
        // onAuthStateChange INITIAL_SESSION event, we'd briefly show unauthenticated.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          // PASSWORD_RECOVERY is handled by ResetPassword.tsx directly — skip here
          if (event === 'PASSWORD_RECOVERY') return

          set({
            session,
            user: session?.user ?? null,
            status: session ? 'authenticated' : 'unauthenticated',
            error: null,
          })
        })

        // Then hydrate from storage (triggers INITIAL_SESSION which fires the subscription)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          set({ status: 'unauthenticated', error: error.message })
          subscription.unsubscribe()
          return
        }

        // Set immediately — the subscription may not have fired yet on first load
        set({
          session,
          user: session?.user ?? null,
          status: session ? 'authenticated' : 'unauthenticated',
        })
      },

      // ── Email + Password sign in ──────────────────────────────────────────
      signInWithEmail: async (email, password) => {
        set({ status: 'loading', error: null })

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          set({ status: 'unauthenticated', error: formatAuthError(error) })
          return
        }

        set({
          user: data.user,
          session: data.session,
          status: 'authenticated',
          error: null,
        })
      },

      // ── Email + Password sign up ──────────────────────────────────────────
      signUpWithEmail: async (email, password, fullName) => {
        set({ status: 'loading', error: null })

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              // Immutable audit trail — Israeli Privacy Protection Regulations compliance
              accepted_terms_at: new Date().toISOString(),
            },
            emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
          },
        })

        if (error) {
          set({ status: 'unauthenticated', error: formatAuthError(error) })
          return
        }

        // If email confirmation is required, user will be null until confirmed
        set({
          user: data.user,
          session: data.session,
          status: data.session ? 'authenticated' : 'unauthenticated',
          error: null,
        })
      },

      // ── Google OAuth ──────────────────────────────────────────────────────
      signInWithGoogle: async () => {
        set({ status: 'loading', error: null })

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        })

        if (error) {
          set({ status: 'unauthenticated', error: formatAuthError(error) })
        }
        // Success: Supabase redirects the browser — onAuthStateChange handles the rest
      },

      // ── Magic Link ────────────────────────────────────────────────────────
      sendMagicLink: async (email) => {
        set({ status: 'loading', error: null })

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
          },
        })

        if (error) {
          set({ status: 'unauthenticated', error: formatAuthError(error) })
          return
        }

        // Stay on current status — user must click link in email
        set({ status: 'unauthenticated', error: null })
      },

      // ── Password Reset ────────────────────────────────────────────────────
      sendPasswordResetEmail: async (email) => {
        set({ error: null })

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${import.meta.env.VITE_APP_URL}/auth/reset-password`,
        })

        if (error) {
          set({ error: formatAuthError(error) })
        }
      },

      // ── Sign Out ──────────────────────────────────────────────────────────
      signOut: async () => {
        set({ status: 'loading' })
        await supabase.auth.signOut()
        set({ user: null, session: null, status: 'unauthenticated', error: null })
      },

      // ── Update Profile ────────────────────────────────────────────────────
      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return

        const { data, error } = await supabase.auth.updateUser({
          data: updates,
        })

        if (error) {
          set({ error: formatAuthError(error) })
          return
        }

        set({ user: data.user })
      },

      // ── Update Password ───────────────────────────────────────────────────
      updatePassword: async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) return { error: formatAuthError(error) }
        set({ user: data.user })
        return { error: null }
      },

      // ── Delete Account ────────────────────────────────────────────────────
      deleteAccount: async () => {
        const { user } = get()
        if (!user) return

        // Call a Supabase Edge Function or RPC to delete user data + auth record
        const { error } = await supabase.rpc('delete_user_account')

        if (error) {
          set({ error: error.message })
          return
        }

        await supabase.auth.signOut()
        set({ user: null, session: null, status: 'unauthenticated' })
      },

      // ── Clear Error ───────────────────────────────────────────────────────
      clearError: () => set({ error: null }),
    }),
    { name: 'DealSpace:Auth' }
  )
)

// ─── Tier selector ───────────────────────────────────────────────────────────
// Reads plan_tier from user_metadata reactively. Defaults to 'free' if missing.
// Usage: const tier = useTier()

export const useTier = (): PlanTier => useAuthStore(s => {
  const raw = s.user?.user_metadata?.plan_tier as string | undefined
  if (raw === 'pro' || raw === 'unlimited') return raw
  return 'free'
})

export const FREE_PROPOSAL_LIMIT = 5

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAuthError(error: AuthError): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'auth.error.invalidCredentials',
    'Email not confirmed': 'auth.error.emailNotConfirmed',
    'User already registered': 'auth.error.userExists',
    'Password should be at least 6 characters': 'auth.error.passwordTooShort',
  }
  return map[error.message] ?? error.message
}
