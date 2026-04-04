import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import type { ProposalInsert, AddOn } from '../../types/proposal'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AIGhostwriterProps {
  onGenerate: (patch: Partial<ProposalInsert>) => void
  locale: string
}

// ─── Proposal templates ───────────────────────────────────────────────────────

interface Template {
  keywords: string[]
  generate: (isHe: boolean) => Partial<ProposalInsert>
}

function makeAddOn(label: string, desc: string, price: number, enabled = false): AddOn {
  return { id: crypto.randomUUID(), label, description: desc, price, enabled }
}

const TEMPLATES: Template[] = [
  {
    keywords: ['website', 'web', 'אתר', 'landing', 'ecommerce', 'e-commerce', 'חנות'],
    generate: (isHe) => ({
      project_title: isHe ? 'בניית אתר אינטרנט מקצועי' : 'Professional Website Build',
      description: isHe
        ? 'פיתוח אתר אינטרנט מלא ומגיב המותאם למובייל, כולל עיצוב UI/UX, תכנות Front-End ו-Back-End, אינטגרציה עם מערכת ניהול תוכן, SEO בסיסי ואפשרות ניהול עצמאי לאחר מסירה.'
        : 'Full responsive website including UI/UX design, Front-End & Back-End development, CMS integration, basic SEO, and training for self-management post-delivery.',
      base_price: 8500,
      currency: 'ILS',
      add_ons: [
        makeAddOn('E-Commerce / Cart', 'WooCommerce or custom checkout', 3200),
        makeAddOn('Multilingual Support', 'Hebrew + English / Arabic', 1800),
        makeAddOn('Blog + CMS Training', 'Full training session included', 900),
        makeAddOn('3 Months Priority Support', 'Bug fixes + minor changes', 1400),
      ],
    }),
  },
  {
    keywords: ['photo', 'photography', 'צילום', 'צלם', 'branding shoot', 'headshot'],
    generate: (isHe) => ({
      project_title: isHe ? 'חבילת צילום מקצועית' : 'Professional Photography Package',
      description: isHe
        ? 'יום צילום מלא הכולל הכנה מקצועית, 8 שעות צילום, עריכה מקצועית של 40 תמונות ברזולוציה גבוהה ומסירה דיגיטלית. כולל הסכם שימוש בתמונות ורישיון מסחרי.'
        : 'Full-day shoot including prep, 8 hours on-location, professional editing of 40 high-res images, and digital delivery. Includes usage rights and commercial license.',
      base_price: 3900,
      currency: 'ILS',
      add_ons: [
        makeAddOn('Aerial Drone Shots', '10 edited aerial photos', 1200),
        makeAddOn('Rush Delivery 48h', 'Edited gallery in 48 hours', 650),
        makeAddOn('Video Reels (3×)', '30-second reels for Instagram', 1800),
        makeAddOn('Second Photographer', 'Additional angles + backup', 1100),
      ],
    }),
  },
  {
    keywords: ['brand', 'logo', 'identity', 'מיתוג', 'לוגו', 'זהות', 'design', 'עיצוב'],
    generate: (isHe) => ({
      project_title: isHe ? 'מיתוג עסקי מלא' : 'Full Brand Identity',
      description: isHe
        ? 'פרויקט מיתוג מלא הכולל מחקר מתחרים, הגדרת אסטרטגיית מותג, עיצוב לוגו (3 קונספטים + 2 סבבי תיקונים), פלטת צבעים, טיפוגרפיה ועזרי מותג בסיסיים.'
        : 'Complete brand identity including competitor research, brand strategy, logo design (3 concepts + 2 revision rounds), color palette, typography, and basic brand assets.',
      base_price: 6500,
      currency: 'ILS',
      add_ons: [
        makeAddOn('Brand Guidelines Doc', 'PDF style guide (20+ pages)', 1600),
        makeAddOn('Business Card Design', 'Print-ready files included', 700),
        makeAddOn('Social Media Templates', '12 Canva/Figma templates', 1200),
        makeAddOn('Product Packaging', 'Up to 2 product sizes', 2400),
      ],
    }),
  },
  {
    keywords: ['social', 'media', 'content', 'instagram', 'tiktok', 'רשתות', 'תוכן', 'קמפיין'],
    generate: (isHe) => ({
      project_title: isHe ? 'ניהול רשתות חברתיות חודשי' : 'Monthly Social Media Management',
      description: isHe
        ? 'ניהול מלא של נוכחות מותגית ברשתות החברתיות: תכנון לוח תוכן חודשי, כתיבה ועיצוב 20 פוסטים, תיאום ופרסום, מעקב אחר ביצועים ודו״ח חודשי.'
        : 'Full social media presence management: monthly content calendar, copywriting and design for 20 posts, scheduling and publishing, performance tracking, and monthly report.',
      base_price: 2800,
      currency: 'ILS',
      add_ons: [
        makeAddOn('Paid Ads Management', 'Meta + Google (budget separate)', 1200),
        makeAddOn('8 Instagram Reels/mo', 'Short-form video editing', 2200),
        makeAddOn('Influencer Coordination', 'Identify + brief + manage', 1800),
        makeAddOn('Strategy Workshop (2h)', 'Quarterly positioning session', 900),
      ],
    }),
  },
  {
    keywords: ['video', 'film', 'production', 'וידאו', 'סרט', 'פרסומת', 'youtube'],
    generate: (isHe) => ({
      project_title: isHe ? 'הפקת וידאו שיווקי' : 'Marketing Video Production',
      description: isHe
        ? 'הפקת וידאו שיווקי מקצועי מהסקריפט ועד למסירה: כתיבת תסריט, ימי צילום, עריכת וידאו מקצועית, מוזיקת רקע מורשית, כתוביות ועוד. אורך סופי: 60-90 שניות.'
        : 'Professional marketing video from script to delivery: scriptwriting, shoot days, professional video editing, licensed background music, subtitles, and more. Final length: 60-90 seconds.',
      base_price: 12000,
      currency: 'ILS',
      add_ons: [
        makeAddOn('Animated Graphics Package', 'Motion titles + transitions', 2800),
        makeAddOn('English Dubbing / Subtitles', 'Professional VO recording', 1600),
        makeAddOn('Second Edit (30s cut)', 'Social media optimized cut', 1200),
        makeAddOn('Full Day Extra Shooting', 'Additional locations or angles', 3500),
      ],
    }),
  },
  {
    keywords: ['seo', 'marketing', 'פרסום', 'קידום', 'גוגל', 'google ads', 'paid'],
    generate: (isHe) => ({
      project_title: isHe ? 'קידום דיגיטלי ו-SEO' : 'Digital Marketing & SEO',
      description: isHe
        ? 'שירות קידום דיגיטלי מלא: מחקר מילות מפתח, אופטימיזציית תוכן, בניית קישורים, ניהול Google Ads ומעקב ביצועים חודשי. כולל דו״ח מפורט בסוף כל חודש.'
        : 'Full digital marketing: keyword research, content optimization, link building, Google Ads management, and monthly performance tracking. Includes a detailed end-of-month report.',
      base_price: 3200,
      currency: 'ILS',
      add_ons: [
        makeAddOn('Google Ads (6 campaigns)', 'Search + Display campaigns', 1600),
        makeAddOn('Landing Page CRO Audit', 'Heatmap + A/B recommendations', 1100),
        makeAddOn('Weekly Reporting', 'KPI dashboard + summary', 800),
        makeAddOn('Competitor Analysis', 'Deep-dive quarterly report', 1400),
      ],
    }),
  },
]

