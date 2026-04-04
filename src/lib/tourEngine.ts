// ─── Tour Engine — driver.js with DealSpace dual theme ───────────────────────
// Imperative tour starter. Call startDashboardTour(locale) to launch.
// CSS is loaded via index.css @import driver.js/dist/driver.css.

import { driver } from 'driver.js'

const TOUR_STYLE_ID = 'ds-driver-tour-theme'

function injectTourStyles() {
  if (document.getElementById(TOUR_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = TOUR_STYLE_ID
  style.textContent = `
    /* ── DealSpace driver.js — dual-theme (light default, dark via .dark) ── */

    /* Overlay — same opacity in both modes */
    .driver-overlay {
      background: rgba(0, 0, 0, 0.52) !important;
    }

    /* ── Popover shell — LIGHT ── */
    .driver-popover {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 18px !important;
      box-shadow: 0 24px 64px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.07) !important;
      font-family: 'Plus Jakarta Sans', 'Rubik', system-ui, sans-serif !important;
      padding: 22px 24px 18px !important;
      min-width: 300px !important;
      max-width: 360px !important;
      backdrop-filter: blur(32px) !important;
    }

    .driver-popover-title {
      font-size: 15px !important;
      font-weight: 800 !important;
      color: #0f172a !important;
      margin-bottom: 8px !important;
      letter-spacing: -0.01em !important;
      padding-right: 28px !important;
    }

    .driver-popover-description {
      font-size: 13px !important;
      color: #64748b !important;
      line-height: 1.65 !important;
      margin-bottom: 0 !important;
    }

    .driver-popover-footer {
      margin-top: 18px !important;
      padding-top: 14px !important;
      border-top: 1px solid #e2e8f0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
    }

    .driver-popover-progress-text {
      font-size: 11px !important;
      color: #94a3b8 !important;
      font-weight: 600 !important;
    }

    .driver-popover-navigation-btns {
      display: flex !important;
      gap: 6px !important;
    }

    .driver-popover-prev-btn,
    .driver-popover-next-btn {
      border-radius: 10px !important;
      font-family: inherit !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      padding: 7px 14px !important;
      cursor: pointer !important;
      transition: all 0.15s !important;
      text-shadow: none !important;
    }

    .driver-popover-prev-btn {
      background: #f1f5f9 !important;
      border: 1px solid #e2e8f0 !important;
      color: #475569 !important;
    }

    .driver-popover-prev-btn:hover {
      background: #e2e8f0 !important;
      color: #0f172a !important;
      border-color: #cbd5e1 !important;
    }

    /* Next / Done — indigo accent (same in both modes) */
    .driver-popover-next-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      border: 1px solid rgba(99,102,241,0.5) !important;
      color: #ffffff !important;
      box-shadow: 0 0 16px rgba(99,102,241,0.35) !important;
    }

    .driver-popover-next-btn:hover {
      background: linear-gradient(135deg, #7578f3, #9d72fa) !important;
      box-shadow: 0 0 24px rgba(99,102,241,0.55) !important;
    }

    /* Close × button */
    .driver-popover-close-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: absolute !important;
      top: 12px !important;
      right: 14px !important;
      left: auto !important;
      inset-inline-end: auto !important;
      inset-inline-start: auto !important;
      width: 22px !important;
      height: 22px !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      outline: none !important;
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 5px !important;
      font-size: 15px !important;
      font-weight: 400 !important;
      line-height: 1 !important;
      color: #94a3b8 !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      text-shadow: none !important;
      opacity: 1 !important;
      visibility: visible !important;
      transition: color 0.15s ease, background 0.15s ease !important;
    }

    .driver-popover-close-btn:hover {
      color: #475569 !important;
      background: #f1f5f9 !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Highlight ring — same in both modes */
    .driver-active-element,
    .driver-active .driver-active-element {
      outline: 2px solid rgba(99,102,241,0.7) !important;
      outline-offset: 3px !important;
      border-radius: 12px !important;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.15) !important;
    }

    /* Arrow — light */
    .driver-popover-arrow {
      border-color: #ffffff !important;
    }

    /* ── Popover shell — DARK ── */
    .dark .driver-popover {
      background: linear-gradient(160deg, rgba(18,18,30,0.98) 0%, rgba(10,10,18,0.99) 100%) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      box-shadow:
        0 24px 80px rgba(0,0,0,0.75),
        0 0 0 1px rgba(99,102,241,0.15),
        inset 0 1px 0 rgba(255,255,255,0.06) !important;
    }

    .dark .driver-popover-title {
      color: #ffffff !important;
    }

    .dark .driver-popover-description {
      color: rgba(255,255,255,0.55) !important;
    }

    .dark .driver-popover-footer {
      border-top: 1px solid rgba(255,255,255,0.07) !important;
    }

    .dark .driver-popover-progress-text {
      color: rgba(255,255,255,0.25) !important;
    }

    .dark .driver-popover-prev-btn {
      background: rgba(255,255,255,0.06) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      color: rgba(255,255,255,0.6) !important;
    }

    .dark .driver-popover-prev-btn:hover {
      background: rgba(255,255,255,0.1) !important;
      color: rgba(255,255,255,0.85) !important;
      border-color: rgba(255,255,255,0.18) !important;
    }

    .dark .driver-popover-close-btn {
      color: rgba(255,255,255,0.35) !important;
    }

    .dark .driver-popover-close-btn:hover {
      color: rgba(255,255,255,0.85) !important;
      background: rgba(255,255,255,0.1) !important;
    }

    .dark .driver-popover-arrow {
      border-color: rgba(18,18,30,0.98) !important;
    }
  `
  document.head.appendChild(style)
}

export function startDashboardTour(locale: 'he' | 'en'): void {
  injectTourStyles()
  const isHe = locale === 'he'

  type StepConfig = {
    element: string
    popover: { title: string; description: string; side: 'bottom' | 'left' | 'right' | 'top'; align: 'start' | 'center' | 'end' }
  }

  const allSteps: StepConfig[] = [
    {
      element: '[data-tour="new-proposal"]',
      popover: {
        title: isHe ? '🚀 יצירת הצעת מחיר' : '🚀 Create a Proposal',
        description: isHe
          ? 'לחץ כאן לפתיחת בונה ההצעות. הגדר שם פרויקט, מחיר בסיס, תוספות אופציונליות, חוזה ואבני דרך לתשלום. לאחר השמירה — קבל קישור ייחודי לשיתוף ישיר עם הלקוח ב-WhatsApp, מייל, או SMS.'
          : 'Open the Proposal Builder. Set a project name, base price, optional add-ons, contract, and payment milestones. After saving — get a unique shareable link to send directly to your client via WhatsApp, email, or SMS.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="kpi-grid"]',
      popover: {
        title: isHe ? '📊 מדדי ביצועים חיים' : '📊 Live Performance Metrics',
        description: isHe
          ? 'שלושה KPI קריטיים: פייפליין פעיל — שווי כל ההצעות שנשלחו ובתהליך. עסקאות שנסגרו — הכנסה בפועל מהצעות חתומות. אחוז הצלחה — מחושב רק מעסקאות שנסגרו (זכו + הפסידו), לא מכלל ההצעות. מתעדכן בזמן אמת.'
          : 'Three critical KPIs: Active Pipeline — value of all in-progress deals. Closed Won — actual revenue from signed proposals. Win Rate — calculated only from resolved deals (won + lost), not all proposals. Updates in real time with every signature.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="pipeline-tabs"]',
      popover: {
        title: isHe ? '🗂️ ניהול פייפליין' : '🗂️ Pipeline Management',
        description: isHe
          ? 'סנן הצעות לפי שלב: הכל, טיוטות, ממתין לחתימה, זכו, ואבד/ארכיון. הספירה ליד כל טאב מתעדכנת אוטומטית. לחץ "ממתין" לראות רק הצעות ששלחת — אלה הן העסקאות שצריכות מעקב.'
          : 'Filter proposals by stage: All, Drafts, Pending signature, Won, and Lost/Archive. Counts auto-update. Click "Pending" to see only proposals you sent — those are the deals that need follow-up.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="crm-toolbar"]',
      popover: {
        title: isHe ? '🔍 חיפוש, סינון וייצוא' : '🔍 Search, Filter & Export',
        description: isHe
          ? 'חפש לפי שם לקוח, פרויקט, או מייל. מיין לפי חדש, ישן, או ערך גבוה. עבור בין תצוגת רשת, רשימה, וקנבן — כל אחת מראה את אותם נתונים בפורמט אחר. ייצוא CSV לאקסל בלחיצה.'
          : 'Search by client name, project, or email. Sort by newest, oldest, or highest value. Toggle between Grid, List, and Kanban views. One-click CSV export to Excel — all your deal data in a spreadsheet.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="proposals-list"]',
      popover: {
        title: isHe ? '📋 כרטיסי ההצעות שלך' : '📋 Your Proposal Cards',
        description: isHe
          ? 'כל כרטיס מציג: סטטוס בזמן אמת, מחיר סופי, מספר צפיות, זמן שהייה, ותג "נפתח" אם הלקוח פתח את המייל. לחץ על הכרטיס לעריכה. תפריט הנקודות (⋯) פותח: שכפול, שיתוף קישור, הורדת PDF, וארכיון.'
          : 'Each card shows: real-time status, final price, view count, time spent, and an "Opened" badge if the client opened the email. Click the card to edit. The dots menu (⋯) unlocks: duplicate, share link, download PDF, and archive.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '[data-tour="help-btn"]',
      popover: {
        title: isHe ? '❓ DealSpace Academy' : '❓ DealSpace Academy',
        description: isHe
          ? 'גישה מיידית ל-30+ מדריכים ותשובות בעברית ואנגלית. מסודרים לפי קטגוריות: יצירת הצעות, שליחה ומעקב, שירותים וחוזים, חיוב, ואוטומציות. כולל סיור מודרך נוסף בכפתור "הפעל סיור מחדש".'
          : 'Instant access to 30+ guides and answers in Hebrew and English. Organized by category: creating proposals, sending & tracking, services & contracts, billing, and automations. Includes a "Restart Tour" button for future reference.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="profile-avatar"]',
      popover: {
        title: isHe ? '🎨 זהות המותג שלך' : '🎨 Your Brand Identity',
        description: isHe
          ? 'לחץ לפתיחת תפריט הפרופיל. בהגדרות: העלה לוגו חברה, בחר צבע מותג, הזן שם מורשה חתימה ופרטים עסקיים. כל הפרטים מוזרקים אוטומטית לכל הצעה חדשה — בחדר הדיל, בתעודת החתימה, ובקובץ PDF.'
          : 'Click to open the profile menu. In Settings: upload your company logo, choose a brand color, enter your authorized signatory name and business details. All details auto-inject into every new proposal — in the Deal Room, signature certificate, and PDF.',
        side: 'bottom',
        align: 'end',
      },
    },
  ]

  // Only run steps for elements currently in the DOM
  const steps = allSteps.filter(s => Boolean(document.querySelector(s.element)))

  if (steps.length === 0) return

  const d = driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayOpacity: 0.58,
    stagePadding: 8,
    stageRadius: 14,
    showProgress: true,
    progressText: isHe ? '{{current}} מתוך {{total}}' : '{{current}} of {{total}}',
    nextBtnText: isHe ? 'הבא ←' : 'Next →',
    prevBtnText: isHe ? '→ הקודם' : '← Back',
    doneBtnText: isHe ? '✓ סיום' : '✓ Done',
    steps,
  })

  d.drive()
}
