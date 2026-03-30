import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Camera, Check, Eye, EyeOff, CheckCircle2, XCircle, Percent, Building2, Hash, MapPin, Phone, PenTool, Palette } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'
import { evaluatePassword } from '../lib/passwordValidation'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { InfoTip } from '../components/ui/InfoTip'

// ─── Section card ─────────────────────────────────────────────────────────────

function Card({ children, title, icon, tip }: { children: React.ReactNode; title: string; icon: React.ReactNode; tip?: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-7"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}
        >
          {icon}
        </div>
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest">{title}</h2>
        {tip}
      </div>
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = 'text', placeholder, suffix, disabled, error,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; suffix?: React.ReactNode
  disabled?: boolean; error?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 disabled:opacity-40"
          style={{
            background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
            border: error ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          onFocus={e => { if (!error && !disabled) { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.06)' } }}
          onBlur={e => { e.currentTarget.style.border = error ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
        />
        {suffix && <span className="absolute inset-y-0 end-3 flex items-center">{suffix}</span>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p className="text-xs" style={{ color: '#f87171' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Save button ──────────────────────────────────────────────────────────────

function SaveButton({ loading, saved, label = 'Save Changes' }: { loading: boolean; saved: boolean; label?: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      style={{
        background: saved
          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        boxShadow: saved ? '0 0 20px rgba(34,197,94,0.35)' : '0 0 20px rgba(99,102,241,0.35)',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-white/30" style={{ borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
      ) : saved ? (
        <><Check size={14} strokeWidth={3} />{label === 'Save Changes' ? 'Saved!' : label}</>
      ) : label}
    </motion.button>
  )
}

// ─── Password Strength ────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const { score, color, label_en, rules } = evaluatePassword(password)
  return (
    <motion.div className="mt-2 space-y-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= score - 1 ? color : 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
        <span className="text-[10px] font-medium" style={{ color }}>{label_en}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {rules.map(r => (
          <div key={r.key} className="flex items-center gap-1">
            {r.met ? <CheckCircle2 size={10} style={{ color: '#22c55e' }} /> : <XCircle size={10} style={{ color: 'rgba(255,255,255,0.2)' }} />}
            <span className="text-[10px]" style={{ color: r.met ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}>{r.label_en}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Avatar upload ────────────────────────────────────────────────────────────

function AvatarUpload({ user }: { user: { name: string; email: string; avatarUrl?: string } }) {
  const { updateProfile } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(user.avatarUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    const ext = file.name.split('.').pop()
    const path = `avatars/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar_url: data.publicUrl })
    }
    setUploading(false)
  }, [updateProfile])

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div
          className="h-20 w-20 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-black text-white"
          style={{ background: preview ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
        >
          {preview ? <img src={preview} alt={user.name} className="h-full w-full object-cover" /> : initials || <User size={28} />}
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
            <span className="h-5 w-5 rounded-full border-2 border-white/30" style={{ borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-base font-bold text-white mb-0.5">{user.name || user.email}</h3>
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.email}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
        >
          <Camera size={12} />
          Change Photo
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>
    </div>
  )
}

// ─── Brand Color Picker ───────────────────────────────────────────────────────

function ColorSwatch({ hex, selected, onClick }: { hex: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 w-8 rounded-xl transition-all"
      style={{
        background: hex,
        border: selected ? `2px solid white` : '2px solid transparent',
        boxShadow: selected ? `0 0 12px ${hex}80` : 'none',
        transform: selected ? 'scale(1.15)' : 'scale(1)',
      }}
      aria-label={hex}
    />
  )
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#1d4ed8',
]

// ─── Main Profile ─────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, updateProfile, updatePassword } = useAuthStore()
  const { locale } = useI18n()
  const isHe = locale === 'he'

  const name = (user?.user_metadata?.full_name as string | undefined) ?? ''
  const email = user?.email ?? ''
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  // ── Display name form ─────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(name)
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameSaving(true)
    await updateProfile({ full_name: displayName })
    setNameSaving(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2500)
  }

  // ── Business identity ─────────────────────────────────────────────────────
  const [biz, setBiz] = useState({
    company_name:   (user?.user_metadata?.company_name  as string | undefined) ?? '',
    tax_id:         (user?.user_metadata?.tax_id         as string | undefined) ?? '',
    address:        (user?.user_metadata?.address        as string | undefined) ?? '',
    phone:          (user?.user_metadata?.phone          as string | undefined) ?? '',
    signatory_name: (user?.user_metadata?.signatory_name as string | undefined) ?? '',
  })
  const [bizSaving, setBizSaving] = useState(false)
  const [bizSaved,  setBizSaved]  = useState(false)

  const handleSaveBiz = async (e: React.FormEvent) => {
    e.preventDefault()
    setBizSaving(true)
    const { error } = await supabase.auth.updateUser({ data: biz })
    setBizSaving(false)
    if (!error) { setBizSaved(true); setTimeout(() => setBizSaved(false), 2500) }
  }

  // ── Brand color ───────────────────────────────────────────────────────────
  const [brandColor, setBrandColor] = useState<string>(
    (user?.user_metadata?.brand_color as string | undefined) ?? '#6366f1'
  )
  const [colorSaved, setColorSaved] = useState(false)

  const handleSaveColor = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ data: { brand_color: brandColor } })
    if (!error) { setColorSaved(true); setTimeout(() => setColorSaved(false), 2500) }
  }

  // ── VAT rate ──────────────────────────────────────────────────────────────
  const [vatRateInput, setVatRateInput] = useState(() => {
    const stored = localStorage.getItem('dealspace:vat-rate')
    const v = stored ? parseFloat(stored) : 0.18
    return String(Math.round((isNaN(v) ? 0.18 : v) * 100))
  })
  const [vatSaved, setVatSaved] = useState(false)

  const handleSaveVat = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(vatRateInput)
    if (isNaN(val) || val < 0 || val > 100) return
    localStorage.setItem('dealspace:vat-rate', String(val / 100))
    setVatSaved(true)
    setTimeout(() => setVatSaved(false), 2500)
  }

  // ── Password form ─────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwSaving(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPw })
    if (signInError) { setPwError('Current password is incorrect'); setPwSaving(false); return }
    const result = await updatePassword(newPw)
    setPwSaving(false)
    if (result.error) { setPwError(result.error); return }
    setPwSaved(true)
    setCurrentPw(''); setNewPw('')
    setTimeout(() => setPwSaved(false), 2500)
  }

  // Keep biz state in sync if user metadata changes externally
  useEffect(() => {
    if (!user) return
    setBiz({
      company_name:   (user.user_metadata?.company_name   as string | undefined) ?? '',
      tax_id:         (user.user_metadata?.tax_id          as string | undefined) ?? '',
      address:        (user.user_metadata?.address         as string | undefined) ?? '',
      phone:          (user.user_metadata?.phone           as string | undefined) ?? '',
      signatory_name: (user.user_metadata?.signatory_name  as string | undefined) ?? '',
    })
    setBrandColor((user.user_metadata?.brand_color as string | undefined) ?? '#6366f1')
  }, [user])

  if (!user) return null

  return (
    <div className="min-h-dvh" dir={isHe ? 'rtl' : 'ltr'} style={{ background: '#030305' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes ds-fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-10 space-y-5">

        {/* ── Avatar + name banner ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' as const }}>
          <Card title={isHe ? 'הזהות שלי' : 'Your Identity'} icon={<User size={16} />}>
            <AvatarUpload user={{ name, email, avatarUrl }} />
          </Card>
        </motion.div>

        {/* ── Display name ───────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.5, ease: 'easeOut' as const }}>
          <Card title={isHe ? 'שם תצוגה' : 'Display Name'} icon={<Mail size={16} />}>
            <form onSubmit={handleSaveName} className="space-y-4">
              <Field label={isHe ? 'שם מלא' : 'Full Name'} value={displayName} onChange={setDisplayName} placeholder={isHe ? 'שמך המלא' : 'Your full name'} />
              <Field label={isHe ? 'כתובת אימייל' : 'Email Address'} value={email} onChange={() => {}} disabled placeholder="your@email.com" />
              <div className="flex justify-end pt-1">
                <SaveButton loading={nameSaving} saved={nameSaved} label={isHe ? 'שמור שם' : 'Save Name'} />
              </div>
            </form>
          </Card>
        </motion.div>

        {/* ── Business Identity ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.5, ease: 'easeOut' as const }}>
          <Card title={isHe ? 'זהות עסקית' : 'Business Identity'} icon={<Building2 size={16} />}>
            <p className="text-xs text-white/35 -mt-2 mb-4 leading-relaxed">
              {isHe
                ? 'פרטים אלה יוזרקו אוטומטית לחוזים ולקבצי PDF שלך — מלא פעם אחת, לעולם לא תצטרך להקליד שוב.'
                : 'These details are automatically injected into your contracts and PDFs — fill once, never type again.'}
            </p>
            <form onSubmit={handleSaveBiz} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field
                    label={isHe ? 'שם חברה / עסק משפטי' : 'Legal Company / Business Name'}
                    value={biz.company_name}
                    onChange={v => setBiz(b => ({ ...b, company_name: v }))}
                    placeholder={isHe ? 'למשל: צילומי כהן בע"מ' : 'e.g. Cohen Studios Ltd.'}
                  />
                </div>
                <Field
                  label={isHe ? 'ח.פ. / עוסק מורשה / ת.ז' : 'Tax ID / Business No.'}
                  value={biz.tax_id}
                  onChange={v => setBiz(b => ({ ...b, tax_id: v }))}
                  placeholder={isHe ? '123456789' : '123456789'}
                  suffix={<Hash size={13} style={{ color: 'rgba(255,255,255,0.25)' }} />}
                />
                <Field
                  label={isHe ? 'טלפון ליצירת קשר' : 'Contact Phone'}
                  value={biz.phone}
                  onChange={v => setBiz(b => ({ ...b, phone: v }))}
                  placeholder={isHe ? '050-000-0000' : '+972-50-000-0000'}
                  suffix={<Phone size={13} style={{ color: 'rgba(255,255,255,0.25)' }} />}
                />
                <div className="sm:col-span-2">
                  <Field
                    label={isHe ? 'כתובת עסק מלאה' : 'Full Business Address'}
                    value={biz.address}
                    onChange={v => setBiz(b => ({ ...b, address: v }))}
                    placeholder={isHe ? 'רחוב, עיר, מיקוד' : 'Street, City, ZIP'}
                    suffix={<MapPin size={13} style={{ color: 'rgba(255,255,255,0.25)' }} />}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label={isHe ? 'שם מורשה חתימה' : 'Authorized Signatory Name'}
                    value={biz.signatory_name}
                    onChange={v => setBiz(b => ({ ...b, signatory_name: v }))}
                    placeholder={isHe ? 'שם מלא של החותם המורשה' : 'Full name of authorized signer'}
                    suffix={<PenTool size={13} style={{ color: 'rgba(255,255,255,0.25)' }} />}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <SaveButton loading={bizSaving} saved={bizSaved} label={isHe ? 'שמור פרטי עסק' : 'Save Business Info'} />
              </div>
            </form>
          </Card>
        </motion.div>

        {/* ── Brand Color ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20, duration: 0.5, ease: 'easeOut' as const }}>
          <Card
            title={isHe ? 'צבע מותג' : 'Brand Color'}
            icon={<Palette size={16} />}
            tip={<InfoTip content={isHe ? 'הצבע שיעטוף את חדר העסקאות שלכם וייצור חוויה ממותגת אישית.' : 'The color that themes your entire Deal Room — button, sliders, and glow effects.'} />}
          >
            <p className="text-xs text-white/35 -mt-2 mb-4 leading-relaxed">
              {isHe
                ? 'הצבע יופיע בחדר הדיל של הלקוח — כפתור האישור, הסליידרים ואפקטי הגלו.'
                : 'This color appears in your client\'s Deal Room — approve button, sliders, and glow effects.'}
            </p>
            <form onSubmit={handleSaveColor} className="space-y-4">
              {/* Preset swatches */}
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(hex => (
                  <ColorSwatch key={hex} hex={hex} selected={brandColor === hex} onClick={() => setBrandColor(hex)} />
                ))}
              </div>
              {/* Custom hex + native picker */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={brandColor}
                    onChange={e => {
                      const v = e.target.value
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBrandColor(v)
                    }}
                    className="w-full rounded-2xl px-4 py-3 ps-11 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                    onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                    onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                    placeholder="#6366f1"
                    maxLength={7}
                  />
                  {/* Color preview circle */}
                  <span
                    className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-lg border border-white/20"
                    style={{ background: /^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : '#6366f1' }}
                  />
                </div>
                {/* Native color picker */}
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : '#6366f1'}
                    onChange={e => setBrandColor(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl transition"
                    style={{
                      background: /^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : '#6366f1',
                      boxShadow: `0 0 16px ${/^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : '#6366f1'}60`,
                    }}
                  >
                    <Palette size={16} className="text-white/80" />
                  </div>
                </label>
                <SaveButton loading={false} saved={colorSaved} label={isHe ? 'שמור צבע' : 'Save Color'} />
              </div>
              {/* Preview */}
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: /^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : '#6366f1', boxShadow: `0 0 8px ${brandColor}80` }}
                />
                <span className="text-[11px] text-white/40">
                  {isHe ? 'תצוגה מקדימה של הצבע בחדר הדיל' : 'Preview of your brand color in Deal Room'}
                </span>
                <div
                  className="ms-auto rounded-lg px-3 py-1 text-[11px] font-bold text-white"
                  style={{ background: /^#[0-9a-fA-F]{6}$/.test(brandColor) ? `${brandColor}30` : 'rgba(99,102,241,0.2)', border: `1px solid ${/^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : '#6366f1'}40` }}
                >
                  {isHe ? 'אשר ✓' : 'Approve ✓'}
                </div>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* ── Password ───────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27, duration: 0.5, ease: 'easeOut' as const }}>
          <Card title={isHe ? 'אבטחה' : 'Security'} icon={<Lock size={16} />}>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <Field
                label={isHe ? 'סיסמה נוכחית' : 'Current Password'}
                type={showCurrent ? 'text' : 'password'}
                value={currentPw}
                onChange={setCurrentPw}
                placeholder="••••••••"
                suffix={
                  <button type="button" onClick={() => setShowCurrent(v => !v)}
                    className="transition" style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}>
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <div>
                <Field
                  label={isHe ? 'סיסמה חדשה' : 'New Password'}
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={setNewPw}
                  placeholder={isHe ? 'מינימום 8 תווים' : 'Min. 8 characters'}
                  suffix={
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="transition" style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'white' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}>
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                <AnimatePresence>
                  {newPw && <PasswordStrength password={newPw} />}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {pwError && (
                  <motion.p className="rounded-xl px-3 py-2.5 text-xs"
                    style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}>
                    {pwError}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex justify-end pt-1">
                <SaveButton loading={pwSaving} saved={pwSaved} label={isHe ? 'עדכן סיסמה' : 'Update Password'} />
              </div>
            </form>
          </Card>
        </motion.div>

        {/* ── VAT Rate ───────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.5, ease: 'easeOut' as const }}>
          <Card
            title={isHe ? 'שיעור מע"מ' : 'VAT Rate'}
            icon={<Percent size={16} />}
            tip={<InfoTip content={isHe ? 'שיעור המע״מ המוגדר כאן ישמש בכל ההצעות שבהן תפעיל את הטוגל. ניתן לשנות בכל עת.' : 'The VAT rate set here is used in all proposals where you enable the VAT toggle. Change anytime.'} />}
          >
            <form onSubmit={handleSaveVat} className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {isHe
                  ? 'שיעור המע״מ הנוכחי בישראל הוא 18%. עדכן כאן אם השיעור ישתנה.'
                  : 'Israeli VAT (מע״מ) is currently 18%. Update here if the rate changes.'}
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number" inputMode="decimal" min={0} max={100} step={0.1}
                    value={vatRateInput}
                    onChange={e => setVatRateInput(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                    onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                    onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                  />
                  <span className="absolute inset-y-0 end-4 flex items-center text-sm font-bold text-white/30">%</span>
                </div>
                <SaveButton loading={false} saved={vatSaved} label={isHe ? 'שמור מע"מ' : 'Save VAT'} />
              </div>
            </form>
          </Card>
        </motion.div>

      </main>
      <GlobalFooter />
    </div>
  )
}
