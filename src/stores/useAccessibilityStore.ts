import { create } from 'zustand'

// ─── Persistence keys ─────────────────────────────────────────────────────────

const LS = {
  textSize:         'ds:a11y:textSize',
  highContrast:     'ds:a11y:highContrast',
  monochrome:       'ds:a11y:monochrome',
  invertColors:     'ds:a11y:invertColors',
  highlightLinks:   'ds:a11y:highlightLinks',
  readableFont:     'ds:a11y:readableFont',
  dyslexiaFont:     'ds:a11y:dyslexiaFont',
  stopAnimations:   'ds:a11y:stopAnimations',
  lineHeightBoost:  'ds:a11y:lineHeightBoost',
  letterSpacing:    'ds:a11y:letterSpacing',
  readingMask:      'ds:a11y:readingMask',
  bigCursor:        'ds:a11y:bigCursor',
  focusHighlight:   'ds:a11y:focusHighlight',
  colorBlindMode:   'ds:a11y:colorBlindMode',
} as const

// ─── State shape ──────────────────────────────────────────────────────────────

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'

export type BoolKey =
  | 'highContrast' | 'monochrome' | 'invertColors'
  | 'highlightLinks' | 'readableFont' | 'dyslexiaFont'
  | 'stopAnimations' | 'lineHeightBoost' | 'letterSpacing'
  | 'readingMask' | 'bigCursor' | 'focusHighlight'

interface A11yState {
  // Vision
  textSize:        number          // 1.0 – 1.5
  highContrast:    boolean
  monochrome:      boolean
  invertColors:    boolean
  colorBlindMode:  ColorBlindMode  // CSS filter approximation
  // Reading & cognitive
  dyslexiaFont:    boolean         // Atkinson Hyperlegible
  readableFont:    boolean         // Arial fallback
  lineHeightBoost: boolean         // 1.6 → 2.2
  letterSpacing:   boolean         // +0.06em
  readingMask:     boolean         // horizontal strip overlay
  stopAnimations:  boolean
  // Navigation & motor
  highlightLinks:  boolean
  focusHighlight:  boolean         // thick yellow focus rings
  bigCursor:       boolean

  setTextSize:       (v: number) => void
  toggle:            (key: BoolKey) => void
  setColorBlindMode: (mode: ColorBlindMode) => void
  reset:             () => void
}

// ─── DOM mutator ──────────────────────────────────────────────────────────────

function buildFilter(s: A11yState): string {
  const parts: string[] = []

  // Color blindness (approximate — good enough for real-world compensation)
  if (s.colorBlindMode === 'protanopia')   parts.push('saturate(0.6) hue-rotate(-20deg)')
  if (s.colorBlindMode === 'deuteranopia') parts.push('saturate(0.65) hue-rotate(20deg)')
  if (s.colorBlindMode === 'tritanopia')   parts.push('saturate(0.7) hue-rotate(90deg)')

  if (s.highContrast) parts.push('contrast(1.9) brightness(1.06) saturate(1.2)')
  if (s.monochrome)   parts.push('grayscale(1)')
  if (s.invertColors) parts.push('invert(1) hue-rotate(180deg)')

  return parts.join(' ')
}

export function applyToDom(s: A11yState) {
  const root = document.documentElement

  // CSS variable for font scaling
  root.style.setProperty('--a11y-scale', String(s.textSize))

  // Filter (combined, one pass — avoids multiple filter layers)
  const f = buildFilter(s)
  root.style.filter = f || ''

  // Class-based features
  root.classList.toggle('a11y-highlight-links',   s.highlightLinks)
  root.classList.toggle('a11y-readable-font',     s.readableFont)
  root.classList.toggle('a11y-dyslexia-font',     s.dyslexiaFont)
  root.classList.toggle('a11y-stop-animations',   s.stopAnimations)
  root.classList.toggle('a11y-line-height',        s.lineHeightBoost)
  root.classList.toggle('a11y-letter-spacing',     s.letterSpacing)
  root.classList.toggle('a11y-big-cursor',         s.bigCursor)
  root.classList.toggle('a11y-focus-highlight',    s.focusHighlight)
  // readingMask handled in React component (needs pointer tracking)
}

function persistState(s: A11yState) {
  localStorage.setItem(LS.textSize,         String(s.textSize))
  localStorage.setItem(LS.highContrast,     String(s.highContrast))
  localStorage.setItem(LS.monochrome,       String(s.monochrome))
  localStorage.setItem(LS.invertColors,     String(s.invertColors))
  localStorage.setItem(LS.highlightLinks,   String(s.highlightLinks))
  localStorage.setItem(LS.readableFont,     String(s.readableFont))
  localStorage.setItem(LS.dyslexiaFont,     String(s.dyslexiaFont))
  localStorage.setItem(LS.stopAnimations,   String(s.stopAnimations))
  localStorage.setItem(LS.lineHeightBoost,  String(s.lineHeightBoost))
  localStorage.setItem(LS.letterSpacing,    String(s.letterSpacing))
  localStorage.setItem(LS.readingMask,      String(s.readingMask))
  localStorage.setItem(LS.bigCursor,        String(s.bigCursor))
  localStorage.setItem(LS.focusHighlight,   String(s.focusHighlight))
  localStorage.setItem(LS.colorBlindMode,   s.colorBlindMode)
}

function ls(key: keyof typeof LS): string {
  return localStorage.getItem(LS[key]) ?? ''
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAccessibilityStore = create<A11yState>((set) => ({
  textSize:        parseFloat(ls('textSize') || '1'),
  highContrast:    ls('highContrast')    === 'true',
  monochrome:      ls('monochrome')      === 'true',
  invertColors:    ls('invertColors')    === 'true',
  highlightLinks:  ls('highlightLinks')  === 'true',
  readableFont:    ls('readableFont')    === 'true',
  dyslexiaFont:    ls('dyslexiaFont')    === 'true',
  stopAnimations:  ls('stopAnimations')  === 'true',
  lineHeightBoost: ls('lineHeightBoost') === 'true',
  letterSpacing:   ls('letterSpacing')   === 'true',
  readingMask:     ls('readingMask')     === 'true',
  bigCursor:       ls('bigCursor')       === 'true',
  focusHighlight:  ls('focusHighlight')  === 'true',
  colorBlindMode:  (ls('colorBlindMode') as ColorBlindMode) || 'none',

  setTextSize: (v) => set({ textSize: Math.round(Math.min(1.5, Math.max(1, v)) * 100) / 100 }),
  toggle: (key) => set(s => ({ [key]: !s[key] })),
  setColorBlindMode: (mode) => set({ colorBlindMode: mode }),

  reset: () => set({
    textSize: 1, highContrast: false, monochrome: false, invertColors: false,
    highlightLinks: false, readableFont: false, dyslexiaFont: false,
    stopAnimations: false, lineHeightBoost: false, letterSpacing: false,
    readingMask: false, bigCursor: false, focusHighlight: false,
    colorBlindMode: 'none',
  }),
}))

// ─── Boot: apply persisted state immediately, then subscribe to future changes ─

applyToDom(useAccessibilityStore.getState())

useAccessibilityStore.subscribe((state) => {
  applyToDom(state)
  persistState(state)
})
