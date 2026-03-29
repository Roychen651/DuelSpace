import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Check, Zap, Eye, Clock, ExternalLink } from 'lucide-react'
import { proposalTotal, formatCurrency, STATUS_META } from '../../types/proposal'
import type { Proposal } from '../../types/proposal'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LivePreviewProps {
  proposal: Proposal
  locale: string
  compact?: boolean
}

// ─── Volumetric orbs (desktop background) ─────────────────────────────────────

function PreviewAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: '#060610' }} />
      {/* Indigo sphere — top left */}
      <div
        className="absolute"
        style={{
          top: '-10%',
          left: '-5%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 68%)',
          filter: 'blur(48px)',
          animation: 'lp-float-a 20s ease-in-out infinite',
        }}
      />
      {/* Purple sphere — bottom right */}
      <div
        className="absolute"
        style={{
          bottom: '-8%',
          right: '-8%',
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'lp-float-b 26s ease-in-out infinite',
        }}
      />
      {/* Gold accent — center */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: 'translate(-50%, -50%)',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)',
          filter: 'blur(40px)',
          animation: 'lp-pulse 14s ease-in-out infinite',
        }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}

// ─── Slot-machine price display ───────────────────────────────────────────────

function AnimatedPrice({
  total,
  currency,
}: {
  total: number
  currency: string
}) {
  const motionVal = useMotionValue(total)
  const spring = useSpring(motionVal, { stiffness: 55, damping: 16, mass: 1.2 })
  const displayed = useTransform(spring, v =>
    formatCurrency(Math.round(Math.max(0, v)), currency)
  )
  const prevRef = useRef(total)

  useEffect(() => {
    if (total !== prevRef.current) {
      prevRef.current = total
      motionVal.set(total)
    }
  }, [total, motionVal])

  return (
    <motion.span className="tabular-nums" aria-live="polite" aria-atomic="true">
      {displayed}
    </motion.span>
  )
}

// ─── Add-on card (in preview — read-only) ─────────────────────────────────────

function AddOnPreviewCard({
  label,
  description,
  price,
  enabled,
  currency,
  locale,
}: {
  label: string
  description?: string
  price: number
  enabled: boolean
  currency: string
  locale: string
}) {
  return (
    <div
      className="relative rounded-xl p-3.5 transition-all duration-300"
      style={{
        background: enabled
          ? 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.06) 100%)'
          : 'rgba(255,255,255,0.025)',
        border: enabled
          ? '1px solid rgba(99,102,241,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: enabled ? '0 4px 20px rgba(99,102,241,0.12)' : 'none',
      }}
    >
      {/* Enabled glow accent */}
      {enabled && (
        <div
          className="pointer-events-none absolute top-0 left-4 right-4 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)',
          }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Check indicator */}
          <div
            className="mt-0.5 flex-none flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: enabled ? '#6366f1' : 'rgba(255,255,255,0.06)',
              boxShadow: enabled ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
            }}
          >
            {enabled && <Check size={10} className="text-white" strokeWidth={3} />}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold leading-snug"
              style={{ color: enabled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }}
            >
              {label || (locale === 'he' ? 'תוספת ללא שם' : 'Unnamed add-on')}
            </p>
            {description && (
              <p className="mt-0.5 text-[11px] leading-snug text-white/30 truncate">
                {description}
              </p>
            )}
          </div>
        </div>
        <p
          className="flex-none text-sm font-bold tabular-nums"
          style={{ color: enabled ? '#a78bfa' : 'rgba(255,255,255,0.25)' }}
        >
          +{formatCurrency(price, currency)}
        </p>
      </div>
    </div>
  )
}

// ─── Main LivePreview ─────────────────────────────────────────────────────────

