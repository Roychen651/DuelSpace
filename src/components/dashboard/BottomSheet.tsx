import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 300], [1, 0])
  const overlayOpacity = useTransform(y, [0, 300], [1, 0])

  // Close on backdrop click
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = '' }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-40"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              opacity: overlayOpacity,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, rgba(18,18,24,0.98) 0%, rgba(12,12,18,1) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              y,
              opacity,
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) {
                onClose()
              } else {
                y.set(0)
              }
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            {title && (
              <div className="px-6 pb-3 pt-1 border-b border-white/5">
                <p className="text-sm font-semibold text-white/70">{title}</p>
              </div>
            )}

            <div className="px-4 py-3">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Bottom Sheet Action Item ─────────────────────────────────────────────────

interface SheetActionProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

export function SheetAction({ icon, label, onClick, variant = 'default' }: SheetActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors active:bg-white/5"
      style={{ color: variant === 'danger' ? '#f87171' : 'rgba(255,255,255,0.85)' }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: variant === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)' }}>
        {icon}
      </span>
      {label}
    </button>
  )
}
