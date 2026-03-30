import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, Zap, CheckCircle2, XCircle, Globe } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import type { Locale } from '../lib/i18n'
import { evaluatePassword, validatePassword } from '../lib/passwordValidation'

// ─── CSS helpers (mirrors Auth.tsx) ──────────────────────────────────────────

const fadeUp = (delay = 0): React.CSSProperties => ({
  animation: `rp-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
})

// ─── Password Strength Meter ──────────────────────────────────────────────────

function PasswordStrengthMeter({ password, isHe }: { password: string; isHe: boolean }) {
  if (!password) return null
  const { score, color, label_en, label_he, rules } = evaluatePassword(password)
  return (
    <motion.div
      className="mt-2 space-y-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= score - 1 ? color : 'rgba(255,255,255,0.08)' }}
            />
          ))}
        </div>
        <span className="text-[10px] font-medium" style={{ color }}>
          {isHe ? label_he : label_en}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {rules.map(rule => (
          <div key={rule.key} className="flex items-center gap-1">
            {rule.met
              ? <CheckCircle2 size={10} className="shrink-0" style={{ color: '#22c55e' }} />
              : <XCircle    size={10} className="shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />}
            <span className="text-[10px]" style={{ color: rule.met ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}>
              {isHe ? rule.label_he : rule.label_en}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Language Toggle ──────────────────────────────────────────────────────────

function LangToggle() {
  const { locale, setLocale } = useI18n()
  const other: Locale = locale === 'he' ? 'en' : 'he'
  return (
    <button
      type="button"
      onClick={() => setLocale(other)}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)' }}
      onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
      aria-label={`Switch to ${other === 'he' ? 'עברית' : 'English'}`}
    >
      <Globe size={12} aria-hidden />
      {other === 'he' ? 'עברית' : 'English'}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResetPassword() {
  const navigate    = useNavigate()
  const { updatePassword } = useAuthStore()
  const { locale, dir, t } = useI18n()
  const isHe = locale === 'he'

  const [password,     setPassword]     = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [done,         setDone]         = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  // Supabase sends the token in the URL hash.
  // onAuthStateChange fires with event=PASSWORD_RECOVERY when it processes the hash.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const pwError = validatePassword(password)
    if (pwError) { setError(t(pwError)); return }

    setLoading(true)
    const result = await updatePassword(password)
    setLoading(false)

    if (result.error) { setError(result.error); return }
    setDone(true)
    setTimeout(() => navigate('/dashboard'), 2800)
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12"
      dir={dir}
      lang={dir === 'rtl' ? 'he' : 'en'}
      style={{ background: '#000000' }}
    >
      <style>{`
        @keyframes rp-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rp-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes rp-shake {
          0%,100% { transform: translateX(0); }
          15%     { transform: translateX(-6px); }
          30%     { transform: translateX(6px); }
          45%     { transform: translateX(-4px); }
          60%     { transform: translateX(4px); }
          75%     { transform: translateX(-2px); }
          90%     { transform: translateX(2px); }
        }
        @keyframes rp-pop {
          0%   { opacity: 0; transform: scale(0.6); }
          60%  { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: '#000000' }} />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4"
          style={{
            width: 700, height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4" style={fadeUp(0)}>
        <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 14px rgba(99,102,241,0.35)' }}
          >
            <Zap size={13} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">{t('brand.name')}</span>
        </a>
        <LangToggle />
      </header>

      {/* Card */}
      <main className="relative z-10 w-full max-w-md">
        <motion.div
          className="w-full rounded-3xl p-8 sm:p-10"
          style={{
            background:       'rgba(255,255,255,0.02)',
            border:           '1px solid rgba(255,255,255,0.05)',
            backdropFilter:   'blur(48px)',
            WebkitBackdropFilter: 'blur(48px)',
            boxShadow:        '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {/* Card header */}
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.12))',
                border:     '1px solid rgba(99,102,241,0.2)',
                boxShadow:  '0 0 20px rgba(99,102,241,0.15)',
              }}
            >
              <Zap size={19} style={{ color: '#818cf8' }} />
            </div>
            <h1 className="text-xl font-bold text-white mb-0.5">
              {isHe ? 'הגדרת סיסמה חדשה' : 'Set New Password'}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isHe ? 'בחר סיסמה חזקה לחשבונך' : 'Choose a strong password for your account'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              /* ── Success state ── */
              <motion.div
                key="done"
                className="flex flex-col items-center gap-4 py-4 text-center"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' as const }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    background:  'rgba(34,197,94,0.1)',
                    border:      '1px solid rgba(34,197,94,0.25)',
                    boxShadow:   '0 0 32px rgba(34,197,94,0.15)',
                    animation:   'rp-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  }}
                >
                  <CheckCircle2 size={28} style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white mb-1">
                    {isHe ? 'הסיסמה עודכנה!' : 'Password updated!'}
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {isHe ? 'מעביר אותך ללוח הבקרה…' : 'Redirecting to your dashboard…'}
                  </p>
                </div>
                {/* Animated progress bar */}
                <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.6, ease: 'linear' as const }}
                  />
                </div>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Verifying banner */}
                {!sessionReady && (
                  <div
                    className="rounded-xl px-3 py-2.5 text-xs text-center"
                    style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}
                  >
                    {isHe ? 'מאמת קישור לאיפוס סיסמה…' : 'Verifying reset link…'}
                  </div>
                )}

                {/* Password field */}
                <div className="space-y-1.5" style={fadeUp(0.05)}>
                  <label
                    htmlFor="rp-password"
                    className="block text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {isHe ? 'סיסמה חדשה' : 'New Password'}
                  </label>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                    >
                      <Lock size={15} />
                    </span>
                    <input
                      id="rp-password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={isHe ? 'לפחות 8 תווים' : 'Min. 8 characters'}
                      autoComplete="new-password"
                      className="w-full rounded-xl py-3 pe-10 ps-10 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border:     error ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.07)',
                      }}
                      onFocus={e => {
                        if (!error) {
                          e.currentTarget.style.border     = '1px solid rgba(99,102,241,0.5)'
                          e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(99,102,241,0.08)'
                        }
                      }}
                      onBlur={e => {
                        e.currentTarget.style.border    = error ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.07)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute inset-y-0 end-3 flex items-center transition"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                      aria-label={showPw ? (isHe ? 'הסתר סיסמה' : 'Hide password') : (isHe ? 'הצג סיסמה' : 'Show password')}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {password && <PasswordStrengthMeter password={password} isHe={isHe} />}
                  </AnimatePresence>
                </div>

                {/* Error badge */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      key={error}
                      className="rounded-xl px-3 py-2.5 text-xs"
                      style={{
                        background: 'rgba(248,113,113,0.07)',
                        border:     '1px solid rgba(248,113,113,0.15)',
                        color:      '#f87171',
                        animation:  'rp-shake 0.4s ease-out',
                      }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      role="alert"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div style={fadeUp(0.12)}>
                  <button
                    type="submit"
                    disabled={loading || !sessionReady}
                    className="group relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                      boxShadow:  '0 0 24px rgba(99,102,241,0.3)',
                    }}
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <span
                          className="h-4 w-4 rounded-full border-2 border-white/30"
                          style={{ borderTopColor: 'white', animation: 'rp-spin 0.8s linear infinite' }}
                        />
                      ) : (isHe ? 'עדכן סיסמה' : 'Update Password')}
                    </span>
                  </button>
                </div>

                <div className="text-center" style={fadeUp(0.16)}>
                  <a
                    href="/auth"
                    className="text-xs transition"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                  >
                    {isHe ? 'חזרה לדף הכניסה' : 'Back to sign in'}
                  </a>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="mt-6 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          {t('footer.legal')}
        </p>
      </main>
    </div>
  )
}
