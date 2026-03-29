import { useNavigate } from 'react-router-dom'
import { Zap, Globe, Shield, Lock, CheckCircle2 } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

// ─── Copy ──────────────────────────────────────────────────────────────────────

const COPY = {
  he: {
    description: 'פלטפורמת הצעות המחיר האינטראקטיביות לעצמאים ועסקים בישראל. מחליפה PDF סטטי בחדר עסקאות חי.',
    copyright: '© 2026 DealSpace Technologies Ltd. כל הזכויות שמורות.',
    langToggle: 'English',
    col2: {
      heading: 'המוצר',
      links: [
        { label: 'יצירת הצעה חדשה', path: '/proposals/new' },
        { label: 'חתימה אלקטרונית', path: '/proposals/new' },
        { label: 'תמחור ותוספות', path: '/proposals/new' },
        { label: 'ספריית חוזים', path: '/contracts' },
        { label: 'ספריית שירותים', path: '/services' },
      ],
    },
    col3: {
      heading: 'משאבים',
      links: [
        { label: 'מרכז העזרה', path: '/#help' },
        { label: 'ספריית תבניות', path: '/contracts' },
        { label: 'מדיניות אבטחה', path: '/security' },
        { label: 'הצהרת נגישות', path: '/accessibility' },
      ],
    },
    col4: {
      heading: 'חוק ואמינות',
      links: [
        { label: 'תנאי שירות', path: '/terms' },
        { label: 'מדיניות פרטיות', path: '/privacy' },
        { label: 'אבטחת מידע', path: '/security' },
        { label: 'הצהרת נגישות', path: '/accessibility' },
      ],
    },
    trust: [
      'מאובטח על ידי Supabase',
      'הצפנה 256-bit',
      'נגיש WCAG 2.2 AA',
    ],
    legalNote: 'DealSpace משמשת ככלי ליצירת הצעות מחיר בלבד ואינה מהווה ייעוץ משפטי, פיננסי או ייעוץ עסקי מכל סוג.',
  },
  en: {
    description: 'The interactive proposal platform for freelancers and agencies. Replaces static PDFs with a live deal room.',
    copyright: '© 2026 DealSpace Technologies Ltd. All rights reserved.',
    langToggle: 'עברית',
    col2: {
      heading: 'Product',
      links: [
        { label: 'Create Proposal', path: '/proposals/new' },
        { label: 'E-Signatures', path: '/proposals/new' },
        { label: 'Pricing & Add-ons', path: '/proposals/new' },
        { label: 'Contract Library', path: '/contracts' },
        { label: 'Services Library', path: '/services' },
      ],
    },
    col3: {
      heading: 'Resources',
      links: [
        { label: 'Help Center', path: '/#help' },
        { label: 'Templates Library', path: '/contracts' },
        { label: 'Security Policy', path: '/security' },
        { label: 'Accessibility Statement', path: '/accessibility' },
      ],
    },
    col4: {
      heading: 'Legal & Trust',
      links: [
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Security Policy', path: '/security' },
        { label: 'Accessibility Statement', path: '/accessibility' },
      ],
    },
    trust: [
      'Secured by Supabase',
      '256-bit Encryption',
      'WCAG 2.2 AA Accessible',
    ],
    legalNote: 'DealSpace is used solely as a proposal generation tool and does not constitute legal, financial, or business advice of any kind.',
  },
}

// ─── GlobalFooter ──────────────────────────────────────────────────────────────

export function GlobalFooter() {
  const { locale, setLocale } = useI18n()
  const navigate = useNavigate()
  const isHe = locale === 'he'
  const c = isHe ? COPY.he : COPY.en

  const nav = (path: string) => {
    if (path.startsWith('/#')) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate(path)
    }
  }

  return (
    <footer
      dir={isHe ? 'rtl' : 'ltr'}
      style={{
        background: '#030305',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* ── Gradient top edge ─────────────────────────────────────────────── */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.3) 40%, rgba(168,85,247,0.3) 60%, transparent 100%)',
        }}
      />

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Col 1 — Brand */}
          <div className="col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl flex-none"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                }}
              >
                <Zap size={16} className="text-white" />
              </div>
              <span
                className="text-[16px] font-black tracking-tight text-white"
                style={{ letterSpacing: '-0.02em' }}
              >
                DealSpace
              </span>
            </div>

            <p className="text-[12.5px] leading-relaxed text-white/40 mb-6 max-w-[240px]">
              {c.description}
            </p>

            {/* Language toggle */}
            <button
              onClick={() => setLocale(isHe ? 'en' : 'he')}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white/35 transition-colors hover:text-white/65"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Globe size={11} />
              {c.langToggle}
            </button>
          </div>

          {/* Col 2 — Product */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/28">
              {c.col2.heading}
            </p>
            <ul className="space-y-2.5">
              {c.col2.links.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => nav(link.path)}
                    className="text-[13px] text-white/48 transition-colors hover:text-white/82"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Resources */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/28">
              {c.col3.heading}
            </p>
            <ul className="space-y-2.5">
              {c.col3.links.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => nav(link.path)}
                    className="text-[13px] text-white/48 transition-colors hover:text-white/82"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal & Trust */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/28">
              {c.col4.heading}
            </p>
            <ul className="space-y-2.5">
              {c.col4.links.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => nav(link.path)}
                    className="text-[13px] text-white/48 transition-colors hover:text-white/82"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div
          className="my-8"
          style={{ height: 1, background: 'rgba(255,255,255,0.06)' }}
        />

        {/* ── Bottom bar ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Trust badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {c.trust.map((label, i) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {i === 0
                  ? <Shield size={10} style={{ color: '#818cf8' }} />
                  : i === 1
                    ? <Lock size={10} style={{ color: '#818cf8' }} />
                    : <CheckCircle2 size={10} style={{ color: '#4ade80' }} />}
                <span className="text-[10px] font-medium text-white/32">{label}</span>
              </div>
            ))}
          </div>

          {/* Copyright + legal disclaimer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-[11px] text-white/20" dir="ltr">{c.copyright}</p>
            <p className="text-[10px] text-white/16 max-w-md sm:text-end">
              {c.legalNote}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
