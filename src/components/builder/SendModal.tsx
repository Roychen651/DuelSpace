import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { X, Copy, Check, Mail, Send, ExternalLink, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SendModalProps {
  open: boolean
  onClose: () => void
  shareUrl: string
  clientName: string
  clientEmail?: string
  projectTitle: string
  locale: string
  /** ID of the proposal being sent — required for native email delivery */
  proposalId?: string | null
}

// ─── View transition variants ─────────────────────────────────────────────────

const slideIn: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit:    { opacity: 0, x: 24, transition: { duration: 0.16, ease: 'easeIn'  as const } },
}

const slideBack: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit:    { opacity: 0, x: -24, transition: { duration: 0.16, ease: 'easeIn' as const } },
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error'

// ─── Component ────────────────────────────────────────────────────────────────

export function SendModal({
  open,
  onClose,
  shareUrl,
  clientName,
  clientEmail,
  projectTitle,
  locale,
  proposalId,
}: SendModalProps) {
  const [copied, setCopied]         = useState(false)
  const [view, setView]             = useState<'menu' | 'composer'>('menu')
  const [toEmail, setToEmail]       = useState(clientEmail ?? '')
  const [message, setMessage]       = useState('')
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle')
  const emailInputRef               = useRef<HTMLInputElement>(null)
  const isHe = locale === 'he'

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Reset all state when modal closes or reopens
  useEffect(() => {
    if (!open) {
      setCopied(false)
      setView('menu')
      setToEmail(clientEmail ?? '')
      setMessage('')
      setSendStatus('idle')
    }
  }, [open, clientEmail])

  // Focus email input when composer opens
  useEffect(() => {
    if (view === 'composer') {
      setTimeout(() => emailInputRef.current?.focus(), 200)
    }
  }, [view])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSendEmail = async () => {
    if (!proposalId || !toEmail.trim() || sendStatus === 'sending') return
    setSendStatus('sending')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-proposal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey':         import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type':   'application/json',
          },
          body: JSON.stringify({
            proposal_id: proposalId,
            to_email:    toEmail.trim(),
            message:     message.trim(),
          }),
        },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSendStatus('sent')
    } catch {
      setSendStatus('error')
      setTimeout(() => setSendStatus('idle'), 3000)
    }
  }

  const clientDisplay = clientName || (isHe ? 'הלקוח' : 'your client')
  const titleDisplay  = projectTitle || (isHe ? 'הפרויקט' : 'our project')

  const waMsg = isHe
    ? `היי ${clientDisplay},\nהכנתי עבורך את המסמך / הצעת המחיר: *${titleDisplay}*.\n\nאפשר לצפות בפרטים, לבחור אפשרויות ולחתום דיגיטלית באופן מאובטח בלינק הבא:\n${shareUrl}`
    : `Hi ${clientDisplay},\nI've prepared the document / proposal for: *${titleDisplay}*.\n\nYou can review the details, customize options, and securely sign it online here:\n${shareUrl}`

  const waHref = `https://wa.me/?text=${encodeURIComponent(waMsg)}`

  // ── Animation variants for modal entrance/exit ────────────────────────────

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
                className="absolute top-4 end-4 flex h-7 w-7 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/[0.08] hover:text-white/70 z-10"
              >
                <X size={14} />
              </button>

              {/* ── View switcher ─────────────────────────────────────────── */}
              <AnimatePresence mode="wait" initial={false}>

                {view === 'menu' && (
                  <motion.div
                    key="menu"
                    variants={slideBack}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {/* Header */}
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

                    {/* Body */}
                    <div className="px-7 pb-7 space-y-3">
                      {/* Link preview */}
                      <div
                        className="flex items-center gap-2 rounded-xl p-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <ExternalLink size={11} className="flex-none text-white/25" />
                        <p className="flex-1 text-xs font-mono text-white/40 truncate">{shareUrl}</p>
                      </div>

                      {/* WhatsApp — Primary */}
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
                        <span
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)',
                            animation:  'send-shimmer 3.5s ease-in-out infinite',
                          }}
                          aria-hidden
                        />
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span>{isHe ? 'שלח בWhatsApp' : 'Send via WhatsApp'}</span>
                      </motion.a>

                      {/* Email — opens composer view */}
                      <motion.button
                        type="button"
                        onClick={() => setView('composer')}
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
                      </motion.button>

                      {/* Divider */}
                      <div className="flex items-center gap-3 py-0.5">
                        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          {isHe ? 'או' : 'or'}
                        </span>
                        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      </div>

                      {/* Copy Link */}
                      <motion.button
                        type="button"
                        onClick={handleCopy}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold whitespace-nowrap"
                        style={{
                          height:     40,
                          background: copied ? 'rgba(34,197,94,0.08)'          : 'rgba(255,255,255,0.04)',
                          border:     copied ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.08)',
                          color:      copied ? '#4ade80'                        : 'rgba(255,255,255,0.45)',
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
                )}

                {view === 'composer' && (
                  <motion.div
                    key="composer"
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {/* Composer header */}
                    <div className="flex items-center gap-3 px-7 pt-6 pb-5">
                      <button
                        type="button"
                        onClick={() => { setView('menu'); setSendStatus('idle') }}
                        className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.08] hover:text-white/70"
                      >
                        {/* Flip arrow direction for RTL */}
                        <ArrowRight size={14} style={{ transform: isHe ? 'none' : 'rotate(180deg)' }} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[15px] font-black text-white leading-tight">
                          {isHe ? 'שלח באימייל' : 'Send via Email'}
                        </h2>
                        <p className="text-[11px] text-white/35 truncate">
                          {titleDisplay}
                        </p>
                      </div>
                      <div
                        className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
                        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
                      >
                        <Mail size={13} style={{ color: '#818cf8' }} />
                      </div>
                    </div>

                    {/* Composer body */}
                    <div className="px-7 pb-7 space-y-3">
                      {/* To: email input */}
                      <div>
                        <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                          {isHe ? 'אל' : 'To'}
                        </label>
                        <input
                          ref={emailInputRef}
                          type="email"
                          value={toEmail}
                          onChange={e => setToEmail(e.target.value)}
                          placeholder={isHe ? 'כתובת האימייל של הלקוח' : "Client's email address"}
                          disabled={sendStatus === 'sending' || sendStatus === 'sent'}
                          className="w-full rounded-xl px-4 text-sm text-white placeholder-white/25 outline-none transition-all"
                          style={{
                            height: 46,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                            direction: 'ltr',
                          }}
                          onFocus={e => {
                            e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)'
                            e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                          }}
                          onBlur={e => {
                            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.09)'
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                          }}
                        />
                      </div>

                      {/* Message textarea */}
                      <div>
                        <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                          {isHe ? 'הודעה (רשות)' : 'Message (optional)'}
                        </label>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          rows={4}
                          placeholder={isHe
                            ? `היי ${clientName || 'שם הלקוח'}! הכנתי עבורך את ההצעה...`
                            : `Hi ${clientName || 'Client Name'}, I've prepared the proposal...`}
                          disabled={sendStatus === 'sending' || sendStatus === 'sent'}
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all resize-none"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                            lineHeight: 1.6,
                          }}
                          onFocus={e => {
                            e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)'
                            e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                          }}
                          onBlur={e => {
                            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.09)'
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                          }}
                        />
                      </div>

                      {/* Send button */}
                      <motion.button
                        type="button"
                        onClick={handleSendEmail}
                        disabled={!toEmail.trim() || sendStatus === 'sending' || sendStatus === 'sent' || !proposalId}
                        className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl overflow-hidden text-sm font-bold text-white whitespace-nowrap"
                        style={{
                          height: 52,
                          background: sendStatus === 'sent'
                            ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                            : sendStatus === 'error'
                            ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          boxShadow: sendStatus === 'sent'
                            ? '0 0 28px rgba(34,197,94,0.3)'
                            : sendStatus === 'error'
                            ? '0 0 28px rgba(239,68,68,0.3)'
                            : '0 0 28px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                          opacity: !toEmail.trim() || !proposalId ? 0.45 : 1,
                          transition: 'background 0.3s, box-shadow 0.3s, opacity 0.2s',
                        }}
                        whileHover={toEmail.trim() && proposalId && sendStatus === 'idle' ? { scale: 1.01 } : {}}
                        whileTap={toEmail.trim() && proposalId && sendStatus === 'idle' ? { scale: 0.97, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } } : {}}
                      >
                        {sendStatus === 'idle' && (
                          <>
                            <span
                              className="pointer-events-none absolute inset-0"
                              style={{
                                background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.14) 50%, transparent 62%)',
                                animation:  'send-shimmer 3.5s ease-in-out infinite',
                              }}
                              aria-hidden
                            />
                            <Send size={15} />
                            <span>{isHe ? 'שלח הצעה ✈' : 'Send Proposal ✈'}</span>
                          </>
                        )}
                        {sendStatus === 'sending' && (
                          <>
                            <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                            <span>{isHe ? 'שולח...' : 'Sending...'}</span>
                          </>
                        )}
                        {sendStatus === 'sent' && (
                          <>
                            <CheckCircle2 size={15} />
                            <span>{isHe ? 'האימייל נשלח!' : 'Email Sent!'}</span>
                          </>
                        )}
                        {sendStatus === 'error' && (
                          <>
                            <AlertTriangle size={15} />
                            <span>{isHe ? 'שגיאה בשליחה' : 'Send Failed'}</span>
                          </>
                        )}
                      </motion.button>

                      {/* Sent success note */}
                      <AnimatePresence>
                        {sendStatus === 'sent' && (
                          <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-[11px] font-medium"
                            style={{ color: '#4ade80' }}
                          >
                            {isHe
                              ? `ההצעה נשלחה ל-${toEmail} — נקבל עדכון כשהלקוח יפתח`
                              : `Proposal sent to ${toEmail} — you'll be notified when opened`}
                          </motion.p>
                        )}
                        {!proposalId && sendStatus === 'idle' && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-[10px]"
                            style={{ color: 'rgba(255,255,255,0.25)' }}
                          >
                            {isHe ? 'שמור את ההצעה כדי לשלוח באימייל' : 'Save the proposal first to send via email'}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
