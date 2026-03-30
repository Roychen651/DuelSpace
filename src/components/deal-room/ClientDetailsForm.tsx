import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Hash, MapPin, Briefcase, ChevronRight } from 'lucide-react'

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
}

// ─── Input ────────────────────────────────────────────────────────────────────

function FormInput({
  label, value, onChange, placeholder, icon, required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  icon: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {icon}
        {label}
        {required && <span style={{ color: '#818cf8' }}>*</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
        onFocus={e => {
          e.currentTarget.style.border = '1px solid rgba(99,102,241,0.65)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
        }}
        onBlur={e => {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)'
        }}
      />
    </div>
  )
}

// ─── ClientDetailsForm ────────────────────────────────────────────────────────

export function ClientDetailsForm({ locale, prefillName = '', onComplete }: ClientDetailsFormProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' as const }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        boxShadow: '0 0 40px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-xl"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <User size={13} className="text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white/90">
            {isHe ? 'פרטי הזהות שלך' : 'Your Identity Details'}
          </h3>
        </div>
        <p className="text-[11px] text-white/35 leading-relaxed">
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
        />

        <FormInput
          label={isHe ? 'שם חברה (אם שונה)' : 'Company Name (if different)'}
          value={details.company_name}
          onChange={set('company_name')}
          placeholder={isHe ? 'שם החברה כפי שרשום' : 'Registered company name'}
          icon={<Building2 size={10} />}
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
          />
        </div>

        <FormInput
          label={isHe ? 'כתובת לחיוב' : 'Billing Address'}
          value={details.billing_address}
          onChange={set('billing_address')}
          placeholder={isHe ? 'רחוב, עיר, מיקוד' : 'Street, City, ZIP'}
          icon={<MapPin size={10} />}
        />

        {/* Submit — also marks taxId touched so validation message appears if skipped */}
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
            opacity: canSubmit ? 1 : 0.5,
            transition: 'opacity 0.2s, background 0.3s',
          }}
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } } : {}}
        >
          <span>{isHe ? 'המשך לחתימה' : 'Continue to Signature'}</span>
          <ChevronRight size={15} />
        </motion.button>

        <p className="text-center text-[10px] text-white/20">
          {isHe
            ? 'פרטיך מאובטחים ומוצפנים. DealSpace אינה משתפת מידע זה עם צדדים שלישיים.'
            : 'Your details are secured and encrypted. DealSpace does not share this information.'}
        </p>
      </form>
    </motion.div>
  )
}
