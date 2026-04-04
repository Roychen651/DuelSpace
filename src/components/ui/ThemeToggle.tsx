import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), [])

  // Skeleton placeholder — same size as the real toggle
  if (!mounted) {
    return (
      <div
        className="h-8 w-[54px] rounded-full"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex h-8 w-[54px] flex-none cursor-pointer items-center rounded-full
        transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.12) 100%)'
          : 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.08) 100%)',
        border: isDark
          ? '1px solid rgba(99,102,241,0.3)'
          : '1px solid rgba(251,191,36,0.3)',
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 12px rgba(99,102,241,0.1)'
          : 'inset 0 1px 0 rgba(255,255,255,0.5), 0 0 12px rgba(251,191,36,0.08)',
      }}
    >
      {/* Track icons — Sun (left) and Moon (right) always visible at low opacity */}
      <div className="absolute inset-0 flex items-center justify-between px-[7px] pointer-events-none">
        <Sun
          size={11}
          style={{
            color: isDark ? 'rgba(255,255,255,0.2)' : '#f59e0b',
            transition: 'color 0.3s',
          }}
        />
        <Moon
          size={11}
          style={{
            color: isDark ? '#818cf8' : 'rgba(0,0,0,0.15)',
            transition: 'color 0.3s',
          }}
        />
      </div>

      {/* Sliding thumb */}
      <motion.div
        layout
        transition={{ type: 'spring' as const, stiffness: 500, damping: 35 }}
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full"
        style={{
          marginLeft: isDark ? '24px' : '3px',
          background: isDark
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          boxShadow: isDark
            ? '0 1px 6px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.2)'
            : '0 1px 6px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon-thumb"
              initial={{ opacity: 0, rotate: -60, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 60, scale: 0.4 }}
              transition={{ duration: 0.18, ease: 'easeOut' as const }}
            >
              <Moon size={11} style={{ color: '#ffffff' }} />
            </motion.span>
          ) : (
            <motion.span
              key="sun-thumb"
              initial={{ opacity: 0, rotate: 60, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -60, scale: 0.4 }}
              transition={{ duration: 0.18, ease: 'easeOut' as const }}
            >
              <Sun size={11} style={{ color: '#7c3aed' }} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  )
}
