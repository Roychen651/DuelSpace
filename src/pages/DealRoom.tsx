import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Zap, Clock, Globe, AlertCircle, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PremiumSliderCard } from '../components/deal-room/PremiumSliderCard'
import { CheckoutClimax } from '../components/deal-room/CheckoutClimax'
import { formatCurrency } from '../types/proposal'
import type { Proposal } from '../types/proposal'

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

// ─── Aurora background ────────────────────────────────────────────────────────

function DealRoomAurora() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: '#05050A' }} />
      <div
        className="absolute -top-1/4 -left-1/4 rounded-full"
        style={{
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 68%)',
          filter: 'blur(60px)',
          animation: 'dr-float-a 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 rounded-full"
        style={{
          width: '55vw', height: '55vw',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)',
          filter: 'blur(70px)',
          animation: 'dr-float-b 28s ease-in-out infinite',
        }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
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
  @keyframes dr-spin { to { transform: rotate(360deg); } }
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

// ─── Main DealRoom page ───────────────────────────────────────────────────────

export default function DealRoom() {
  const { token } = useParams<{ token: string }>()

  // ── State ──────────────────────────────────────────────────────────────────
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [fetchStatus, setFetchStatus] = useState<'loading' | 'notfound' | 'ok'>('loading')

  // Per-add-on state: { [id]: { enabled, qty } }
  const [lineItems, setLineItems] = useState<
    Record<string, { enabled: boolean; qty: number }>
  >({})

  const [signature, setSignature] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  // Locale toggle (public page — no auth context)
  const [locale, setLocale] = useState<'he' | 'en'>(() => {
    const stored = localStorage.getItem('dealspace-locale')
    if (stored === 'he' || stored === 'en') return stored
    return navigator.language.startsWith('he') ? 'he' : 'en'
  })
  const dir = locale === 'he' ? 'rtl' : 'ltr'

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

      setProposal(data as Proposal)
      setFetchStatus('ok')
      if (data.status === 'accepted') setAccepted(true)

      // Initialise line items from proposal add-ons
      const init: Record<string, { enabled: boolean; qty: number }> = {}
      for (const a of (data as Proposal).add_ons) {
        init[a.id] = { enabled: a.enabled, qty: 1 }
      }
      setLineItems(init)

      // Silent "viewed" ping — fire-and-forget
      supabase.rpc('mark_proposal_viewed', { p_token: token }).then(() => {})
    }
    load()
  }, [token])

  // ── Grand total calculation ────────────────────────────────────────────────
  const grandTotal = proposal
    ? proposal.base_price +
      proposal.add_ons
        .filter(a => lineItems[a.id]?.enabled ?? a.enabled)
        .reduce((sum, a) => sum + a.price * (lineItems[a.id]?.qty ?? 1), 0)
    : 0

  // ── Handle accept ──────────────────────────────────────────────────────────
  const handleAccept = useCallback(async () => {
    if (!token || accepting || accepted) return
    setAccepting(true)
    const { error } = await supabase.rpc('accept_proposal', { p_token: token })
    if (!error) setAccepted(true)
    setAccepting(false)
  }, [token, accepting, accepted])

  // ── Toggle locale ──────────────────────────────────────────────────────────
  const toggleLocale = () => {
    const next = locale === 'he' ? 'en' : 'he'
    setLocale(next)
    localStorage.setItem('dealspace-locale', next)
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
  if (fetchStatus === 'notfound' || !proposal) {
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

  // ── Render: main ───────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-dvh flex flex-col"
      style={{ background: '#05050A' }}
      dir={dir}
    >
      <style>{pageKeyframes}</style>
      <DealRoomAurora />

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

          {/* Countdown */}
          {proposal.expires_at && (
            <motion.div variants={slideUp}>
              <CountdownBanner expiresAt={proposal.expires_at} locale={locale} />
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
            className="font-display text-3xl sm:text-4xl font-black leading-tight text-white mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            {proposal.project_title}
          </motion.h1>

          {/* Description */}
          {proposal.description && (
            <motion.p
              variants={slideUp}
              className="text-[15px] text-white/50 leading-relaxed whitespace-pre-wrap"
            >
              {proposal.description}
            </motion.p>
          )}
        </motion.div>

        {/* ── Base package card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-2xl p-5 mb-3"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">
            {locale === 'he' ? 'חבילת בסיס' : 'Base Package'}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <Check size={14} className="text-indigo-400" strokeWidth={2.5} />
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
              style={{ color: '#c4b5fd' }}
            >
              {formatCurrency(proposal.base_price, proposal.currency)}
            </p>
          </div>
        </motion.div>

        {/* ── Add-ons section ───────────────────────────────────────────── */}
        {proposal.add_ons.length > 0 && (
          <div className="mt-6 mb-4">
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

        {/* ── Trust signals ─────────────────────────────────────────────── */}
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

        {/* Spacer so sticky bar doesn't overlap content */}
        <div className="h-44" />
      </div>

      {/* ── Sticky checkout bar ───────────────────────────────────────────── */}
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
        />
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {accepted && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(20px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {}} // Non-dismissible
          >
            <motion.div
              className="flex flex-col items-center gap-6 p-8 text-center max-w-sm"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.08))',
                  border: '2px solid rgba(34,197,94,0.4)',
                  boxShadow: '0 0 40px rgba(34,197,94,0.3)',
                }}
              >
                🎉
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">
                  {locale === 'he' ? 'סגרנו את הדיל!' : 'Deal Closed!'}
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  {locale === 'he'
                    ? `תודה ${proposal.client_name ? proposal.client_name + ',' : ''} ההסכם אושר ונשמר. ניצור איתך קשר בקרוב.`
                    : `Thank you${proposal.client_name ? ` ${proposal.client_name}` : ''}! Your approval has been recorded. We'll be in touch shortly.`}
                </p>
              </div>
              <div
                className="rounded-xl px-4 py-2"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <p className="text-xs font-semibold text-emerald-400">
                  {locale === 'he'
                    ? `סה״כ מאושר: ${formatCurrency(grandTotal, proposal.currency)}`
                    : `Approved: ${formatCurrency(grandTotal, proposal.currency)}`}
                </p>
              </div>
              <p className="text-[10px] text-white/20">
                Powered by DealSpace
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
