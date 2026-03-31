import { useState, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { X, Building2, Palette, Rocket, Upload, Check, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '../../stores/useAuthStore'
import { supabase } from '../../lib/supabase'
import { useI18n } from '../../lib/i18n'
import { startDashboardTour } from '../../lib/tourEngine'

// ─── Brand color presets (same as Profile.tsx) ────────────────────────────────

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#1d4ed8',
]

const isValidHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v)

// ─── Animation variants ───────────────────────────────────────────────────────

const stepVariants: Variants = {
  enter:  { opacity: 0, x: 32, scale: 0.97 },
  center: { opacity: 1, x: 0,  scale: 1,   transition: { duration: 0.32, ease: 'easeOut' as const } },
  exit:   { opacity: 0, x: -28, scale: 0.97, transition: { duration: 0.22, ease: 'easeIn' as const } },
}

const stepVariantsBack: Variants = {
  enter:  { opacity: 0, x: -32, scale: 0.97 },
  center: { opacity: 1, x: 0,   scale: 1,   transition: { duration: 0.32, ease: 'easeOut' as const } },
  exit:   { opacity: 0, x: 28,  scale: 0.97, transition: { duration: 0.22, ease: 'easeIn' as const } },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  onClose: () => void
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const { user } = useAuthStore()
  const { locale } = useI18n()
  const isHe = locale === 'he'

  const [step, setStep]               = useState<1 | 2 | 3>(1)
  const [direction, setDirection]     = useState<1 | -1>(1)
  const [companyName, setCompanyName] = useState(
    (user?.user_metadata?.company_name as string | undefined) ?? ''
  )
  const [brandColor, setBrandColor]   = useState(
    (user?.user_metadata?.brand_color as string | undefined) ?? '#6366f1'
  )
  const [hexInput, setHexInput]       = useState(
    (user?.user_metadata?.brand_color as string | undefined) ?? '#6366f1'
  )
  const [logoFile, setLogoFile]       = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [launchClicked, setLaunchClicked] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? '').split(' ')[0] || ''

  function goNext() {
    setDirection(1)
    setStep(s => (s < 3 ? (s + 1) as 1 | 2 | 3 : s))
  }
  function goBack() {
    setDirection(-1)
    setStep(s => (s > 1 ? (s - 1) as 1 | 2 | 3 : s))
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleLaunch() {
    if (!user || saving) return
    setLaunchClicked(true)
    setSaving(true)
    try {
      let logoUrl = (user.user_metadata?.logo_url as string | undefined) ?? ''

      if (logoFile) {
        const ext = logoFile.name.split('.').pop() ?? 'png'
        const path = `logos/${user.id}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, logoFile, { upsert: true, contentType: logoFile.type })
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          logoUrl = urlData.publicUrl
        }
      }

      await supabase.auth.updateUser({
        data: {
          company_name: companyName.trim() || (user.user_metadata?.company_name ?? ''),
          brand_color: isValidHex(brandColor) ? brandColor : '#6366f1',
          logo_url: logoUrl,
          has_completed_onboarding: true,
        },
      })

      onClose()
      // Delay tour start so the wizard finishes its exit animation
      setTimeout(() => {
        startDashboardTour(locale as 'he' | 'en')
        supabase.rpc('mark_tour_seen').then(() => {})
      }, 500)
    } catch (_) {
      // On error, still close — don't block the user
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleSkip() {
    if (!user) { onClose(); return }
    // Mark onboarding done so they never see this again
    supabase.auth.updateUser({ data: { has_completed_onboarding: true } }).then(() => {})
    onClose()
  }

  const activeVariants = direction === 1 ? stepVariants : stepVariantsBack

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <motion.div
        className="fixed inset-0 z-[9998]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(18px)' }}
        onClick={handleSkip}
      />

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.38, ease: 'easeOut' as const }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="relative w-full max-w-[460px] rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(18,18,30,0.99) 0%, rgba(8,8,18,0.99) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
          dir={isHe ? 'rtl' : 'ltr'}
        >
          {/* Aurora glow top */}
          <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)', filter: 'blur(40px)' }} />
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)', filter: 'blur(32px)' }} />

          {/* ── Step indicator ─────────────────────────────────────────── */}
          <div className="relative flex items-center justify-between px-7 pt-7 pb-5">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(n => (
                <div
                  key={n}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: step === n ? 24 : 8,
                    height: 8,
                    background: step >= n
                      ? 'linear-gradient(90deg, #6366f1, #a855f7)'
                      : 'rgba(255,255,255,0.12)',
                    boxShadow: step === n ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white/25 hover:bg-white/5 hover:text-white/60 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Step content ───────────────────────────────────────────── */}
          <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                variants={activeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 px-7 pb-8"
              >
                {/* ── Step 1: Welcome ─────────────────────────────────── */}
                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <div
                        className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.14))',
                          border: '1px solid rgba(99,102,241,0.3)',
                          boxShadow: '0 0 24px rgba(99,102,241,0.25)',
                        }}
                      >
                        <Building2 size={24} className="text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                        {isHe
                          ? `ברוך הבא ל-DealSpace${firstName ? `, ${firstName}` : ''} 👋`
                          : `Welcome to DealSpace${firstName ? `, ${firstName}` : ''} 👋`}
                      </h2>
                      <p className="mt-2 text-[13.5px] text-white/45 leading-relaxed">
                        {isHe
                          ? 'בוא נגדיר את זהות העסק שלך — לוקח פחות מדקה.'
                          : 'Let\'s set up your business identity — takes under a minute.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">
                        {isHe ? 'שם החברה / עסק' : 'Company / Business Name'}
                      </label>
                      <input
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder={isHe ? 'לדוגמה: סטודיו רועי דיזיין' : 'e.g. Roy Design Studio'}
                        autoFocus
                        className="w-full rounded-xl px-4 py-3.5 text-[15px] text-white placeholder-white/25 outline-none transition-all duration-200"
                        style={{
                          background: '#0a0a0f',
                          border: '1px solid rgba(255,255,255,0.09)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)'
                          e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 3px rgba(99,102,241,0.12)'
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                          e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)'
                        }}
                      />
                      <p className="text-[11px] text-white/22">
                        {isHe ? 'יוצג בחדרי הדיל ובחוזים החתומים' : 'Shown in Deal Rooms and signed contracts'}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Brand ────────────────────────────────────── */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <div
                        className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(99,102,241,0.14))',
                          border: '1px solid rgba(168,85,247,0.3)',
                          boxShadow: '0 0 24px rgba(168,85,247,0.2)',
                        }}
                      >
                        <Palette size={24} className="text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {isHe ? 'הגדר את זהות המותג' : 'Set Your Brand Identity'}
                      </h2>
                      <p className="mt-2 text-[13.5px] text-white/45">
                        {isHe ? 'צבע ולוגו יופיעו בכל חדרי הדיל שלך.' : 'Color and logo appear in all your Deal Rooms.'}
                      </p>
                    </div>

                    {/* Color presets */}
                    <div>
                      <p className="mb-2.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                        {isHe ? 'צבע מותג' : 'Brand Color'}
                      </p>
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setBrandColor(c); setHexInput(c) }}
                            className="relative h-9 w-full rounded-xl transition-transform hover:scale-110 active:scale-95"
                            style={{
                              background: c,
                              boxShadow: brandColor === c
                                ? `0 0 0 2px rgba(255,255,255,0.15), 0 0 12px ${c}88`
                                : `0 2px 8px ${c}44`,
                              outline: brandColor === c ? `2px solid ${c}` : 'none',
                              outlineOffset: 2,
                            }}
                            aria-label={c}
                          >
                            {brandColor === c && (
                              <Check size={13} className="absolute inset-0 m-auto text-white" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }} />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          value={hexInput}
                          onChange={e => {
                            setHexInput(e.target.value)
                            if (isValidHex(e.target.value)) setBrandColor(e.target.value)
                          }}
                          placeholder="#6366f1"
                          maxLength={7}
                          className="flex-1 rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/25 outline-none transition-all"
                          style={{
                            background: '#0a0a0f',
                            border: `1px solid ${isValidHex(hexInput) ? hexInput + '50' : 'rgba(255,255,255,0.09)'}`,
                            fontFamily: 'monospace',
                          }}
                        />
                        <div
                          className="h-10 w-10 flex-none rounded-xl transition-all"
                          style={{
                            background: isValidHex(brandColor) ? brandColor : '#6366f1',
                            boxShadow: `0 0 14px ${brandColor}60`,
                            border: '2px solid rgba(255,255,255,0.12)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Logo upload */}
                    <div>
                      <p className="mb-2.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                        {isHe ? 'לוגו חברה (אופציונלי)' : 'Company Logo (optional)'}
                      </p>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleLogoChange}
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-all hover:bg-white/5"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px dashed rgba(255,255,255,0.12)',
                        }}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="logo preview" className="h-9 w-14 object-contain rounded-lg flex-none" />
                        ) : (
                          <div className="flex h-9 w-14 items-center justify-center rounded-lg flex-none"
                            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <Upload size={14} className="text-indigo-400" />
                          </div>
                        )}
                        <div className="text-start min-w-0">
                          <p className="text-[13px] font-semibold text-white/70">
                            {logoPreview
                              ? (isHe ? 'לחץ להחלפת לוגו' : 'Click to change logo')
                              : (isHe ? 'לחץ להעלאת לוגו' : 'Click to upload logo')}
                          </p>
                          <p className="text-[11px] text-white/28">
                            {isHe ? 'PNG / SVG / JPG — מומלץ 400×160px' : 'PNG / SVG / JPG — 400×160px recommended'}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Launch ───────────────────────────────────── */}
                {step === 3 && (
                  <div className="flex flex-col items-center text-center gap-6 pt-4">
                    {/* Animated checkmark orb */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                      className="relative flex h-24 w-24 items-center justify-center rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.14))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        boxShadow: '0 0 48px rgba(99,102,241,0.35)',
                      }}
                    >
                      {/* Orbit ring */}
                      <div className="absolute inset-0 rounded-full" style={{
                        border: '1px solid rgba(99,102,241,0.2)',
                        animation: 'ob-wizard-spin 8s linear infinite',
                      }} />
                      <div className="absolute rounded-full" style={{
                        width: 8, height: 8, top: -4, left: '50%', marginLeft: -4,
                        background: '#6366f1', boxShadow: '0 0 10px #6366f1',
                        animation: 'ob-wizard-spin 8s linear infinite',
                        transformOrigin: '4px 52px',
                      }} />
                      <Rocket size={32} className="text-indigo-400" />
                    </motion.div>

                    <style>{`
                      @keyframes ob-wizard-spin {
                        from { transform: rotate(0deg); }
                        to   { transform: rotate(360deg); }
                      }
                    `}</style>

                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                        {isHe ? '🎉 הכל מוכן!' : '🎉 You\'re all set!'}
                      </h2>
                      <p className="text-[13.5px] text-white/45 max-w-[300px] mx-auto leading-relaxed">
                        {isHe
                          ? 'פרופיל העסק שלך מוכן. לחץ כדי לסייר במערכת ולגלות את כל הכוח שב-DealSpace.'
                          : 'Your business profile is ready. Launch the guided tour to discover everything DealSpace can do for you.'}
                      </p>
                    </div>

                    {/* Brand preview chip */}
                    <div
                      className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
                      style={{
                        background: `${brandColor}14`,
                        border: `1px solid ${brandColor}30`,
                        boxShadow: `0 0 16px ${brandColor}18`,
                      }}
                    >
                      <div className="h-3 w-3 rounded-full flex-none" style={{ background: brandColor, boxShadow: `0 0 6px ${brandColor}` }} />
                      <span className="text-[13px] font-bold text-white/70">
                        {companyName.trim() || (isHe ? 'העסק שלך' : 'Your Business')}
                      </span>
                    </div>

                    {/* Launch CTA */}
                    <motion.button
                      onClick={handleLaunch}
                      disabled={saving}
                      className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-[15px] font-black text-white overflow-hidden"
                      style={{
                        background: saving
                          ? 'rgba(99,102,241,0.5)'
                          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a855f7 100%)',
                        boxShadow: saving ? 'none' : '0 0 32px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.4)',
                        cursor: saving ? 'wait' : 'pointer',
                      }}
                      whileHover={saving ? {} : { scale: 1.02 }}
                      whileTap={saving ? {} : { scale: 0.97, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                    >
                      {!saving && (
                        <span
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)',
                            animation: launchClicked ? 'none' : 'ob-shimmer 2.5s ease-in-out infinite',
                          }}
                        />
                      )}
                      <style>{`
                        @keyframes ob-shimmer {
                          0%        { transform: translateX(-120%); }
                          60%, 100% { transform: translateX(120%); }
                        }
                      `}</style>
                      {saving
                        ? <Loader2 size={18} className="animate-spin" />
                        : <Rocket size={18} />
                      }
                      {isHe
                        ? (saving ? 'שומר...' : 'התחל סיור מודרך ←')
                        : (saving ? 'Saving...' : 'Start Guided Tour →')}
                    </motion.button>

                    <button
                      type="button"
                      onClick={handleSkip}
                      className="text-[12px] text-white/22 hover:text-white/50 transition-colors"
                    >
                      {isHe ? 'דלג לעת עתה' : 'Skip for now'}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer nav (steps 1 & 2) ─────────────────────────────────── */}
          {step < 3 && (
            <div className="relative flex items-center justify-between px-7 pb-7 pt-2 gap-3">
              <button
                type="button"
                onClick={step === 1 ? handleSkip : goBack}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white/35 transition-all hover:bg-white/5 hover:text-white/65"
              >
                {step > 1 && (isHe ? <ChevronRight size={15} /> : <ChevronLeft size={15} />)}
                {step === 1
                  ? (isHe ? 'דלג' : 'Skip')
                  : (isHe ? 'הקודם' : 'Back')}
              </button>

              <motion.button
                type="button"
                onClick={goNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-black text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
              >
                {isHe ? 'המשך' : 'Continue'}
                {isHe ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
