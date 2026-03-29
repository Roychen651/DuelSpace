import { useRef, useState, useCallback } from 'react'
import ReactSignatureCanvas from 'react-signature-canvas'
import type SignatureCanvas from 'react-signature-canvas'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Check, PenLine } from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SignaturePadProps {
  onConfirm: (dataUrl: string) => void
  onClear?: () => void
  locale?: string
}

// ─── SignaturePad ─────────────────────────────────────────────────────────────

export function SignaturePad({ onConfirm, onClear, locale = 'en' }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const isHe = locale === 'he'

  const handleClear = useCallback(() => {
    sigRef.current?.clear()
    setIsEmpty(true)
    setConfirmed(false)
    onClear?.()
  }, [onClear])

  const handleConfirm = useCallback(() => {
    if (!sigRef.current || sigRef.current.isEmpty()) return
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png')
    setConfirmed(true)
    onConfirm(dataUrl)
  }, [onConfirm])

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine size={13} style={{ color: '#818cf8' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {isHe ? 'חתימה אלקטרונית' : 'Electronic Signature'}
          </span>
        </div>
        {!isEmpty && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-[10px] font-semibold transition"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ color: '#f87171' }}
          >
            <RotateCcw size={11} />
            {isHe ? 'נקה' : 'Clear'}
          </motion.button>
        )}
      </div>

      {/* Canvas area */}
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: isDrawing
            ? '1px solid rgba(212,175,55,0.6)'
            : confirmed
              ? '1px solid rgba(34,197,94,0.4)'
              : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isDrawing
            ? '0 0 0 3px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.04)'
            : confirmed
              ? '0 0 0 3px rgba(34,197,94,0.1)'
              : 'none',
          transition: 'border 0.2s, box-shadow 0.2s',
          cursor: 'crosshair',
        }}
      >
        {/* Placeholder when empty */}
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PenLine size={20} style={{ color: 'rgba(255,255,255,0.12)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {isHe ? 'חתמו כאן' : 'Sign here'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Baseline */}
        <div
          className="pointer-events-none absolute bottom-10 inset-x-6"
          style={{ height: 1, background: 'rgba(255,255,255,0.08)' }}
        />

        <ReactSignatureCanvas
          ref={sigRef}
          penColor={confirmed ? '#4ade80' : '#a5b4fc'}
          canvasProps={{
            className: 'w-full',
            style: { height: 160, display: 'block' },
          }}
          backgroundColor="transparent"
          onBegin={() => { setIsDrawing(true); setIsEmpty(false); setConfirmed(false) }}
          onEnd={() => { setIsDrawing(false); setIsEmpty(sigRef.current?.isEmpty() ?? true) }}
          dotSize={2}
          minWidth={1.5}
          maxWidth={3.5}
          velocityFilterWeight={0.7}
        />
      </motion.div>

      {/* Confirm button */}
      <AnimatePresence>
        {!isEmpty && !confirmed && (
          <motion.button
            type="button"
            onClick={handleConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 20px rgba(99,102,241,0.35)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
          >
            <Check size={15} strokeWidth={2.5} />
            {isHe ? 'אשר חתימה' : 'Confirm Signature'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Confirmed state */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Check size={15} strokeWidth={2.5} />
            {isHe ? 'החתימה אושרה' : 'Signature confirmed'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
