import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, ChevronDown, ChevronUp,
  Copy, Check, Edit3, Save, X as CloseIcon, Eye, EyeOff,
} from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import {
  CONTRACT_TEMPLATES, interpolateTemplate, getTemplatesByCategory,
  CATEGORY_LABELS,
  type ContractTemplate,
} from '../lib/contractTemplates'

// ─── Default variable values per template (persisted in localStorage) ─────────

const STORAGE_KEY = 'dealspace:contract-defaults'

function loadDefaults(): Record<string, Record<string, string>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveDefaults(data: Record<string, Record<string, string>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── Category tabs ────────────────────────────────────────────────────────────

function CategoryTabs({
  selected, onSelect, locale,
}: { selected: string | null; onSelect: (c: string | null) => void; locale: string }) {
  const isHe = locale === 'he'
  const cats = Object.entries(CATEGORY_LABELS)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
        style={{
          background: selected === null ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
          border: selected === null ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
          color: selected === null ? '#818cf8' : 'rgba(255,255,255,0.45)',
        }}
      >
        {isHe ? 'הכל' : 'All'}
      </button>
      {cats.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
          style={{
            background: selected === key ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
            border: selected === key ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
            color: selected === key ? '#818cf8' : 'rgba(255,255,255,0.45)',
          }}
        >
          {isHe ? label.he : label.en}
        </button>
      ))}
    </div>
  )
}

// ─── Variable editor ──────────────────────────────────────────────────────────

