// ─── Tour Engine — driver.js with DealSpace dark theme ───────────────────────
// Imperative tour starter. Call startDashboardTour(locale) to launch.
// CSS is loaded via index.css @import driver.js/dist/driver.css.

import { driver } from 'driver.js'

const DARK_OVERRIDE_ID = 'ds-driver-dark-override'

function injectDarkStyles() {
  if (document.getElementById(DARK_OVERRIDE_ID)) return
  const style = document.createElement('style')
  style.id = DARK_OVERRIDE_ID
  style.textContent = `
    /* ── DealSpace driver.js dark theme ─────────────────────────────────── */

    /* Overlay */
    .driver-overlay {
      background: rgba(0, 0, 0, 0.82) !important;
    }

    /* Popover shell */
    .driver-popover {
      background: linear-gradient(160deg, rgba(18,18,30,0.98) 0%, rgba(10,10,18,0.99) 100%) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      border-radius: 18px !important;
      box-shadow:
        0 24px 80px rgba(0,0,0,0.75),
        0 0 0 1px rgba(99,102,241,0.15),
        inset 0 1px 0 rgba(255,255,255,0.06) !important;
      font-family: 'Plus Jakarta Sans', 'Rubik', system-ui, sans-serif !important;
      padding: 22px 24px 18px !important;
      min-width: 280px !important;
      max-width: 340px !important;
      backdrop-filter: blur(32px) !important;
    }

    /* Title */
    .driver-popover-title {
      font-size: 15px !important;
      font-weight: 800 !important;
      color: #ffffff !important;
      margin-bottom: 8px !important;
      letter-spacing: -0.01em !important;
    }

    /* Description */
    .driver-popover-description {
      font-size: 13px !important;
      color: rgba(255,255,255,0.55) !important;
      line-height: 1.65 !important;
      margin-bottom: 0 !important;
    }

    /* Footer */
    .driver-popover-footer {
      margin-top: 18px !important;
      padding-top: 14px !important;
      border-top: 1px solid rgba(255,255,255,0.07) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
    }

    /* Progress text */
    .driver-popover-progress-text {
      font-size: 11px !important;
      color: rgba(255,255,255,0.25) !important;
      font-weight: 600 !important;
    }

    /* Navigation buttons */
    .driver-popover-navigation-btns {
      display: flex !important;
      gap: 6px !important;
    }

    /* All buttons */
    .driver-popover-prev-btn,
    .driver-popover-next-btn,
    .driver-popover-close-btn {
      background: rgba(255,255,255,0.06) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      border-radius: 10px !important;
      color: rgba(255,255,255,0.6) !important;
      font-family: inherit !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      padding: 7px 14px !important;
      cursor: pointer !important;
      transition: all 0.15s !important;
      text-shadow: none !important;
    }

    .driver-popover-prev-btn:hover,
    .driver-popover-close-btn:hover {
      background: rgba(255,255,255,0.1) !important;
      color: rgba(255,255,255,0.85) !important;
      border-color: rgba(255,255,255,0.18) !important;
    }

    /* Next / Done button — indigo accent */
    .driver-popover-next-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      border-color: rgba(99,102,241,0.5) !important;
      color: #ffffff !important;
      box-shadow: 0 0 16px rgba(99,102,241,0.35) !important;
    }

    .driver-popover-next-btn:hover {
      background: linear-gradient(135deg, #7578f3, #9d72fa) !important;
      box-shadow: 0 0 24px rgba(99,102,241,0.55) !important;
    }

    /* Close × button */
    .driver-popover-close-btn {
      position: absolute !important;
      top: 14px !important;
      inset-inline-end: 14px !important;
      padding: 4px 8px !important;
      opacity: 0.45 !important;
      border: none !important;
      background: transparent !important;
      font-size: 16px !important;
    }

    .driver-popover-close-btn:hover {
      opacity: 1 !important;
      background: rgba(255,255,255,0.08) !important;
    }

    /* Highlight ring */
    .driver-active-element,
    .driver-active .driver-active-element {
      outline: 2px solid rgba(99,102,241,0.7) !important;
      outline-offset: 3px !important;
      border-radius: 12px !important;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.15) !important;
    }

    /* Arrow */
    .driver-popover-arrow {
      border-color: rgba(18,18,30,0.98) !important;
    }
  `
  document.head.appendChild(style)
}

export function startDashboardTour(locale: 'he' | 'en'): void {
  injectDarkStyles()
  const isHe = locale === 'he'

  type StepConfig = {
    element: string
    popover: { title: string; description: string; side: 'bottom' | 'left' | 'right' | 'top'; align: 'start' | 'center' | 'end' }
  }

  const allSteps: StepConfig[] = [
    {
      element: '[data-tour="new-proposal"]',
      popover: {
        title: isHe ? '🚀 צור את ההצעה הראשונה שלך' : '🚀 Create Your First Proposal',
        description: isHe
          ? 'לחץ כאן לפתיחת בונה ההצעות. הגדר מחיר, הוסף שירותים, ושלח חדר דיל אינטראקטיבי ללקוח שלך — הוא יכול לחתום ישירות מהדפדפן.'
          : 'Click here to open the Proposal Builder. Set your price, add services, and send an interactive Deal Room to your client — they can sign directly from the browser.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="services-link"]',
      popover: {
        title: isHe ? '📋 ספריית שירותים' : '📋 Services Library',
        description: isHe
          ? 'שמור שירותים חוזרים עם מחירים קבועים. בהצעה הבאה — הכנס אותם בלחיצה אחת. חוסך זמן, מונע טעויות תמחור.'
          : 'Save reusable services with fixed prices. In your next proposal — insert them in one click. Saves time, prevents pricing mistakes.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="integrations-link"]',
      popover: {
        title: isHe ? '⚡ חבר את הכלים שלך' : '⚡ Connect Your Tools',
        description: isHe
          ? 'הגדר webhook URL אחד וכל חתימה תפעיל אוטומטית תרחיש ב-Make.com, Zapier, או CRM שלך. ללא קידוד.'
          : 'Set one webhook URL and every signature automatically triggers a Make.com scenario, Zapier flow, or your CRM. Zero coding.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="profile-avatar"]',
      popover: {
        title: isHe ? '🎨 זהות המותג שלך' : '🎨 Your Brand Identity',
        description: isHe
          ? 'הגדר צבע מותג, לוגו חברה, ופרטים עסקיים. כל ההצעות שלך יוצגו עם זהות המותג שלך — חדר הדיל ותעודת החתימה.'
          : 'Set your brand color, company logo, and business details. All your proposals display your brand identity — in the Deal Room and signature certificate.',
        side: 'bottom',
        align: 'end',
      },
    },
  ]

  // Only run steps for elements that exist in the DOM
  const steps = allSteps.filter(s => Boolean(document.querySelector(s.element)))

  if (steps.length === 0) return

  const d = driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayOpacity: 0.82,
    stagePadding: 6,
    stageRadius: 12,
    showProgress: true,
    progressText: isHe ? '{{current}} מתוך {{total}}' : '{{current}} of {{total}}',
    nextBtnText: isHe ? 'הבא ←' : 'Next →',
    prevBtnText: isHe ? '→ הקודם' : '← Back',
    doneBtnText: isHe ? '✓ סיום' : '✓ Done',
    steps,
  })

  d.drive()
}
