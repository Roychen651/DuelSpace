// Handles Supabase OAuth and magic-link redirects.
// Supabase's PKCE flow + detectSessionInUrl:true auto-exchanges the code.
// We just wait for the session and redirect to dashboard.

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

export default function AuthCallback() {
  const { status } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/dashboard', { replace: true })
    } else if (status === 'unauthenticated') {
      navigate('/auth', { replace: true })
    }
  }, [status, navigate])

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
