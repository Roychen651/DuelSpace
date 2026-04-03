import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Extend window for analytics globals injected via script tags
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void }
  }
}

export function AnalyticsProvider() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname

    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: path })
    }

    if (window.fbq) {
      window.fbq('track', 'PageView')
    }

    if (window.posthog) {
      window.posthog.capture('$pageview')
    }
  }, [location.pathname])

  return null
}
