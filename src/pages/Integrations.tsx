import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Lock, CheckCircle2, AlertCircle, Loader2,
  Webhook, Link2, FlaskConical, ChevronDown, ChevronUp,
  MousePointerClick, Settings2, Bell, FileText, Send,
  ArrowDown, AlertTriangle, Info,
} from 'lucide-react'
import { useAuthStore, useTier } from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { UpgradeModal } from '../components/dashboard/UpgradeModal'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { useProposalStore } from '../stores/useProposalStore'

// ─── How It Works steps ───────────────────────────────────────────────────────

const FLOW_STEPS = [
  {
    icon: <MousePointerClick size={18} />,
    titleHe: 'הלקוח חותם על ההצעה',
    titleEn: 'Client signs your proposal',
    bodyHe: 'הלקוח פותח את קישור ה-Deal Room, בוחר את האפשרויות שלו וחותם דיגיטלית.',
    bodyEn: 'Your client opens the Deal Room link, selects their options, and signs digitally.',
    color: '#6366f1',
  },
  {
    icon: <Zap size={18} />,
    titleHe: 'DealSpace שולח את ה-Webhook',
    titleEn: 'DealSpace fires the webhook',
    bodyHe: 'תוך שניות, DealSpace שולח בקשת POST לכתובת שלך עם כל פרטי העסקה.',
    bodyEn: 'Within seconds, DealSpace sends a POST request to your URL with full deal details.',
    color: '#a855f7',
  },
  {
    icon: <Settings2 size={18} />,
    titleHe: 'האוטומציה שלך מופעלת',
    titleEn: 'Your automation runs',
    bodyHe: 'Make.com, Zapier או n8n מקבלים את הנתונים ומפעילים את כל ה-Workflow שבנית.',
    bodyEn: 'Make.com, Zapier, or n8n receive the data and trigger your entire workflow.',
    color: '#22c55e',
  },
]

// ─── Use cases ────────────────────────────────────────────────────────────────

const USE_CASES = [
  { icon: <FileText size={13} />, he: 'שליחת חשבונית מס אוטומטית דרך Invoice4u', en: 'Auto-send a tax invoice via Invoice4u' },
  { icon: <Bell size={13} />, he: 'התראת Slack/WhatsApp על כל סגירת עסקה', en: 'Slack/WhatsApp notification on every deal close' },
  { icon: <Link2 size={13} />, he: 'פתיחת עסקה חדשה ב-HubSpot או Pipedrive', en: 'Create a new deal in HubSpot or Pipedrive' },
  { icon: <Send size={13} />, he: 'מייל ברוכים הבאים ללקוח דרך SendGrid', en: 'Send a welcome email to the client via SendGrid' },
  { icon: <Settings2 size={13} />, he: 'הוספה ל-Google Sheets למעקב הכנסות', en: 'Append to Google Sheets for revenue tracking' },
  { icon: <MousePointerClick size={13} />, he: 'פתיחת משימה ב-monday.com / Notion', en: 'Trigger a task in monday.com or Notion' },
]

// ─── Platform guides ──────────────────────────────────────────────────────────

interface PlatformGuide {
  name: string
  logo: string
  tagHe: string
  tagEn: string
  stepsHe: Array<{ title: string; detail: string }>
  stepsEn: Array<{ title: string; detail: string }>
  tipHe: string
  tipEn: string
  commonMistakeHe: string
  commonMistakeEn: string
}

