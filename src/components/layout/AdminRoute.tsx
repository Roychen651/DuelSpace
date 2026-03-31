import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

const ADMIN_EMAIL = 'roychen651@gmail.com'

function Spinner() {
  return (
    <div style={{ background: '#030305', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', animation: 'spin 0.9s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuthStore()

  if (status === 'idle' || status === 'loading') return <Spinner />
  if (status === 'unauthenticated') return <Navigate to="/auth" replace />
  if (user?.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
