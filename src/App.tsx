import { useEffect } from 'react'
import { useAuthStore } from './stores/useAuthStore'
import AuthPage from './pages/Auth'

function App() {
  const { initialize, status } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Restoring session from localStorage
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#040608]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-400" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <AuthPage />
  }

  // Authenticated — Dashboard arrives in Sprint 2
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#040608] text-white">
      <p className="text-sm text-white/40">✓ Authenticated — Dashboard coming in Sprint 2</p>
    </div>
  )
}

export default App
