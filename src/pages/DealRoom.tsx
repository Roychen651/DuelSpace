import { useState, useEffect, useCallback, useRef } from 'react'
import type { RefObject } from 'react'
import { useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, type Variants } from 'framer-motion'
import { Zap, Clock, Globe, AlertCircle, Check, FileDown, ChevronDown, ChevronUp, Shield, Lock, Loader2, XCircle, ThumbsDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { calculateFinancials } from '../lib/financialMath'
import { PremiumSliderCard } from '../components/deal-room/PremiumSliderCard'
import { CheckoutClimax } from '../components/deal-room/CheckoutClimax'
import { formatCurrency } from '../types/proposal'
import type { Proposal, Testimonial } from '../types/proposal'
import { generateProposalPdf } from '../lib/pdfEngine'
import { ClientDetailsForm } from '../components/deal-room/ClientDetailsForm'
import { MilestoneTimeline } from '../components/deal-room/MilestoneTimeline'
import type { ClientCapturedDetails } from '../components/deal-room/ClientDetailsForm'
import { SUCCESS_TEMPLATES, DEFAULT_TEMPLATE_ID, interpolateSuccess } from '../lib/successTemplates'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { triggerPostSignatureAutomations } from '../lib/automations'
import { parseSmartVariables } from '../lib/contractEngine'
import { LegalTermsModal } from '../components/deal-room/LegalTermsModal'

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{
    d: number; h: number; m: number; s: number
  } | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setExpired(true); setTimeLeft(null); return }
      setTimeLeft({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return { timeLeft, expired }
}

// ─── Countdown display ────────────────────────────────────────────────────────

function CountdownBanner({ expiresAt, locale }: { expiresAt: string; locale: string }) {
  const { timeLeft, expired } = useCountdown(expiresAt)
  const isHe = locale === 'he'

  if (expired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl px-4 py-3 flex items-center gap-3 mb-6"
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
        }}
      >
        <AlertCircle size={15} className="text-red-400 flex-none" />
        <span className="text-sm font-medium text-red-400">
          {isHe ? 'פג תוקף ההצעה' : 'This offer has expired'}
        </span>
      </motion.div>
    )
  }

  if (!timeLeft) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  const unit = (val: number, l: string) => (
    <div className="flex flex-col items-center min-w-[40px]">
      <span
        className="text-2xl font-black tabular-nums leading-none"
        style={{
          background: 'linear-gradient(135deg, #c4b5fd, #e879f9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {pad(val)}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-0.5">
        {l}
      </span>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'urgency-pulse 3s ease-in-out infinite',
      }}
    >
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-indigo-400 flex-none" />
        <span className="text-xs font-semibold text-white/50">
          {isHe ? 'ההצעה תפקע בעוד' : 'Offer expires in'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {unit(timeLeft.d, isHe ? 'ימים' : 'd')}
        <span className="text-white/30 font-black text-lg mb-3">:</span>
        {unit(timeLeft.h, isHe ? 'שעות' : 'h')}
        <span className="text-white/30 font-black text-lg mb-3">:</span>
        {unit(timeLeft.m, isHe ? 'דקות' : 'm')}
        <span className="text-white/30 font-black text-lg mb-3">:</span>
        {unit(timeLeft.s, isHe ? 'שניות' : 's')}
      </div>
    </motion.div>
  )
}

// ─── Animated counter (spring-physics number roll) ────────────────────────────

function AnimatedCounter({ value, currency }: { value: number; currency: string }) {
  const mv = useMotionValue(value)
  const spring = useSpring(mv, { stiffness: 110, damping: 22, restDelta: 0.5 })
  const [display, setDisplay] = useState(value)

  useEffect(() => { mv.set(value) }, [value, mv])
  useEffect(() => spring.on('change', v => setDisplay(Math.round(v))), [spring])

  return <>{formatCurrency(display, currency)}</>
}

// ─── Aurora background ────────────────────────────────────────────────────────

function DealRoomAurora() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: '#05050A' }} />
      <div
        className="absolute -top-1/4 -left-1/4 rounded-full"
        style={{
          width: '70vw', height: '70vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'dr-float-a 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 rounded-full"
        style={{
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 62%)',
          filter: 'blur(90px)',
          animation: 'dr-float-b 28s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'dr-float-a 34s ease-in-out infinite reverse',
        }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
      {/* Cinematic film-grain noise — SVG feTurbulence overlay */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ mixBlendMode: 'overlay', opacity: 0.1 }}
      >
        <filter id="dr-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#dr-noise)" />
      </svg>
    </div>
  )
}

// ─── Page-level keyframes ─────────────────────────────────────────────────────

const pageKeyframes = `
  @keyframes dr-float-a {
    0%, 100% { transform: translate(0,0) scale(1); }
    50%       { transform: translate(50px, 40px) scale(1.05); }
  }
  @keyframes dr-float-b {
    0%, 100% { transform: translate(0,0) scale(1); }
    50%       { transform: translate(-40px, -50px) scale(1.04); }
  }
  @keyframes urgency-pulse {
    0%, 100% { box-shadow: 0 0 0 rgba(99,102,241,0); }
    50%       { box-shadow: 0 0 20px rgba(99,102,241,0.15); }
  }
  @keyframes fomo-pulse {
    0%, 100% { box-shadow: 0 2px 0 rgba(251,146,60,0); }
    50%       { box-shadow: 0 2px 24px rgba(251,146,60,0.18); }
  }
  @keyframes dr-spin { to { transform: rotate(360deg); } }
  @keyframes dr-glow-ping {
    0%     { transform: scale(1); opacity: 0.8; }
    80%, 100% { transform: scale(2); opacity: 0; }
  }
  @keyframes checkout-shimmer {
    0%   { transform: translateX(-150%) skewX(-18deg); }
    100% { transform: translateX(400%) skewX(-18deg); }
  }
  @keyframes dr-sealed-glow {
    0%, 100% { box-shadow: 0 0 40px rgba(34,197,94,0.06), inset 0 1px 0 rgba(34,197,94,0.1); }
    50%       { box-shadow: 0 0 60px rgba(34,197,94,0.12), inset 0 1px 0 rgba(34,197,94,0.18); }
  }
  @keyframes dr-progress-glow {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.75; }
  }

  /* TipTap rich-text description styles */
  .dr-prose p                          { margin-bottom: 0.7em; }
  .dr-prose p:last-child               { margin-bottom: 0; }
  .dr-prose strong, .dr-prose b        { font-weight: 700; color: rgba(255,255,255,0.65); }
  .dr-prose em, .dr-prose i            { font-style: italic; }
  .dr-prose mark                       { background: rgba(255,215,0,0.18); color: inherit; border-radius: 3px; padding: 0.05em 0.2em; }
  .dr-prose h1                         { font-size: 1.4em; font-weight: 800; color: rgba(255,255,255,0.75); margin-bottom: 0.5em; }
  .dr-prose h2                         { font-size: 1.2em; font-weight: 700; color: rgba(255,255,255,0.7);  margin-bottom: 0.45em; }
  .dr-prose h3                         { font-size: 1.05em; font-weight: 600; color: rgba(255,255,255,0.65); margin-bottom: 0.4em; }
  .dr-prose ul                         { list-style: disc inside; padding-inline-start: 1.1em; margin-bottom: 0.7em; }
  .dr-prose ol                         { list-style: decimal inside; padding-inline-start: 1.1em; margin-bottom: 0.7em; }
  .dr-prose li                         { margin-bottom: 0.25em; }
`

// ─── Stagger container ────────────────────────────────────────────────────────

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// ─── Video URL parser ─────────────────────────────────────────────────────────

