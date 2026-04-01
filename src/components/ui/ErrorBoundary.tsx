import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const error = this.state.error

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: '#030305' }}
      >
        <div
          className="w-full max-w-md rounded-3xl p-8 space-y-6 text-center"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.08) 100%)',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: '0 0 32px rgba(239,68,68,0.12), inset 0 1px 0 rgba(239,68,68,0.1)',
              }}
            >
              <AlertTriangle size={28} style={{ color: '#f87171' }} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-white/40 leading-relaxed">
              משהו השתבש
            </p>
          </div>

          {/* Reload button */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            Reload Application / רענן אפליקציה
          </button>

          {/* Dev debug details */}
          {error && (
            <details className="text-start">
              <summary className="cursor-pointer text-xs text-white/25 hover:text-white/50 transition-colors select-none">
                Error details
              </summary>
              <pre
                className="mt-3 rounded-xl p-3 text-[11px] leading-relaxed overflow-auto max-h-40"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(248,113,113,0.8)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(99,102,241,0.3) transparent',
                }}
              >
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