const DEFAULT_TEMPLATE: Template = {
  keywords: [],
  generate: (isHe) => ({
    project_title: isHe ? 'הצעת שירות מקצועית' : 'Professional Service Proposal',
    description: isHe
      ? 'הצעה מקצועית לשירות המותאמת אישית ללקוח. פרטים, לוחות זמנים ותנאים יוגדרו בתיאום משותף.'
      : 'A tailored professional service proposal. Details, timelines, and terms will be defined collaboratively.',
    base_price: 5000,
    currency: 'ILS',
    add_ons: [
      makeAddOn('Priority Support', 'Fast response SLA', 800),
      makeAddOn('Extended Revision Rounds', '+3 extra revision rounds', 600),
    ],
  }),
}

function findTemplate(prompt: string): Template {
  const lower = prompt.toLowerCase()
  return TEMPLATES.find(t => t.keywords.some(k => lower.includes(k))) ?? DEFAULT_TEMPLATE
}

// ─── Loading steps ────────────────────────────────────────────────────────────

const STEPS_HE = [
  'מנתח את הפרויקט...',
  'בונה מבנה תמחור...',
  'כותב תיאור מקצועי...',
  'מוסיף תוספות חכמות...',
  'מסיים את ההצעה...',
]
const STEPS_EN = [
  'Analyzing your project...',
  'Building pricing structure...',
  'Writing professional description...',
  'Adding smart add-ons...',
  'Finalizing the proposal...',
]

