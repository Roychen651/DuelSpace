import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Zap, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuthStore()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  // Supabase sends the token in the URL hash. onAuthStateChange fires with
  // event=PASSWORD_RECOVERY when it processes the hash automatically.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const result = await updatePassword(password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setDone(true)
    setTimeout(() => navigate('/dashboard'), 2500)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4" style={{ background: '#000000' }}>
      {/* glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2"
        style={{ width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <motion.div
        className="relative z-10 w-full max-w-sm rounded-3xl p-8"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(48px)' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Zap size={19} style={{ color: '#818cf8' }} />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Set New Password</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Choose a strong password for your account</p>
        </div>

        {done ? (
          <motion.div className="flex flex-col items-center gap-3 py-4"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <Check size={24} style={{ color: '#4ade80' }} />
            </div>
            <p className="text-white font-semibold">Password updated!</p>
            <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Redirecting to your dashboard…</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!sessionReady && (
              <div className="rounded-xl px-3 py-2.5 text-xs text-center" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                Verifying reset link…
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>New Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-2xl py-3 ps-10 pe-10 text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)' }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute inset-y-0 end-3 flex items-center transition"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl px-3 py-2.5 text-xs" style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !sessionReady}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
            >
              {loading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30" style={{ borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
                : 'Update Password'
              }
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </form>
        )}
      </motion.div>
    </div>
  )
}
