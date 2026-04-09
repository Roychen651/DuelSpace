import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Building2, Hash, MapPin, Briefcase, ChevronRight, CheckCircle2, PenLine } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientCapturedDetails {
  full_name: string
  company_name: string
  tax_id: string
  billing_address: string
  signer_role: string
}

interface ClientDetailsFormProps {
  locale: string
  /** Pre-fill full_name from the proposal's client_name */
  prefillName?: string
  onComplete: (details: ClientCapturedDetails) => void
  /** When true, renders a compact sealed confirmation card instead of the form */
  sealed?: boolean
  /** Called when the user taps Edit in the sealed state */
  onEdit?: () => void
}

// ─── Input ────────────────────────────────────────────────────────────────────

function FormInput({
  label, value, onChange, placeholder, icon, required, inputMode, maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  icon: React.ReactNode
  required?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
        {icon}
        {label}
        {required && <span style={{ color: '#818cf8' }}>*</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none transition-all duration-300 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/[0.12] dark:bg-white/[0.05] dark:border-white/[0.1] dark:focus:bg-white/[0.07] dark:focus:border-indigo-500/[0.65]"
      />
    </div>
  )
}

// ─── Sealed confirmation card ─────────────────────────────────────────────────

function SealedCard({
  details,
  locale,
  onEdit,
}: {
  details: ClientCapturedDetails
  locale: string
  onEdit?: () => void
}) {
  const isHe = locale === 'he'
  return (
    <motion.div
      key="sealed"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.03) 100%)',
        border: '1px solid rgba(34,197,94,0.22)',
        boxShadow: '0 0 0 1px rgba(34,197,94,0.06), 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(34,197,94,0.14)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 pt-4 pb-3.5"
        style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 18, delay: 0.1 }}
            className="flex h-7 w-7 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(34,197,94,0.18)',
              border: '1px solid rgba(34,197,94,0.35)',
              boxShadow: '0 0 12px rgba(34,197,94,0.2)',
            }}
          >
            <CheckCircle2 size={14} className="text-emerald-400" />
          </motion.div>
          <h3 className="text-sm font-bold text-emerald-400">
            {isHe ? 'פרטי הזהות אושרו' : 'Identity Confirmed'}
          </h3>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all text-slate-400 bg-slate-100 border border-slate-200 hover:text-slate-600 hover:bg-slate-200 dark:text-white/40 dark:bg-white/[0.05] dark:border-white/[0.08] dark:hover:text-white/75 dark:hover:bg-white/[0.09]"
          >
            <PenLine size={10} />
            {isHe ? 'ערוך' : 'Edit'}
          </button>
        )}
      </div>

      {/* Details grid */}
      <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {[
          {
            icon: <User size={10} />,
            label: isHe ? 'שם' : 'Name',
            value: details.full_name,
          },
          {
            icon: <Hash size={10} />,
            label: isHe ? 'ח.פ. / ת.ז' : 'Tax ID',
            value: details.tax_id,
          },
          details.company_name ? {
            icon: <Building2 size={10} />,
            label: isHe ? 'חברה' : 'Company',
            value: details.company_name,
          } : null,
          details.signer_role ? {
            icon: <Briefcase size={10} />,
            label: isHe ? 'תפקיד' : 'Role',
            value: details.signer_role,
          } : null,
          details.billing_address ? {
            icon: <MapPin size={10} />,
            label: isHe ? 'כתובת' : 'Address',
            value: details.billing_address,
          } : null,
        ].filter(Boolean).map((row, i) => (
          <div key={i} className="min-w-0">
            <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-0.5">
              {row!.icon}
              {row!.label}
            </p>
            <p className="text-[12px] font-semibold text-slate-700 dark:text-white/75 truncate">{row!.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── ClientDetailsForm ────────────────────────────────────────────────────────

export function ClientDetailsForm({ locale, prefillName = '', onComplete, sealed = false, onEdit }: ClientDetailsFormProps) {
  const isHe = locale === 'he'

  const [details, setDetails] = useState<ClientCapturedDetails>({
    full_name:       prefillName,
    company_name:    '',
    tax_id:          '',
    billing_address: '',
    signer_role:     '',
  })

  // Tracks whether the user has touched the tax_id field (show error on blur)
  const [taxIdTouched, setTaxIdTouched] = useState(false)

  const set = (key: keyof ClientCapturedDetails) => (v: string) =>
    setDetails(d => ({ ...d, [key]: v }))

  // Israeli tax IDs: ת.ז is 9 digits, ח.פ is 9 digits — min 5 chars allows partial
  const taxIdValid = details.tax_id.replace(/\D/g, '').length >= 5
  const canSubmit = details.full_name.trim().length >= 2 && taxIdValid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      setTaxIdTouched(true)
      return
    }
    onComplete(details)
  }

  return (
    <AnimatePresence mode="wait">
      {sealed ? (
        <SealedCard key="sealed" details={details} locale={locale} onEdit={onEdit} />
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.45, ease: 'easeOut' as const }}
          className="client-form-card rounded-2xl overflow-hidden bg-white border border-indigo-100 shadow-lg dark:bg-transparent dark:border-transparent dark:shadow-none"
          style={{
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/[0.15] dark:border-indigo-500/[0.3]"
              >
                <User size={13} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white/90">
                {isHe ? 'פרטי הזהות שלך' : 'Your Identity Details'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-white/35 leading-relaxed">
              {isHe
                ? 'הזן את פרטיך לפני החתימה. המידע נדרש לצרכים משפטיים ומאובטח.'
                : 'Enter your details before signing. This information is required for legal purposes.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-5 pb-5 pt-4 space-y-3">
            <FormInput
              label={isHe ? 'שם מלא / שם חברה' : 'Full Name / Company Name'}
              value={details.full_name}
              onChange={set('full_name')}
              placeholder={isHe ? 'שם משפטי מלא' : 'Full legal name'}
              icon={<User size={10} />}
              required
              maxLength={200}
            />

            <FormInput
              label={isHe ? 'שם חברה (אם שונה)' : 'Company Name (if different)'}
              value={details.company_name}
              onChange={set('company_name')}
              placeholder={isHe ? 'שם החברה כפי שרשום' : 'Registered company name'}
              icon={<Building2 size={10} />}
              maxLength={200}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FormInput
                  label={isHe ? 'ח.פ. / ת.ז' : 'Tax ID / ID No.'}
                  value={details.tax_id}
                  onChange={v => { set('tax_id')(v); if (taxIdTouched) setTaxIdTouched(true) }}
                  placeholder={isHe ? '123456789' : '123456789'}
                  icon={<Hash size={10} />}
                  required
                  inputMode="numeric"
                  maxLength={200}
                />
                {taxIdTouched && !taxIdValid && (
                  <p className="text-[10px] font-semibold" style={{ color: '#f87171' }}>
                    {isHe ? 'נדרש ח.פ. / ת.ז. תקין (לפחות 5 ספרות)' : 'Valid Tax ID required (min 5 digits)'}
                  </p>
                )}
              </div>
              <FormInput
                label={isHe ? 'תפקיד החותם' : 'Signer Role'}
                value={details.signer_role}
                onChange={set('signer_role')}
                placeholder={isHe ? 'למשל: מנכ"ל' : 'e.g. CEO'}
                icon={<Briefcase size={10} />}
                maxLength={200}
              />
            </div>

            <FormInput
              label={isHe ? 'כתובת לחיוב' : 'Billing Address'}
              value={details.billing_address}
              onChange={set('billing_address')}
              placeholder={isHe ? 'רחוב, עיר, מיקוד' : 'Street, City, ZIP'}
              icon={<MapPin size={10} />}
              maxLength={200}
            />

            {/* Submit */}
            <motion.button
              type="submit"
              onClick={() => setTaxIdTouched(true)}
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed"
              style={{
                background: canSubmit
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)'
                  : 'rgba(255,255,255,0.06)',
                border: canSubmit ? 'none' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: canSubmit ? '0 0 24px rgba(99,102,241,0.35)' : 'none',
                opacity: canSubmit ? 1 : 0.5,
                transition: 'opacity 0.2s, background 0.3s',
              }}
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } } : {}}
            >
              <span>{isHe ? 'המשך לחתימה' : 'Continue to Signature'}</span>
              <ChevronRight size={15} />
            </motion.button>

            <p className="text-center text-[10px] text-slate-400 dark:text-white/20">
              {isHe
                ? 'פרטיך מאובטחים ומוצפנים. DealSpace אינה משתפת מידע זה עם צדדים שלישיים.'
                : 'Your details are secured and encrypted. DealSpace does not share this information.'}
            </p>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