function parseVideoEmbed(url: string): string | null {
  if (!url) return null
  // YouTube: watch?v= or youtu.be/ or embed/
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1&color=white`
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`
  // Loom
  const loom = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
  if (loom) return `https://www.loom.com/embed/${loom[1]}`
  return null
}

// ─── Cinematic video player ───────────────────────────────────────────────────

function CinematicVideoPlayer({
  videoUrl,
  brandColor,
  locale,
}: {
  videoUrl: string
  brandColor: string
  locale: string
}) {
  const embedUrl = parseVideoEmbed(videoUrl)
  if (!embedUrl) return null
  const isHe = locale === 'he'

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' as const }}
      className="mb-8"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
          style={{ background: `${brandColor}22`, color: brandColor }}
        >
          ▶
        </span>
        {isHe ? 'מצגת הפרויקט' : 'Project Pitch'}
      </p>

      <div className="relative">
        {/* Ambient glow layer */}
        <div
          className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl"
          style={{
            background: `radial-gradient(ellipse at center, ${brandColor}18 0%, transparent 68%)`,
            filter: 'blur(24px)',
          }}
        />

        {/* Player wrapper */}
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            aspectRatio: '16 / 9',
            border: `1px solid ${brandColor}30`,
            boxShadow: `0 0 0 1px ${brandColor}15, 0 32px 80px rgba(0,0,0,0.75), 0 0 48px ${brandColor}12`,
          }}
        >
          <iframe
            src={embedUrl}
            title={isHe ? 'מצגת הפרויקט' : 'Project pitch video'}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Social proof block ───────────────────────────────────────────────────────