function VariableEditor({
  template, values, onChange, locale,
}: {
  template: ContractTemplate
  values: Record<string, string>
  onChange: (key: string, val: string) => void
  locale: string
}) {
  const isHe = locale === 'he'
  if (!template.variables || template.variables.length === 0) return null

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
        {isHe ? 'מלא פרטים לחוזה' : 'Fill contract details'}
      </p>
      {template.variables.map(v => (
        <div key={v.key} className="space-y-1">
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            {isHe ? v.labelHe : v.labelEn}
          </label>
          <input
            type="text"
            value={values[v.key] ?? v.defaultValue ?? ''}
            onChange={e => onChange(v.key, e.target.value)}
            placeholder={isHe ? v.labelHe : v.labelEn}
            className="w-full rounded-xl border bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition-all"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
            onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Contract Card ────────────────────────────────────────────────────────────

interface ContractCardProps {
  template: ContractTemplate
  defaults: Record<string, string>
  onSaveDefaults: (vals: Record<string, string>) => void
  locale: string
}

function ContractCard({ template, defaults, onSaveDefaults, locale }: ContractCardProps) {
  const isHe = locale === 'he'
  const [expanded, setExpanded] = useState(false)
  const [editingVars, setEditingVars] = useState(false)
  const [varValues, setVarValues] = useState<Record<string, string>>({ ...defaults })
  const [showFull, setShowFull] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedVars, setSavedVars] = useState(false)

  const interpolated = interpolateTemplate(template.bodyHe, varValues)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(interpolated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSaveVars = () => {
    onSaveDefaults(varValues)
    setSavedVars(true)
    setTimeout(() => setSavedVars(false), 2000)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 px-5 py-4 text-start"
      >
        <div
          className="flex-none mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <FileText size={14} className="text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white/90">
            {isHe ? template.titleHe : template.titleEn}
          </h3>
          <p className="text-xs text-white/35 mt-0.5">
            {isHe ? template.descHe : (template.titleEn)}
          </p>
        </div>
        <span className="text-white/30 flex-none mt-1">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 space-y-4">

              {/* Variable editor toggle */}
              {template.variables && template.variables.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => setEditingVars(v => !v)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition"
                      style={{
                        background: editingVars ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.05)',
                        border: editingVars ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        color: editingVars ? '#818cf8' : 'rgba(255,255,255,0.45)',
                      }}
                    >
                      <Edit3 size={11} />
                      {isHe ? 'מלא פרטים' : 'Fill details'}
                    </button>
                    {editingVars && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveVars}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-white transition"
                          style={{ background: savedVars ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.18)', border: savedVars ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(99,102,241,0.3)' }}
                        >
                          {savedVars ? <Check size={11} /> : <Save size={11} />}
                          {isHe ? (savedVars ? 'נשמר!' : 'שמור') : (savedVars ? 'Saved!' : 'Save defaults')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingVars(false)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:text-white/60"
                        >
                          <CloseIcon size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {editingVars && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: 'hidden' }}
                        className="mb-4"
                      >
                        <div
                          className="rounded-xl p-4 space-y-3"
                          style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}
                        >
                          <VariableEditor
                            template={template}
                            values={varValues}
                            onChange={(key, val) => setVarValues(prev => ({ ...prev, [key]: val }))}
                            locale={locale}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Contract preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    {isHe ? 'תצוגת חוזה' : 'Contract preview'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFull(v => !v)}
                    className="flex items-center gap-1 text-[11px] font-semibold transition text-white/30 hover:text-white/60"
                  >
                    {showFull ? <EyeOff size={11} /> : <Eye size={11} />}
                    {isHe ? (showFull ? 'קצר' : 'הצג הכל') : (showFull ? 'Collapse' : 'View full')}
                  </button>
                </div>

                <div
                  className="rounded-xl p-4 text-[12px] leading-relaxed text-white/55 font-mono whitespace-pre-wrap overflow-y-auto transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    maxHeight: showFull ? '600px' : '200px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(99,102,241,0.3) transparent',
                  }}
                  dir="rtl"
                >
                  {interpolated}
                </div>
              </div>

              {/* Legal disclaimer */}
              <div
                className="rounded-xl px-3.5 py-3 text-[11px] leading-relaxed text-white/30"
                style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}
              >
                <span className="text-amber-400/60 font-bold">{isHe ? '⚠ אזהרה משפטית: ' : '⚠ Legal Notice: '}</span>
                {isHe
                  ? 'תבנית זו היא כלי עזר בלבד ואינה מהווה ייעוץ משפטי. מומלץ להתייעץ עם עו"ד לפני חתימה. DealSpace אינה נושאת באחריות לנוסח החוזי.'
                  : 'This template is a tool only and does not constitute legal advice. Consult a licensed attorney before signing. DealSpace bears no liability for the contractual text.'}
              </div>

              {/* Actions */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition"
                style={{
                  background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                  border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(99,102,241,0.25)',
                  color: copied ? '#4ade80' : '#818cf8',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {isHe ? (copied ? 'הועתק!' : 'העתק טקסט חוזה') : (copied ? 'Copied!' : 'Copy contract text')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── ContractLibrary page ─────────────────────────────────────────────────────

export default function ContractLibrary() {
  const { locale } = useI18n()
  const isHe = locale === 'he'

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [allDefaults, setAllDefaults] = useState<Record<string, Record<string, string>>>(loadDefaults)

  const templates = selectedCategory
    ? getTemplatesByCategory(selectedCategory as ContractTemplate['category'])
    : CONTRACT_TEMPLATES

  const handleSaveDefaults = (templateId: string, vals: Record<string, string>) => {
    const next = { ...allDefaults, [templateId]: vals }
    setAllDefaults(next)
    saveDefaults(next)
  }

  return (
    <div
      className="min-h-dvh"
      style={{ background: '#030305' }}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      <style>{`@keyframes ds-fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Intro */}
        <div style={{ animation: 'ds-fade-up 0.4s ease-out 0.05s both' }}>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-black text-white">
              {isHe ? 'חוזים מקצועיים בעברית' : 'Professional Hebrew Contracts'}
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-400 border border-indigo-500/20">
              {templates.length} {isHe ? 'תבניות' : 'templates'}
            </span>
          </div>
          <p className="text-sm text-white/35 leading-relaxed">
            {isHe
              ? 'תבניות חוזה מותאמות לחוק הישראלי. מלא פרטים, העתק, והכנס להצעה.'
              : 'Contract templates adapted for Israeli law. Fill details, copy, and insert into proposals.'}
          </p>
        </div>

        {/* Category filter */}
        <div style={{ animation: 'ds-fade-up 0.4s ease-out 0.1s both' }}>
          <CategoryTabs
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            locale={locale}
          />
        </div>

        {/* Contract list */}
        <div className="space-y-3" style={{ animation: 'ds-fade-up 0.4s ease-out 0.15s both' }}>
          {templates.map(template => (
            <ContractCard
              key={template.id}
              template={template}
              defaults={allDefaults[template.id] ?? {}}
              onSaveDefaults={vals => handleSaveDefaults(template.id, vals)}
              locale={locale}
            />
          ))}
        </div>
      </main>
      <GlobalFooter />
    </div>
  )
}
