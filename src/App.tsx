import { useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/useAuthStore'
import AuthPage from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import ProposalBuilder from './pages/ProposalBuilder'
import DealRoom from './pages/DealRoom'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import Legal from './pages/Legal'

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
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/proposals/new" element={<ProtectedRoute><ProposalBuilder /></ProtectedRoute>} />
        <Route path="/proposals/:id" element={<ProtectedRoute><ProposalBuilder /></ProtectedRoute>} />

        {/* Public deal room — no auth required */}
        <Route path="/deal/:token" element={<DealRoom />} />

        {/* Legal — always public */}
        <Route path="/terms" element={<Legal />} />
        <Route path="/privacy" element={<Legal />} />

        {/* Landing — always public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
