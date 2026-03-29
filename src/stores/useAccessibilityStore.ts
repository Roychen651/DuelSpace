import { create } from 'zustand'

// ─── Persistence keys ─────────────────────────────────────────────────────────

const LS = {
  textSize:       'ds:a11y:textSize',
  highContrast:   'ds:a11y:highContrast',
  monochrome:     'ds:a11y:monochrome',
  highlightLinks: 'ds:a11y:highlightLinks',
  readableFont:   'ds:a11y:readableFont',
  stopAnimations: 'ds:a11y:stopAnimations',
} as const

// ─── State shape ──────────────────────────────────────────────────────────────

type BoolKey = 'highContrast' | 'monochrome' | 'highlightLinks' | 'readableFont' | 'stopAnimations'

interface A11yState {
  textSize:       number   // 1.0 – 1.5 (multiplier applied to root font-size)
  highContrast:   boolean
  monochrome:     boolean
  highlightLinks: boolean
  readableFont:   boolean
  stopAnimations: boolean

  setTextSize: (v: number) => void
  toggle:      (key: BoolKey) => void
  reset:       () => void
}

// ─── DOM mutator ──────────────────────────────────────────────────────────────

function applyToDom(s: Pick<A11yState, 'textSize' | BoolKey>) {
  const root = document.documentElement
  root.style.setProperty('--a11y-scale', String(s.textSize))
  root.classList.toggle('a11y-high-contrast',   s.highContrast)
  root.classList.toggle('a11y-monochrome',       s.monochrome)
  root.classList.toggle('a11y-highlight-links',  s.highlightLinks)
  root.classList.toggle('a11y-readable-font',    s.readableFont)
  root.classList.toggle('a11y-stop-animations',  s.stopAnimations)
}

function persistState(s: Pick<A11yState, 'textSize' | BoolKey>) {
  localStorage.setItem(LS.textSize,       String(s.textSize))
  localStorage.setItem(LS.highContrast,   String(s.highContrast))
  localStorage.setItem(LS.monochrome,     String(s.monochrome))
  localStorage.setItem(LS.highlightLinks, String(s.highlightLinks))
  localStorage.setItem(LS.readableFont,   String(s.readableFont))
  localStorage.setItem(LS.stopAnimations, String(s.stopAnimations))
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAccessibilityStore = create<A11yState>((set) => ({
  textSize:       parseFloat(localStorage.getItem(LS.textSize) ?? '1'),
  highContrast:   localStorage.getItem(LS.highContrast)   === 'true',
  monochrome:     localStorage.getItem(LS.monochrome)     === 'true',
  highlightLinks: localStorage.getItem(LS.highlightLinks) === 'true',
  readableFont:   localStorage.getItem(LS.readableFont)   === 'true',
  stopAnimations: localStorage.getItem(LS.stopAnimations) === 'true',

  setTextSize: (v) => set({ textSize: Math.round(Math.min(1.5, Math.max(1, v)) * 100) / 100 }),
  toggle:      (key) => set(s => ({ [key]: !s[key] })),
  reset: () => set({
    textSize: 1, highContrast: false, monochrome: false,
    highlightLinks: false, readableFont: false, stopAnimations: false,
  }),
}))

// ─── DOM sync (runs outside React, fires on every state change) ───────────────

// Apply initial state immediately before first render
applyToDom(useAccessibilityStore.getState())

// Subscribe to future changes
useAccessibilityStore.subscribe((state) => {
  applyToDom(state)
  persistState(state)
})
