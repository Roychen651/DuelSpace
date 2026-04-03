import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Camera, Check, Eye, EyeOff, CheckCircle2, XCircle, Percent, Building2, Hash, MapPin, Phone, PenTool, Palette, ImageIcon, Loader2, FileText, CreditCard, ExternalLink, Zap, Star, Infinity as InfinityIcon } from 'lucide-react'
import { useAuthStore, useTier } from '../stores/useAuthStore'
import { STRIPE_CUSTOMER_PORTAL, STRIPE_PRO_LINK, STRIPE_PREMIUM_LINK, buildCheckoutUrl } from '../lib/stripe'
import { supabase } from '../lib/supabase'
import { evaluatePassword } from '../lib/passwordValidation'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { InfoTip } from '../components/ui/InfoTip'
import { RichTextEditor } from '../components/builder/RichTextEditor'

// ─── Section card ─────────────────────────────────────────────────────────────

function Card({ children, title, icon, tip }: { children: React.ReactNode; title: string; icon: React.ReactNode; tip?: React.ReactNode }) {
  return (
    <div className="profile-card rounded-3xl p-7">
      <div className="flex items-center gap-3 mb-6">
        <div className="profile-icon-badge flex h-9 w-9 items-center justify-center rounded-xl">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-slate-600 dark:text-white/80 uppercase tracking-widest">{title}</h2>
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
      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="profile-input w-full rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none transition-all duration-200 disabled:opacity-40"
          data-error={error ? 'true' : undefined}
          data-disabled={disabled ? 'true' : undefined}
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
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">{user.name || user.email}</h3>
        <p className="text-xs mb-3 text-slate-400 dark:text-white/35">{user.email}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white/60 dark:hover:bg-white/[0.09] dark:hover:text-white"
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
  const tier = useTier()

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

  // ── Company logo ──────────────────────────────────────────────────────────
  const [logoUrl, setLogoUrl] = useState<string>(
    (user?.user_metadata?.logo_url as string | undefined) ?? ''
  )
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoSaved, setLogoSaved] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setLogoUploading(true)
    setLogoError(null)

    const uid = user?.id
    if (!uid) {
      setLogoError(isHe ? 'משתמש לא מחובר' : 'Not authenticated')
      setLogoUploading(false)
      return
    }

    // Use {uid}/{filename} path — the most universally compatible format with
    // Supabase Storage RLS policies. The most common policy checks:
    //   auth.uid()::text = (storage.foldername(name))[1]
    // meaning the FIRST folder segment must equal the user's UUID.
    // Paths like `avatars/logo-{uid}` fail this check (foldername[1] = 'avatars').
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const path = `${uid}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      // Show the real Supabase error so it's debuggable
      setLogoError(uploadError.message || (isHe ? 'שגיאה בהעלאה' : 'Upload failed'))
      console.error('[logo upload]', uploadError)
      setLogoUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    // Append timestamp to bust CDN cache so the browser reloads the new image
    const url = `${data.publicUrl}?t=${Date.now()}`
    setLogoUrl(url)

    const { error: saveError } = await supabase.auth.updateUser({ data: { logo_url: url } })
    if (saveError) {
      setLogoError(saveError.message || (isHe ? 'שגיאה בשמירה' : 'Save failed'))
      console.error('[logo save]', saveError)
    } else {
      setLogoSaved(true)
      setTimeout(() => setLogoSaved(false), 2500)
    }
    setLogoUploading(false)
  }, [user?.id, isHe])

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

  // ── Business Terms ────────────────────────────────────────────────────────
  const [businessTerms, setBusinessTerms] = useState<string>(
    (user?.user_metadata?.business_terms as string | undefined) ?? ''
  )
  const [termsSaving, setTermsSaving] = useState(false)
  const [termsSaved, setTermsSaved] = useState(false)

  const handleSaveTerms = async (e: React.FormEvent) => {
    e.preventDefault()
    setTermsSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { business_terms: businessTerms } })
    setTermsSaving(false)
    if (!error) { setTermsSaved(true); setTimeout(() => setTermsSaved(false), 2500) }
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

  // Keep biz state in sync if user metadata changes externally (e.g., after auth refresh)
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
    // logo_url must also sync — useState initializes once on mount; if user loads after
    // initial render (common on page refresh) the logo would show blank without this.
    setLogoUrl((user.user_metadata?.logo_url as string | undefined) ?? '')
    setBusinessTerms((user.user_metadata?.business_terms as string | undefined) ?? '')
  }, [user])

  if (!user) return null

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-[#030305]" dir={isHe ? 'rtl' : 'ltr'}>
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
            <p className="text-xs text-slate-400 dark:text-white/35 -mt-2 mb-4 leading-relaxed">
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
            <p className="text-xs text-slate-400 dark:text-white/35 -mt-2 mb-4 leading-relaxed">
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
                    className="profile-input w-full rounded-2xl px-4 py-3 ps-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none transition-all duration-200"
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
                <span className="text-[11px] text-slate-400 dark:text-white/40">
                  {isHe ? 'תצוגה מקדימה של הצבע בחדר הדיל' : 'Preview of your brand color in Deal Room'}
                </span>
                <div
                  className="ms-auto rounded-lg px-3 py-1 text-[11px] font-bold text-slate-900 dark:text-white"
                  style={{ background: /^#[0-9a-fA-F]{6}$/.test(brandColor) ? `${brandColor}30` : 'rgba(99,102,241,0.2)', border: `1px solid ${/^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : '#6366f1'}40` }}
                >
                  {isHe ? 'אשר ✓' : 'Approve ✓'}
                </div>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* ── Company Logo ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.5, ease: 'easeOut' as const }}>
          <Card
            title={isHe ? 'לוגו החברה' : 'Company Logo'}
            icon={<ImageIcon size={16} />}
          >
            <p className="text-xs text-slate-400 dark:text-white/35 -mt-2 mb-5 leading-relaxed">
              {isHe
                ? 'הלוגו יופיע בחדר הדיל ובעמוד השער של קובץ ה-PDF.'
                : 'Your logo appears in the Deal Room and on the PDF cover page.'}
            </p>
            <div className="flex items-center gap-5">
              {/* Preview box */}
              <div
                className="flex h-20 w-36 flex-none items-center justify-center rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.08]"
              >
                {logoUrl
                  ? <img src={logoUrl} alt="logo" className="max-h-full max-w-full object-contain p-2" />
                  : <ImageIcon size={22} className="text-slate-300 dark:text-white/15" />
                }
              </div>
              {/* Controls */}
              <div className="flex-1 space-y-3">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition"
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.22)',
                    color: '#818cf8',
                    opacity: logoUploading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)' }}
                >
                  {logoUploading
                    ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Camera size={12} />
                  }
                  {isHe ? (logoUploading ? 'מעלה...' : 'העלה לוגו') : (logoUploading ? 'Uploading...' : 'Upload Logo')}
                </button>
                {logoSaved && (
                  <p className="text-[11px] font-semibold text-emerald-400">
                    {isHe ? 'הלוגו נשמר ✓' : 'Logo saved ✓'}
                  </p>
                )}
                {logoError && (
                  <p className="text-[11px] font-semibold" style={{ color: '#f87171' }}>
                    {logoError}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 dark:text-white/25">
                  {isHe ? 'PNG, SVG, או JPG — מומלץ רקע שקוף' : 'PNG, SVG, or JPG — transparent background recommended'}
                </p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Business Terms & Conditions ────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' as const }}>
          <Card
            title={isHe ? 'תקנון העסק / תנאים והתניות' : 'Business Terms & Conditions'}
            icon={<FileText size={16} />}
          >
            <p className="text-xs text-slate-400 dark:text-white/35 -mt-2 mb-4 leading-relaxed">
              {isHe
                ? 'הגדר פעם אחת — יוקפאו אוטומטית בכל הצעה חדשה. הלקוח יראה ויצטרך להסכים לפני החתימה.'
                : 'Define once — automatically frozen into every new proposal. Clients must agree before signing.'}
            </p>
            <form onSubmit={handleSaveTerms} className="space-y-4">
              <RichTextEditor
                value={businessTerms}
                onChange={setBusinessTerms}
                placeholder={isHe
                  ? 'תנאי תשלום, זכויות יוצרים, אחריות, ביטולים...'
                  : 'Payment terms, IP ownership, liability, cancellation policy...'}
                locale={locale}
              />
              <div className="flex justify-end pt-1">
                <SaveButton loading={termsSaving} saved={termsSaved} label={isHe ? 'שמור תנאים' : 'Save Terms'} />
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

        {/* ── Billing & Subscription ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30, duration: 0.5, ease: 'easeOut' as const }}>
          <Card title={isHe ? 'חיוב ומנוי' : 'Billing & Subscription'} icon={<CreditCard size={16} />}>
            {/* Current plan badge */}
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 mb-5"
              style={{
                background: tier === 'unlimited'
                  ? 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))'
                  : tier === 'pro'
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))'
                  : 'rgba(255,255,255,0.03)',
                border: tier === 'unlimited'
                  ? '1px solid rgba(212,175,55,0.25)'
                  : tier === 'pro'
                  ? '1px solid rgba(99,102,241,0.25)'
                  : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl flex-none"
                  style={{
                    background: tier === 'unlimited'
                      ? 'rgba(212,175,55,0.15)'
                      : tier === 'pro'
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(255,255,255,0.06)',
                    color: tier === 'unlimited' ? '#d4af37' : tier === 'pro' ? '#818cf8' : 'rgba(255,255,255,0.3)',
                    border: tier === 'unlimited'
                      ? '1px solid rgba(212,175,55,0.3)'
                      : tier === 'pro'
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {tier === 'unlimited' ? <InfinityIcon size={15} /> : tier === 'pro' ? <Zap size={15} /> : <Star size={15} />}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white/90">
                    {tier === 'unlimited'
                      ? (isHe ? 'תוכנית פרימיום' : 'Premium Plan')
                      : tier === 'pro'
                      ? (isHe ? 'תוכנית פרו' : 'Pro Plan')
                      : (isHe ? 'תוכנית חינם' : 'Free Plan')}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-white/35 mt-0.5">
                    {tier === 'unlimited'
                      ? (isHe ? '₪39 / חודש · כולל מע"מ' : '₪39 / month · VAT incl.')
                      : tier === 'pro'
                      ? (isHe ? '₪19 / חודש · כולל מע"מ' : '₪19 / month · VAT incl.')
                      : (isHe ? 'ללא עלות' : 'No charge')}
                  </p>
                </div>
              </div>
              <span
                className="flex-none rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                style={
                  tier === 'unlimited'
                    ? { background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }
                    : tier === 'pro'
                    ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {tier === 'unlimited' ? 'PREMIUM' : tier === 'pro' ? 'PRO' : 'FREE'}
              </span>
            </div>

            {/* FREE — upgrade options */}
            {tier === 'free' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 dark:text-white/35 leading-relaxed -mt-2 mb-3">
                  {isHe
                    ? 'שדרג לפרו כדי לבטל את מגבלת ההצעות, להפעיל Webhooks ולקבל תמיכה ישירה.'
                    : 'Upgrade to Pro to remove proposal limits, unlock Webhooks, and get direct support.'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {STRIPE_PRO_LINK && (
                    <motion.a
                      href={buildCheckoutUrl(STRIPE_PRO_LINK, user?.id ?? '', user?.email)}
                      className="flex flex-col items-center rounded-2xl px-3 py-3.5 text-center"
                      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', transition: 'background 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.18)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.1)' }}
                      whileTap={{ scale: 0.97, transition: { type: 'spring' as const, stiffness: 500, damping: 20 } }}
                    >
                      <Zap size={16} style={{ color: '#818cf8', marginBottom: 6 }} />
                      <p className="text-[12px] font-bold" style={{ color: '#818cf8' }}>{isHe ? 'פרו' : 'Pro'}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">{isHe ? '₪19 / חודש · כולל מע"מ' : '₪19 / mo · VAT incl.'}</p>
                    </motion.a>
                  )}
                  {STRIPE_PREMIUM_LINK && (
                    <motion.a
                      href={buildCheckoutUrl(STRIPE_PREMIUM_LINK, user?.id ?? '', user?.email)}
                      className="flex flex-col items-center rounded-2xl px-3 py-3.5 text-center"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)', transition: 'background 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.14)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.08)' }}
                      whileTap={{ scale: 0.97, transition: { type: 'spring' as const, stiffness: 500, damping: 20 } }}
                    >
                      <InfinityIcon size={16} style={{ color: '#d4af37', marginBottom: 6 }} />
                      <p className="text-[12px] font-bold" style={{ color: '#d4af37' }}>{isHe ? 'פרימיום' : 'Premium'}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">{isHe ? '₪39 / חודש · כולל מע"מ' : '₪39 / mo · VAT incl.'}</p>
                    </motion.a>
                  )}
                </div>
              </div>
            )}

            {/* PRO — upgrade to Premium + manage/cancel */}
            {tier === 'pro' && (
              <div className="space-y-4">
                {/* Upgrade to Premium */}
                {STRIPE_PREMIUM_LINK && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                      {isHe ? 'שדרוג זמין' : 'Available upgrade'}
                    </p>
                    <motion.a
                      href={buildCheckoutUrl(STRIPE_PREMIUM_LINK, user?.id ?? '', user?.email)}
                      className="flex items-center justify-between w-full rounded-2xl px-4 py-3 text-[13px] font-semibold"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)', color: '#d4af37', transition: 'background 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.15)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.08)' }}
                      whileTap={{ scale: 0.98, transition: { type: 'spring' as const, stiffness: 500, damping: 20 } }}
                    >
                      <span className="flex items-center gap-2">
                        <InfinityIcon size={14} />
                        {isHe ? 'שדרג לפרימיום — ₪39 / חודש' : 'Upgrade to Premium — ₪39 / mo'}
                      </span>
                      <span className="text-[10px] opacity-50 font-normal">
                        {isHe ? 'הצעות ללא הגבלה' : 'Unlimited proposals'}
                      </span>
                    </motion.a>
                  </div>
                )}

                {/* Manage / Cancel */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                    {isHe ? 'ניהול מנוי' : 'Subscription management'}
                  </p>
                  {STRIPE_CUSTOMER_PORTAL ? (
                    <motion.a
                      href={STRIPE_CUSTOMER_PORTAL}
                      className="flex items-center justify-between w-full rounded-2xl px-4 py-3 text-[13px] font-semibold"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.65)', transition: 'background 0.2s, border-color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.09)' }}
                      whileTap={{ scale: 0.98, transition: { type: 'spring' as const, stiffness: 500, damping: 20 } }}
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard size={14} />
                        {isHe ? 'עדכון תשלום, חשבוניות וביטול' : 'Update billing, invoices & cancel'}
                      </span>
                      <ExternalLink size={12} className="opacity-40" />
                    </motion.a>
                  ) : (
                    <p className="text-[12px] text-white/35 leading-relaxed rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {isHe
                        ? 'לביטול, שינוי תוכנית או הורדת חשבוניות — פנה לתמיכה: support@dealspace.app'
                        : 'To cancel, change plan, or download invoices — contact support@dealspace.app'}
                    </p>
                  )}
                </div>

                {/* Invoice note */}
                <p className="text-[11px] text-white/25 leading-relaxed">
                  {isHe
                    ? 'Stripe שולחת קבלה אוטומטית למייל שלך בכל חיוב חודשי. חשבוניות מס זמינות בפורטל.'
                    : 'Stripe automatically emails a receipt on every monthly charge. Tax invoices are available in the portal.'}
                </p>
              </div>
            )}

            {/* PREMIUM — manage / downgrade / cancel */}
            {tier === 'unlimited' && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                    {isHe ? 'ניהול מנוי' : 'Subscription management'}
                  </p>
                  {STRIPE_CUSTOMER_PORTAL ? (
                    <motion.a
                      href={STRIPE_CUSTOMER_PORTAL}
                      className="flex items-center justify-between w-full rounded-2xl px-4 py-3 text-[13px] font-semibold"
                      style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.22)', color: '#d4af37', transition: 'background 0.2s, border-color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.13)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,175,55,0.35)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.07)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,175,55,0.22)' }}
                      whileTap={{ scale: 0.98, transition: { type: 'spring' as const, stiffness: 500, damping: 20 } }}
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard size={14} />
                        {isHe ? 'ניהול תוכנית, חשבוניות, שינוי וביטול' : 'Manage plan, invoices & cancellation'}
                      </span>
                      <ExternalLink size={12} className="opacity-40" />
                    </motion.a>
                  ) : (
                    <p className="text-[12px] text-white/35 leading-relaxed rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {isHe
                        ? 'לביטול, שינוי תוכנית או הורדת חשבוניות — פנה לתמיכה: support@dealspace.app'
                        : 'To cancel, change plan, or download invoices — contact support@dealspace.app'}
                    </p>
                  )}
                </div>

                {/* Invoice note */}
                <p className="text-[11px] text-white/25 leading-relaxed">
                  {isHe
                    ? 'Stripe שולחת קבלה אוטומטית למייל שלך בכל חיוב חודשי. לשינוי תוכנית — השתמש בפורטל הניהול למעלה.'
                    : 'Stripe automatically emails a receipt on every monthly charge. To change or cancel your plan, use the management portal above.'}
                </p>
              </div>
            )}
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
                    className="profile-input w-full rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none transition-all duration-200"
                  />
                  <span className="absolute inset-y-0 end-4 flex items-center text-sm font-bold text-slate-400 dark:text-white/30">%</span>
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
