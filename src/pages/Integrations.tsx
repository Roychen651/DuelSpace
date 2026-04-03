import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Lock, CheckCircle2, AlertCircle, Loader2,
  Webhook, Send, ArrowRight, MousePointerClick, Bell, FileText,
  Settings2, Link2, FlaskConical, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAuthStore, useTier } from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { UpgradeModal } from '../components/dashboard/UpgradeModal'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { useProposalStore } from '../stores/useProposalStore'

// ─── Constants ────────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  {
    iconEn: <MousePointerClick size={18} />,
    titleEn: 'Client signs your proposal',
    bodyEn: 'Your client opens the Deal Room link and clicks "Approve & Sign".',
    titleHe: 'הלקוח חותם על ההצעה',
    bodyHe: 'הלקוח פותח את קישור ה-Deal Room ולוחץ על "אשר וחתום".',
    color: '#6366f1',
  },
  {
    iconEn: <Zap size={18} />,
    titleEn: 'DealSpace fires the webhook',
    bodyEn: 'Within milliseconds, DealSpace POSTs deal details (client, project, total, date) to your URL.',
    titleHe: 'DealSpace שולח את ה-Webhook',
    bodyHe: 'תוך אלפיות שנייה, DealSpace שולח POST עם פרטי העסקה (לקוח, פרויקט, סכום, תאריך) לכתובת שלך.',
    color: '#a855f7',
  },
  {
    iconEn: <Settings2 size={18} />,
    titleEn: 'Your automation runs',
    bodyEn: 'Make.com, Zapier, or n8n receive the data and trigger your workflow: send an invoice, update your CRM, notify Slack, and more.',
    titleHe: 'האוטומציה שלך מופעלת',
    bodyHe: 'Make.com, Zapier, או n8n מקבלים את הנתונים ומפעילים את ה-Workflow שלך: שליחת חשבונית, עדכון CRM, הודעת Slack ועוד.',
    color: '#22c55e',
  },
]

const PLATFORMS = [
  {
    name: 'Make.com',
    logo: '🔄',
    stepsEn: [
      'Create a new Scenario in Make.com',
      'Add a "Webhooks" module → "Custom webhook"',
      'Copy the generated webhook URL',
      'Paste it here and click Save',
      'Run the Test Connection to verify',
    ],
    stepsHe: [
      'פתח Scenario חדש ב-Make.com',
      'הוסף מודול "Webhooks" → "Custom webhook"',
      'העתק את ה-URL שנוצר',
      'הדבק אותו כאן ולחץ שמור',
      'לחץ "בדוק חיבור" לאימות',
    ],
  },
  {
    name: 'Zapier',
    logo: '⚡',
    stepsEn: [
      'Create a new Zap in Zapier',
      'Choose "Webhooks by Zapier" as trigger → "Catch Hook"',
      'Copy the webhook URL Zapier provides',
      'Paste it here and click Save',
      'Trigger a test to activate the Zap',
    ],
    stepsHe: [
      'פתח Zap חדש ב-Zapier',
      'בחר "Webhooks by Zapier" כטריגר → "Catch Hook"',
      'העתק את ה-URL שזאפייר מספק',
      'הדבק אותו כאן ולחץ שמור',
      'הפעל בדיקה כדי להפעיל את ה-Zap',
    ],
  },
  {
    name: 'n8n',
    logo: '🔗',
    stepsEn: [
      'Open your n8n instance',
      'Add a "Webhook" trigger node',
      'Set method to POST, copy the Test/Production URL',
      'Paste it here and click Save',
      'Use Test Connection to send a sample payload',
    ],
    stepsHe: [
      'פתח את ה-n8n שלך',
      'הוסף node מסוג "Webhook" כטריגר',
      'הגדר method ל-POST, העתק את ה-URL',
      'הדבק אותו כאן ולחץ שמור',
      'לחץ "בדוק חיבור" לשליחת דוגמה',
    ],
  },
]

