// Admin impersonation landing page.
// Opened in a new tab by UserOpsDrawer with ?email=...&otp=... params.
// Calls verifyOtp directly — no redirect chain, no PKCE ambiguity,
// no race with an existing admin session in localStorage.

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ImpersonateCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const email = searchParams.get('email')
    const otp   = searchParams.get('otp')

    if (!email || !otp) {
      setErrorMsg('Missing impersonation parameters.')
      return
    }

    supabase.auth
      .verifyOtp({ email, token: otp, type: 'email' })
      .then(({ error }) => {
        if (error) {
          setErrorMsg(error.message)
        } else {
          navigate('/dashboard', { replace: true })
        }
      })
      .catch((e: unknown) => {
        setErrorMsg(e instanceof Error ? e.message : 'Unknown error')
      })
  }, []) // run once on mount — params don't change

  if (errorMsg) {
    return (
      <div style={{ background: '#040608', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: '#f87171', fontSize: 14, marginBottom: 16 }}>⚠ Impersonation failed: {errorMsg}</p>
          <a href="/auth" style={{ color: '#818cf8', fontSize: 13 }}>Back to login →</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#040608', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Signing in as user…</p>
      </div>
    </div>
  )
}