export function LivePreview({ proposal, locale, compact = false }: LivePreviewProps) {
  const total = proposalTotal(proposal)
  const meta = STATUS_META[proposal.status]

  const isEmpty =
    !proposal.project_title &&
    !proposal.client_name &&
    proposal.base_price === 0 &&
    proposal.add_ons.length === 0

  const containerClass = compact
    ? 'px-4 py-4'
    : 'relative w-full h-full overflow-y-auto flex flex-col items-center justify-start py-10 px-6'

  return (
    <div className={containerClass} style={compact ? {} : { minHeight: 0 }}>
      {/* Background orbs — desktop only */}
      {!compact && <PreviewAurora />}

      {/* Keyframes */}
      <style>{`
        @keyframes lp-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(40px, 30px) scale(1.05); }
        }
        @keyframes lp-float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-35px, -45px) scale(1.04); }
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 0.7; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-price-tick {
          0%   { transform: translateY(0); }
          30%  { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }
      `}</style>

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {isEmpty && !compact ? (
        <div
          className="relative z-10 flex flex-col items-center justify-center flex-1 text-center gap-4 max-w-xs mx-auto"
          style={{ animation: 'lp-fade-up 0.5s ease-out 0.2s both' }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 0 30px rgba(99,102,241,0.15)',
            }}
          >
            <Eye size={24} className="text-indigo-400/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/40 mb-1">
              {locale === 'he' ? 'תצוגה מקדימה' : 'Live Preview'}
            </p>
            <p className="text-xs text-white/20 leading-relaxed">
              {locale === 'he'
                ? 'מלאו את הפרטים משמאל ותצוגת הלקוח תתעדכן בזמן אמת'
                : 'Fill in the details on the left and the client view will update in real time'}
            </p>
          </div>
        </div>
      ) : (
        /* ── Deal Room Card ──────────────────────────────────────────── */
        <div
          className={[
            'relative z-10 w-full',
            compact ? '' : 'max-w-[520px]',
          ].join(' ')}
          style={{ animation: 'lp-fade-up 0.45s ease-out 0.1s both' }}
        >
          {/* ── Card ──────────────────────────────────────────────────── */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* ── Card header glow bar ─────────────────────────────── */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${meta.color}80 30%, ${meta.color}80 70%, transparent 100%)`,
                boxShadow: `0 0 20px ${meta.glow}`,
              }}
            />

            <div className={compact ? 'p-5' : 'p-7'}>

              {/* ── Brand bar ───────────────────────────────────────── */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      boxShadow: '0 0 14px rgba(99,102,241,0.4)',
                    }}
                  >
                    <Zap size={13} className="text-white" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-white/60">DealSpace</span>
                </div>

                {/* Status badge */}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    color: meta.color,
                    background: `${meta.color}15`,
                    border: `1px solid ${meta.color}30`,
                    boxShadow: `0 0 10px ${meta.glow}`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: meta.color }}
                  />
                  {locale === 'he' ? meta.label_he : meta.label_en}
                </span>
              </div>

              {/* ── Client greeting ──────────────────────────────────── */}
              {proposal.client_name && (
                <p className="text-xs text-white/35 mb-1 font-medium">
                  {locale === 'he' ? `שלום, ${proposal.client_name}` : `Hello, ${proposal.client_name}`}
                </p>
              )}

              {/* ── Project title ─────────────────────────────────────── */}
              <h2
                className={[
                  'font-bold leading-tight text-white mb-3',
                  compact ? 'text-lg' : 'text-2xl',
                ].join(' ')}
              >
                {proposal.project_title || (locale === 'he' ? 'הצעת מחיר' : 'Your Proposal')}
              </h2>

              {/* ── Description ──────────────────────────────────────── */}
              {proposal.description && (
                <p className="text-sm text-white/45 leading-relaxed mb-5 whitespace-pre-wrap">
                  {proposal.description}
                </p>
              )}

              {/* ── Divider ───────────────────────────────────────────── */}
              <div className="h-px bg-white/[0.06] mb-5" />

              {/* ── Base package ─────────────────────────────────────── */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
                  {locale === 'he' ? 'חבילת בסיס' : 'Base Package'}
                </p>
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(99,102,241,0.18)' }}
                    >
                      <Check size={11} className="text-indigo-400" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-white/70">
                      {proposal.project_title || (locale === 'he' ? 'שירות' : 'Service')}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white/80 tabular-nums">
                    {formatCurrency(proposal.base_price, proposal.currency)}
                  </span>
                </div>
              </div>

              {/* ── Add-ons ───────────────────────────────────────────── */}
              {proposal.add_ons.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
                    {locale === 'he' ? 'תוספות' : 'Add-ons'}
                  </p>
                  <div className="space-y-2">
                    {proposal.add_ons.map(addOn => (
                      <AddOnPreviewCard
                        key={addOn.id}
                        label={addOn.label}
                        description={addOn.description}
                        price={addOn.price}
                        enabled={addOn.enabled}
                        currency={proposal.currency}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Divider ───────────────────────────────────────────── */}
              <div className="h-px bg-white/[0.06] mb-5" />

              {/* ── Total price (slot machine) ────────────────────────── */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">
                    {locale === 'he' ? 'סה״כ לתשלום' : 'Total Investment'}
                  </p>
                  <p
                    className={[
                      'font-black leading-none',
                      compact ? 'text-3xl' : 'text-4xl',
                    ].join(' ')}
                    style={{
                      color: meta.color,
                      textShadow: `0 0 40px ${meta.glow}, 0 0 80px ${meta.glow}`,
                    }}
                  >
                    <AnimatedPrice total={total} currency={proposal.currency} />
                  </p>
                  {proposal.add_ons.filter(a => a.enabled).length > 0 && (
                    <p className="mt-1 text-[11px] text-white/25">
                      {locale === 'he'
                        ? `כולל ${proposal.add_ons.filter(a => a.enabled).length} תוספות`
                        : `Includes ${proposal.add_ons.filter(a => a.enabled).length} add-on${proposal.add_ons.filter(a => a.enabled).length !== 1 ? 's' : ''}`}
                    </p>
                  )}
                </div>

                {/* Meta info */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/25">
                    <Eye size={10} />
                    <span>{proposal.view_count} {locale === 'he' ? 'צפיות' : 'views'}</span>
                  </div>
                  {proposal.expires_at && (
                    <div className="flex items-center gap-1.5 text-[10px] text-white/25">
                      <Clock size={10} />
                      <span>
                        {locale === 'he' ? 'תוקף עד' : 'Expires'}{' '}
                        {new Date(proposal.expires_at).toLocaleDateString(
                          locale === 'he' ? 'he-IL' : 'en-US',
                          { day: 'numeric', month: 'short' }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CTA (preview only — not functional in builder) ────── */}
              {!compact && (
                <div className="mt-6">
                  <div
                    className="relative w-full overflow-hidden rounded-xl py-3.5 text-center text-sm font-bold text-white/40 cursor-not-allowed select-none"
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px dashed rgba(99,102,241,0.25)',
                    }}
                  >
                    {locale === 'he' ? '✓ אשר את ההצעה' : '✓ Accept This Proposal'}
                  </div>
                  <div className="mt-2.5 flex items-center justify-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: '#d4af37', boxShadow: '0 0 6px rgba(212,175,55,0.6)' }}
                    />
                    <p className="text-[10px] font-semibold text-amber-400/50">
                      {locale === 'he'
                        ? 'תצוגה מקדימה — הכפתור יופעל כשהלקוח פותח את הקישור'
                        : 'Preview only — button activates when client opens the link'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Share link (desktop preview only) ────────────────────── */}
          {!compact && proposal.id !== 'preview' && (
            <motion.div
              className="mt-4 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <ExternalLink size={11} className="text-white/20" />
              <p className="text-[10px] text-white/20 font-mono truncate max-w-[300px]">
                {window.location.origin}/deal/{proposal.public_token || '…'}
              </p>
            </motion.div>
          )}

          {/* ── "LIVE PREVIEW" watermark ──────────────────────────────── */}
          {!compact && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <div
                className="h-px flex-1 max-w-[80px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08))' }}
              />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/15">
                {locale === 'he' ? 'תצוגה מקדימה בלבד' : 'Live Preview'}
              </span>
              <div
                className="h-px flex-1 max-w-[80px]"
                style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
