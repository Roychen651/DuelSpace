import { useNavigate } from 'react-router-dom'
import { Zap, Globe, Shield, Lock, CheckCircle2 } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

// ─── Copy ─────────────────────────────────────────────────────────────────────

const COPY = {
  he: {
    tagline: 'סוגרים עסקאות מהר יותר.',
    description: 'פלטפורמת הצעות המחיר האינטראקטיביות לעצמאים ועסקים בישראל. מחליפה PDF סטטי בחדר עסקאות חי.',
    copyright: '© 2026 DealSpace Technologies Ltd. כל הזכויות שמורות.',
    langToggle: 'English',
    madeInIsrael: 'פותח בישראל 🇮🇱',
    mobileLinks: [
      { label: 'הצעה חדשה',      path: '/proposals/new' },
      { label: 'לוח הבקרה',      path: '/dashboard' },
      { label: 'ספריית שירותים', path: '/services' },
      { label: 'אינטגרציות',     path: '/integrations' },
      { label: 'תנאי שירות',     path: '/terms' },
      { label: 'מדיניות פרטיות', path: '/privacy' },
      { label: 'אבטחת מידע',     path: '/security' },
      { label: 'הצהרת נגישות',   path: '/accessibility' },
    ],
    col2: {
      heading: 'המוצר',
      links: [
        { label: 'הצעה חדשה',      path: '/proposals/new' },
        { label: 'לוח הבקרה',      path: '/dashboard' },
        { label: 'ספריית שירותים', path: '/services' },
        { label: 'אינטגרציות',     path: '/integrations' },
      ],
    },
    col3: {
      heading: 'משפטי ואמון',
      links: [
        { label: 'תנאי שירות',     path: '/terms' },
        { label: 'מדיניות פרטיות', path: '/privacy' },
        { label: 'אבטחת מידע',     path: '/security' },
        { label: 'הצהרת נגישות',   path: '/accessibility' },
      ],
    },
    col4: {
      heading: 'תמיכה וקשר',
      links: [
        { label: 'צור קשר',       path: 'mailto:support@dealspace.app' },
        { label: 'חיוב ומנוי',    path: '/billing' },
        { label: 'מרכז עזרה',     path: '#top' },
      ],
    },
    trust: ['מאובטח על ידי Supabase', 'הצפנה 256-bit', 'נגיש WCAG 2.2 AA'],
    legalNote: 'DealSpace משמשת ככלי ליצירת הצעות מחיר בלבד ואינה מהווה ייעוץ משפטי, פיננסי או ייעוץ עסקי מכל סוג.',
  },
  en: {
    tagline: 'Close deals faster.',
    description: 'The interactive proposal platform for freelancers and agencies in Israel. Replaces static PDFs with a live deal room.',
    copyright: '© 2026 DealSpace Technologies Ltd. All rights reserved.',
    langToggle: 'עברית',
    madeInIsrael: 'Made in Israel 🇮🇱',
    mobileLinks: [
      { label: 'New Proposal',     path: '/proposals/new' },
      { label: 'Dashboard',        path: '/dashboard' },
      { label: 'Services Library', path: '/services' },
      { label: 'Integrations',     path: '/integrations' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy',   path: '/privacy' },
      { label: 'Security',         path: '/security' },
      { label: 'Accessibility',    path: '/accessibility' },
    ],
    col2: {
      heading: 'Product',
      links: [
        { label: 'New Proposal',     path: '/proposals/new' },
        { label: 'Dashboard',        path: '/dashboard' },
        { label: 'Services Library', path: '/services' },
        { label: 'Integrations',     path: '/integrations' },
      ],
    },
    col3: {
      heading: 'Legal & Trust',
      links: [
        { label: 'Terms of Service',       path: '/terms' },
        { label: 'Privacy Policy',         path: '/privacy' },
        { label: 'Security',               path: '/security' },
        { label: 'Accessibility',          path: '/accessibility' },
      ],
    },
    col4: {
      heading: 'Support',
      links: [
        { label: 'Contact Us',             path: 'mailto:support@dealspace.app' },
        { label: 'Billing & Subscription', path: '/billing' },
        { label: 'Help Center',            path: '#top' },
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

  const handleLink = (path: string) => {
    if (path.startsWith('mailto:')) {
      window.location.href = path
    } else if (path === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate(path)
    }
  }

  const TRUST_BADGES = [
    { icon: <Shield size={10} style={{ color: '#818cf8' }} />, text: c.trust[0] },
    { icon: <Lock size={10} style={{ color: '#818cf8' }} />, text: c.trust[1] },
    { icon: <CheckCircle2 size={10} style={{ color: '#4ade80' }} />, text: c.trust[2] },
  ]

  // Shared link button class — RTL-aware hover translate
  const linkCls = 'text-[13px] text-white/40 transition-[transform,color] duration-200 hover:text-white ltr:hover:translate-x-0.5 rtl:hover:-translate-x-0.5 text-start block py-0.5'

  return (
    <footer
      dir={isHe ? 'rtl' : 'ltr'}
      className="relative z-10"
      style={{ background: 'rgba(3,3,5,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Top gradient border */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.35) 30%, rgba(168,85,247,0.35) 70%, transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-8 pb-7">

        {/* ════════════════════════════════════════════════════════════════
            MOBILE LAYOUT  (< md)
        ════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden">

          {/* Brand row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl flex-none"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 14px rgba(99,102,241,0.45)' }}
              >
                <Zap size={14} className="text-white" />
              </div>
              <div>
                <span className="text-[14px] font-black text-white" style={{ letterSpacing: '-0.02em' }}>
                  DealSpace
                </span>
                <span className="ms-1.5 text-[11px] text-white/30 font-normal">{c.tagline}</span>
              </div>
            </div>

            <button
              onClick={() => setLocale(isHe ? 'en' : 'he')}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-white/35 transition-colors hover:text-white/65 flex-none border border-white/[0.08]"
            >
              <Globe size={10} />
              {c.langToggle}
            </button>
          </div>

          {/* Divider */}
          <div className="mb-5 h-px bg-white/[0.06]" />

          {/* 2-column link grid — 8 links, no headings, py-2 touch targets */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mb-5">
            {c.mobileLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleLink(link.path)}
                className="text-start text-[12.5px] font-medium text-white/40 transition-colors hover:text-white py-2"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="mb-4 h-px bg-white/[0.06]" />

          {/* Trust badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {TRUST_BADGES.map(badge => (
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

          {/* Bottom row: copyright + Made in Israel */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[10px] text-white/18" dir="ltr">{c.copyright}</p>
            <span
              className="text-[10px] font-medium text-white/28 rounded-full px-2.5 py-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {c.madeInIsrael}
            </span>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            DESKTOP LAYOUT  (md+)
            Brand col + 3 link columns
        ════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block">

          {/* 4-column grid: brand + product + legal + support */}
          <div className="grid md:grid-cols-4 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl flex-none"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.45)' }}
                >
                  <Zap size={16} className="text-white" />
                </div>
                <span className="text-[16px] font-black text-white" style={{ letterSpacing: '-0.02em' }}>
                  DealSpace
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-white/38 mb-5">
                {c.description}
              </p>
              <button
                onClick={() => setLocale(isHe ? 'en' : 'he')}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white/35 transition-colors hover:text-white/65 border border-white/[0.08]"
              >
                <Globe size={11} />
                {c.langToggle}
              </button>
            </div>

            {/* Product */}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white/28">{c.col2.heading}</p>
              <ul className="space-y-1">
                {c.col2.links.map(link => (
                  <li key={link.label}>
                    <button onClick={() => handleLink(link.path)} className={linkCls}>
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Trust */}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white/28">{c.col3.heading}</p>
              <ul className="space-y-1">
                {c.col3.links.map(link => (
                  <li key={link.label}>
                    <button onClick={() => handleLink(link.path)} className={linkCls}>
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white/28">{c.col4.heading}</p>
              <ul className="space-y-1">
                {c.col4.links.map(link => (
                  <li key={link.label}>
                    <button onClick={() => handleLink(link.path)} className={linkCls}>
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div
            className="mb-6 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.07) 80%, transparent)' }}
          />

          {/* Bottom bar: trust badges | copyright + Made in Israel */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Trust badges */}
            <div className="flex items-center gap-2.5">
              {TRUST_BADGES.map(badge => (
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

            {/* Copyright + Made in Israel */}
            <div className="flex items-center gap-3">
              <span
                className="text-[10.5px] font-medium text-white/30 rounded-full px-3 py-1.5"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 0 12px rgba(99,102,241,0.08)',
                }}
              >
                {c.madeInIsrael}
              </span>
              <p className="text-[11px] text-white/20" dir="ltr">{c.copyright}</p>
            </div>
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
