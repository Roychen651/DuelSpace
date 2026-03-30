import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Service {
  id: string
  user_id: string
  label: string
  description: string | null
  price: number
  created_at: string
}

export type ServiceInsert = Pick<Service, 'label' | 'description' | 'price'>

// ─── State ────────────────────────────────────────────────────────────────────

interface ServicesState {
  services: Service[]
  loading: boolean
  error: string | null
  fetchServices: () => Promise<void>
  createService: (data: ServiceInsert) => Promise<Service | null>
  updateService: (id: string, data: Partial<ServiceInsert>) => Promise<void>
  deleteService: (id: string) => Promise<void>
  clearError: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useServicesStore = create<ServicesState>()(
  devtools(
    (set, get) => ({
      services: [],
      loading: false,
      error: null,

      // ── Fetch all services for the current user ────────────────────────────
      fetchServices: async () => {
        set({ loading: true, error: null })
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) { set({ loading: false }); return }

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })

        if (error) { set({ loading: false, error: error.message }); return }
        set({ services: (data ?? []) as Service[], loading: false })
      },

      // ── Create ────────────────────────────────────────────────────────────
      createService: async (insertData) => {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return null

        const optimisticId = crypto.randomUUID()
        const now = new Date().toISOString()
        const optimistic: Service = {
          label: insertData.label,
          description: insertData.description ?? null,
          price: insertData.price,
          id: optimisticId,
          user_id: userData.user.id,
          created_at: now,
        }
        set(s => ({ services: [optimistic, ...s.services] }))

        const { data, error } = await supabase
          .from('services')
          .insert({ ...insertData, user_id: userData.user.id })
          .select()
          .single()

        if (error || !data) {
          set(s => ({
            services: s.services.filter(x => x.id !== optimisticId),
            error: error?.message ?? 'Create failed',
          }))
          return null
        }

        set(s => ({ services: s.services.map(x => x.id === optimisticId ? (data as Service) : x) }))
        return data as Service
      },

      // ── Update ────────────────────────────────────────────────────────────
      updateService: async (id, updateData) => {
        const previous = get().services.find(s => s.id === id)
        if (!previous) return

        set(s => ({ services: s.services.map(x => x.id === id ? { ...x, ...updateData } : x) }))

        const { error } = await supabase.from('services').update(updateData).eq('id', id)
        if (error) {
          set(s => ({
            services: s.services.map(x => x.id === id ? previous : x),
            error: error.message,
          }))
        }
      },

      // ── Delete ────────────────────────────────────────────────────────────
      deleteService: async (id) => {
        const snapshot = get().services.find(s => s.id === id)
        if (!snapshot) return

        set(s => ({ services: s.services.filter(x => x.id !== id) }))

        const { error } = await supabase.from('services').delete().eq('id', id)
        if (error) {
          set(s => ({
            services: [snapshot, ...s.services].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ),
            error: error.message,
          }))
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'DealSpace:Services' }
  )
)
