import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Check, PenLine } from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SignaturePadProps {
  onConfirm: (dataUrl: string) => void
  onClear?: () => void
  locale?: string
}

// ─── SignaturePad — native canvas, no external dependency ────────────────────

export function SignaturePad({ onConfirm, onClear, locale = 'en' }: SignaturePadProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPtRef = useRef<{ x: number; y: number } | null>(null)

  const [isEmpty, setIsEmpty] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const isHe = locale === 'he'

  // ── Initialize canvas once on mount ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const w = container.clientWidth
    const h = 160
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = '100%'
    canvas.style.height = h + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2
    ctx.strokeStyle = '#a5b4fc'
  }, [])

  const getXY = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.setPointerCapture(e.pointerId)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pt = getXY(e)
    isDrawingRef.current = true
    lastPtRef.current = pt
    ctx.strokeStyle = '#a5b4fc'
    ctx.beginPath()
    ctx.moveTo(pt.x, pt.y)
    setIsDrawing(true)
    setIsEmpty(false)
    setConfirmed(false)
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pt = getXY(e)
    const last = lastPtRef.current
    if (last) {
      const mid = { x: (last.x + pt.x) / 2, y: (last.y + pt.y) / 2 }
      ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(mid.x, mid.y)
    }
    lastPtRef.current = pt
  }

  const onUp = () => {
    isDrawingRef.current = false
    lastPtRef.current = null
    setIsDrawing(false)
  }

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    ctx.strokeStyle = '#a5b4fc'
    setIsEmpty(true)
    setConfirmed(false)
    isDrawingRef.current = false
    lastPtRef.current = null
    onClear?.()
  }, [onClear])

  const handleConfirm = useCallback(() => {
    if (isEmpty) return
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    setConfirmed(true)
    onConfirm(dataUrl)
  }, [isEmpty, onConfirm])

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
        ref={containerRef}
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

        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          style={{ display: 'block', touchAction: 'none' }}
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
