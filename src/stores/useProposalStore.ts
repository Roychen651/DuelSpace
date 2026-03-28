import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Proposal, ProposalInsert, ProposalUpdate } from '../types/proposal'

// ─── State shape ──────────────────────────────────────────────────────────────

interface ProposalState {
  proposals: Proposal[]
  loading: boolean
  error: string | null

  // Actions
  fetchProposals: () => Promise<void>
  createProposal: (data: ProposalInsert) => Promise<Proposal | null>
  updateProposal: (id: string, data: ProposalUpdate) => Promise<void>
  deleteProposal: (id: string) => Promise<void>
  duplicateProposal: (id: string) => Promise<Proposal | null>
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

        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          set({ loading: false, error: error.message })
          return
        }

        set({ proposals: (data ?? []) as Proposal[], loading: false })
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

      // ── Delete ────────────────────────────────────────────────────────────
      deleteProposal: async (id) => {
        const previous = get().proposals
        const snapshot = previous.find(p => p.id === id)
        if (!snapshot) return

        // Optimistic delete
        set(s => ({ proposals: s.proposals.filter(p => p.id !== id) }))

        const { error } = await supabase
          .from('proposals')
          .delete()
          .eq('id', id)

        if (error) {
          // Rollback
          set(s => ({
            proposals: [snapshot, ...s.proposals].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ),
            error: error.message,
          }))
        }
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

      clearError: () => set({ error: null }),
    }),
    { name: 'DealSpace:Proposals' }
  )
)
