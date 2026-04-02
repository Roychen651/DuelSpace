import { useNavigate } from 'react-router-dom'
import { Zap, Globe, Shield, Lock, CheckCircle2 } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

// ─── Copy ──────────────────────────────────────────────────────────────────────

const COPY = {
  he: {
    tagline: 'סוגרים עסקאות בסטייל.',
    description: 'פלטפורמת הצעות המחיר האינטראקטיביות לעצמאים ועסקים בישראל. מחליפה PDF סטטי בחדר עסקאות חי.',
    copyright: '© 2026 DealSpace Technologies Ltd. כל הזכויות שמורות.',
    langToggle: 'English',
    /** Curated short list shown only on mobile — no section headers */
    mobileLinks: [
      { label: 'יצירת הצעה', path: '/proposals/new' },
      { label: 'תנאי שירות', path: '/terms' },
      { label: 'ספריית חוזים', path: '/contracts' },
      { label: 'מדיניות פרטיות', path: '/privacy' },
      { label: 'ספריית שירותים', path: '/services' },
      { label: 'אבטחת מידע', path: '/security' },
      { label: 'מרכז העזרה', path: '/#help' },
      { label: 'הצהרת נגישות', path: '/accessibility' },
    ],
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
    trust: ['מאובטח על ידי Supabase', 'הצפנה 256-bit', 'נגיש WCAG 2.2 AA'],
    legalNote: 'DealSpace משמשת ככלי ליצירת הצעות מחיר בלבד ואינה מהווה ייעוץ משפטי, פיננסי או ייעוץ עסקי מכל סוג.',
  },
  en: {
    tagline: 'Close deals in style.',
    description: 'The interactive proposal platform for freelancers and agencies. Replaces static PDFs with a live deal room.',
    copyright: '© 2026 DealSpace Technologies Ltd. All rights reserved.',
    langToggle: 'עברית',
    mobileLinks: [
      { label: 'Create Proposal', path: '/proposals/new' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Contracts', path: '/contracts' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Services', path: '/services' },
      { label: 'Security', path: '/security' },
      { label: 'Help Center', path: '/#help' },
      { label: 'Accessibility', path: '/accessibility' },
    ],
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
    trust: ['Secured by Supabase', '256-bit Encryption', 'WCAG 2.2 AA'],
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
      className="relative z-10 bg-white dark:bg-[#030305]"
    >
      {/* Gradient rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent dark:from-transparent dark:via-indigo-500/35 dark:to-transparent" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-8 pb-7">

        {/* ══════════════════════════════════════════════════════════════════
            MOBILE LAYOUT  (< md)
            Compact brand row → 2-column link grid → trust row → copyright
        ══════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden">

          {/* Brand row — logo + name + lang toggle all on one line */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl flex-none shadow-[0_0_14px_rgba(99,102,241,0.25)] dark:shadow-[0_0_14px_rgba(99,102,241,0.45)]"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
              >
                <Zap size={14} className="text-white" />
              </div>
              <div>
                <span className="text-[14px] font-black tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.02em' }}>
                  DealSpace
                </span>
                <span className="ms-1.5 text-[11px] text-slate-400 dark:text-white/30 font-normal">{c.tagline}</span>
              </div>
            </div>

            <button
              onClick={() => setLocale(isHe ? 'en' : 'he')}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-white/35 transition-colors hover:text-white/65 flex-none"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Globe size={10} />
              {c.langToggle}
            </button>
          </div>

          {/* Gradient rule */}
          <div className="my-5" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* 2-column flat link grid — all 8 curated links, no headings */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 mb-5">
            {c.mobileLinks.map(link => (
              <button
                key={link.label}
                onClick={() => nav(link.path)}
                className="text-start text-[12px] font-medium text-white/45 transition-colors hover:text-white/80 py-0.5"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Gradient rule */}
          <div className="mb-4" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Trust row — 3 compact pills */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              { icon: <Shield size={9} style={{ color: '#818cf8' }} />, text: c.trust[0] },
              { icon: <Lock size={9} style={{ color: '#818cf8' }} />, text: c.trust[1] },
              { icon: <CheckCircle2 size={9} style={{ color: '#4ade80' }} />, text: c.trust[2] },
            ].map(badge => (
              <div
                key={badge.text}
                className="flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {badge.icon}
                <span className="text-[9.5px] font-medium text-white/30 whitespace-nowrap">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[10px] text-white/18" dir="ltr">{c.copyright}</p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TABLET + DESKTOP LAYOUT  (md+)
            Full 3-column link grid with section headings
        ══════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block">

          {/* Brand + columns row */}
          <div className="grid md:grid-cols-4 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl flex-none"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
                >
                  <Zap size={16} className="text-white" />
                </div>
                <span className="text-[16px] font-black tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
                  DealSpace
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-white/38 mb-5">
                {c.description}
              </p>
              <button
                onClick={() => setLocale(isHe ? 'en' : 'he')}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white/35 transition-colors hover:text-white/65"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Globe size={11} />
                {c.langToggle}
              </button>
            </div>

            {/* Product */}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/28">{c.col2.heading}</p>
              <ul className="space-y-2.5">
                {c.col2.links.map(link => (
                  <li key={link.label}>
                    <button onClick={() => nav(link.path)} className="text-[13px] text-white/45 transition-colors hover:text-white/82 text-start">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/28">{c.col3.heading}</p>
              <ul className="space-y-2.5">
                {c.col3.links.map(link => (
                  <li key={link.label}>
                    <button onClick={() => nav(link.path)} className="text-[13px] text-white/45 transition-colors hover:text-white/82 text-start">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/28">{c.col4.heading}</p>
              <ul className="space-y-2.5">
                {c.col4.links.map(link => (
                  <li key={link.label}>
                    <button onClick={() => nav(link.path)} className="text-[13px] text-white/45 transition-colors hover:text-white/82 text-start">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Bottom bar */}
          <div className="flex items-center justify-between gap-6 flex-wrap">
            {/* Trust badges */}
            <div className="flex items-center gap-2.5">
              {[
                { icon: <Shield size={10} style={{ color: '#818cf8' }} />, text: c.trust[0] },
                { icon: <Lock size={10} style={{ color: '#818cf8' }} />, text: c.trust[1] },
                { icon: <CheckCircle2 size={10} style={{ color: '#4ade80' }} />, text: c.trust[2] },
              ].map(badge => (
                <div
                  key={badge.text}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {badge.icon}
                  <span className="text-[10px] font-medium text-white/30 whitespace-nowrap">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-[11px] text-white/20" dir="ltr">{c.copyright}</p>
          </div>

          {/* Legal note */}
          <p className="mt-3 text-[10px] text-white/14 leading-relaxed">
            {c.legalNote}
          </p>
        </div>

      </div>
    </footer>
  )
}
