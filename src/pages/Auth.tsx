import { useState, useEffect } from 'react'
import { motion, AnimatePresence, type Transition } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, Globe, CheckCircle2, XCircle } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import type { Locale } from '../lib/i18n'
import { evaluatePassword, validatePassword } from '../lib/passwordValidation'

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode = 'signin' | 'signup' | 'magic' | 'forgot'

// ─── CSS animation helpers ─────────────────────────────────────────────────────
// Using CSS animations (not framer-motion initial/animate) for entrance effects
// so content is ALWAYS visible on first render regardless of React version.

const fadeUp = (delay = 0, duration = 0.45): React.CSSProperties => ({
  animation: `ds-fade-up ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
})

const fadeIn = (delay = 0): React.CSSProperties => ({
  animation: `ds-fade-in 0.4s ease-out ${delay}s both`,
})

// Mode-switch transitions (between signin/signup/magic/forgot) — safe to use
// framer-motion here because these don't run on first render.
const MODE_TRANSITION: Transition = { duration: 0.22, ease: 'easeOut' }

// ─── Aurora Background ────────────────────────────────────────────────────────

function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Deep base */}
      <div className="absolute inset-0 bg-[#040608]" />
      {/* Aurora orbs — pure CSS animations */}
      <div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'ds-float-a 18s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 h-[700px] w-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'ds-float-b 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 65%)',
          filter: 'blur(50px)',
          animation: 'ds-pulse-scale 12s ease-in-out infinite',
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

// ─── CSS Keyframes (injected once) ───────────────────────────────────────────

function GlobalStyles() {
  return (
    <style>{`
      @keyframes ds-fade-up {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes ds-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes ds-float-a {
        0%, 100% { transform: translate(0, 0); }
        50%      { transform: translate(60px, 40px); }
      }
      @keyframes ds-float-b {
        0%, 100% { transform: translate(0, 0); }
        50%      { transform: translate(-50px, -60px); }
      }
      @keyframes ds-pulse-scale {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50%      { transform: translate(-50%, -50%) scale(1.15); }
      }
      @keyframes ds-shimmer {
        0%   { transform: translateX(-100%) skewX(12deg); }
        100% { transform: translateX(200%) skewX(12deg); }
      }
      @keyframes ds-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes ds-tab-bounce {
        0%, 100% { transform: scaleX(1); }
        50%      { transform: scaleX(0.96); }
      }
    `}</style>
  )
}

// ─── Glow Border Card ─────────────────────────────────────────────────────────

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow border */}
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.55) 0%, rgba(212,175,55,0.3) 50%, rgba(168,85,247,0.45) 100%)',
          opacity: 0.7,
        }}
        aria-hidden
      />
      {/* Glass body */}
      <div
        className="relative rounded-2xl p-8"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Input Field ──────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: React.ReactNode
  error?: string
  suffix?: React.ReactNode
}

function AuthInput({ label, icon, error, suffix, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-white/50 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-white/30">
          {icon}
        </span>
        <input
          id={id}
          className={[
            'w-full rounded-xl border bg-white/5 py-3 pe-10 ps-10 text-sm text-white placeholder-white/20',
            'outline-none transition-all duration-200',
            'focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20',
            error ? 'border-red-400/50' : 'border-white/10',
          ].join(' ')}
          {...props}
        />
        {suffix && (
          <span className="absolute inset-y-0 end-3 flex items-center">{suffix}</span>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-xs text-red-400"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={MODE_TRANSITION}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Primary Button ───────────────────────────────────────────────────────────

function PrimaryButton({
  children, loading, onClick, type = 'submit', disabled,
}: {
  children: React.ReactNode; loading?: boolean; onClick?: () => void
  type?: 'submit' | 'button'; disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="group relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        boxShadow: '0 0 30px rgba(99,102,241,0.35)',
      }}
    >
      {/* Shimmer sweep */}
      <span
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/15"
        style={{ animation: 'none' }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.animation = 'ds-shimmer 0.7s ease-out forwards'
          el.addEventListener('animationend', () => { el.style.animation = 'none' }, { once: true })
        }}
        aria-hidden
      />
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <span
            className="h-4 w-4 rounded-full border-2 border-white/30"
            style={{ borderTopColor: 'white', animation: 'ds-spin 0.8s linear infinite' }}
          />
        ) : children}
      </span>
    </button>
  )
}

// ─── Google Button ────────────────────────────────────────────────────────────

function GoogleButton({ onClick, loading, label }: { onClick: () => void; loading?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white/20 hover:bg-white/8 active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? (
        <span
          className="h-4 w-4 rounded-full border-2 border-white/30"
          style={{ borderTopColor: 'white', animation: 'ds-spin 0.8s linear infinite' }}
        />
      ) : <GoogleIcon />}
      {label}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs text-white/30">{label}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div
      className={[
        'fixed top-4 end-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-xl',
        type === 'success'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-red-500/30 bg-red-500/10 text-red-300',
      ].join(' ')}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={MODE_TRANSITION}
      role="alert"
      aria-live="polite"
    >
      {message}
    </motion.div>
  )
}

// ─── Language Switcher ────────────────────────────────────────────────────────

function LangToggle() {
  const { locale, setLocale } = useI18n()
  const other: Locale = locale === 'he' ? 'en' : 'he'
  return (
    <button
      type="button"
      onClick={() => setLocale(other)}
      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white/80"
      aria-label={`Switch to ${other === 'he' ? 'עברית' : 'English'}`}
    >
      <Globe size={12} aria-hidden />
      {other === 'he' ? 'עברית' : 'English'}
    </button>
  )
}

// ─── Auth Tabs ────────────────────────────────────────────────────────────────

function AuthTabs({ active, onChange }: { active: 'signin' | 'signup'; onChange: (v: 'signin' | 'signup') => void }) {
  const { t } = useI18n()
  return (
    <div className="relative flex rounded-xl border border-white/10 bg-white/5 p-1" role="tablist">
      {(['signin', 'signup'] as const).map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className="relative z-10 flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-200"
          style={{ color: active === tab ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
        >
          {t(`auth.tab.${tab}`)}
        </button>
      ))}
      <motion.div
        className="absolute inset-y-1 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          boxShadow: '0 0 22px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
          width: 'calc(50% - 4px)',
          left: 4,
        }}
        animate={{ x: active === 'signin' ? 0 : 'calc(100% + 4px)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      />
    </div>
  )
}

// ─── Sign In Form ─────────────────────────────────────────────────────────────

function SignInForm({ onForgot, onMagic }: { onForgot: () => void; onMagic: () => void }) {
  const { t } = useI18n()
  const { signInWithEmail, signInWithGoogle, status, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const loading = status === 'loading'

  const validate = () => {
    const errs: typeof fieldErrors = {}
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = t('auth.error.generic')
    if (!password || password.length < 6) errs.password = t('auth.error.passwordTooShort')
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    if (!validate()) return
    await signInWithEmail(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div style={fadeUp(0.05)}>
        <AuthInput id="signin-email" label={t('auth.field.email')} type="email"
          autoComplete="email" placeholder={t('auth.field.email.placeholder')}
          value={email} onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={15} />} error={fieldErrors.email} />
      </div>
      <div style={fadeUp(0.12)}>
        <AuthInput id="signin-password" label={t('auth.field.password')}
          type={showPw ? 'text' : 'password'} autoComplete="current-password"
          placeholder={t('auth.field.password.placeholder')}
          value={password} onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={15} />} error={fieldErrors.password}
          suffix={
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="text-white/30 transition hover:text-white/60"
              aria-label={showPw ? t('auth.field.password.hide') : t('auth.field.password.show')}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          } />
      </div>
      <div style={fadeUp(0.18)} className="flex justify-end">
        <button type="button" onClick={onForgot}
          className="text-xs text-indigo-400/80 transition hover:text-indigo-300">
          {t('auth.action.forgotPassword')}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0 }} transition={MODE_TRANSITION} role="alert">
            {t(error) || error}
          </motion.p>
        )}
      </AnimatePresence>

      <div style={fadeUp(0.22)}>
        <PrimaryButton loading={loading}>
          {loading ? t('auth.action.signIn.loading') : <>{t('auth.action.signIn')} <ArrowRight size={15} /></>}
        </PrimaryButton>
      </div>

      <div style={fadeUp(0.28)}><OrDivider label={t('auth.divider.or')} /></div>
      <div style={fadeUp(0.32)}>
        <GoogleButton onClick={signInWithGoogle} loading={loading} label={t('auth.action.google')} />
      </div>
      <div style={fadeUp(0.36)} className="text-center">
        <button type="button" onClick={onMagic}
          className="text-xs text-white/40 transition hover:text-white/70 underline-offset-2 hover:underline">
          {t('auth.action.switchToMagicLink')}
        </button>
      </div>
    </form>
  )
}

// ─── Password Strength Meter ──────────────────────────────────────────────────

function PasswordStrengthMeter({ password, locale }: { password: string; locale: string }) {
  if (!password) return null
  const { score, color, label_en, rules } = evaluatePassword(password)
  const bars = [0, 1, 2, 3]

  return (
    <motion.div
      className="mt-2 space-y-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {bars.map(i => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= score - 1 ? color : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
        <span className="text-[10px] font-medium" style={{ color }}>
          {locale === 'he' ? evaluatePassword(password).label_he : label_en}
        </span>
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-2 gap-1">
        {rules.map(rule => (
          <div key={rule.key} className="flex items-center gap-1">
            {rule.met
              ? <CheckCircle2 size={10} className="shrink-0" style={{ color: '#22c55e' }} />
              : <XCircle size={10} className="shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
            }
            <span className="text-[10px]" style={{ color: rule.met ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}>
              {locale === 'he' ? rule.label_he : rule.label_en}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Sign Up Form ─────────────────────────────────────────────────────────────

function SignUpForm() {
  const { t, locale } = useI18n()
  const { signUpWithEmail, signInWithGoogle, status, error, clearError } = useAuthStore()
  const [toast, setToast] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const loading = status === 'loading'

  const validate = () => {
    const errs: typeof fieldErrors = {}
    if (!name.trim()) errs.name = locale === 'he' ? 'שדה חובה' : 'Required'
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = t('auth.error.generic')
    const pwError = validatePassword(password)
    if (pwError) errs.password = t(pwError)
    setFieldErrors(errs); return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    if (!validate()) return
    await signUpWithEmail(email, password, name)
    if (!error) setToast(t('auth.success.signUp'))
  }

  return (
    <>
      <AnimatePresence>
        {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div style={fadeUp(0.05)}>
          <AuthInput id="signup-name" label={t('auth.field.fullName')} type="text"
            autoComplete="name" placeholder={t('auth.field.fullName.placeholder')}
            value={name} onChange={(e) => setName(e.target.value)}
            icon={<User size={15} />} error={fieldErrors.name} />
        </div>
        <div style={fadeUp(0.10)}>
          <AuthInput id="signup-email" label={t('auth.field.email')} type="email"
            autoComplete="email" placeholder={t('auth.field.email.placeholder')}
            value={email} onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={15} />} error={fieldErrors.email} />
        </div>
        <div style={fadeUp(0.15)}>
          <AuthInput id="signup-password" label={t('auth.field.password')}
            type={showPw ? 'text' : 'password'} autoComplete="new-password"
            placeholder={t('auth.field.password.placeholder')}
            value={password} onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={15} />} error={fieldErrors.password}
            suffix={
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="text-white/30 transition hover:text-white/60"
                aria-label={showPw ? t('auth.field.password.hide') : t('auth.field.password.show')}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            } />
          <AnimatePresence>
            {password && <PasswordStrengthMeter password={password} locale={locale} />}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0 }} transition={MODE_TRANSITION} role="alert">
              {t(error) || error}
            </motion.p>
          )}
        </AnimatePresence>

        <div style={fadeUp(0.20)}>
          <PrimaryButton loading={loading}>
            {loading ? t('auth.action.signUp.loading') : <>{t('auth.action.signUp')} <ArrowRight size={15} /></>}
          </PrimaryButton>
        </div>
        <div style={fadeUp(0.25)}><OrDivider label={t('auth.divider.or')} /></div>
        <div style={fadeUp(0.28)}>
          <GoogleButton onClick={signInWithGoogle} loading={loading} label={t('auth.action.google')} />
        </div>
        <p style={fadeUp(0.32)} className="text-center text-[10px] text-white/25 leading-relaxed">
          {t('auth.legal.agree')}{' '}
          <a href="/terms" className="underline hover:text-white/50">{t('auth.legal.terms')}</a>
          {' '}{t('auth.legal.and')}{' '}
          <a href="/privacy" className="underline hover:text-white/50">{t('auth.legal.privacy')}</a>
        </p>
      </form>
    </>
  )
}

// ─── Magic Link Form ──────────────────────────────────────────────────────────

function MagicLinkForm({ onBack }: { onBack: () => void }) {
  const { t } = useI18n()
  const { sendMagicLink, status, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const loading = status === 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    await sendMagicLink(email)
    if (!error) setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-5 text-center" style={fadeUp(0)}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-500/30">
          <Zap size={24} className="text-indigo-400" />
        </div>
        <div>
          <p className="font-semibold text-white">{t('auth.action.magicLink.sent')}</p>
          <p className="mt-1 text-sm text-white/40">{t('auth.success.magicLink')}</p>
        </div>
        <button type="button" onClick={onBack} className="text-sm text-indigo-400/80 hover:text-indigo-300">
          {t('auth.action.backToSignIn')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-white/50" style={fadeIn(0.05)}>{t('auth.page.subtitle')}</p>
      <div style={fadeUp(0.10)}>
        <AuthInput id="magic-email" label={t('auth.field.email')} type="email"
          autoComplete="email" placeholder={t('auth.field.email.placeholder')}
          value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={15} />} />
      </div>
      <div style={fadeUp(0.15)}>
        <PrimaryButton loading={loading}>
          {loading ? t('auth.action.magicLink.loading') : <><Zap size={15} /> {t('auth.action.magicLink')}</>}
        </PrimaryButton>
      </div>
      <div style={fadeUp(0.20)} className="text-center">
        <button type="button" onClick={onBack} className="text-xs text-white/40 hover:text-white/70">
          {t('auth.action.switchToPassword')}
        </button>
      </div>
    </form>
  )
}

// ─── Forgot Password Form ─────────────────────────────────────────────────────

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { t } = useI18n()
  const { sendPasswordResetEmail, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError(); setLoading(true)
    await sendPasswordResetEmail(email)
    setLoading(false)
    if (!error) setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center" style={fadeUp(0)}>
        <p className="text-sm text-white/70">{t('auth.action.resetPassword.sent')}</p>
        <button type="button" onClick={onBack} className="text-sm text-indigo-400/80 hover:text-indigo-300">
          {t('auth.action.backToSignIn')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div style={fadeUp(0.05)}>
        <AuthInput id="forgot-email" label={t('auth.field.email')} type="email"
          autoComplete="email" placeholder={t('auth.field.email.placeholder')}
          value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={15} />} />
      </div>
      <div style={fadeUp(0.10)}>
        <PrimaryButton loading={loading}>
          {loading ? t('auth.action.resetPassword.loading') : t('auth.action.resetPassword')}
        </PrimaryButton>
      </div>
      <div style={fadeUp(0.14)} className="text-center">
        <button type="button" onClick={onBack} className="text-xs text-white/40 hover:text-white/70">
          {t('auth.action.backToSignIn')}
        </button>
      </div>
    </form>
  )
}

// ─── Brand Panel ──────────────────────────────────────────────────────────────

function BrandPanel() {
  const { t } = useI18n()
  return (
    <div className="hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Logo */}
      <div className="flex items-center gap-2" style={fadeUp(0.05)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
          <Zap size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">{t('brand.name')}</span>
      </div>

      {/* Hero copy */}
      <div className="space-y-6" style={fadeUp(0.15)}>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
          {t('auth.page.title')}
        </h1>
        <p className="text-base leading-relaxed text-white/40">{t('auth.page.subtitle')}</p>
        <div className="flex flex-wrap gap-2">
          {['Interactive Proposals', 'Real-Time Analytics', 'Deal Rooms', 'Auto-Upsell'].map((f, i) => (
            <span key={f}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50"
              style={fadeIn(0.3 + i * 0.08)}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <p className="text-xs text-white/25" style={fadeIn(0.5)}>{t('auth.social.trusted')}</p>
    </div>
  )
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────

export default function AuthPage() {
  const { t, dir } = useI18n()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [mode, setMode] = useState<AuthMode>('signin')

  const handleTabChange = (newTab: 'signin' | 'signup') => {
    setTab(newTab)
    setMode(newTab)
  }

  const showTabs = mode === 'signin' || mode === 'signup'

  const formTitle: Record<AuthMode, string> = {
    signin: t('auth.tab.signin'),
    signup: t('auth.tab.signup'),
    magic: t('auth.action.magicLink'),
    forgot: t('auth.action.forgotPassword'),
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden" dir={dir} lang={dir === 'rtl' ? 'he' : 'en'}>
      <GlobalStyles />
      <AuroraBackground />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6" style={fadeIn(0)}>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white">{t('brand.name')}</span>
        </div>
        <div className="ms-auto"><LangToggle /></div>
      </header>

      {/* Main layout */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <BrandPanel />

            {/* Auth card — visible immediately, no opacity-0 initial */}
            <div className="w-full" style={fadeUp(0.08)}>
              <GlassCard>
                {showTabs && (
                  <div className="mb-6">
                    <AuthTabs active={tab} onChange={handleTabChange} />
                  </div>
                )}
                {!showTabs && (
                  <div className="mb-6">
                    <p className="text-lg font-semibold text-white">{formTitle[mode]}</p>
                  </div>
                )}

                {/* Mode transitions — safe to use framer-motion here (not first render) */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={MODE_TRANSITION}
                  >
                    {mode === 'signin' && <SignInForm onForgot={() => setMode('forgot')} onMagic={() => setMode('magic')} />}
                    {mode === 'signup' && <SignUpForm />}
                    {mode === 'magic' && <MagicLinkForm onBack={() => setMode('signin')} />}
                    {mode === 'forgot' && <ForgotPasswordForm onBack={() => setMode('signin')} />}
                  </motion.div>
                </AnimatePresence>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      {/* Legal footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-4 text-center" style={fadeIn(0.4)}>
        <p className="text-[11px] leading-relaxed text-white/20">{t('footer.legal')}</p>
        <p className="mt-1 text-[10px] text-white/15">{t('footer.rights')}</p>
      </footer>
    </div>
  )
}
