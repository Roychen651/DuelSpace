import { create } from 'zustand'

// ─── usePresenceStore ─────────────────────────────────────────────────────────
// Global in-memory store tracking which proposals a client is actively viewing
// right now. Keyed by public_token so any component can read without subscribing
// to its own Supabase channel.
//
// Populated by the single `user-activity:{userId}` channel in ProtectedLayout —
// ONE WebSocket subscription for ALL proposals, not one per card.

interface PresenceState {
  /** public_token → last heartbeat timestamp (ms) */
  activeViewers: Record<string, number>
  markActive: (token: string) => void
  markInactive: (token: string) => void
}

export const usePresenceStore = create<PresenceState>((set) => ({
  activeViewers: {},

  markActive: (token) =>
    set((state) => ({
      activeViewers: { ...state.activeViewers, [token]: Date.now() },
    })),

  markInactive: (token) =>
    set((state) => {
      const next = { ...state.activeViewers }
      delete next[token]
      return { activeViewers: next }
    }),
}))
