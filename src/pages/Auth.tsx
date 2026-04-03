import { useState } from 'react'
import { motion, AnimatePresence, type Transition } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, Globe, CheckCircle2, XCircle, MailCheck } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import type { Locale } from '../lib/i18n'
import { evaluatePassword, validatePassword } from '../lib/passwordValidation'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode = 'signin' | 'signup' | 'magic' | 'forgot'

// ─── CSS animation helpers ────────────────────────────────────────────────────

const fadeUp = (delay = 0, duration = 0.45): React.CSSProperties => ({
  animation: `ds-fade-up ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
})

const fadeIn = (delay = 0): React.CSSProperties => ({
  animation: `ds-fade-in 0.4s ease-out ${delay}s both`,
})

const MODE_TRANSITION: Transition = { duration: 0.22, ease: 'easeOut' }

// ─── CSS Keyframes ────────────────────────────────────────────────────────────

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
      @keyframes ds-shimmer {
        0%   { transform: translateX(0); }
        100% { transform: translateX(500%); }
      }
      @keyframes ds-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes ds-shake {
        0%,100% { transform: translateX(0); }
        15%     { transform: translateX(-6px); }
        30%     { transform: translateX(6px); }
        45%     { transform: translateX(-4px); }
        60%     { transform: translateX(4px); }
        75%     { transform: translateX(-2px); }
        90%     { transform: translateX(2px); }
      }
    `}</style>
  )
}

// ─── Background — single blurred radial glow on pure black ───────────────────

function LinearBackground() {
  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden>
      <div className="absolute inset-0 bg-slate-50 dark:bg-black" />
      {/* Single centered glow — the only decoration */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 opacity-60 dark:opacity-100"
        style={{
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
    </div>
  )
}

// ─── Glass Card — true Linear/Notion glassmorphism ───────────────────────────

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-3xl p-8 sm:p-10
        bg-white/80 border border-slate-200/60 shadow-xl
        dark:bg-white/[0.02] dark:border-white/[0.05] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]"
      style={{
        backdropFilter: 'blur(48px)',
        WebkitBackdropFilter: 'blur(48px)',
      }}
    >
      {children}
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
      <label htmlFor={id} className="block text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-white/35">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-slate-300 dark:text-white/25">
          {icon}
        </span>
        <input
          id={id}
          className="w-full rounded-xl py-3 pe-10 ps-10 text-sm outline-none transition-all duration-200
            bg-slate-50 text-slate-900 placeholder-slate-300 border border-slate-200
            dark:bg-white/[0.03] dark:text-white dark:placeholder-white/20 dark:border-white/[0.07]
            focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10
            dark:focus:border-indigo-500/50 dark:focus:ring-indigo-500/8"
          style={{
            ...(error ? { borderColor: 'rgba(248,113,113,0.4)' } : {}),
          }}
          {...props}
        />
        {suffix && (
          <span className="absolute inset-y-0 end-3 flex items-center">{suffix}</span>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-xs"
            style={{ color: '#f87171' }}
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
      className="group relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        boxShadow: '0 0 24px rgba(99,102,241,0.3)',
      }}
      onMouseEnter={(e) => {
        const shimmer = e.currentTarget.querySelector<HTMLSpanElement>('[data-shimmer]')
        if (!shimmer) return
        shimmer.style.animation = 'none'
        void shimmer.offsetWidth // force reflow
        shimmer.style.animation = 'ds-shimmer 0.65s ease-out forwards'
      }}
    >
      <span
        data-shimmer=""
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-12deg] bg-white/20"
        style={{ animation: 'none' }}
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
      className="flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50
        bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300
        dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/70 dark:hover:bg-white/[0.07] dark:hover:border-white/[0.14]"
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
      <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.07]" />
      <span className="text-xs text-slate-300 dark:text-white/25">{label}</span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.07]" />
    </div>
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
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition
        border border-slate-200 bg-white/80 text-slate-400 hover:text-slate-600
        dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/40 dark:hover:text-white/75"
      aria-label={`Switch to ${other === 'he' ? 'עברית' : 'English'}`}
    >
      <Globe size={12} aria-hidden />
      {other === 'he' ? 'עברית' : 'English'}
    </button>
  )
}

// ─── Auth Tabs ────────────────────────────────────────────────────────────────

