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
import { Zap } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const { status } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { locale } = useI18n()
  const isHe = locale === 'he'

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#040608]">
      <style>{`
        @keyframes cb-spin { to { transform: rotate(360deg) } }
        @keyframes cb-pulse { 0%,100% { opacity: 0.45 } 50% { opacity: 1 } }
      `}</style>

      {/* Brand mark */}
      <div
        className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          boxShadow: '0 0 32px rgba(99,102,241,0.4)',
        }}
      >
        <Zap size={20} className="text-white" />
      </div>

      {/* Spinner */}
      <div className="relative mb-5 flex h-11 w-11 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
        />
        <div
          className="h-10 w-10 rounded-full border-2"
          style={{
            borderColor: 'rgba(99,102,241,0.15)',
            borderTopColor: '#818cf8',
            animation: 'cb-spin 0.9s linear infinite',
          }}
        />
      </div>

      {/* Text */}
      <p
        className="text-sm font-semibold text-white/70"
        style={{ animation: 'cb-pulse 2s ease-in-out infinite' }}
      >
        {isHe ? 'מאמת את החשבון...' : 'Verifying your account...'}
      </p>
      <p className="mt-1.5 text-xs text-white/25">
        {isHe ? 'זה ייקח רגע' : 'This will just take a moment'}
      </p>
    </div>
  )
}
