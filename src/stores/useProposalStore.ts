import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Proposal, ProposalInsert, ProposalUpdate } from '../types/proposal'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Module-level channel reference — one subscription shared for the store lifetime.
// Kept outside the store so it persists across Zustand store resets.
let _realtimeChannel: RealtimeChannel | null = null

// ─── State shape ──────────────────────────────────────────────────────────────

interface ProposalState {
  proposals: Proposal[]
  loading: boolean
  error: string | null

  // Actions
  fetchProposals: () => Promise<void>
  createProposal: (data: ProposalInsert) => Promise<Proposal | null>
  updateProposal: (id: string, data: ProposalUpdate) => Promise<void>
  archiveProposal: (id: string) => Promise<{ ok: true } | { ok: false; message: string }>
  unarchiveProposal: (id: string) => Promise<void>
  deleteProposal: (id: string) => Promise<{ ok: true } | { ok: false; message: string }>
  duplicateProposal: (id: string) => Promise<Proposal | null>
  injectDemoProposal: () => Promise<void>
  subscribeRealtime: (userId: string) => void
  unsubscribeRealtime: () => void
  clearError: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProposalStore = create<ProposalState>()(
  devtools(
    (set, get) => ({
      proposals: [],
      loading: false,
      error: null,

      // ── Fetch all proposals for the current user ───────────────────────────
      fetchProposals: async () => {
        set({ loading: true, error: null })

        // Explicit user_id filter is required — the public_token_select RLS policy
        // allows reading any proposal with a public_token (needed for anon Deal Room
        // access), which means a bare SELECT * would return proposals from all users.
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          set({ loading: false })
          return
        }

        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })

        if (error) {
          set({ loading: false, error: error.message })
          return
        }

        // Normalize is_archived — if the column is missing from the DB response
        // (e.g. migration not yet applied), treat it as false rather than undefined,
        // which would cause !p.is_archived to be true and show all proposals as active.
        const normalized = (data ?? []).map(row => ({
          ...row,
          is_archived: (row as Record<string, unknown>).is_archived === true,
        })) as Proposal[]
        set({ proposals: normalized, loading: false })
      },

      // ── Create ────────────────────────────────────────────────────────────
      createProposal: async (insertData) => {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return null

        const optimisticId = crypto.randomUUID()
        const now = new Date().toISOString()

        const defaults = { currency: 'ILS', add_ons: [] as Proposal['add_ons'], status: 'draft' as const }
        const optimistic: Proposal = {
          ...defaults,
          ...insertData,
          id: optimisticId,
          user_id: userData.user.id,
          public_token: crypto.randomUUID(),
          view_count: 0,
          time_spent_seconds: 0,
          is_archived: false,
          created_at: now,
          updated_at: now,
        }

        // Optimistic insert at top of list
        set(s => ({ proposals: [optimistic, ...s.proposals] }))

        const { data, error } = await supabase
          .from('proposals')
          .insert({ ...insertData, user_id: userData.user.id })
          .select()
          .single()

        if (error || !data) {
          // Rollback
          set(s => ({ proposals: s.proposals.filter(p => p.id !== optimisticId), error: error?.message ?? 'Create failed' }))
          return null
        }

        // Replace optimistic with real record
        set(s => ({
          proposals: s.proposals.map(p => p.id === optimisticId ? (data as Proposal) : p),
        }))

        return data as Proposal
      },

      // ── Update ────────────────────────────────────────────────────────────
      updateProposal: async (id, updateData) => {
        const previous = get().proposals.find(p => p.id === id)
        if (!previous) return

        // Optimistic update
        set(s => ({
          proposals: s.proposals.map(p =>
            p.id === id ? { ...p, ...updateData, updated_at: new Date().toISOString() } : p
          ),
        }))

        const { error } = await supabase
          .from('proposals')
          .update(updateData)
          .eq('id', id)

        if (error) {
          // Rollback
          set(s => ({ proposals: s.proposals.map(p => p.id === id ? previous : p), error: error.message }))
        }
      },

      // ── Archive (soft delete) ─────────────────────────────────────────────
      // Signed contracts must never be destructively deleted from the database.
      // Archiving sets is_archived = true, hiding the proposal from active views
      // while preserving the full row forever.
      archiveProposal: async (id) => {
        const snapshot = get().proposals.find(p => p.id === id)
        if (!snapshot) return { ok: false, message: 'Proposal not found in local state' }

        // Optimistic update — mark archived locally
        set(s => ({
          proposals: s.proposals.map(p => p.id === id ? { ...p, is_archived: true } : p),
        }))

        const { error } = await supabase
          .from('proposals')
          .update({ is_archived: true })
          .eq('id', id)

        if (error) {
          // Log the full PostgREST error so we can diagnose column-missing / RLS issues
          console.error('[archiveProposal] Supabase UPDATE failed:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            proposalId: id,
          })
          // Rollback — restore original proposal in UI
          set(s => ({
            proposals: s.proposals.map(p => p.id === id ? snapshot : p),
            error: error.message,
          }))
          return { ok: false, message: error.message }
        }

        // Re-fetch authoritative DB state — guards against any race where
        // a Realtime fetchProposals() call happened before our UPDATE committed.
        get().fetchProposals()
        return { ok: true }
      },