function AuthTabs({ active, onChange }: { active: 'signin' | 'signup'; onChange: (v: 'signin' | 'signup') => void }) {
  const { t, locale } = useI18n()
  // In RTL (Hebrew), flex items are visually reversed:
  // DOM[0]='signin' appears on the RIGHT, DOM[1]='signup' on the LEFT.
  // Indicator uses `left: 4` (physical left). So we flip the condition for RTL.
  const isRTL = locale === 'he'
  const indicatorX = (isRTL ? active === 'signup' : active === 'signin')
    ? 0
    : 'calc(100% + 4px)'

  return (
    <div
      className="relative flex rounded-xl p-1
        bg-slate-100 border border-slate-200
        dark:bg-white/[0.04] dark:border-white/[0.06]"
      role="tablist"
    >
      {(['signin', 'signup'] as const).map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className="relative z-10 flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-200"
          style={{ color: active === tab ? '#ffffff' : 'var(--text-tertiary)' }}
        >
          {t(`auth.tab.${tab}`)}
        </button>
      ))}
      <motion.div
        className="absolute inset-y-1 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          boxShadow: '0 0 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          width: 'calc(50% - 4px)',
          left: 4,
        }}
        animate={{ x: indicatorX }}
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
              className="transition" style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              aria-label={showPw ? t('auth.field.password.hide') : t('auth.field.password.show')}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          } />
      </div>
      <div style={fadeUp(0.18)} className="flex justify-end">
        <button type="button" onClick={onForgot}
          className="text-xs transition"
          style={{ color: 'rgba(99,102,241,0.7)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#a5b4fc' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(99,102,241,0.7)' }}>
          {t('auth.action.forgotPassword')}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            key={error}
            className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{ background: 'rgba(248,113,113,0.09)', border: '1px solid rgba(248,113,113,0.28)', animation: 'ds-shake 0.4s ease-out' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={MODE_TRANSITION} role="alert">
            <XCircle size={15} className="mt-0.5 flex-none" style={{ color: '#f87171' }} />
            <p className="text-xs leading-relaxed" style={{ color: '#f87171' }}>{t(error) || error}</p>
          </motion.div>
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
          className="text-xs transition"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
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
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {bars.map(i => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= score - 1 ? color : 'rgba(255,255,255,0.08)' }}
            />
          ))}
        </div>
        <span className="text-[10px] font-medium" style={{ color }}>
          {locale === 'he' ? evaluatePassword(password).label_he : label_en}
        </span>
      </div>
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
  const { signInWithGoogle } = useAuthStore()
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPw, setShowPw]             = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [fieldErrors, setFieldErrors]   = useState<{ name?: string; email?: string; password?: string }>({})
  const [loading, setLoading]           = useState(false)
  const [formError, setFormError]       = useState<string | null>(null)
  const [checkEmail, setCheckEmail]     = useState(false)
  const isHe = locale === 'he'

  const validate = () => {
    const errs: typeof fieldErrors = {}
    if (!name.trim()) errs.name = isHe ? 'שדה חובה' : 'Required'
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = t('auth.error.generic')
    const pwError = validatePassword(password)
    if (pwError) errs.password = t(pwError)
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    setLoading(false)

    if (error) {
      setFormError(error.message)
      return
    }

    // Email Enumeration Protection: Supabase returns a fake success with empty
    // identities array when the email already exists in the system.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setFormError(
        isHe
          ? 'כתובת המייל הזו כבר רשומה במערכת. אנא התחברו או השתמשו בגוגל.'
          : 'This email is already registered. Please sign in or use Google.'
      )
      return
    }

    setCheckEmail(true)
  }

  // ── "Check Your Email" success state ─────────────────────────────────────
  if (checkEmail) {
    return (
      <motion.div
        className="flex flex-col items-center gap-6 py-2 text-center"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        {/* Glowing mail icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.08 }}
          className="flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,197,94,0.12))',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 0 56px rgba(99,102,241,0.35), 0 0 96px rgba(34,197,94,0.08)',
          }}
        >
          <MailCheck size={34} style={{ color: '#818cf8' }} />
        </motion.div>

        <div className="space-y-2.5">
          <h2 className="text-[22px] font-black tracking-tight text-white">
            {isHe ? 'בדקו את תיבת המייל' : 'Check your inbox'}
          </h2>
          <p className="mx-auto max-w-[290px] text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {isHe
              ? `שלחנו קישור אימות ל־${email}. לחצו עליו כדי להפעיל את החשבון ולהתחיל לסגור עסקאות.`
              : `We've sent a verification link to ${email}. Click it to activate your account and start closing deals.`}
          </p>
        </div>

        <div
          className="w-full rounded-xl px-4 py-3 text-[11.5px] leading-relaxed"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.28)',
          }}
        >
          {isHe ? 'לא קיבלתם? בדקו גם בתיקיית הספאם.' : "Didn't receive it? Check your spam folder too."}
        </div>

        <button
          type="button"
          onClick={() => setCheckEmail(false)}
          className="text-sm transition"
          style={{ color: 'rgba(99,102,241,0.7)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#a5b4fc' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(99,102,241,0.7)' }}
        >
          {isHe ? '← חזרה להתחברות' : '← Back to sign in'}
        </button>
      </motion.div>
    )
  }

  // ── Sign Up Form ──────────────────────────────────────────────────────────
  return (
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
              className="transition" style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              aria-label={showPw ? t('auth.field.password.hide') : t('auth.field.password.show')}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          } />
        <AnimatePresence>
          {password && <PasswordStrengthMeter password={password} locale={locale} />}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {formError && (
          <motion.div
            key={formError}
            className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{ background: 'rgba(248,113,113,0.09)', border: '1px solid rgba(248,113,113,0.28)', animation: 'ds-shake 0.4s ease-out' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={MODE_TRANSITION} role="alert">
            <XCircle size={15} className="mt-0.5 flex-none" style={{ color: '#f87171' }} />
            <p className="text-xs leading-relaxed" style={{ color: '#f87171' }}>{formError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Compliance checkbox — mandatory, Israeli Privacy Protection Regulations ── */}
      <div style={fadeUp(0.19)}>
        <label className="flex cursor-pointer select-none items-start gap-3 group" dir={isHe ? 'rtl' : 'ltr'}>
          <div className="relative mt-0.5 flex-none">
            <input type="checkbox" className="sr-only" checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)} aria-required="true" />
            <div
              className="flex h-4 w-4 items-center justify-center rounded transition-all duration-150"
              style={{
                background: termsAccepted ? '#6366f1' : 'rgba(255,255,255,0.04)',
                border: termsAccepted ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: termsAccepted ? '0 0 10px rgba(99,102,241,0.35)' : 'none',
              }}
            >
              {termsAccepted && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden>
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {isHe ? (
              <>
                קראתי והסכמתי ל
                <a href="/terms" target="_blank" rel="noopener noreferrer"
                  className="underline transition-colors" style={{ color: 'rgba(165,170,255,0.75)' }}
                  onClick={e => e.stopPropagation()}>תנאי השימוש</a>
                {' '}ול
                <a href="/privacy" target="_blank" rel="noopener noreferrer"
                  className="underline transition-colors" style={{ color: 'rgba(165,170,255,0.75)' }}
                  onClick={e => e.stopPropagation()}>מדיניות הפרטיות</a>
                {' '}של DealSpace
              </>
            ) : (
              <>
                I have read and agree to DealSpace&apos;s{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer"
                  className="underline transition-colors" style={{ color: 'rgba(165,170,255,0.75)' }}
                  onClick={e => e.stopPropagation()}>Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer"
                  className="underline transition-colors" style={{ color: 'rgba(165,170,255,0.75)' }}
                  onClick={e => e.stopPropagation()}>Privacy Policy</a>
              </>
            )}
          </span>
        </label>
      </div>

      <div style={fadeUp(0.22)}>
        <PrimaryButton loading={loading} disabled={!termsAccepted}>
          {loading ? t('auth.action.signUp.loading') : <>{t('auth.action.signUp')} <ArrowRight size={15} /></>}
        </PrimaryButton>
      </div>
      <div style={fadeUp(0.27)}><OrDivider label={t('auth.divider.or')} /></div>
      <div style={fadeUp(0.30)}>
        <GoogleButton onClick={signInWithGoogle} loading={loading} label={t('auth.action.google')} />
      </div>
    </form>
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
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Zap size={24} style={{ color: '#818cf8' }} />
        </div>
        <div>
          <p className="font-semibold text-white">{t('auth.action.magicLink.sent')}</p>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('auth.success.magicLink')}</p>
        </div>
        <button type="button" onClick={onBack}
          className="text-sm transition" style={{ color: 'rgba(99,102,241,0.7)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#a5b4fc' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(99,102,241,0.7)' }}>
          {t('auth.action.backToSignIn')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm" style={{ ...fadeIn(0.05), color: 'rgba(255,255,255,0.45)' }}>{t('auth.page.subtitle')}</p>
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
        <button type="button" onClick={onBack}
          className="text-xs transition" style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
          {t('auth.action.switchToPassword')}
        </button>
      </div>
    </form>
  )
}

// ─── Forgot Password Form ─────────────────────────────────────────────────────

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { t, locale } = useI18n()
  const { sendPasswordResetEmail, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const isHe = locale === 'he'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError(); setLoading(true)
    await sendPasswordResetEmail(email)
    setLoading(false)
    setSent(true) // Always show success — don't leak whether the email exists
  }

  if (sent) {
    return (
      <motion.div
        className="space-y-5"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' as const }}
      >
        {/* Green success banner */}
        <div
          className="rounded-2xl px-5 py-6 text-center"
          style={{
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.2)',
            boxShadow: '0 0 40px rgba(34,197,94,0.06), inset 0 1px 0 rgba(34,197,94,0.1)',
          }}
        >
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <MailCheck size={22} style={{ color: '#4ade80' }} />
          </div>
          <p className="font-bold text-white mb-1.5">
            {isHe ? 'קישור נשלח!' : 'Recovery link sent!'}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isHe
              ? 'שלחנו לך קישור לשחזור סיסמה למייל. אנא בדוק גם בתיקיית הספאם.'
              : 'Please check your email — and your spam folder too.'}
          </p>
        </div>

        <div className="text-center">
          <button type="button" onClick={onBack}
            className="text-sm transition" style={{ color: 'rgba(99,102,241,0.7)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#a5b4fc' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(99,102,241,0.7)' }}>
            {t('auth.action.backToSignIn')}
          </button>
        </div>
      </motion.div>
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
        <button type="button" onClick={onBack}
          className="text-xs transition" style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
          {t('auth.action.backToSignIn')}
        </button>
      </div>
    </form>
  )
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────

export default function AuthPage() {
  const { t, dir, locale } = useI18n()
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
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12"
      dir={dir}
      lang={dir === 'rtl' ? 'he' : 'en'}
      style={{ background: '#000000' }}
    >
      <GlobalStyles />
      <LinearBackground />

      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4" style={fadeIn(0)}>
        <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 14px rgba(99,102,241,0.35)' }}
          >
            <Zap size={13} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">{t('brand.name')}</span>
        </a>
        <LangToggle />
      </header>

      {/* Card */}
      <main className="relative z-10 w-full max-w-md">
        <div style={fadeUp(0.08)}>
          <GlassCard>
            {/* Card logo + title */}
            <div className="mb-8 text-center">
              <div
                className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.12))',
                  border: '1px solid rgba(99,102,241,0.2)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.15)',
                }}
              >
                <Zap size={19} style={{ color: '#818cf8' }} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
                {showTabs ? t('brand.name') : formTitle[mode]}
              </h1>
              <p className="text-sm text-slate-400 dark:text-white/35">
                {showTabs
                  ? (tab === 'signin'
                      ? (locale === 'he' ? 'ברוך שובך' : 'Welcome back')
                      : (locale === 'he' ? 'יצירת חשבון חדש' : 'Create your account'))
                  : (mode === 'forgot'
                      ? (locale === 'he' ? 'אפס את הסיסמה שלך' : 'Reset your password')
                      : (locale === 'he' ? 'כניסה ללא סיסמה' : 'Sign in without a password'))}
              </p>
            </div>

            {showTabs && (
              <div className="mb-6">
                <AuthTabs active={tab} onChange={handleTabChange} />
              </div>
            )}

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

        <p className="mt-6 text-center text-[10px] text-slate-300 dark:text-white/15" style={fadeIn(0.3)}>
          {t('footer.legal')}
        </p>
      </main>
    </div>
  )
}
