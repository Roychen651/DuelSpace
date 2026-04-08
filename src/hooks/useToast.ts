import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'default'

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  add: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, 4000)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

/** Convenience — call from anywhere without hooks */
export const toast = (t: Omit<Toast, 'id'>) => useToastStore.getState().add(t)
