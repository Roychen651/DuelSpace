import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Lock, CheckCircle2, AlertCircle, Loader2, ExternalLink, Webhook, Send } from 'lucide-react'
import { useAuthStore, useTier } from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { UpgradeModal } from '../components/dashboard/UpgradeModal'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { useProposalStore } from '../stores/useProposalStore'

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

  // Load existing webhook URL from user metadata
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
    !isPaid ? 'cursor-not-allowed opacity-40 select-none' : '',
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
        @keyframes int-pulse {
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

        {/* ── Header ──────────────────────────────────────────────────────── */}
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
              ? 'חבר את DealSpace לכלים שלך — קבל webhook בכל פעם שלקוח חותם על הצעה.'
              : 'Connect DealSpace to your tools — receive a webhook every time a client signs a proposal.'}
          </p>
        </div>

        {/* ── Webhook card ─────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-white/[0.02] dark:border-white/[0.06] dark:shadow-none"
          style={{
            animation: 'int-fade-up 0.45s ease-out 0.12s both',
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-white/[0.05]"
          >
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
                {isHe ? 'POST — event: proposal.accepted' : 'POST — event: proposal.accepted'}
              </p>
            </div>
            {/* Tier badge */}
            <div
              className="flex-none flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black"
              style={isPaid
                ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }
                : { background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }
              }
            >
              {isPaid ? <CheckCircle2 size={11} /> : <Lock size={11} />}
              {isPaid ? (isHe ? 'פעיל' : 'Active') : (isHe ? 'Pro בלבד' : 'Pro only')}
            </div>
          </div>

          {/* Card body */}
          <div className="px-6 py-6 space-y-5">

            {/* Paywall blur overlay for free users */}
            {!isPaid && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-3xl"
                style={{ backdropFilter: 'blur(8px)', background: 'rgba(4,6,8,0.5)' }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.28)', boxShadow: '0 0 32px rgba(212,175,55,0.14)' }}
                >
                  <Lock size={22} className="text-yellow-400" />
                </div>
                <div className="text-center px-6">
                  <p className="text-[15px] font-bold text-white mb-1.5">
                    {isHe ? 'אוטומציות זמינות בתוכנית Pro' : 'Automations require Pro'}
                  </p>
                  <p className="text-[13px] text-white/45 leading-relaxed">
                    {isHe
                      ? 'שדרג לקבלת webhook, אינטגרציות עם Make.com, Invoice4u ועוד.'
                      : 'Upgrade to unlock webhooks, Make.com, Invoice4u integrations, and more.'}
                  </p>
                </div>
                <motion.button
                  onClick={() => setUpgradeOpen(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                  className="flex items-center gap-2 rounded-2xl px-6 py-3 text-[13px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 28px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}
                >
                  <Zap size={14} />
                  {isHe ? 'שדרג ל-Pro' : 'Upgrade to Pro'}
                </motion.button>
              </div>
            )}

            {/* Webhook URL input */}
            <div>
              <label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-300 mb-2.5">
                <Send size={13} className="text-indigo-400" />
                {isHe ? 'כתובת Webhook' : 'Webhook URL'}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                  placeholder={isHe ? 'https://hook.make.com/...' : 'https://hook.make.com/...'}
                  className={inputClass}
                  disabled={!isPaid}
                  dir="ltr"
                />
              </div>
              <p className="text-[12px] text-zinc-500 mt-2">
                {isHe
                  ? 'DealSpace ישלח POST עם פרטי ההצעה מיד לאחר שהלקוח חותם.'
                  : 'DealSpace will POST deal details immediately after the client signs.'}
              </p>
            </div>

            {/* Payload preview */}
            <div>
              <p className="text-[12px] font-semibold text-zinc-400 mb-2">
                {isHe ? 'מבנה ה-Payload' : 'Payload structure'}
              </p>
              <div
                className="rounded-xl px-4 py-3.5 text-[11px] font-mono leading-relaxed text-white/40 overflow-x-auto"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}
                dir="ltr"
              >
                <span className="text-indigo-400/70">{'{'}</span>
                {`\n  "event": "proposal.accepted",\n  "data": {\n    "proposal_id": "uuid",\n    "project_title": "...",\n    "client_name": "...",\n    "client_email": "...",\n    "grand_total": 5000,\n    "currency": "ILS",\n    "signed_at": "2026-01-01T00:00:00.000Z"\n  }\n`}
                <span className="text-indigo-400/70">{'}'}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                onClick={handleSave}
                disabled={!isPaid || saving}
                whileHover={isPaid ? { scale: 1.02 } : {}}
                whileTap={isPaid ? { scale: 0.97 } : {}}
                className="flex items-center gap-2 rounded-xl px-5 h-10 text-[13px] font-bold text-white flex-none"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                  opacity: !isPaid ? 0.4 : 1,
                  cursor: !isPaid ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                {isHe ? 'שמור' : 'Save'}
              </motion.button>

              <motion.button
                onClick={handleTest}
                disabled={!isPaid || testing || !webhookUrl.trim()}
                whileHover={isPaid && webhookUrl.trim() ? { scale: 1.02 } : {}}
                whileTap={isPaid && webhookUrl.trim() ? { scale: 0.97 } : {}}
                className="flex items-center gap-2 rounded-xl px-5 h-10 text-[13px] font-semibold flex-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: !isPaid || !webhookUrl.trim() ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
                  cursor: !isPaid || !webhookUrl.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {testing ? <Loader2 size={13} className="animate-spin" /> : <ExternalLink size={13} />}
                {isHe ? 'בדוק חיבור' : 'Test Connection'}
              </motion.button>

              {/* Status indicators */}
              <AnimatePresence>
                {saveStatus === 'saved' && (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-400"
                  >
                    <CheckCircle2 size={13} />
                    {isHe ? 'נשמר בהצלחה' : 'Saved'}
                  </motion.span>
                )}
                {saveStatus === 'error' && (
                  <motion.span
                    key="save-err"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400"
                  >
                    <AlertCircle size={13} />
                    {isHe ? 'שגיאה בשמירה' : 'Save failed'}
                  </motion.span>
                )}
                {testStatus === 'ok' && (
                  <motion.span
                    key="test-ok"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-400"
                  >
                    <CheckCircle2 size={13} />
                    {isHe ? 'Webhook מגיב תקין' : 'Webhook responded OK'}
                  </motion.span>
                )}
                {testStatus === 'error' && (
                  <motion.span
                    key="test-err"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400"
                  >
                    <AlertCircle size={13} />
                    {isHe ? 'שגיאה — בדוק את הכתובת' : 'Error — check the URL'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Compatible tools ─────────────────────────────────────────────── */}
        <div
          className="mt-6 rounded-3xl px-6 py-5"
          style={{
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid rgba(255,255,255,0.05)',
            animation: 'int-fade-up 0.45s ease-out 0.22s both',
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