// ─── Component ────────────────────────────────────────────────────────────────

export function AIGhostwriter({ onGenerate, locale }: AIGhostwriterProps) {
  const isHe = locale === 'he'
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const steps = isHe ? STEPS_HE : STEPS_EN

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setStepIndex(0)
    setDone(false)

    // Advance through steps
    let idx = 0
    intervalRef.current = setInterval(() => {
      idx += 1
      if (idx < steps.length) {
        setStepIndex(idx)
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 520)

    // Simulate AI delay then populate
    await new Promise(r => setTimeout(r, steps.length * 520 + 200))

    const tmpl = findTemplate(prompt)
    onGenerate(tmpl.generate(isHe))

    setGenerating(false)
    setDone(true)
    setPrompt('')

    // Collapse after short delay
    setTimeout(() => {
      setDone(false)
      setOpen(false)
    }, 1800)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: open
          ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(168,85,247,0.03) 100%)',
        border: open
          ? '1px solid rgba(99,102,241,0.3)'
          : '1px solid rgba(99,102,241,0.18)',
        transition: 'background 0.3s, border 0.3s',
      }}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => !generating && setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              boxShadow: open ? '0 0 16px rgba(99,102,241,0.6)' : '0 0 8px rgba(99,102,241,0.3)',
            }}
          >
            <FileText size={13} className="text-white" />
          </div>
          <div className="text-start">
            <p className="text-sm font-bold text-white/80">
              {isHe ? 'תבניות חכמות להצעה' : 'Quick-Start Templates'}
            </p>
            <p className="text-[10px] text-white/35">
              {isHe ? 'בחר סוג פרויקט — מלא הצעה מוכנה תוך שניות' : 'Pick a project type — fill a ready-made proposal in seconds'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {open
            ? <ChevronUp size={14} className="text-white/30" />
            : <ChevronDown size={14} className="text-white/30" />}
        </div>
      </button>

      {/* Injected keyframes */}

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 space-y-3">
              {/* Input */}
              <div className="relative">
                <textarea
                  rows={3}
                  className="w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none resize-none transition-all"
                  style={{
                    border: '1px solid rgba(99,102,241,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                  placeholder={
                    isHe
                      ? 'למשל: "אתר אי-קומרס לחנות בגדים" או "צילום מוצרים לעסק קטן"'
                      : 'e.g. "fashion e-commerce website" or "product photography for small business"'
                  }
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  disabled={generating}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
                  }}
                  dir={isHe ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Loading state */}
              <AnimatePresence>
                {generating && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    <Loader2 size={13} className="text-indigo-400 animate-spin flex-none" />
                    <motion.span
                      key={stepIndex}
                      initial={{ opacity: 0, x: isHe ? 8 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-semibold text-indigo-300"
                    >
                      {steps[stepIndex]}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Done state */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <Sparkles size={13} className="text-emerald-400 flex-none" />
                    <span className="text-xs font-semibold text-emerald-400">
                      {isHe ? 'ההצעה מוכנה! בדוק ושנה לפי הצורך.' : 'Proposal ready! Review and adjust as needed.'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              {!generating && !done && (
                <motion.button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                    boxShadow: prompt.trim() ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
                  }}
                  whileHover={prompt.trim() ? { scale: 1.01 } : {}}
                  whileTap={prompt.trim() ? { scale: 0.97 } : {}}
                >
                  <FileText size={14} />
                  {isHe ? 'מלא מתבנית' : 'Fill from Template'}
                  <span className="text-[10px] opacity-60 ms-1">
                    {isHe ? '(⌘↵)' : '(⌘↵)'}
                  </span>
                </motion.button>
              )}

              <p className="text-[9px] text-white/20 text-center">
                {isHe
                  ? 'הנתונים שנוצרו הם המלצות בלבד — בדוק ועדכן לפני שליחה ללקוח'
                  : 'Generated data is a starting point — review and update before sending to client'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