const PLATFORMS: PlatformGuide[] = [
  {
    name: 'Make.com',
    logo: '🔄',
    tagHe: 'הפלטפורמה הנפוצה ביותר בישראל לאוטומציה',
    tagEn: 'Most popular automation platform in Israel',
    stepsHe: [
      {
        title: 'פתח Scenario חדש',
        detail: 'היכנס ל-app.make.com, לחץ "Create a new scenario" (כפתור כחול בפינה). תגיע לעורך ויזואלי עם מעגל ריק באמצע.',
      },
      {
        title: 'הוסף מודול Webhook',
        detail: 'לחץ על המעגל הריק (+). בחלון החיפוש שנפתח, חפש "Webhooks". בחר "Custom webhook" ואז לחץ "Add".',
      },
      {
        title: 'צור Webhook חדש',
        detail: 'לחץ "Add" שוב בחלון הבא. Make.com ייצור URL ייחודי שנראה כך: https://hook.eu1.make.com/abc123xyz. זה ה-URL שלך.',
      },
      {
        title: 'העתק את ה-URL',
        detail: 'לחץ על הכפתור "Copy address to clipboard" שמופיע ליד ה-URL. שמור אותו — תצטרך אותו בשלב הבא.',
      },
      {
        title: 'הדבק כאן ושמור',
        detail: 'חזור לדף זה, הדבק את ה-URL בשדה "כתובת Webhook" למעלה, ולחץ "שמור". עכשיו ה-URL שמור ב-DealSpace.',
      },
      {
        title: 'הפעל מצב האזנה ב-Make',
        detail: 'חזור ל-Make.com ולחץ "Run once" (בפינה השמאלית התחתונה). Make.com עכשיו מחכה לנתונים ראשונים.',
      },
      {
        title: 'שלח Webhook לבדיקה',
        detail: 'חזור לדף זה ולחץ "בדוק חיבור". DealSpace ישלח payload לדוגמה. ב-Make.com תראה "1 bundle received".',
      },
      {
        title: 'הוסף את המודול הבא',
        detail: 'ב-Make.com, לחץ על הפלוס (+) שמופיע אחרי מודול ה-Webhook כדי להוסיף את הפעולה הבאה: שליחת מייל, עדכון CRM, חשבונית, Slack ועוד.',
      },
    ],
    stepsEn: [
      {
        title: 'Create a new Scenario',
        detail: 'Go to app.make.com, click "Create a new scenario" (blue button). You\'ll land in the visual editor with an empty circle in the center.',
      },
      {
        title: 'Add a Webhook module',
        detail: 'Click the empty circle (+). In the search window that opens, search for "Webhooks". Select "Custom webhook" then click "Add".',
      },
      {
        title: 'Create a new Webhook',
        detail: 'Click "Add" again in the next window. Make.com generates a unique URL like: https://hook.eu1.make.com/abc123xyz. This is your webhook URL.',
      },
      {
        title: 'Copy the URL',
        detail: 'Click the "Copy address to clipboard" button next to the URL. Save it — you\'ll need it in the next step.',
      },
      {
        title: 'Paste here and Save',
        detail: 'Return to this page, paste the URL in the "Webhook URL" field above, and click "Save". The URL is now stored in DealSpace.',
      },
      {
        title: 'Enable listening mode in Make',
        detail: 'Back in Make.com, click "Run once" (bottom-left corner). Make.com is now waiting for the first data.',
      },
      {
        title: 'Send a test webhook',
        detail: 'Return here and click "Test Connection". DealSpace sends a sample payload. In Make.com you\'ll see "1 bundle received".',
      },
      {
        title: 'Add your next module',
        detail: 'In Make.com, click the (+) that appears after the Webhook module to add the next action: send email, update CRM, create invoice, Slack, and more.',
      },
    ],
    tipHe: '💡 ב-Make.com, השתמש ב-"Data Structure" כדי למפות את שדות ה-Webhook אוטומטית. לחץ "Determine data structure" ו-Make יזהה את כל השדות מהבדיקה.',
    tipEn: '💡 In Make.com, use "Data Structure" to auto-map webhook fields. Click "Determine data structure" and Make will recognize all fields from the test.',
    commonMistakeHe: '⚠️ טעות נפוצה: שכחת ללחוץ "Run once" לפני בדיקת החיבור. Make.com חייב להיות במצב האזנה כדי לקבל את הנתונים.',
    commonMistakeEn: '⚠️ Common mistake: Forgetting to click "Run once" before testing. Make.com must be in listening mode to receive data.',
  },
  {
    name: 'Zapier',
    logo: '⚡',
    tagHe: 'אינטגרציה עם 6,000+ אפליקציות',
    tagEn: 'Integrates with 6,000+ apps',
    stepsHe: [
      {
        title: 'פתח Zap חדש',
        detail: 'היכנס ל-zapier.com/app/editor, לחץ "+ Create Zap". תגיע לעורך שלבים.',
      },
      {
        title: 'בחר Trigger: Webhooks by Zapier',
        detail: 'בחלון "Trigger", חפש "Webhooks by Zapier" (זהו אפליקציה מובנית של Zapier). לחץ עליה.',
      },
      {
        title: 'בחר "Catch Hook"',
        detail: 'מתוך אפשרויות ה-Event, בחר "Catch Hook". זה יוצר URL ייחודי שמקבל בקשות POST.',
      },
      {
        title: 'העתק את ה-Webhook URL',
        detail: 'Zapier מציג URL שנראה כך: https://hooks.zapier.com/hooks/catch/1234567/abcdef/. העתק אותו.',
      },
      {
        title: 'הדבק כאן ושמור',
        detail: 'חזור לדף זה, הדבק את ה-URL בשדה למעלה, ולחץ "שמור".',
      },
      {
        title: 'בדוק חיבור',
        detail: 'לחץ "בדוק חיבור" בדף זה. Zapier אמור לזהות אוטומטית את הנתונים שנשלחו (proposal_id, client_name, grand_total וכו\').',
      },
      {
        title: 'הוסף Action',
        detail: 'לחץ "Continue" ב-Zapier, ואז "+ Add Action" כדי להגדיר מה יקרה: שלח מייל, עדכן Google Sheets, צור רשומה ב-HubSpot ועוד.',
      },
      {
        title: 'הפעל את ה-Zap',
        detail: 'לחץ "Publish Zap" (כפתור כתום). ה-Zap פעיל ומוכן לקבל webhooks אמיתיים.',
      },
    ],
    stepsEn: [
      {
        title: 'Create a new Zap',
        detail: 'Go to zapier.com/app/editor, click "+ Create Zap". You\'ll land in the step editor.',
      },
      {
        title: 'Choose Trigger: Webhooks by Zapier',
        detail: 'In the "Trigger" panel, search for "Webhooks by Zapier" (built-in Zapier app). Click it.',
      },
      {
        title: 'Choose "Catch Hook"',
        detail: 'From the Event options, choose "Catch Hook". This creates a unique URL that accepts POST requests.',
      },
      {
        title: 'Copy the Webhook URL',
        detail: 'Zapier shows a URL like: https://hooks.zapier.com/hooks/catch/1234567/abcdef/. Copy it.',
      },
      {
        title: 'Paste here and Save',
        detail: 'Return to this page, paste the URL in the field above, and click "Save".',
      },
      {
        title: 'Test Connection',
        detail: 'Click "Test Connection" on this page. Zapier should automatically detect the sent data (proposal_id, client_name, grand_total, etc.).',
      },
      {
        title: 'Add an Action',
        detail: 'Click "Continue" in Zapier, then "+ Add Action" to define what happens: send email, update Google Sheets, create a HubSpot record, and more.',
      },
      {
        title: 'Publish the Zap',
        detail: 'Click "Publish Zap" (orange button). The Zap is active and ready to receive real webhooks.',
      },
    ],
    tipHe: '💡 Zapier מזהה אוטומטית את שדות ה-Webhook לאחר הבדיקה. תוכל להשתמש ב-"{{data__client_name}}" בכל שלב כדי להכניס את שם הלקוח.',
    tipEn: '💡 Zapier auto-detects webhook fields after the test. You can use "{{data__client_name}}" in any step to insert the client name.',
    commonMistakeHe: '⚠️ Webhooks by Zapier הוא אפליקציה בתשלום בתוכניות מסוימות של Zapier. אם אינך רואה אותה, בדוק את התוכנית שלך.',
    commonMistakeEn: '⚠️ Webhooks by Zapier is a paid-tier feature in some Zapier plans. If you don\'t see it, check your plan.',
  },
  {
    name: 'n8n',
    logo: '🔗',
    tagHe: 'קוד פתוח — לאינסטלציה עצמית או Cloud',
    tagEn: 'Open source — self-hosted or Cloud',
    stepsHe: [
      {
        title: 'פתח Workflow חדש',
        detail: 'ב-n8n שלך (n8n.io/cloud או self-hosted), לחץ "New workflow".',
      },
      {
        title: 'הוסף Webhook Node',
        detail: 'לחץ "+ Add first step" ← חפש "Webhook". בחר את ה-Webhook node (לא HTTP Request).',
      },
      {
        title: 'הגדר HTTP Method',
        detail: 'ב-Webhook node: שנה "HTTP Method" ל-POST. השאר את שאר ההגדרות כברירת מחדל.',
      },
      {
        title: 'העתק את ה-Test URL',
        detail: 'n8n מציג שני URLs: "Test URL" ו-"Production URL". להתחלה, העתק את ה-"Test URL" (נראה כמו: https://yourn8n.app.n8n.cloud/webhook-test/uuid).',
      },
      {
        title: 'הדבק כאן ושמור',
        detail: 'חזור לדף זה, הדבק את ה-Test URL, ולחץ "שמור".',
      },
      {
        title: 'הפעל האזנה',
        detail: 'ב-n8n, לחץ "Test workflow" (כפתור בפינה). n8n עכשיו מחכה לנתונים.',
      },
      {
        title: 'שלח בדיקה ובנה',
        detail: 'לחץ "בדוק חיבור" בדף זה. ב-n8n תראה את הנתונים ב-"Input" של ה-Webhook node. מכאן תוכל לחבר nodes נוספים.',
      },
      {
        title: 'עבור ל-Production URL',
        detail: 'לאחר שסיימת לבנות ולבדוק, החלף ב-DealSpace ל-"Production URL" (ללא /webhook-test/) ולחץ שמור. Activate את ה-Workflow ב-n8n.',
      },
    ],
    stepsEn: [
      {
        title: 'Create a new Workflow',
        detail: 'In your n8n instance (n8n.io/cloud or self-hosted), click "New workflow".',
      },
      {
        title: 'Add a Webhook Node',
        detail: 'Click "+ Add first step" → search "Webhook". Choose the Webhook node (not HTTP Request).',
      },
      {
        title: 'Set HTTP Method',
        detail: 'In the Webhook node: change "HTTP Method" to POST. Leave other settings as default.',
      },
      {
        title: 'Copy the Test URL',
        detail: 'n8n shows two URLs: "Test URL" and "Production URL". Start with the "Test URL" (like: https://yourn8n.app.n8n.cloud/webhook-test/uuid).',
      },
      {
        title: 'Paste here and Save',
        detail: 'Return to this page, paste the Test URL, and click "Save".',
      },
      {
        title: 'Enable listening',
        detail: 'In n8n, click "Test workflow" (button in the corner). n8n is now waiting for data.',
      },
      {
        title: 'Test and build',
        detail: 'Click "Test Connection" on this page. In n8n you\'ll see data in the "Input" of the Webhook node. Now you can connect additional nodes.',
      },
      {
        title: 'Switch to Production URL',
        detail: 'Once you\'re done building, replace with the "Production URL" (without /webhook-test/) and click Save. Activate the Workflow in n8n.',
      },
    ],
    tipHe: '💡 ב-n8n, השתמש ב-"JSON" output מה-Webhook node. הנתונים יהיו תחת body.data.client_name, body.data.grand_total וכו\'.',
    tipEn: '💡 In n8n, use "JSON" output from the Webhook node. Data will be under body.data.client_name, body.data.grand_total, etc.',
    commonMistakeHe: '⚠️ טעות נפוצה: שימוש ב-Test URL בסביבת הפרודקשן. בסיום הבנייה — החלף ל-Production URL והפעל את ה-Workflow.',
    commonMistakeEn: '⚠️ Common mistake: Using the Test URL in production. When done building — switch to Production URL and Activate the Workflow.',
  },
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
      setTimeout(() => setTestStatus('idle'), 5000)
    }
  }

  const activeCount = proposals.filter(p => !p.is_archived).length

  const inputClass = [
    'w-full bg-[var(--input-bg)] border border-[color:var(--border)] rounded-xl px-4 py-3.5 text-base text-main placeholder:text-dim',
    'outline-none transition-all duration-200',
    'shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    'focus:bg-[var(--input-bg)] focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/[0.12]',
  ].join(' ')

  const isWebhookSaved = !!(user?.user_metadata?.webhook_url as string | undefined)?.trim()

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
          0%, 100% { box-shadow: 0 0 32px rgba(212,175,55,0.15); }
          50%       { box-shadow: 0 0 48px rgba(212,175,55,0.3); }
        }
      `}</style>

      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'int-float 22s ease-in-out infinite', willChange: 'transform' }} />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'int-float 28s ease-in-out infinite reverse', willChange: 'transform' }} />
      </div>

      <main className="relative z-10 px-6 py-10 max-w-3xl mx-auto w-full flex-1">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="mb-10" style={{ animation: 'int-fade-up 0.4s ease-out 0.05s both' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl flex-none"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
              <Webhook size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-main" style={{ letterSpacing: '-0.025em' }}>
              {isHe ? 'אינטגרציות ואוטומציות' : 'Integrations & Automations'}
            </h1>
          </div>
          <p className="text-[14px] text-subtle leading-relaxed">
            {isHe
              ? 'חבר את DealSpace לכלים שלך — webhook אוטומטי בכל פעם שלקוח חותם על הצעה.'
              : 'Connect DealSpace to your tools — automatic webhook every time a client signs a proposal.'}
          </p>
        </div>

        {/* ── How it works — shown to all ────────────────────────────────────── */}
        <div
          className="bg-card border border-[color:var(--border)] rounded-3xl overflow-hidden mb-6"
          style={{ animation: 'int-fade-up 0.45s ease-out 0.1s both' }}
        >
          <div className="px-6 py-4 border-b border-[color:var(--border-subtle)]">
            <p className="text-[13px] font-bold text-subtle">
              {isHe ? 'איך זה עובד — 3 שלבים' : 'How it works — 3 steps'}
            </p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-none flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${step.color}18`, border: `1px solid ${step.color}35`, color: step.color }}>
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-subtle mb-1">
                    {isHe ? step.titleHe : step.titleEn}
                  </p>
                  <p className="text-[12px] text-dim leading-relaxed">
                    {isHe ? step.bodyHe : step.bodyEn}
                  </p>
                </div>
                <span className="flex-none flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-dim mt-1"
                  style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FREE: paywall gate ──────────────────────────────────────────────── */}
        {!isPaid && (
          <>
            {/* Use cases */}
            <div className="bg-card border border-[color:var(--border)] rounded-3xl px-6 py-5 mb-6"
              style={{ animation: 'int-fade-up 0.45s ease-out 0.16s both' }}>
              <p className="text-[12px] font-semibold text-dim mb-3">
                {isHe ? 'מה תוכל לאוטמט:' : 'What you can automate:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {USE_CASES.map((uc, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-subtle">
                    <span className="flex-none" style={{ color: '#6366f1' }}>{uc.icon}</span>
                    {isHe ? uc.he : uc.en}
                  </div>
                ))}
              </div>
            </div>

            {/* Lock gate */}
            <div className="rounded-3xl overflow-hidden mb-6"
              style={{
                background: 'linear-gradient(160deg, rgba(212,175,55,0.08) 0%, rgba(99,102,241,0.06) 100%)',
                border: '1px solid rgba(212,175,55,0.2)',
                animation: 'int-glow-pulse 2.5s ease-in-out infinite, int-fade-up 0.45s ease-out 0.22s both',
              }}>
              <div className="px-8 py-10 flex flex-col items-center text-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 0 40px rgba(212,175,55,0.18)' }}>
                  <Lock size={24} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-[17px] font-black text-main mb-2">
                    {isHe ? 'אוטומציות זמינות בתוכנית Pro ומעלה' : 'Automations require Pro or higher'}
                  </p>
                  <p className="text-[13px] text-subtle leading-relaxed max-w-sm mx-auto">
                    {isHe
                      ? 'שדרג כדי לחבר Webhook, לשלוח חשבוניות אוטומטיות, לעדכן CRM ולקבל התראות בזמן אמת על כל חתימה.'
                      : 'Upgrade to connect a webhook, send automatic invoices, update your CRM, and get real-time notifications on every signature.'}
                  </p>
                </div>
                <motion.button
                  onClick={() => setUpgradeOpen(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                  className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-[14px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                  <Zap size={15} />
                  {isHe ? 'שדרג לפרו — ₪19 / חודש' : 'Upgrade to Pro — ₪19 / month'}
                </motion.button>
                <p className="text-[11px] text-dim">
                  {isHe ? 'ביטול בכל עת · כולל מע"מ' : 'Cancel anytime · VAT incl.'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── PAID: webhook config + full guides ─────────────────────────────── */}
        {isPaid && (
          <>
            {/* Status + active webhook indicator */}
            {isWebhookSaved && (
              <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', animation: 'int-fade-up 0.35s ease-out 0.14s both' }}>
                <CheckCircle2 size={14} className="text-emerald-400 flex-none" />
                <p className="text-[12px] font-semibold text-emerald-400">
                  {isHe ? 'Webhook פעיל ומוגדר — DealSpace ישלח POST לאחר כל חתימה' : 'Webhook active — DealSpace will POST after every signature'}
                </p>
              </div>
            )}

            {/* Webhook configuration card */}
            <div className="relative overflow-hidden rounded-3xl bg-card border border-[color:var(--border)] mb-6"
              style={{ animation: 'int-fade-up 0.45s ease-out 0.15s both' }}>

              <div className="flex items-center gap-3 px-6 py-5 border-b border-[color:var(--border-subtle)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl flex-none"
                  style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.28)' }}>
                  <Zap size={15} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-main">
                    {isHe ? 'Webhook — event: proposal.accepted' : 'Webhook — event: proposal.accepted'}
                  </p>
                  <p className="text-[11px] text-dim mt-0.5">
                    {isHe ? 'מופעל מיד לאחר שלקוח חותם על ההצעה' : 'Fires immediately after a client signs a proposal'}
                  </p>
                </div>
              </div>

              <div className="px-6 py-6 space-y-5">

                {/* Webhook URL input */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-subtle mb-2.5">
                    <Link2 size={13} className="text-indigo-400" />
                    {isHe ? 'כתובת Webhook' : 'Webhook URL'}
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                    placeholder="https://hook.eu1.make.com/..."
                    className={inputClass}
                    dir="ltr"
                  />
                  <p className="text-[12px] text-dim mt-2">
                    {isHe
                      ? 'הכתובת שמקבלת את ה-POST. קבל אותה מ-Make.com, Zapier, n8n או כל כלי אוטומציה אחר (ראה מדריך למטה).'
                      : 'The URL that receives the POST. Get it from Make.com, Zapier, n8n, or any automation tool (see guide below).'}
                  </p>
                </div>

                {/* Payload preview */}
                <div>
                  <p className="text-[12px] font-semibold text-dim mb-2 flex items-center gap-1.5">
                    <Info size={12} className="text-indigo-400" />
                    {isHe ? 'Payload שנשלח בכל חתימה' : 'Payload sent on every signature'}
                  </p>
                  <div className="rounded-xl px-4 py-3.5 text-[11px] font-mono leading-relaxed overflow-x-auto text-slate-600 dark:text-white/40 bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/5" dir="ltr">
                    <span className="text-indigo-400/70">{'{'}</span>
                    {`\n  "event": "proposal.accepted",\n  "data": {\n    "proposal_id":  "uuid",\n    "project_title": "עיצוב מחדש לאתר",\n    "client_name":   "שם הלקוח",\n    "client_email":  "client@example.com",\n    "client_company": "שם החברה",\n    "grand_total":   12000,\n    "currency":      "ILS",\n    "public_token":  "abc123",\n    "signed_at":     "2026-04-03T10:30:00.000Z"\n  }\n`}
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
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
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
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      color: !webhookUrl.trim() ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                      cursor: !webhookUrl.trim() ? 'not-allowed' : 'pointer',
                    }}>
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
                        <CheckCircle2 size={13} />{isHe ? '✓ Webhook מגיב תקין' : '✓ Webhook responded OK'}
                      </motion.span>
                    )}
                    {testStatus === 'error' && (
                      <motion.span key="test-err" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400">
                        <AlertCircle size={13} />{isHe ? 'שגיאה — ה-URL לא מגיב ל-POST' : 'Error — URL not responding to POST'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Contextual test hint */}
                {webhookUrl.trim() && (
                  <p className="text-[11px] text-dim leading-relaxed">
                    {isHe
                      ? 'ב-Make.com: לחץ "Run once" לפני הבדיקה. ב-n8n: לחץ "Test workflow". ב-Zapier: ה-Zap חייב להיות Published.'
                      : 'Make.com: click "Run once" before testing. n8n: click "Test workflow". Zapier: Zap must be Published.'}
                  </p>
                )}
              </div>
            </div>

            {/* Platform setup guides — accordion */}
            <div className="bg-card border border-[color:var(--border)] rounded-3xl overflow-hidden mb-6"
              style={{ animation: 'int-fade-up 0.45s ease-out 0.2s both' }}>

              <div className="px-6 py-5 border-b border-[color:var(--border-subtle)]">
                <p className="text-[13px] font-bold text-subtle">
                  {isHe ? 'מדריך הגדרה שלב אחר שלב' : 'Step-by-step setup guide'}
                </p>
                <p className="text-[12px] text-dim mt-1">
                  {isHe
                    ? 'בחר את הפלטפורמה שלך — המדריך יוביל אותך בדיוק מה ללחוץ ואיפה'
                    : 'Choose your platform — the guide tells you exactly what to click and where'}
                </p>
              </div>

              <div className="divide-y divide-[color:var(--border-subtle)]">
                {PLATFORMS.map(platform => (
                  <div key={platform.name}>
                    <button
                      onClick={() => setExpandedPlatform(expandedPlatform === platform.name ? null : platform.name)}
                      className="w-full flex items-center justify-between px-6 py-4 text-start transition-colors hover:bg-[var(--bg-card-hover)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{platform.logo}</span>
                        <div>
                          <p className="text-[13px] font-bold text-subtle">{platform.name}</p>
                          <p className="text-[11px] text-dim">
                            {isHe ? platform.tagHe : platform.tagEn}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        {expandedPlatform === platform.name && (
                          <span className="text-[10px] font-bold text-indigo-400 rounded-full px-2 py-0.5"
                            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                            {isHe ? 'פתוח' : 'Open'}
                          </span>
                        )}
                        {expandedPlatform === platform.name
                          ? <ChevronUp size={15} className="text-dim" />
                          : <ChevronDown size={15} className="text-dim" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedPlatform === platform.name && (
                        <motion.div
                          key={platform.name + '-body'}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' as const }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="px-6 pb-6">
                            {/* Steps */}
                            <div className="space-y-0">
                              {(isHe ? platform.stepsHe : platform.stepsEn).map((step, i) => (
                                <div key={i} className="flex gap-4 py-3 border-b border-[color:var(--border-subtle)] last:border-0">
                                  <div className="flex-none flex flex-col items-center gap-1 pt-0.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white flex-none"
                                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                      {i + 1}
                                    </span>
                                    {i < (isHe ? platform.stepsHe : platform.stepsEn).length - 1 && (
                                      <div className="w-px flex-1 mt-1" style={{ background: 'rgba(99,102,241,0.2)', minHeight: 16 }} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 pb-1">
                                    <p className="text-[13px] font-bold text-subtle mb-1">{step.title}</p>
                                    <p className="text-[12px] text-subtle leading-relaxed">{step.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Divider */}
                            <div className="my-4 border-t border-[color:var(--border-subtle)]" />

                            {/* Tip */}
                            <div className="rounded-xl px-4 py-3 mb-3"
                              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}>
                              <p className="text-[12px] text-indigo-300/80 leading-relaxed">
                                {isHe ? platform.tipHe : platform.tipEn}
                              </p>
                            </div>

                            {/* Common mistake */}
                            <div className="rounded-xl px-4 py-3"
                              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                              <p className="text-[12px] leading-relaxed flex items-start gap-2" style={{ color: 'rgba(248,113,113,0.8)' }}>
                                <AlertTriangle size={13} className="flex-none mt-0.5" />
                                {isHe ? platform.commonMistakeHe : platform.commonMistakeEn}
                              </p>
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
            <div className="bg-card border border-[color:var(--border)] rounded-3xl px-6 py-5 mb-6"
              style={{ animation: 'int-fade-up 0.45s ease-out 0.25s both' }}>
              <p className="text-[12px] font-semibold text-dim mb-4">
                {isHe ? 'רעיונות לאוטומציות פופולריות:' : 'Popular automation ideas:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {USE_CASES.map((uc, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-subtle">
                    <span className="flex-none" style={{ color: '#818cf8' }}>{uc.icon}</span>
                    {isHe ? uc.he : uc.en}
                  </div>
                ))}
              </div>
            </div>

            {/* Need help */}
            <div className="bg-card border border-[color:var(--border)] rounded-3xl px-6 py-5"
              style={{ animation: 'int-fade-up 0.45s ease-out 0.3s both' }}>
              <div className="flex items-start gap-3">
                <ArrowDown size={14} className="text-indigo-400 flex-none mt-0.5 rotate-[135deg]" />
                <div>
                  <p className="text-[13px] font-bold text-subtle mb-1">
                    {isHe ? 'צריך עזרה בהגדרה?' : 'Need help setting up?'}
                  </p>
                  <p className="text-[12px] text-dim leading-relaxed">
                    {isHe
                      ? 'שלח מייל ל-support@dealspace.app עם שם הפלטפורמה שאתה משתמש בה ונעזור לך בהגדרה המלאה.'
                      : 'Email support@dealspace.app with the platform name you\'re using and we\'ll help with full setup.'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Compatible tools — both tiers */}
        <div className="bg-card border border-[color:var(--border)] mt-6 rounded-3xl px-6 py-5"
          style={{ animation: 'int-fade-up 0.45s ease-out 0.35s both' }}>
          <p className="text-[11px] font-semibold text-dim mb-3">
            {isHe ? 'תואם ל:' : 'Compatible with:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {['Make.com', 'Zapier', 'n8n', 'Invoice4u', 'HubSpot', 'Pipedrive', 'monday.com', 'SendGrid', 'Slack', 'WhatsApp Business'].map(tool => (
              <span key={tool} className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-dim"
                style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)' }}>
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
