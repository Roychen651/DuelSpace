import { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'

// ─── InfoTip ──────────────────────────────────────────────────────────────────
// Touch-safe tooltip. Uses controlled open state + onClick so it works on mobile
// (mouseenter never fires on touch devices). See CLAUDE.md §21 for the pattern.

interface InfoTipProps {
  content: string
  /** Icon size in px — defaults to 14 */
  size?: number
}

export function InfoTip({ content, size = 14 }: InfoTipProps) {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip.Provider delayDuration={200} skipDelayDuration={0}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            tabIndex={0}
            className="touch-manipulation rounded-lg p-1.5 text-white/25 transition-colors duration-200 hover:text-white/60"
            onClick={() => setOpen(o => !o)}
            aria-label="More info"
          >
            <Info size={size} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-[200] max-w-[260px] rounded-xl px-3.5 py-2.5 text-[11px] leading-relaxed text-white/75 select-none"
            style={{
              background: '#030305',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {content}
            <Tooltip.Arrow style={{ fill: '#030305' }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