const USE_CASES = [
  { iconEn: <FileText size={14} />, en: 'Auto-send a tax invoice via Invoice4u', he: 'שליחת חשבונית מס אוטומטית דרך Invoice4u' },
  { iconEn: <Bell size={14} />, en: 'Get a Slack or WhatsApp notification on every close', he: 'קבל התראת Slack/WhatsApp על כל סגירה' },
  { iconEn: <Link2 size={14} />, en: 'Create a new deal in HubSpot or Pipedrive', he: 'פתח עסקה ב-HubSpot או ב-Pipedrive' },
  { iconEn: <Send size={14} />, en: 'Send a welcome email via SendGrid or Mailchimp', he: 'שלח מייל ברוכים הבאים דרך SendGrid' },
  { iconEn: <Settings2 size={14} />, en: 'Add to a Google Sheet for revenue tracking', he: 'הוסף ל-Google Sheet למעקב הכנסות' },
  { iconEn: <MousePointerClick size={14} />, en: 'Trigger a monday.com task or Notion page', he: 'פתח משימה ב-monday.com או Notion' },
]

// ─── Integrations page ────────────────────────────────────────────────────────

export default function Integrations() {
  const { user } = useAuthStore()
  const { locale } = useI18n()
  const tier = useTier()
  const { proposals } = useProposalStore()
  const isHe = locale === 'he'
  const isPaid = tier === 'pro' || tier === 'unlimited'

  const [webhookUrl, setWebhookUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [testing, setTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('Make.com')

  useEffect(() => {
    const url = (user?.user_metadata?.webhook_url as string | undefined) ?? ''
    setWebhookUrl(url)
  }, [user])

  const handleSave = async () => {
    if (!isPaid || saving) return
    setSaving(true)
    setSaveStatus('idle')
    const { error } = await supabase.auth.updateUser({ data: { webhook_url: webhookUrl.trim() } })
    setSaving(false)
    setSaveStatus(error ? 'error' : 'saved')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleTest = async () => {
    if (!isPaid || testing || !webhookUrl.trim()) return
    setTesting(true)
    setTestStatus('idle')
    const payload = {
      event: 'proposal.accepted',
      data: {
        proposal_id: 'test-00000000-0000-0000-0000-000000000000',
        project_title: isHe ? 'הצעת בדיקה' : 'Test Proposal',
        client_name: isHe ? 'לקוח בדיקה' : 'Test Client',
        client_email: 'test@example.com',
        client_company: null,
        grand_total: 5000,
        currency: 'ILS',
        public_token: 'test-token',
        signed_at: new Date().toISOString(),
      },
    }
    try {
      const res = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setTestStatus(res.ok ? 'ok' : 'error')
    } catch {
      setTestStatus('error')
    } finally {
      setTesting(false)
      setTimeout(() => setTestStatus('idle'), 4000)
    }
  }

  const activeCount = proposals.filter(p => !p.is_archived).length

  const inputClass = [
    'w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3.5 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30',
    'outline-none transition-all duration-200',
    'shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    'focus:bg-white dark:focus:bg-[#0f0f1a] focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/[0.12]',
  ].join(' ')

  return (
    <div className="relative min-h-dvh flex flex-col" dir={isHe ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes int-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes int-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes int-glow-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-slate-50 dark:bg-[#040608]" />
        <div className="absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'int-float 22s ease-in-out infinite' }} />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'int-float 28s ease-in-out infinite reverse' }} />
      </div>

      <main className="relative z-10 px-6 py-10 max-w-3xl mx-auto w-full flex-1">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="mb-10" style={{ animation: 'int-fade-up 0.4s ease-out 0.05s both' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl flex-none"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}
            >
              <Webhook size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ letterSpacing: '-0.025em' }}>
              {isHe ? 'אינטגרציות ואוטומציות' : 'Integrations & Automations'}
            </h1>
          </div>
          <p className="text-[14px] text-slate-500 dark:text-white/45 leading-relaxed">
            {isHe
              ? 'חבר את DealSpace לכלים שלך — webhook אוטומטי בכל פעם שלקוח חותם על הצעה.'
              : 'Connect DealSpace to your tools — automatic webhook every time a client signs a proposal.'}
          </p>
        </div>

        {/* ── FREE: full-page paywall ──────────────────────────────────────────── */}
        {!isPaid && (
          <>
            {/* How it works — visible to all as marketing */}
            <div
              className="rounded-3xl overflow-hidden mb-6"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                animation: 'int-fade-up 0.45s ease-out 0.12s both',
              }}
            >
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <p className="text-[13px] font-bold text-white/80">
                  {isHe ? 'איך זה עובד' : 'How it works'}
                </p>
              </div>
              <div className="px-6 py-5 space-y-5">
                {FLOW_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className="flex-none flex h-9 w-9 items-center justify-center rounded-xl mt-0.5"
                      style={{ background: `${step.color}18`, border: `1px solid ${step.color}35`, color: step.color }}
                    >
                      {step.iconEn}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white/85 mb-0.5">
                        {isHe ? step.titleHe : step.titleEn}
                      </p>
                      <p className="text-[12px] text-white/40 leading-relaxed">
                        {isHe ? step.bodyHe : step.bodyEn}
                      </p>
                    </div>
                    <div className="flex-none flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white/25" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Use cases */}
            <div
              className="rounded-3xl px-6 py-5 mb-6"
              style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.05)',
                animation: 'int-fade-up 0.45s ease-out 0.18s both',
              }}
            >
              <p className="text-[12px] font-semibold text-white/40 mb-3">
                {isHe ? 'מה אפשר לאוטמט:' : 'What you can automate:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {USE_CASES.map((uc, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/50">
                    <span className="flex-none" style={{ color: '#6366f1' }}>{uc.iconEn}</span>
                    {isHe ? uc.he : uc.en}
                  </div>
                ))}
              </div>
            </div>

            {/* Paywall gate */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(212,175,55,0.08) 0%, rgba(99,102,241,0.06) 100%)',
                border: '1px solid rgba(212,175,55,0.2)',
                boxShadow: '0 0 60px rgba(212,175,55,0.06)',
                animation: 'int-fade-up 0.45s ease-out 0.24s both',
              }}
            >
              <div className="px-8 py-10 flex flex-col items-center text-center gap-5">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 0 40px rgba(212,175,55,0.18)', animation: 'int-glow-pulse 2s ease-in-out infinite' }}
                >
                  <Lock size={24} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-[17px] font-black text-white mb-2">
                    {isHe ? 'אוטומציות זמינות בתוכנית Pro ומעלה' : 'Automations require Pro or higher'}
                  </p>
                  <p className="text-[13px] text-white/45 leading-relaxed max-w-sm mx-auto">
                    {isHe
                      ? 'שדרג לפרו כדי לחבר Webhook, לשלוח חשבוניות אוטומטיות, לעדכן CRM ולקבל התראות בזמן אמת.'
                      : 'Upgrade to Pro to connect a webhook, send automatic invoices, update your CRM, and receive real-time notifications.'}
                  </p>
                </div>
                <motion.button
                  onClick={() => setUpgradeOpen(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                  className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-[14px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}
                >
                  <Zap size={15} />
                  {isHe ? 'שדרג לפרו' : 'Upgrade to Pro'}
                </motion.button>
                <p className="text-[11px] text-white/25">
                  {isHe ? 'ביטול בכל עת · ₪19 / חודש · כולל מע"מ' : 'Cancel anytime · ₪19 / month · VAT incl.'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── PAID: full integration panel ──────────────────────────────────── */}
        {isPaid && (
          <>
            {/* How it works */}
            <div
              className="rounded-3xl overflow-hidden mb-6"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                animation: 'int-fade-up 0.4s ease-out 0.1s both',
              }}
            >
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <p className="text-[13px] font-bold text-white/80">
                  {isHe ? 'איך זה עובד' : 'How it works'}
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-0">
                  {FLOW_STEPS.map((step, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center text-center px-2">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                        style={{ background: `${step.color}18`, border: `1px solid ${step.color}35`, color: step.color }}
                      >
                        {step.iconEn}
                      </div>
                      <p className="text-[11px] font-bold text-white/80 mb-1 leading-snug">
                        {isHe ? step.titleHe : step.titleEn}
                      </p>
                      <p className="text-[10px] text-white/35 leading-relaxed hidden sm:block">
                        {isHe ? step.bodyHe : step.bodyEn}
                      </p>
                      {i < FLOW_STEPS.length - 1 && (
                        <div className="absolute" style={{ display: 'none' }} />
                      )}
                    </div>
                  ))}
                </div>
                {/* Connector line on desktop */}
                <div className="hidden sm:flex items-center justify-between px-[10%] -mt-20 mb-3 pointer-events-none" aria-hidden>
                  <ArrowRight size={14} className="text-white/15" />
                  <ArrowRight size={14} className="text-white/15" />
                </div>
              </div>
            </div>

            {/* Webhook configuration card */}
            <div
              className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-white/[0.02] dark:border-white/[0.06] dark:shadow-none mb-6"
              style={{ animation: 'int-fade-up 0.45s ease-out 0.15s both' }}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-white/[0.05]">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl flex-none"
                  style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.28)' }}
                >
                  <Zap size={15} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-white">
                    {isHe ? 'Webhook — חתימה על הצעה' : 'Proposal Signed Webhook'}
                  </p>
                  <p className="text-[12px] text-white/35 mt-0.5">
                    POST — event: proposal.accepted
                  </p>
                </div>
                <div
                  className="flex-none flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
                >
                  <CheckCircle2 size={11} />
                  {isHe ? 'פעיל' : 'Active'}
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-6 space-y-5">

                {/* Webhook URL input */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-300 mb-2.5">
                    <Link2 size={13} className="text-indigo-400" />
                    {isHe ? 'כתובת Webhook' : 'Webhook URL'}
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={e => setWebhookUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                      placeholder="https://hook.make.com/..."
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-2">
                    {isHe
                      ? 'הדבק כאן את ה-Webhook URL מ-Make.com, Zapier, n8n, או כל כלי אוטומציה אחר.'
                      : 'Paste the Webhook URL from Make.com, Zapier, n8n, or any other automation tool.'}
                  </p>
                </div>

                {/* Payload preview */}
                <div>
                  <p className="text-[12px] font-semibold text-zinc-400 mb-2">
                    {isHe ? 'מבנה ה-Payload שנשלח' : 'Payload structure sent'}
                  </p>
                  <div
                    className="rounded-xl px-4 py-3.5 text-[11px] font-mono leading-relaxed text-white/40 overflow-x-auto"
                    style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}
                    dir="ltr"
                  >
                    <span className="text-indigo-400/70">{'{'}</span>
                    {`\n  "event": "proposal.accepted",\n  "data": {\n    "proposal_id": "uuid",\n    "project_title": "...",\n    "client_name": "...",\n    "client_email": "...",\n    "client_company": "...",\n    "grand_total": 5000,\n    "currency": "ILS",\n    "public_token": "...",\n    "signed_at": "2026-01-01T00:00:00.000Z"\n  }\n`}
                    <span className="text-indigo-400/70">{'}'}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-xl px-5 h-10 text-[13px] font-bold text-white flex-none"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 0 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    {isHe ? 'שמור' : 'Save'}
                  </motion.button>

                  <motion.button
                    onClick={handleTest}
                    disabled={testing || !webhookUrl.trim()}
                    whileHover={webhookUrl.trim() ? { scale: 1.02 } : {}}
                    whileTap={webhookUrl.trim() ? { scale: 0.97 } : {}}
                    className="flex items-center gap-2 rounded-xl px-5 h-10 text-[13px] font-semibold flex-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: !webhookUrl.trim() ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
                      cursor: !webhookUrl.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {testing ? <Loader2 size={13} className="animate-spin" /> : <FlaskConical size={13} />}
                    {isHe ? 'בדוק חיבור' : 'Test Connection'}
                  </motion.button>

                  <AnimatePresence>
                    {saveStatus === 'saved' && (
                      <motion.span key="saved" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-400">
                        <CheckCircle2 size={13} />{isHe ? 'נשמר בהצלחה' : 'Saved'}
                      </motion.span>
                    )}
                    {saveStatus === 'error' && (
                      <motion.span key="save-err" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400">
                        <AlertCircle size={13} />{isHe ? 'שגיאה בשמירה' : 'Save failed'}
                      </motion.span>
                    )}
                    {testStatus === 'ok' && (
                      <motion.span key="test-ok" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-400">
                        <CheckCircle2 size={13} />{isHe ? 'Webhook מגיב תקין ✓' : 'Webhook responded OK ✓'}
                      </motion.span>
                    )}
                    {testStatus === 'error' && (
                      <motion.span key="test-err" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400">
                        <AlertCircle size={13} />{isHe ? 'שגיאה — בדוק שה-URL נכון ומקבל POST' : 'Error — check the URL accepts POST requests'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Test note */}
                {webhookUrl.trim() && (
                  <p className="text-[11px] text-white/25 leading-relaxed">
                    {isHe
                      ? 'לחיצה על "בדוק חיבור" שולחת payload לדוגמה לכתובת שלמעלה. ב-Make.com יש ללחוץ "Run once" לפני הבדיקה.'
                      : 'Clicking "Test Connection" sends a sample payload to the URL above. In Make.com, click "Run once" before testing.'}
                  </p>
                )}
              </div>
            </div>

            {/* Platform setup guides */}
            <div
              className="rounded-3xl overflow-hidden mb-6"
              style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.05)',
                animation: 'int-fade-up 0.45s ease-out 0.22s both',
              }}
            >
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <p className="text-[13px] font-bold text-white/80">
                  {isHe ? 'מדריך הגדרה לפי פלטפורמה' : 'Setup guide by platform'}
                </p>
                <p className="text-[12px] text-white/35 mt-1">
                  {isHe
                    ? 'לחץ על פלטפורמה לקבלת הוראות שלב-אחר-שלב'
                    : 'Click a platform for step-by-step instructions'}
                </p>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {PLATFORMS.map(platform => (
                  <div key={platform.name}>
                    <button
                      onClick={() => setExpandedPlatform(expandedPlatform === platform.name ? null : platform.name)}
                      className="w-full flex items-center justify-between px-6 py-4 text-start transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{platform.logo}</span>
                        <p className="text-[13px] font-bold text-white/80">{platform.name}</p>
                      </div>
                      {expandedPlatform === platform.name
                        ? <ChevronUp size={14} className="text-white/30 flex-none" />
                        : <ChevronDown size={14} className="text-white/30 flex-none" />
                      }
                    </button>
                    <AnimatePresence>
                      {expandedPlatform === platform.name && (
                        <motion.div
                          key={platform.name + '-steps'}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeOut' as const }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="px-6 pb-5">
                            <ol className="space-y-2.5">
                              {(isHe ? platform.stepsHe : platform.stepsEn).map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-[12px] text-white/55">
                                  <span
                                    className="flex-none flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white mt-0.5"
                                    style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)' }}
                                  >
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                            <div
                              className="mt-4 rounded-xl px-4 py-3 text-[11px] text-white/40 leading-relaxed"
                              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
                            >
                              {isHe
                                ? `💡 לאחר ההגדרה ב-${platform.name}, הדבק את ה-URL בשדה למעלה ולחץ שמור. לחץ "בדוק חיבור" כדי לוודא שהכל עובד.`
                                : `💡 After setting up in ${platform.name}, paste the URL in the field above and click Save. Then click "Test Connection" to verify everything works.`}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Use cases */}
            <div
              className="rounded-3xl px-6 py-5 mb-6"
              style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.05)',
                animation: 'int-fade-up 0.45s ease-out 0.28s both',
              }}
            >
              <p className="text-[12px] font-semibold text-zinc-500 mb-4">
                {isHe ? 'דוגמאות לאוטומציות פופולריות:' : 'Popular automation examples:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {USE_CASES.map((uc, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/50">
                    <span className="flex-none" style={{ color: '#6366f1' }}>{uc.iconEn}</span>
                    {isHe ? uc.he : uc.en}
                  </div>
                ))}
              </div>
            </div>

            {/* Compatible tools */}
            <div
              className="rounded-3xl px-6 py-5"
              style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.05)',
                animation: 'int-fade-up 0.45s ease-out 0.32s both',
              }}
            >
              <p className="text-[12px] font-semibold text-zinc-500 mb-4">
                {isHe ? 'תואם ל:' : 'Compatible with:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {['Make.com', 'Zapier', 'n8n', 'Invoice4u', 'HubSpot', 'Pipedrive', 'monday.com', 'SendGrid', 'Slack', 'WhatsApp Business'].map(tool => (
                  <span
                    key={tool}
                    className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-white/40"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Compatible tools footer (free users) */}
        {!isPaid && (
          <div
            className="mt-6 rounded-3xl px-6 py-5"
            style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.05)',
              animation: 'int-fade-up 0.45s ease-out 0.3s both',
            }}
          >
            <p className="text-[12px] font-semibold text-zinc-500 mb-4">
              {isHe ? 'תואם ל:' : 'Compatible with:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {['Make.com', 'Zapier', 'n8n', 'Invoice4u', 'HubSpot', 'Pipedrive', 'monday.com', 'SendGrid', 'Slack', 'WhatsApp Business'].map(tool => (
                <span
                  key={tool}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-white/40"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

      </main>

      <GlobalFooter />

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        activeCount={activeCount}
        currentTier={tier}
      />
    </div>
  )
}