      // ── Unarchive — restore proposal to active view ───────────────────────
      unarchiveProposal: async (id) => {
        const snapshot = get().proposals.find(p => p.id === id)
        if (!snapshot) return

        set(s => ({
          proposals: s.proposals.map(p => p.id === id ? { ...p, is_archived: false } : p),
        }))

        const { error } = await supabase
          .from('proposals')
          .update({ is_archived: false })
          .eq('id', id)

        if (error) {
          console.error('[unarchiveProposal] failed:', error.message)
          set(s => ({
            proposals: s.proposals.map(p => p.id === id ? snapshot : p),
            error: error.message,
          }))
        } else {
          get().fetchProposals()
        }
      },

      // ── Permanent delete (archived proposals) ────────────────────────────
      deleteProposal: async (id) => {
        const snapshot = get().proposals.find(p => p.id === id)
        if (!snapshot) return { ok: false, message: 'Proposal not found in local state' }

        // Optimistic remove
        set(s => ({ proposals: s.proposals.filter(p => p.id !== id) }))

        const { error } = await supabase.from('proposals').delete().eq('id', id)

        if (error) {
          console.error('[deleteProposal] Supabase DELETE failed:', {
            message: error.message, details: error.details, hint: error.hint,
            code: error.code, proposalId: id,
          })
          // Rollback — restore in original position
          set(s => ({
            proposals: [snapshot, ...s.proposals].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ),
            error: error.message,
          }))
          return { ok: false, message: error.message }
        }

        return { ok: true }
      },

      // ── Duplicate ─────────────────────────────────────────────────────────
      duplicateProposal: async (id) => {
        const source = get().proposals.find(p => p.id === id)
        if (!source) return null

        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return null

        const { id: _id, user_id: _uid, public_token: _pt, created_at: _ca,
          updated_at: _ua, view_count: _vc, time_spent_seconds: _ts, ...rest } = source

        const insertData: ProposalInsert = {
          ...rest,
          project_title: `${source.project_title} (Copy)`,
          status: 'draft',
          expires_at: null,
          last_viewed_at: null,
        }

        return get().createProposal(insertData)
      },

      // ── Inject demo proposal for new users ────────────────────────────────
      injectDemoProposal: async () => {
        const STORAGE_KEY = 'dealspace:demo-injected'
        if (localStorage.getItem(STORAGE_KEY)) return

        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const demoData: ProposalInsert = {
          client_name: 'Dana Cohen',
          client_email: 'dana@example.com',
          project_title: 'Brand Photography Package — Demo',
          description: 'Full-day brand photography session including editing, licensing, and delivery of 30 high-resolution images. This is a demo proposal — feel free to explore and edit it.',
          base_price: 4800,
          currency: 'ILS',
          status: 'sent',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_viewed_at: null,
          include_vat: false,
          add_ons: [
            {
              id: crypto.randomUUID(),
              label: 'Additional Editing Hours',
              description: '4 extra hours of post-processing and color grading',
              price: 800,
              enabled: true,
            },
            {
              id: crypto.randomUUID(),
              label: 'Aerial Drone Shots',
              description: '10 drone photos from licensed pilot',
              price: 1200,
              enabled: false,
            },
            {
              id: crypto.randomUUID(),
              label: 'Rush Delivery (48h)',
              description: 'Receive all edited images within 48 hours',
              price: 600,
              enabled: false,
            },
          ],
          payment_milestones: [
            { id: crypto.randomUUID(), name: 'Kickoff Payment', percentage: 50 },
            { id: crypto.randomUUID(), name: 'Final Delivery', percentage: 50 },
          ],
        }

        await get().createProposal(demoData)
        localStorage.setItem(STORAGE_KEY, '1')
      },

      // ── Supabase Realtime ─────────────────────────────────────────────────
      // Listens for INSERT/UPDATE/DELETE on proposals rows owned by the current
      // user. Keeps the store in sync when a client accepts in another tab/device
      // without requiring a manual page refresh.
      subscribeRealtime: (userId: string) => {
        if (_realtimeChannel) return // already subscribed

        _realtimeChannel = supabase
          .channel(`proposals:owner:${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'proposals',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const { eventType, new: newRow, old: oldRow } = payload
              if (eventType === 'UPDATE') {
                // Always re-fetch on UPDATE — the Realtime payload's `new` object may be
                // partial (only changed columns), so an optimistic in-place replace would
                // wipe the full proposal and desync the UI (root cause of the "other side
                // doesn't see accepted" bug). A full re-fetch guarantees complete, fresh data.
                get().fetchProposals()
              } else if (eventType === 'INSERT' && newRow) {
                set(s => {
                  const exists = s.proposals.some(p => p.id === (newRow as Proposal).id)
                  if (exists) return s
                  return { proposals: [newRow as Proposal, ...s.proposals] }
                })
              } else if (eventType === 'DELETE' && oldRow) {
                set(s => ({
                  proposals: s.proposals.filter(p => p.id !== (oldRow as { id: string }).id),
                }))
              }
            }
          )
          .subscribe()
      },

      unsubscribeRealtime: () => {
        if (_realtimeChannel) {
          supabase.removeChannel(_realtimeChannel)
          _realtimeChannel = null
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'DealSpace:Proposals' }
  )
)