function SocialProofBlock({
  testimonials,
  locale,
  brandColor,
}: {
  testimonials: Testimonial[]
  locale: string
  brandColor: string
}) {
  const isHe = locale === 'he'
  const visible = testimonials.filter(t => t.quote.trim() && t.author.trim())
  if (!visible.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}
      className="mb-8"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">
        {isHe ? '⭐ לקוחות ממליצים' : '⭐ Client Testimonials'}
      </p>

      <div className={`grid gap-3 ${visible.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {visible.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: 'easeOut' as const }}
            className="relative rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, ${brandColor}0A 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${brandColor}20`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)`,
            }}
          >
            {/* Decorative opening quote */}
            <div
              className="absolute top-2 start-4 select-none pointer-events-none text-5xl font-black leading-none"
              style={{
                color: brandColor,
                opacity: 0.12,
                fontFamily: 'Georgia, "Times New Roman", serif',
                lineHeight: 1,
              }}
            >
              &ldquo;
            </div>

            {/* Quote text */}
            <p className="relative text-[13px] leading-relaxed text-white/60 mt-4 mb-4">
              {t.quote}
            </p>

            {/* Author row */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-black"
                style={{ background: `${brandColor}20`, color: brandColor }}
              >
                {t.author.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-white/70 leading-tight">{t.author}</p>
                {t.role && (
                  <p className="text-[10px] text-white/32 mt-0.5">{t.role}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Sticky FOMO urgency band (< 48h) ────────────────────────────────────────

function StickyFomoBand({
  expiresAt,
  locale,
  brandColor,
}: {
  expiresAt: string
  locale: string
  brandColor: string
}) {
  const { timeLeft, expired } = useCountdown(expiresAt)
  const isHe = locale === 'he'

  if (expired || !timeLeft) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  const hms = `${timeLeft.d > 0 ? `${timeLeft.d}d ` : ''}${pad(timeLeft.h)}:${pad(timeLeft.m)}:${pad(timeLeft.s)}`

  return (
    <div
      className="sticky top-0 z-40 w-full"
      style={{
        background: 'linear-gradient(90deg, rgba(251,146,60,0.10) 0%, rgba(245,158,11,0.12) 50%, rgba(251,146,60,0.10) 100%)',
        borderBottom: '1px solid rgba(251,146,60,0.22)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: 'fomo-pulse 2.8s ease-in-out infinite',
      }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-2.5 px-4 py-2">
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2 flex-none">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: '#fb923c', animation: 'dr-glow-ping 1.5s ease-in-out infinite' }}
          />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#f59e0b' }} />
        </span>

        <span className="text-[11px] font-semibold text-amber-300/75">
          {isHe ? 'ההצעה תפקע בעוד' : 'Offer expires in'}
        </span>

        <span
          className="text-[11px] font-black tabular-nums"
          style={{ color: '#fb923c' }}
        >
          {hms}
        </span>

        <span
          className="hidden sm:inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
          style={{
            background: `${brandColor}15`,
            color: brandColor,
            border: `1px solid ${brandColor}30`,
          }}
        >
          {isHe ? 'אל תחמיץ' : "Don't miss out"}
        </span>
      </div>
    </div>
  )
}

// ─── Main DealRoom page ───────────────────────────────────────────────────────

export default function DealRoom() {
  const { token } = useParams<{ token: string }>()

  // ── State ──────────────────────────────────────────────────────────────────
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [fetchStatus, setFetchStatus] = useState<'loading' | 'notfound' | 'requires_code' | 'ok'>('loading')
  const [accessCode, setAccessCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)

  // Per-add-on state: { [id]: { enabled, qty } }
  const [lineItems, setLineItems] = useState<
    Record<string, { enabled: boolean; qty: number }>
  >({})

  const [signature, setSignature] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const freshSignedRef = useRef(false) // true only when signed in this session
  const [sigTimestamp, setSigTimestamp] = useState<Date>(new Date())
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [declining, setDeclining] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)

  // ── Sprint 21: Scroll progress bar ────────────────────────────────────────
  const { scrollYProgress } = useScroll()
  const scrollBarScaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  // ── Sprint 21: Spotlight flashlight on base package card ──────────────────
  const [baseSpotlight, setBaseSpotlight] = useState({ x: 50, y: 50, active: false })

  // ── Sprint 21.6: 3D tilt physics on base package card ─────────────────────
  const baseTiltX = useMotionValue(0)
  const baseTiltY = useMotionValue(0)
  const baseTiltXSpring = useSpring(baseTiltX, { stiffness: 180, damping: 20, restDelta: 0.001 })
  const baseTiltYSpring = useSpring(baseTiltY, { stiffness: 180, damping: 20, restDelta: 0.001 })

  // ── Sprint 21.6: Auto-scroll anchor ref (after client details form submit) ─
  const checkoutScrollTargetRef = useRef<HTMLDivElement>(null)

  // ── Derived status flags — single source of truth is proposal.status ──────
  // These are NEVER stored in state. They are always computed from the proposal
  // object, which is the single source of truth (loaded from DB, kept in sync
  // via Realtime). This eliminates the entire class of "state drift" bugs where
  // local state diverged from the DB — new tabs, refreshes, and cross-device
  // updates all automatically show the correct state with zero extra code.
  const revisionSent = proposal?.status === 'needs_revision'
  const declined     = proposal?.status === 'rejected'
  const [legalExpanded, setLegalExpanded] = useState(false)

  // ── Confetti burst on fresh signature ─────────────────────────────────────
  // Fires only when accepted transitions to true AND freshSignedRef.current is true.
  // When page loads with an already-accepted proposal, setAccepted(true) runs but
  // freshSignedRef.current remains false — so no confetti on revisit.
  useEffect(() => {
    if (!accepted || !freshSignedRef.current || !proposal) return
    const brand = proposal.brand_color ?? '#6366f1'
    // Central burst
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.68 }, colors: [brand, '#6366f1', '#a855f7', '#22c55e', '#ffffff', '#ffd700'] })
    // Side cannons
    const t1 = setTimeout(() => {
      confetti({ particleCount: 65, angle: 58, spread: 68, origin: { x: 0, y: 0.72 }, colors: [brand, '#a855f7', '#ffd700'] })
      confetti({ particleCount: 65, angle: 122, spread: 68, origin: { x: 1, y: 0.72 }, colors: [brand, '#6366f1', '#22c55e'] })
    }, 220)
    // Trailing sparkle
    const t2 = setTimeout(() => {
      confetti({ particleCount: 45, spread: 130, origin: { y: 0.6 }, gravity: 0.55, scalar: 0.75, colors: ['#ffffff', '#ffd700', brand] })
    }, 580)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [accepted]) // eslint-disable-line react-hooks/exhaustive-deps
  const [clientDetails, setClientDetails] = useState<ClientCapturedDetails | null>(null)
  const [legalConsent, setLegalConsent] = useState(false)
  const [legalModalOpen, setLegalModalOpen] = useState(false)

  // Time tracking
  const timeSpentRef = useRef(0)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  // Section-time telemetry (IntersectionObserver X-Ray)
  const sectionTimeRef  = useRef<Record<string, number>>({})
  const sectionEnterRef = useRef<Record<string, number>>({})
  const pricingSectionRef    = useRef<HTMLDivElement>(null)
  const addonsSectionRef     = useRef<HTMLDivElement>(null)
  const milestonesSectionRef = useRef<HTMLDivElement>(null)
  const contractSectionRef   = useRef<HTMLDivElement>(null)
  const clientDetailsFormRef = useRef<HTMLDivElement>(null)

  // Locale toggle (public page — no auth context)
  const [locale, setLocale] = useState<'he' | 'en'>(() => {
    const stored = localStorage.getItem('dealspace:locale')
    if (stored === 'he' || stored === 'en') return stored
    return navigator.language.startsWith('he') ? 'he' : 'en'
  })
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  // VAT rate — read from owner's localStorage setting (or default 18%)
  const vatRate = (() => {
    const stored = localStorage.getItem('dealspace:vat-rate')
    const v = stored ? parseFloat(stored) : 0.18
    return isNaN(v) ? 0.18 : v
  })()

  // Holds the fetched proposal before the access code gate clears it
  const pendingProposalRef = useRef<Proposal | null>(null)

  // ── Load proposal ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setFetchStatus('notfound'); return }
    const load = async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('public_token', token)
        .single()

      if (error || !data) { setFetchStatus('notfound'); return }

      const p = data as Proposal

      // If an access code is set, hold the proposal and show the gate
      if (p.access_code) {
        pendingProposalRef.current = p
        setFetchStatus('requires_code')
        return
      }

      setProposal(p)
      setFetchStatus('ok')
      if (p.status === 'accepted') setAccepted(true)

      const init: Record<string, { enabled: boolean; qty: number }> = {}
      for (const a of p.add_ons) {
        init[a.id] = { enabled: a.enabled, qty: 1 }
      }
      setLineItems(init)

      // Pre-fill client details if already captured in a previous session or round
      // Covers: revisit after revision request, revisit after creator resends
      if (p.client_company_name || p.client_tax_id || p.client_address || p.client_signer_role) {
        setClientDetails({
          full_name:       p.client_name          || '',
          company_name:    p.client_company_name  || '',
          tax_id:          p.client_tax_id        || '',
          billing_address: p.client_address       || '',
          signer_role:     p.client_signer_role   || '',
        })
      }

      // Email open tracking — fire-and-forget, idempotent (RPC guards with IS NULL)
      if (new URLSearchParams(window.location.search).get('source') === 'email' && !p.email_opened_at) {
        supabase.rpc('mark_email_opened', { p_token: token }).then(() => {})
      }

      // Only mark as viewed for active statuses — terminal/pending-revision proposals
      // must not bump updated_at (it would corrupt StatusTimeline timestamps or revert status)
      if (p.status !== 'accepted' && p.status !== 'rejected' && p.status !== 'needs_revision') {
        supabase.rpc('mark_proposal_viewed', { p_token: token }).then(() => {})
      }
    }
    load()
  }, [token])

  const handleCodeSubmit = () => {
    const pending = pendingProposalRef.current
    if (!pending || !accessCode.trim()) return
    setCodeLoading(true)

    if (accessCode.trim() === pending.access_code) {
      setProposal(pending)
      setFetchStatus('ok')
      if (pending.status === 'accepted') setAccepted(true)
      const init: Record<string, { enabled: boolean; qty: number }> = {}
      for (const a of pending.add_ons) {
        init[a.id] = { enabled: a.enabled, qty: 1 }
      }
      setLineItems(init)
      if (pending.client_company_name || pending.client_tax_id || pending.client_address || pending.client_signer_role) {
        setClientDetails({
          full_name:       pending.client_name          || '',
          company_name:    pending.client_company_name  || '',
          tax_id:          pending.client_tax_id        || '',
          billing_address: pending.client_address       || '',
          signer_role:     pending.client_signer_role   || '',
        })
      }
      if (pending.status !== 'accepted' && pending.status !== 'rejected' && pending.status !== 'needs_revision') {
        supabase.rpc('mark_proposal_viewed', { p_token: token }).then(() => {})
      }
    } else {
      setCodeError(true)
    }
    setCodeLoading(false)
  }

  // ── Time tracking + section-time flush ────────────────────────────────────
  useEffect(() => {
    if (fetchStatus !== 'ok' || !token) return

    timerRef.current = setInterval(() => {
      timeSpentRef.current += 1
    }, 1000)

    const flush = () => {
      if (timerRef.current) clearInterval(timerRef.current)

      // Finalise time for sections still in viewport at flush time
      for (const [name, enterTime] of Object.entries(sectionEnterRef.current)) {
        sectionTimeRef.current[name] =
          (sectionTimeRef.current[name] ?? 0) + Math.round((Date.now() - enterTime) / 1000)
      }
      sectionEnterRef.current = {}

      // Fire-and-forget total time
      if (timeSpentRef.current > 0) {
        supabase.rpc('update_proposal_time_spent', {
          p_token:   token,
          p_seconds: timeSpentRef.current,
        }).then(() => {})
        timeSpentRef.current = 0
      }

      // Fire-and-forget section breakdown
      if (Object.keys(sectionTimeRef.current).length > 0) {
        supabase.rpc('update_section_time', {
          p_token:        token,
          p_section_time: sectionTimeRef.current,
        }).then(() => {})
        sectionTimeRef.current = {}
      }
    }

    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [fetchStatus, token])

  // ── Live presence broadcast ────────────────────────────────────────────────
  // Broadcasts on `user-activity:{userId}` so ProtectedLayout (ONE subscription)
  // handles all proposals without N per-card channels.
  // Heartbeat every 3 s for snappy real-time feel.
  useEffect(() => {
    if (fetchStatus !== 'ok' || !proposal) return
    const { user_id: userId, public_token: publicToken } = proposal

    const channel = supabase.channel(`user-activity:${userId}`)
    let heartbeatId: ReturnType<typeof setInterval> | null = null

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        const beat = () =>
          channel.send({ type: 'broadcast', event: 'heartbeat', payload: { token: publicToken } })
        beat()
        heartbeatId = setInterval(beat, 3_000)
      }
    })

    return () => {
      if (heartbeatId) clearInterval(heartbeatId)
      channel.send({ type: 'broadcast', event: 'offline', payload: { token: publicToken } })
      supabase.removeChannel(channel)
    }
  }, [fetchStatus, proposal?.user_id, proposal?.public_token])

  // ── Realtime — watch for proposal status changes ──────────────────────────
  // When the creator edits and resends the proposal (status → 'sent'), the client's
  // open tab needs to detect it automatically — without a manual refresh.
  // We subscribe to Postgres Changes on the proposals table, filtered by public_token.
  // On status change: update local proposal state and reset revision/decline flags.
  useEffect(() => {
    if (!token || fetchStatus !== 'ok' || !proposal) return

    const channel = supabase
      .channel(`proposal-status:${token}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'proposals',
          filter: `public_token=eq.${token}`,
        },
        (payload) => {
          const updated = payload.new as typeof proposal
          // setProposal is the only call needed — revisionSent and declined are
          // derived from proposal.status, so they update automatically.
          setProposal(updated)
          // accepted still needs explicit state (freshSignedRef session tracking)
          if (updated?.status === 'accepted') setAccepted(true)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [token, fetchStatus, proposal?.id])

  // ── IntersectionObserver — per-section read time ───────────────────────────
  useEffect(() => {
    if (fetchStatus !== 'ok') return

    const SECTIONS: Array<{ ref: RefObject<HTMLDivElement | null>; name: string }> = [
      { ref: pricingSectionRef,    name: 'pricing'    },
      { ref: addonsSectionRef,     name: 'addons'     },
      { ref: milestonesSectionRef, name: 'milestones' },
      { ref: contractSectionRef,   name: 'contract'   },
    ]

    const observers: IntersectionObserver[] = []

    for (const { ref, name } of SECTIONS) {
      const el = ref.current
      if (!el) continue

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            sectionEnterRef.current[name] = Date.now()
          } else {
            const t = sectionEnterRef.current[name]
            if (t != null) {
              sectionTimeRef.current[name] =
                (sectionTimeRef.current[name] ?? 0) + Math.round((Date.now() - t) / 1000)
              delete sectionEnterRef.current[name]
            }
          }
        },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    }

    return () => observers.forEach(obs => obs.disconnect())
  }, [fetchStatus])

  // ── Grand total — single source of truth via calculateFinancials ───────────
  const financials = proposal
    ? calculateFinancials(proposal, lineItems, vatRate)
    : null
  const grandTotal         = financials?.grandTotal         ?? 0
  const originalGrandTotal = financials?.originalGrandTotal ?? 0

  // Resolved add-ons: apply client overrides for per-item receipt display
  const resolvedAddOns = proposal
    ? proposal.add_ons.map(a => {
        const lo = lineItems[a.id]
        const discount_pct = a.discount_pct ?? 0
        return {
          id: a.id,
          label: a.label,
          price: a.price,
          discountedPrice: Math.round(a.price * (1 - discount_pct / 100)),
          qty: lo?.qty ?? 1,
          discount_pct,
          enabled: lo ? lo.enabled : a.enabled,
        }
      })
    : []

  // ── Handle accept ──────────────────────────────────────────────────────────
  const handleAccept = useCallback(async () => {
    if (!token || accepting || accepted) return
    // Hard guard — identity form must be completed before accepting
    if (!clientDetails) return
    setAccepting(true)
    setAcceptError(null)

    // Save client legal identity before accepting — must succeed or abort
    {
      const { error: detailsError } = await supabase.rpc('save_client_details', {
        p_token:        token,
        p_full_name:    clientDetails.full_name,
        p_company_name: clientDetails.company_name,
        p_tax_id:       clientDetails.tax_id,
        p_address:      clientDetails.billing_address,
        p_signer_role:  clientDetails.signer_role,
      })
      if (detailsError) {
        setAcceptError(locale === 'he'
          ? 'שגיאה בשמירת פרטי הזהות. בדוק את החיבור לאינטרנט ונסה שוב.'
          : 'Failed to save your identity details. Please check your connection and try again.')
        setAccepting(false)
        return
      }
    }

    // ── Forensic capture — IP + User-Agent (Migration 23) ─────────────────
    // Fire-and-forget: a failed IP lookup must never block the signing flow.
    let signerIp = 'Unknown'
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json')
      const ipJson = await ipRes.json() as { ip?: string }
      if (ipJson.ip) signerIp = ipJson.ip
    } catch (_) {}
    const signerUa = navigator.userAgent

    const { data: accepted_result, error } = await supabase.rpc('accept_proposal', {
      p_token: token,
      p_ip:    signerIp,
      p_ua:    signerUa,
    })
    // Migration 14: accept_proposal now returns BOOLEAN.
    // error = null + data = false  → 0 rows updated (already accepted, or token not found)
    // error = null + data = true   → row was updated successfully
    if (error || !accepted_result) {
      setAcceptError(locale === 'he'
        ? 'שגיאה באישור ההצעה. ייתכן שההצעה כבר אושרה. אנא רענן את הדף.'
        : 'Failed to confirm the agreement. The proposal may already be accepted. Please refresh.')
      setAccepting(false)
      return
    }
    setSigTimestamp(new Date())
    freshSignedRef.current = true
    setAccepted(true)
    // Persist signature dataUrl to localStorage so the PDF download works even after
    // page reload or when the business owner visits the sealed link from the same browser.
    // Key is scoped to the token so multiple deals don't collide.
    try { localStorage.setItem(`dealspace:sig:${token}`, signature) } catch (_) {}
    // Notify the Dashboard in the same browser tab/session immediately —
    // faster than waiting for Supabase Realtime Postgres Changes to propagate
    try { new BroadcastChannel('dealspace:proposals').postMessage({ type: 'accepted', token }) } catch (_) {}
    // Fire post-signature automation hooks (stub — Sprint 19 wires real webhooks)
    if (proposal) triggerPostSignatureAutomations(proposal).catch(console.error)
    setAccepting(false)
  }, [token, accepting, accepted, clientDetails, locale, signature])

  // ── Handle revision request ────────────────────────────────────────────────
  const handleRequestRevision = useCallback(async (notes: string) => {
    if (!token) return
    // Persist client identity to DB *before* flipping status — save_client_details only runs
    // when status ∈ {sent, viewed}; after request_proposal_revision it becomes needs_revision.
    // This means client details survive when the creator fixes and resends the proposal.
    if (clientDetails) {
      await supabase.rpc('save_client_details', {
        p_token:        token,
        p_full_name:    clientDetails.full_name,
        p_company_name: clientDetails.company_name,
        p_tax_id:       clientDetails.tax_id,
        p_address:      clientDetails.billing_address,
        p_signer_role:  clientDetails.signer_role,
      })
    }
    const { data: success } = await supabase.rpc('request_proposal_revision', { p_token: token, p_notes: notes })
    if (!success) {
      // RPC returned false — 0 rows updated (proposal was already accepted/rejected/etc.)
      // No local state to flip — the derived revisionSent will already reflect reality.
      return
    }
    // Update local proposal status immediately (optimistic — Realtime will confirm shortly)
    setProposal(prev => prev ? { ...prev, status: 'needs_revision' as const, revision_notes: notes } : prev)
    // Notify Dashboard in same browser — creator sees status flip to needs_revision instantly
    try { new BroadcastChannel('dealspace:proposals').postMessage({ type: 'revision_requested', token }) } catch (_) {}
  }, [token, clientDetails])

  // ── Handle decline ─────────────────────────────────────────────────────────
  const handleDecline = useCallback(async () => {
    if (!token || declining || proposal?.status === 'rejected') return
    setDeclining(true)
    const { error } = await supabase.rpc('decline_proposal', { p_token: token })
    if (!error) setProposal(prev => prev ? { ...prev, status: 'rejected' as const } : prev)
    setDeclining(false)
  }, [token, declining, proposal?.status])

  // ── PDF download ───────────────────────────────────────────────────────────
  const handleDownloadPdf = useCallback(async () => {
    if (!proposal || pdfGenerating) return
    setPdfGenerating(true)
    const enabledIds = proposal.add_ons
      .filter(a => lineItems[a.id]?.enabled ?? a.enabled)
      .map(a => a.id)
    // Use in-memory signature first; fall back to localStorage copy for revisits /
    // same-browser reloads. The localStorage key is scoped to the proposal token.
    const sigForPdf = signature || (() => {
      try { return localStorage.getItem(`dealspace:sig:${token}`) ?? '' } catch { return '' }
    })()
    await generateProposalPdf({
      proposal,
      totalAmount: grandTotal,
      enabledAddOnIds: enabledIds,
      signatureDataUrl: sigForPdf,
      locale,
      signatureTimestamp: sigTimestamp,
    })
    setPdfGenerating(false)
  }, [proposal, pdfGenerating, lineItems, grandTotal, signature, locale, sigTimestamp])

  // ── Draft PDF download (before acceptance) ────────────────────────────────
  const [draftGenerating, setDraftGenerating] = useState(false)
  const handleDownloadDraft = useCallback(async () => {
    if (!proposal || draftGenerating) return
    setDraftGenerating(true)
    const enabledIds = proposal.add_ons
      .filter(a => lineItems[a.id]?.enabled ?? a.enabled)
      .map(a => a.id)
    await generateProposalPdf({
      proposal,
      totalAmount: grandTotal,
      enabledAddOnIds: enabledIds,
      signatureDataUrl: '',
      locale,
      isDraft: true,
    })
    setDraftGenerating(false)
  }, [proposal, draftGenerating, lineItems, grandTotal, locale])

  // ── Toggle locale ──────────────────────────────────────────────────────────
  const toggleLocale = () => {
    const next = locale === 'he' ? 'en' : 'he'
    setLocale(next)
    localStorage.setItem('dealspace:locale', next)
  }

  // ── Render: loading ────────────────────────────────────────────────────────
  if (fetchStatus === 'loading') {
    return (
      <div
        style={{
          background: '#05050A', minHeight: '100dvh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <style>{pageKeyframes}</style>
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '2px solid rgba(99,102,241,0.2)',
            borderTopColor: '#818cf8',
            animation: 'dr-spin 0.9s linear infinite',
          }}
        />
      </div>
    )
  }

  // ── Render: not found ──────────────────────────────────────────────────────
  if (fetchStatus === 'notfound' || (!proposal && fetchStatus !== 'requires_code')) {
    return (
      <div
        style={{
          background: '#05050A', minHeight: '100dvh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32,
        }}
      >
        <style>{pageKeyframes}</style>
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <p className="text-white/60 text-sm font-medium text-center">
          This deal room doesn't exist or the link has expired.
        </p>
      </div>
    )
  }

  // ── Render: access code gate ───────────────────────────────────────────────
  if (fetchStatus === 'requires_code') {
    const isHe = locale === 'he'
    return (
      <div
        style={{
          background: '#05050A', minHeight: '100dvh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 32,
        }}
        dir={dir}
      >
        <style>{pageKeyframes}</style>
        <DealRoomAurora />
        <motion.div
          className="relative z-10 w-full max-w-sm space-y-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: '0 0 32px rgba(99,102,241,0.5)',
              }}
            >
              <Lock size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-white">
              {isHe ? 'גישה מוגבלת' : 'Access Required'}
            </h1>
            <p className="text-center text-sm text-white/45">
              {isHe
                ? 'הצעה זו מוגנת. בקש את קוד הגישה מבעל העסק.'
                : 'This proposal is protected. Ask the business for the access code.'}
            </p>
          </div>

          {/* Code input */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(40px)',
            }}
          >
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
                {isHe ? 'קוד גישה' : 'Access Code'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                placeholder={isHe ? 'הכנס קוד...' : 'Enter code…'}
                value={accessCode}
                onChange={e => { setAccessCode(e.target.value); setCodeError(false) }}
                onKeyDown={e => { if (e.key === 'Enter') handleCodeSubmit() }}
                className="w-full rounded-2xl border bg-white/[0.05] px-4 py-3 text-center text-xl font-black tracking-[0.3em] text-white placeholder-white/20 outline-none transition-all"
                style={{
                  border: codeError
                    ? '1px solid rgba(248,113,113,0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: codeError
                    ? '0 0 0 3px rgba(248,113,113,0.12)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
                autoFocus
              />
              {codeError && (
                <motion.p
                  className="text-[11px] text-red-400 text-center font-semibold"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {isHe ? 'קוד שגוי. נסה שוב.' : 'Incorrect code. Try again.'}
                </motion.p>
              )}
            </div>

            <button
              onClick={handleCodeSubmit}
              disabled={!accessCode.trim() || codeLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                boxShadow: '0 0 24px rgba(99,102,241,0.4)',
              }}
            >
              {codeLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <>{isHe ? 'כניסה' : 'Enter'}</>
              }
            </button>
          </div>

          <p className="text-center text-[10px] text-white/20">Powered by DealSpace</p>
        </motion.div>
      </div>
    )
  }

  // ── Render: main ───────────────────────────────────────────────────────────
  if (!proposal) return null

  const brandColor = proposal.brand_color ?? '#6366f1'
  const isWithin48h = proposal.expires_at
    ? (new Date(proposal.expires_at).getTime() - Date.now() > 0) &&
      (new Date(proposal.expires_at).getTime() - Date.now() < 48 * 3_600_000)
    : false

  return (
    <div
      className="relative min-h-dvh flex flex-col"
      style={{ background: '#05050A' }}
      dir={dir}
    >
      <style>{pageKeyframes}</style>
      <style>{`
        :root {
          --primary-brand: ${brandColor};
          --primary-brand-20: ${brandColor}33;
          --primary-brand-40: ${brandColor}66;
        }
      `}</style>
      <DealRoomAurora />

      {/* ── Scroll progress bar ─────────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left"
        style={{
          scaleX: scrollBarScaleX,
          background: `linear-gradient(90deg, ${brandColor}, #a855f7, #ec4899)`,
          boxShadow: `0 0 12px ${brandColor}cc, 0 0 24px ${brandColor}66`,
          animation: 'dr-progress-glow 2s ease-in-out infinite',
        }}
      />

      {/* ── Sticky FOMO urgency band (< 48 h) ───────────────────────────── */}
      {isWithin48h && !accepted && (
        <StickyFomoBand
          expiresAt={proposal.expires_at!}
          locale={locale}
          brandColor={brandColor}
        />
      )}

      {/* ── Floating locale toggle ───────────────────────────────────────── */}
      <div className="fixed top-4 end-4 z-40">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/50 backdrop-blur-xl transition hover:border-white/20 hover:text-white/80"
        >
          <Globe size={11} />
          {locale === 'he' ? 'EN' : 'עב'}
        </button>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pt-10 pb-8">

        {/* ── Hero section ──────────────────────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          {/* Brand bar */}
          <motion.div variants={slideUp} className="flex items-center gap-2 mb-8">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: '0 0 20px rgba(99,102,241,0.5)',
              }}
            >
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white/60">DealSpace</span>
          </motion.div>

          {/* Countdown — hidden once deal is signed */}
          {proposal.expires_at && !accepted && (
            <motion.div variants={slideUp}>
              <CountdownBanner expiresAt={proposal.expires_at} locale={locale} />
            </motion.div>
          )}

          {/* Creator identity — logo + company name */}
          {(proposal.creator_info?.logo_url || proposal.creator_info?.company_name) && (
            <motion.div variants={slideUp} className="mb-6 flex flex-col items-center gap-2">
              {proposal.creator_info.logo_url && (
                <div
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <img
                    src={proposal.creator_info.logo_url}
                    alt={proposal.creator_info.company_name || 'company logo'}
                    className="max-h-10 max-w-[160px] object-contain"
                  />
                </div>
              )}
              {proposal.creator_info.company_name && !proposal.creator_info.logo_url && (
                <p className="text-sm font-bold text-white/60 tracking-tight">
                  {proposal.creator_info.company_name}
                </p>
              )}
            </motion.div>
          )}

          {/* Client greeting */}
          {proposal.client_name && (
            <motion.p
              variants={slideUp}
              className="text-sm font-medium text-white/40 mb-2"
            >
              {locale === 'he' ? `שלום, ${proposal.client_name} 👋` : `Hello, ${proposal.client_name} 👋`}
            </motion.p>
          )}

          {/* Project title */}
          <motion.h1
            variants={slideUp}
            className="font-display text-3xl sm:text-4xl font-black leading-tight mb-4"
            style={{
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.72) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {proposal.project_title}
          </motion.h1>

          {/* Description — TipTap HTML rendered safely (creator's own content) */}
          {proposal.description && (
            <motion.div
              variants={slideUp}
              className="dr-prose text-[15px] text-white/50 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseSmartVariables(proposal.description, proposal, locale) }}
            />
          )}
        </motion.div>

        {/* ── Cinematic video player ────────────────────────────────────── */}
        {proposal.video_url && (
          <CinematicVideoPlayer
            videoUrl={proposal.video_url}
            brandColor={brandColor}
            locale={locale}
          />
        )}

        {/* ── Social proof block ────────────────────────────────────────── */}
        {(proposal.testimonials ?? []).length > 0 && (
          <SocialProofBlock
            testimonials={proposal.testimonials ?? []}
            locale={locale}
            brandColor={brandColor}
          />
        )}

        {/* ── Base package card ─────────────────────────────────────────── */}
        <motion.div
          ref={pricingSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileTap={{ scale: 0.984, transition: { type: 'spring' as const, stiffness: 500, damping: 18 } }}
          className="relative rounded-2xl p-5 mb-3 overflow-hidden cursor-default"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            rotateX: baseTiltXSpring,
            rotateY: baseTiltYSpring,
            transformPerspective: 1200,
          }}
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect()
            const x = ((e.clientX - r.left) / r.width) * 100
            const y = ((e.clientY - r.top) / r.height) * 100
            setBaseSpotlight({ x, y, active: true })
            baseTiltX.set(((e.clientY - r.top) / r.height - 0.5) * -8)
            baseTiltY.set(((e.clientX - r.left) / r.width - 0.5) * 10)
          }}
          onMouseLeave={() => {
            setBaseSpotlight(s => ({ ...s, active: false }))
            baseTiltX.set(0)
            baseTiltY.set(0)
          }}
        >
          {/* Aceternity spotlight layer */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(320px circle at ${baseSpotlight.x}% ${baseSpotlight.y}%, rgba(255,255,255,0.06) 0%, transparent 70%)`,
              opacity: baseSpotlight.active ? 1 : 0,
            }}
          />
          <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">
            {locale === 'he' ? 'חבילת בסיס' : 'Base Package'}
          </p>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${brandColor}22, ${brandColor}0E)`,
                  border: `1px solid ${brandColor}35`,
                  boxShadow: `0 0 16px ${brandColor}18`,
                }}
              >
                <Check size={15} style={{ color: brandColor }} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white/90">
                  {proposal.project_title}
                </p>
                <p className="text-xs text-white/35">
                  {locale === 'he' ? 'כלול בהצעה' : 'Included in proposal'}
                </p>
              </div>
            </div>
            <p
              className="text-xl font-black tabular-nums"
              style={{
                background: `linear-gradient(135deg, ${brandColor}FF, #c4b5fd)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatCurrency(proposal.base_price, proposal.currency)}
            </p>
          </div>
        </motion.div>

        {/* ── Add-ons section ───────────────────────────────────────────── */}
        {proposal.add_ons.length > 0 && (
          <div ref={addonsSectionRef} className="mt-6 mb-4">
            <motion.p
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {locale === 'he' ? 'תוספות ושדרוגים' : 'Add-ons & Upgrades'}
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {proposal.add_ons.map(addOn => (
                <PremiumSliderCard
                  key={addOn.id}
                  addOn={addOn}
                  quantity={lineItems[addOn.id]?.qty ?? 1}
                  enabled={lineItems[addOn.id]?.enabled ?? addOn.enabled}
                  currency={proposal.currency}
                  locale={locale}
                  adjustable={addOn.clientAdjustable !== false}
                  sealed={accepted}
                  onToggle={() =>
                    setLineItems(prev => ({
                      ...prev,
                      [addOn.id]: {
                        enabled: !(prev[addOn.id]?.enabled ?? addOn.enabled),
                        qty: prev[addOn.id]?.qty ?? 1,
                      },
                    }))
                  }
                  onQuantityChange={qty =>
                    setLineItems(prev => ({
                      ...prev,
                      [addOn.id]: {
                        enabled: prev[addOn.id]?.enabled ?? addOn.enabled,
                        qty,
                      },
                    }))
                  }
                />
              ))}
            </motion.div>
          </div>
        )}

        {/* ── Milestone timeline ────────────────────────────────────────── */}
        {(proposal.payment_milestones ?? []).length > 0 && (
          <motion.div
            ref={milestonesSectionRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-6"
          >
            <MilestoneTimeline
              milestones={proposal.payment_milestones ?? []}
              grandTotal={grandTotal}
              currency={proposal.currency}
              locale={locale}
            />
          </motion.div>
        )}

        {/* ── Client details capture / sealed confirmation ───────────────── */}
        {!accepted && !revisionSent && (
          <motion.div
            ref={clientDetailsFormRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.65 }}
            className="mt-6"
          >
            <ClientDetailsForm
              locale={locale}
              prefillName={proposal.client_name}
              sealed={!!clientDetails}
              onEdit={() => setClientDetails(null)}
              onComplete={details => {
                setClientDetails(details)
                setTimeout(() => {
                  checkoutScrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 150)
              }}
            />
          </motion.div>
        )}

        {/* Checkout scroll anchor — scrolled to after client details form submission */}
        <div ref={checkoutScrollTargetRef} />

        {/* ── Draft PDF download — only before signing ──────────────────── */}
        {!accepted && !revisionSent && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleDownloadDraft}
              disabled={draftGenerating}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-semibold transition-all disabled:opacity-50"
              style={{
                color: 'rgba(255,255,255,0.32)',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.32)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
            >
              <FileDown size={12} />
              {draftGenerating
                ? (locale === 'he' ? 'יוצר טיוטה…' : 'Generating…')
                : (locale === 'he' ? 'הורד טיוטה (PDF)' : 'Download Draft (PDF)')}
            </button>
          </div>
        )}

        {/* ── Trust signals — only before signing ───────────────────────── */}
        {!accepted && !revisionSent && (
          <motion.div
            className="flex items-center justify-center gap-6 py-6 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[
              { icon: '🔒', label: locale === 'he' ? 'SSL מאובטח' : 'SSL Secured' },
              { icon: '✍️', label: locale === 'he' ? 'חתימה חוקית' : 'Legally Binding' },
              { icon: '⚡', label: locale === 'he' ? 'אישור מיידי' : 'Instant Confirm' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-lg">{icon}</span>
                <span className="text-[10px] font-medium text-white/25">{label}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Legal terms box — only before signing ─────────────────────── */}
        {!accepted && !revisionSent && (
          <motion.div
            ref={contractSectionRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <button
              onClick={() => setLegalExpanded(v => !v)}
              className="flex w-full items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-2">
                <Shield size={13} className="text-white/30" />
                <span className="text-xs font-semibold text-white/40">
                  {locale === 'he' ? 'תנאים והתניות' : 'Terms & Conditions'}
                </span>
              </div>
              {legalExpanded
                ? <ChevronUp size={13} className="text-white/30" />
                : <ChevronDown size={13} className="text-white/30" />}
            </button>

            <AnimatePresence>
              {legalExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    className="px-5 pb-5 max-h-48 overflow-y-auto text-[11px] leading-relaxed text-white/35 space-y-3"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}
                  >
                    <p>
                      {locale === 'he'
                        ? 'חתימה על הצעה זו מהווה הסכם מחייב בין הצדדים. תשלום יבוצע לפי לוח הזמנים המוסכם. ביטול לאחר חתימה כפוף לדמי ביטול.'
                        : 'Signing this proposal constitutes a binding agreement between the parties. Payment will be made according to the agreed schedule. Cancellation after signing is subject to cancellation fees.'}
                    </p>
                    <p>
                      {locale === 'he'
                        ? 'בעל העסק ו-DealSpace אינם אחראים לעיכובים שנגרמו מגורמים חיצוניים. שינויים בהיקף העבודה ידרשו הסכמה בכתב של שני הצדדים.'
                        : 'Neither the service provider nor DealSpace is liable for delays caused by external factors. Changes to scope require written agreement from both parties.'}
                    </p>
                    <p>
                      {locale === 'he'
                        ? 'חתימה אלקטרונית זו כפופה לחוק חתימה אלקטרונית, התשס״א-2001. DealSpace משמשת כמתווך טכנולוגי בלבד ואינה צד להסכם.'
                        : 'This electronic signature is subject to applicable electronic signature laws. DealSpace serves solely as a technology intermediary and is not a party to this agreement.'}
                    </p>
                    <p>
                      {locale === 'he'
                        ? 'החוק החל על הסכם זה הוא דין מדינת ישראל. כל סכסוך יובא לפני בית המשפט המוסמך במחוז תל אביב-יפו.'
                        : 'This agreement is governed by the laws of the State of Israel. Any dispute shall be resolved in the competent courts of Tel Aviv-Jaffa.'}
                    </p>
                    <p className="text-white/20">
                      {locale === 'he'
                        ? 'לתנאי שירות המלאים ומדיניות הפרטיות, בקר ב-dealspace.app/terms'
                        : 'For full Terms of Service and Privacy Policy, visit dealspace.app/terms'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Sealed summary — replaces signing UI for already-accepted deals ─ */}
        {accepted && !freshSignedRef.current && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35, type: 'spring' as const, stiffness: 200, damping: 24 }}
            className="mt-6 rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(34,197,94,0.09) 0%, rgba(16,185,129,0.04) 60%, rgba(5,5,10,0.8) 100%)',
              border: '1px solid rgba(34,197,94,0.22)',
              boxShadow: '0 0 0 1px rgba(34,197,94,0.08), 0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(34,197,94,0.18)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              animation: 'dr-sealed-glow 4s ease-in-out infinite',
            }}
          >
            {/* Header row */}
            <div
              className="flex items-center gap-3.5 px-5 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(34,197,94,0.12)' }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring' as const, stiffness: 380, damping: 18, delay: 0.5 }}
                className="flex-none flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(16,185,129,0.12))',
                  border: '1px solid rgba(34,197,94,0.4)',
                  boxShadow: '0 0 24px rgba(34,197,94,0.25)',
                }}
              >
                <Check size={19} className="text-emerald-400" strokeWidth={2.5} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-emerald-400 tracking-tight">
                  {locale === 'he' ? 'הסכם חתום ואושר' : 'Agreement Signed & Approved'}
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {proposal.client_name
                    ? (locale === 'he'
                        ? `נחתם על ידי ${proposal.client_name}`
                        : `Signed by ${proposal.client_name}`)
                    : (locale === 'he' ? 'ההסכם אושר' : 'Agreement confirmed')}
                  {proposal.updated_at && ` · ${new Date(proposal.updated_at).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                </p>
              </div>
            </div>

            {/* Total — spring-animated counter */}
            <div className="px-5 py-5 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                {locale === 'he' ? 'סה"כ מאושר' : 'Total Approved'}
              </p>
              <p
                className="text-2xl font-black tabular-nums"
                style={{
                  background: 'linear-gradient(135deg, #4ade80, #22c55e, #86efac)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.4))',
                }}
              >
                <AnimatedCounter value={grandTotal} currency={proposal.currency} />
              </p>
            </div>

            {/* Re-download PDF — always available for sealed deals */}
            <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3 pt-4">
                {locale === 'he' ? 'חוזה חתום' : 'Signed Contract'}
              </p>
              <motion.button
                onClick={handleDownloadPdf}
                disabled={pdfGenerating}
                className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-3.5 text-sm font-bold text-white transition disabled:opacity-60"
                whileHover={{ scale: 1.02, transition: { type: 'spring' as const, stiffness: 340, damping: 24 } }}
                whileTap={{ scale: 0.96, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.22) 0%, rgba(16,185,129,0.14) 100%)',
                  border: '1px solid rgba(34,197,94,0.35)',
                  boxShadow: '0 0 24px rgba(34,197,94,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
                }}
              >
                {!pdfGenerating && (
                  <span
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/[0.06]"
                    style={{ animation: 'checkout-shimmer 3s ease-out 0.5s infinite' }}
                    aria-hidden
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <FileDown size={15} className={pdfGenerating ? 'animate-bounce' : ''} />
                  {pdfGenerating
                    ? (locale === 'he' ? 'יוצר PDF…' : 'Generating PDF…')
                    : (locale === 'he' ? '⬇ הורד חוזה חתום (PDF)' : '⬇ Download Signed Contract (PDF)')}
                </span>
              </motion.button>

              {/* DealSpace disclaimer */}
              <p className="text-[10px] text-white/18 text-center leading-relaxed mt-4">
                {locale === 'he'
                  ? 'DealSpace מספקת תשתית טכנולוגית בלבד ואינה צד להסכם זה, לאיכות השירותים, או לכל מחלוקת בין הצדדים.'
                  : 'DealSpace provides technology infrastructure only and is not a party to this agreement, the quality of services rendered, or any dispute between the parties.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Spacer — smaller when sticky bar is absent (accepted non-fresh) */}
        <div className={accepted && !freshSignedRef.current ? 'h-10' : 'h-44'} />
      </div>

      {/* ── Sticky checkout bar (hidden when expired, declined, or already sealed) */}
      {(() => {
        // Already accepted before this session — inline summary is shown instead
        if (accepted && !freshSignedRef.current) return null

        const isExpired = proposal.expires_at
          ? new Date(proposal.expires_at).getTime() < Date.now()
          : false

        if (isExpired && !accepted) {
          return (
            <div className="sticky bottom-0 z-30 pb-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
              <div className="mx-auto max-w-2xl px-4">
                <motion.div
                  className="rounded-2xl px-5 py-5 text-center"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 32, delay: 0.5 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.04) 100%)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    backdropFilter: 'blur(40px)',
                  }}
                >
                  <XCircle size={28} className="text-red-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-red-400 mb-1">
                    {locale === 'he' ? 'תוקף ההצעה פג' : 'This Offer Has Expired'}
                  </p>
                  <p className="text-xs text-white/40">
                    {locale === 'he'
                      ? 'ההצעה אינה זמינה יותר לאישור. אנא פנה ליוצר לקבלת הצעה מחודשת.'
                      : 'This proposal is no longer available for signing. Please contact the creator for a renewed offer.'}
                  </p>
                </motion.div>
              </div>
            </div>
          )
        }

        if (declined) {
          return (
            <div className="sticky bottom-0 z-30 pb-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
              <div className="mx-auto max-w-2xl px-4">
                <motion.div
                  className="rounded-2xl px-5 py-5 text-center"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(40px)',
                  }}
                >
                  <ThumbsDown size={24} className="text-white/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white/50">
                    {locale === 'he' ? 'ההצעה נדחתה' : 'Offer Declined'}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    {locale === 'he'
                      ? 'ניתן ליצור קשר עם בעל העסק לדיון נוסף.'
                      : 'You can contact the creator to discuss further.'}
                  </p>
                </motion.div>
              </div>
            </div>
          )
        }

        return (
          <>
            <div className="relative z-20">
              <CheckoutClimax
                total={grandTotal}
                currency={proposal.currency}
                clientName={proposal.client_name}
                signature={signature}
                onSignatureChange={setSignature}
                onAccept={handleAccept}
                accepting={accepting}
                accepted={accepted}
                locale={locale}
                includeVat={proposal.include_vat}
                vatRate={vatRate}
                legalConsent={legalConsent}
                onLegalConsentChange={setLegalConsent}
                onRequestRevision={handleRequestRevision}
                revisionSent={revisionSent}
                originalTotal={originalGrandTotal}
                financials={financials ?? undefined}
                resolvedAddOns={resolvedAddOns}
                globalDiscountPct={proposal.global_discount_pct ?? 0}
                basePrice={proposal.base_price}
                clientDetailsConfirmed={!!clientDetails}
                onScrollToDetails={() =>
                  clientDetailsFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
                onOpenLegalTerms={() => setLegalModalOpen(true)}
              />
            </div>
            {/* Accept error */}
            {acceptError && (
              <div className="relative z-20 mx-4 mb-2">
                <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}>
                  <AlertCircle size={13} className="text-red-400 flex-none" />
                  <p className="text-xs text-red-400">{acceptError}</p>
                </div>
              </div>
            )}
            {/* Decline offer ghost button */}
            {!accepted && !revisionSent && (
              <div className="relative z-20 flex justify-center pb-6" style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
                <motion.button
                  type="button"
                  onClick={handleDecline}
                  disabled={declining}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-medium transition-opacity disabled:opacity-50"
                  style={{ color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent' }}
                  whileHover={{ color: 'rgba(248,113,113,0.7)', borderColor: 'rgba(248,113,113,0.25)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  {declining
                    ? <Loader2 size={11} className="animate-spin" />
                    : <ThumbsDown size={11} />}
                  {locale === 'he' ? 'דחה הצעה' : 'Decline Offer'}
                </motion.button>
              </div>
            )}
          </>
        )
      })()}

      {/* ── Post-signature success overlay (only for fresh signs, not revisits) */}
      <AnimatePresence>
        {accepted && freshSignedRef.current && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(3,3,5,0.92)', backdropFilter: 'blur(24px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Aurora behind the card — brand_color + emerald */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute top-1/4 left-1/4 rounded-full"
                style={{
                  width: '55vw', height: '55vw',
                  background: `radial-gradient(circle, ${brandColor}20 0%, transparent 65%)`,
                  filter: 'blur(60px)',
                  animation: 'dr-float-a 8s ease-in-out infinite',
                }}
              />
              <div
                className="absolute bottom-1/4 right-1/4 rounded-full"
                style={{
                  width: '45vw', height: '45vw',
                  background: 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 65%)',
                  filter: 'blur(50px)',
                  animation: 'dr-float-b 10s ease-in-out infinite',
                }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: '30vw', height: '30vw',
                  background: `radial-gradient(circle, ${brandColor}15 0%, transparent 70%)`,
                  filter: 'blur(40px)',
                  animation: 'dr-float-a 12s ease-in-out infinite reverse',
                }}
              />
            </div>

            <motion.div
              className="relative w-full max-w-sm mx-4 mb-8 sm:mb-0 rounded-3xl p-8 flex flex-col items-center gap-5 text-center"
              initial={{ scale: 0.78, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.12 }}
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 100%)',
                border: `1px solid ${brandColor}35`,
                boxShadow: `0 0 80px ${brandColor}18, 0 0 40px rgba(34,197,94,0.1), 0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.09)`,
              }}
            >
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.3 }}
                className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
                style={{
                  background: `linear-gradient(135deg, ${brandColor}28, ${brandColor}12)`,
                  border: `2px solid ${brandColor}50`,
                  boxShadow: `0 0 40px ${brandColor}35, 0 0 80px ${brandColor}18`,
                }}
              >
                🎉
              </motion.div>

              {/* Success message from template */}
              {(() => {
                const templateId = proposal.success_template ?? DEFAULT_TEMPLATE_ID
                const tmpl = SUCCESS_TEMPLATES.find(t => t.id === templateId) ?? SUCCESS_TEMPLATES.find(t => t.id === DEFAULT_TEMPLATE_ID)!
                const totalStr = formatCurrency(grandTotal, proposal.currency)
                const message = interpolateSuccess(tmpl, locale as 'he' | 'en', proposal.client_name || '', totalStr)
                return (
                  <motion.p
                    className="text-sm leading-relaxed text-white/70"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    {message}
                  </motion.p>
                )
              })()}

              {/* Grand total badge */}
              <motion.div
                className="rounded-2xl px-5 py-3 w-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.06))',
                  border: '1px solid rgba(34,197,94,0.25)',
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/60 mb-0.5">
                  {locale === 'he' ? 'סה״כ מאושר' : 'Total Approved'}
                </p>
                <p
                  className="text-2xl font-black tabular-nums"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatCurrency(grandTotal, proposal.currency)}
                </p>
              </motion.div>

              {/* Download signed PDF — branded button */}
              <motion.button
                onClick={handleDownloadPdf}
                disabled={pdfGenerating}
                className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-sm font-bold text-white transition disabled:opacity-60"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                style={{
                  background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 60%, #a855f7 100%)`,
                  boxShadow: `0 0 32px ${brandColor}55, 0 4px 24px rgba(0,0,0,0.3)`,
                }}
              >
                {/* Shimmer sweep */}
                {!pdfGenerating && (
                  <span
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/12"
                    style={{ animation: 'checkout-shimmer 2.4s ease-out 1s infinite' }}
                    aria-hidden
                  />
                )}
                <span className="relative flex items-center gap-2.5">
                  <FileDown size={16} className={pdfGenerating ? 'animate-bounce' : ''} />
                  {pdfGenerating
                    ? (locale === 'he' ? 'יוצר PDF…' : 'Generating PDF…')
                    : (locale === 'he' ? '⬇ הורד חוזה חתום (PDF)' : '⬇ Download Signed Contract (PDF)')}
                </span>
              </motion.button>

              <motion.p
                className="text-[10px] text-white/18"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Powered by DealSpace
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legal Terms Modal ──────────────────────────────────────────────────── */}
      <LegalTermsModal
        open={legalModalOpen}
        onOpenChange={setLegalModalOpen}
        locale={locale}
        companyName={proposal?.creator_info?.company_name}
      />

      <GlobalFooter />
    </div>
  )
}
