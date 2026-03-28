import { useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/useAuthStore'
import AuthPage from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'

// ─── Error Boundary ───────────────────────────────────────────────────────────

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#040608', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <pre style={{ color: '#f87171', fontFamily: 'monospace', fontSize: 13, maxWidth: 600, whiteSpace: 'pre-wrap' }}>
            ⚠ Render error:{'\n'}{this.state.error}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Route Guards ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ background: '#040608', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', animation: 'spin 0.9s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuthStore()
  if (status === 'idle' || status === 'loading') return <Spinner />
  if (status === 'unauthenticated') return <Navigate to="/auth" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { status } = useAuthStore()
  if (status === 'idle' || status === 'loading') return <Spinner />
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// ─── Sprint 3 placeholder ─────────────────────────────────────────────────────

function ProposalBuilderPlaceholder() {
  return (
    <div style={{ background: '#040608', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 48 }}>🚧</div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: 'system-ui' }}>Proposal Builder — Sprint 3</p>
      <a href="/dashboard" style={{ color: '#818cf8', fontSize: 13 }}>← Back to Dashboard</a>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function AppInner() {
  const { initialize } = useAuthStore()
  useEffect(() => { initialize() }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/proposals/new" element={<ProtectedRoute><ProposalBuilderPlaceholder /></ProtectedRoute>} />
        <Route path="/proposals/:id" element={<ProtectedRoute><ProposalBuilderPlaceholder /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}
