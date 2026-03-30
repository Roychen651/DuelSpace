import { useState, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { X, Copy, Check, Mail, Send, ExternalLink } from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SendModalProps {
  open: boolean
  onClose: () => void
  shareUrl: string
  clientName: string
  clientEmail?: string
  projectTitle: string
  locale: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SendModal({
  open,
  onClose,
  shareUrl,
  clientName,
  clientEmail,
  projectTitle,
  locale,
}: SendModalProps) {
  const [copied, setCopied] = useState(false)
  const isHe = locale === 'he'

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Reset copied state when modal closes
  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const clientDisplay = clientName || (isHe ? 'הלקוח' : 'your client')
  const titleDisplay  = projectTitle || (isHe ? 'הפרויקט' : 'our project')

  const waMsg = isHe
    ? `היי${clientName ? ` ${clientName}` : ''}! הכנתי עבורך את הצעת המחיר / הסכם ההתקשרות לפרויקט ${titleDisplay}. אפשר לצפות, לאשר ולחתום דיגיטלית בצורה מאובטחת כאן:\n${shareUrl}`
    : `Hi${clientName ? ` ${clientName}` : ''}! I've prepared the proposal / engagement agreement for "${titleDisplay}". You can view, approve, and sign digitally here:\n${shareUrl}`

  const emailSubject = isHe ? `הצעה: ${titleDisplay}` : `Proposal: ${titleDisplay}`
  const waHref       = `https://wa.me/?text=${encodeURIComponent(waMsg)}`
  const mailHref     = `mailto:${clientEmail ?? ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(waMsg)}`

  // ── Animation variants ────────────────────────────────────────────────────

  const backdropVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit:    { opacity: 0, transition: { duration: 0.18, delay: 0.05 } },
  }

  const panelVariants: Variants = {
    hidden:  { opacity: 0, scale: 0.9, y: 24 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: { type: 'spring' as const, stiffness: 320, damping: 28, delay: 0.04 },
    },
    exit: { opacity: 0, scale: 0.94, y: 12, transition: { duration: 0.18 } },
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <style>{`
            @keyframes send-shimmer {
              0%        { transform: translateX(-140%) }
              60%, 100% { transform: translateX(140%) }
            }
          `}</style>

          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
          />

          {/* Centering wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md rounded-3xl overflow-hidden"
              style={{
                background:  'linear-gradient(160deg, rgba(22,22,36,0.99) 0%, rgba(12,12,22,0.99) 100%)',
                border:      '1px solid rgba(255,255,255,0.09)',
                boxShadow:   '0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
              dir={isHe ? 'rtl' : 'ltr'}
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 end-4 flex h-7 w-7 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/[0.08] hover:text-white/70"
              >
                <X size={14} />
              </button>

              {/* ── Header ── */}
              <div className="px-7 pt-7 pb-5">
                <div className="flex justify-center mb-5">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.14))',
                      border:     '1px solid rgba(99,102,241,0.3)',
                      boxShadow:  '0 0 32px rgba(99,102,241,0.22)',
                    }}
                  >
                    <Send size={22} style={{ color: '#818cf8' }} />
                  </div>
                </div>

                <h2 className="text-xl font-black text-white text-center mb-1.5">
                  {isHe ? 'חדר העסקה פעיל!' : 'Deal Room is Live!'}
                </h2>
                <p className="text-sm text-white/45 text-center leading-relaxed">
                  {isHe
                    ? `שתף עם ${clientDisplay} — הם יוכלו לצפות, לבחור ולחתום מיידית`
                    : `Share with ${clientDisplay} — they can view, choose, and sign instantly`}
                </p>
              </div>

              {/* ── Body ── */}
              <div className="px-7 pb-7 space-y-3">

                {/* Link preview */}
                <div
                  className="flex items-center gap-2 rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <ExternalLink size={11} className="flex-none text-white/25" />
                  <p className="flex-1 text-xs font-mono text-white/40 truncate">{shareUrl}</p>
                </div>

                {/* ── WhatsApp — Primary CTA ── */}
                <motion.a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl overflow-hidden text-sm font-bold text-white whitespace-nowrap"
                  style={{
                    height:     52,
                    background: 'linear-gradient(135deg, #1DA851 0%, #25D366 100%)',
                    boxShadow:  '0 0 28px rgba(37,211,102,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                >
                  {/* Shimmer */}
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)',
                      animation:  'send-shimmer 3.5s ease-in-out infinite',
                    }}
                    aria-hidden
                  />
                  {/* WhatsApp logo */}
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>{isHe ? 'שלח בWhatsApp' : 'Send via WhatsApp'}</span>
                </motion.a>

                {/* ── Email — Secondary ── */}
                <motion.a
                  href={mailHref}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl text-sm font-bold whitespace-nowrap"
                  style={{
                    height:     46,
                    background: 'rgba(99,102,241,0.1)',
                    border:     '1px solid rgba(99,102,241,0.25)',
                    color:      '#a5b4fc',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                >
                  <Mail size={15} />
                  <span>{isHe ? 'שלח באימייל' : 'Send via Email'}</span>
                </motion.a>

                {/* ── Divider ── */}
                <div className="flex items-center gap-3 py-0.5">
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {isHe ? 'או' : 'or'}
                  </span>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* ── Copy Link — Tertiary ── */}
                <motion.button
                  type="button"
                  onClick={handleCopy}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold whitespace-nowrap"
                  style={{
                    height:     40,
                    background: copied ? 'rgba(34,197,94,0.08)'      : 'rgba(255,255,255,0.04)',
                    border:     copied ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    color:      copied ? '#4ade80'                    : 'rgba(255,255,255,0.45)',
                    transition: 'background 0.25s, border-color 0.25s, color 0.25s',
                  }}
                  whileTap={{ scale: 0.96, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                >
                  {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                  <span>
                    {copied
                      ? (isHe ? 'הקישור הועתק!' : 'Link Copied!')
                      : (isHe ? 'העתק קישור' : 'Copy Link')}
                  </span>
                </motion.button>

                {/* Footer note */}
                <p className="text-center text-[10px] pt-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
                  {isHe
                    ? 'תקבל עדכון כשהלקוח יצפה ויאשר את ההצעה'
                    : "You'll be notified when your client views and approves"}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
