// Handles Supabase OAuth, magic-link, and admin impersonation redirects.
//
// Two modes:
// 1. PKCE code present (?code=…) — explicitly exchange the code and listen for
//    SIGNED_IN event before navigating. We CANNOT rely on `status` here because
//    the user might already be authenticated (e.g. admin impersonating a client
//    in a new tab that shares localStorage). `status === 'authenticated'` would
//    fire immediately with the WRONG user, before the code exchange completes.
//
// 2. No code — fall back to status-based navigation (OAuth hash tokens or
//    password-recovery flow handled by the Supabase client automatically).

import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const { status } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const code = searchParams.get('code')
  const didExchange = useRef(false)

  // ── Mode 1: PKCE code exchange ──────────────────────────────────────────────
  // When a code is present we must complete the exchange before navigating.
  // Listen for SIGNED_IN (only fires on real logins, not localStorage restores)
  // so we react to the correct user regardless of any pre-existing session.
  useEffect(() => {
    if (!code || didExchange.current) return
    didExchange.current = true

    // Subscribe before calling exchange so we never miss the event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        subscription.unsubscribe()
        navigate('/dashboard', { replace: true })
      }
    })

    // Kick off the exchange — detectSessionInUrl may also attempt it; whichever
    // wins will fire SIGNED_IN and trigger the navigation above.
    supabase.auth.exchangeCodeForSession(code).catch(() => {
      // If our explicit call lost the race, detectSessionInUrl already handled it
      // and SIGNED_IN will still fire via the subscription above.
    })

    // Safety timeout: if exchange never completes (invalid/expired code) go to /auth
    const fallback = setTimeout(() => {
      subscription.unsubscribe()
      navigate('/auth', { replace: true })
    }, 10_000)

    return () => {
      clearTimeout(fallback)
      subscription.unsubscribe()
    }
  }, [code, navigate])

  // ── Mode 2: no code — status-based (OAuth hash, password-recovery, etc.) ────
  useEffect(() => {
    if (code) return // handled above
    if (status === 'authenticated') navigate('/dashboard', { replace: true })
    else if (status === 'unauthenticated') navigate('/auth', { replace: true })
  }, [status, navigate, code])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#040608]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 rounded-full border-2 border-indigo-500/20"
          style={{ borderTopColor: '#818cf8', animation: 'ds-spin 0.9s linear infinite' }}
        />
        <style>{`@keyframes ds-spin { to { transform: rotate(360deg) } }`}</style>
        <p className="text-xs text-white/30">Completing sign in…</p>
      </div>
    </div>
  )
}
