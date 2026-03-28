import { useEffect, Component, type ReactNode } from 'react'
import { useAuthStore } from './stores/useAuthStore'
import AuthPage from './pages/Auth'

// Error boundary — catches any render-time JS crash and shows it on screen
class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: 14, maxWidth: 600, whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            ⚠ DealSpace render error:{'\n'}{this.state.error}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

function AppInner() {
  const { initialize, status } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (status === 'idle' || status === 'loading') {
    return (
      <div style={{ background: '#040608', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '2px solid rgba(99,102,241,0.2)',
          borderTopColor: '#818cf8',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <AuthPage />
  }

  return (
    <div style={{ background: '#040608', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>✓ Authenticated — Dashboard coming in Sprint 2</p>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}
