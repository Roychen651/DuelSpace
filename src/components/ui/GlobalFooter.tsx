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

// ─── LinkColumn ────────────────────────────────────────────────────────────────

function LinkColumn({
  heading, links, onNav,
}: {
  heading: string
  links: { label: string; path: string }[]
  onNav: (path: string) => void
}) {
  return (
    <div>
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/28">
        {heading}
      </p>
      <ul className="space-y-2.5">
        {links.map(link => (
          <li key={link.label}>
            <button
              onClick={() => onNav(link.path)}
              className="text-[13px] text-white/48 transition-colors hover:text-white/82 text-start"
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
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

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-8">

        {/* ── Brand block — always full width on mobile ──────────────────── */}
        <div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 pb-8 mb-8"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Logo + description */}
          <div>
            <div className="flex items-center gap-3 mb-3">
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
            <p className="text-[12.5px] leading-relaxed text-white/38 max-w-xs">
              {c.description}
            </p>
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLocale(isHe ? 'en' : 'he')}
            className="self-start flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white/35 transition-colors hover:text-white/65"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Globe size={11} />
            {c.langToggle}
          </button>
        </div>

        {/* ── Link columns grid ─────────────────────────────────────────────
            Mobile:  1 column — all sections stack vertically
            Tablet:  2 columns — Product | Resources, Legal spans 2 (full)
            Desktop: 3 equal columns — Product | Resources | Legal
        ──────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <LinkColumn heading={c.col2.heading} links={c.col2.links} onNav={nav} />
          <LinkColumn heading={c.col3.heading} links={c.col3.links} onNav={nav} />
          {/* On tablet: Legal spans both columns (full width). On desktop: 1/3. */}
          <div className="sm:col-span-2 lg:col-span-1">
            <LinkColumn heading={c.col4.heading} links={c.col4.links} onNav={nav} />
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div
          className="mb-6"
          style={{ height: 1, background: 'rgba(255,255,255,0.055)' }}
        />

        {/* ── Bottom bar ────────────────────────────────────────────────────── */}

        {/* Trust badges — scrollable row on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
          {[
            { icon: <Shield size={10} style={{ color: '#818cf8' }} />, text: c.trust[0] },
            { icon: <Lock size={10} style={{ color: '#818cf8' }} />, text: c.trust[1] },
            { icon: <CheckCircle2 size={10} style={{ color: '#4ade80' }} />, text: c.trust[2] },
          ].map(badge => (
            <div
              key={badge.text}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 flex-none"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {badge.icon}
              <span className="text-[10px] font-medium text-white/32 whitespace-nowrap">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* Copyright + legal note */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-white/20" dir="ltr">{c.copyright}</p>
          <p className="text-[10px] text-white/14 leading-relaxed">
            {c.legalNote}
          </p>
        </div>
      </div>
    </footer>
  )
}
