import { useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from './stores/useAuthStore'
import { useProposalStore } from './stores/useProposalStore'
import { AccessibilityWidget } from './components/ui/AccessibilityWidget'
import { ProtectedLayout } from './components/layout/ProtectedLayout'
import AuthPage from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import ProposalBuilder from './pages/ProposalBuilder'
import DealRoom from './pages/DealRoom'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import Legal from './pages/Legal'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AccessibilityStatement from './pages/AccessibilityStatement'
import ContractLibrary from './pages/ContractLibrary'
import ServicesLibrary from './pages/ServicesLibrary'

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

// ─── Animated Routes ──────────────────────────────────────────────────────────

function AnimatedRoutes() {
  const location = useLocation()
  const { status: _status } = useAuthStore()

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' as const }}
          style={{ minHeight: '100dvh' }}
        >
          <Routes location={location}>
            {/* Public */}
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Protected — with shared Navbar via ProtectedLayout */}
            <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><Dashboard /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProtectedLayout><Profile /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute><ProtectedLayout><ContractLibrary /></ProtectedLayout></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><ProtectedLayout><ServicesLibrary /></ProtectedLayout></ProtectedRoute>} />

            {/* Protected — ProposalBuilder has its own header, no shared layout */}
            <Route path="/proposals/new" element={<ProtectedRoute><ProposalBuilder /></ProtectedRoute>} />
            <Route path="/proposals/:id" element={<ProtectedRoute><ProposalBuilder /></ProtectedRoute>} />

            {/* Public deal room — no auth required */}
            <Route path="/deal/:token" element={<DealRoom />} />

            {/* Legal — always public */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/security" element={<Legal />} />
            <Route path="/accessibility" element={<AccessibilityStatement />} />

            {/* Landing — always public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* Accessibility Widget — global, always visible on all pages */}
      <AccessibilityWidget />
    </>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function AppInner() {
  const { initialize, user, status } = useAuthStore()
  const { subscribeRealtime, unsubscribeRealtime } = useProposalStore()
  useEffect(() => { initialize() }, [initialize])

  // Start/stop Supabase Realtime for proposals when auth state changes.
  // This keeps the Zustand store in sync on any page (not just Dashboard).
  useEffect(() => {
    if (status === 'authenticated' && user?.id) {
      subscribeRealtime(user.id)
    } else if (status === 'unauthenticated') {
      unsubscribeRealtime()
    }
  }, [status, user?.id, subscribeRealtime, unsubscribeRealtime])

  return (
    <BrowserRouter>
      <AnimatedRoutes />
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
