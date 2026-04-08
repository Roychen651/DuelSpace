import * as ToastPrimitive from '@radix-ui/react-toast'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore, type ToastType } from '../../hooks/useToast'

const ICON: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  default: Info,
}

const ICON_COLOR: Record<ToastType, string> = {
  success: '#22c55e',
  error: '#f87171',
  default: '#818cf8',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
      {toasts.map((t) => {
        const Icon = ICON[t.type]
        return (
          <ToastPrimitive.Root
            key={t.id}
            className="toast-root"
            onOpenChange={(open) => { if (!open) dismiss(t.id) }}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '14px 16px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(24px)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              minWidth: 280,
              maxWidth: 380,
            }}
          >
            <Icon size={18} style={{ color: ICON_COLOR[t.type], flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <ToastPrimitive.Title
                style={{ color: 'var(--text-main)', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}
              >
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description
                  style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5, marginTop: 2 }}
                >
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close aria-label="Close" style={{ flexShrink: 0, cursor: 'pointer', background: 'none', border: 'none', padding: 2 }}>
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}

      <ToastPrimitive.Viewport
        className="toast-viewport"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 9999,
          listStyle: 'none',
          margin: 0,
          padding: 0,
          outline: 'none',
          maxWidth: 400,
        }}
      />

      <style>{`
        .toast-root[data-state="open"] {
          animation: toast-slide-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toast-root[data-state="closed"] {
          animation: toast-slide-out 0.18s ease-in forwards;
        }
        .toast-root[data-swipe="move"] {
          transform: translateX(var(--radix-toast-swipe-move-x));
        }
        .toast-root[data-swipe="cancel"] {
          transform: translateX(0);
          transition: transform 0.2s ease-out;
        }
        .toast-root[data-swipe="end"] {
          animation: toast-swipe-out 0.15s ease-out forwards;
        }
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toast-slide-out {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(100%); }
        }
        @keyframes toast-swipe-out {
          from { transform: translateX(var(--radix-toast-swipe-end-x)); }
          to   { transform: translateX(calc(100% + 24px)); }
        }
      `}</style>
    </ToastPrimitive.Provider>
  )
}
