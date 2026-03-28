// ─── DealSpace i18n — Hebrew + English ───────────────────────────────────────
// High-register, marketing-sharp copy. Zero spelling errors.
// Hebrew is RTL — the dir attribute on <html> is controlled by useI18n().

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Locale = 'he' | 'en'
export type Dir = 'rtl' | 'ltr'

export interface I18nState {
  locale: Locale
  dir: Dir
  t: (key: string, vars?: Record<string, string | number>) => string
  setLocale: (locale: Locale) => void
}

// ─── Translations ─────────────────────────────────────────────────────────────

const translations: Record<Locale, Record<string, string>> = {
  // ── English ───────────────────────────────────────────────────────────────
  en: {
    // Brand
    'brand.name': 'DealSpace',
    'brand.tagline': 'Close deals that leave an impression.',
    'brand.description':
      'Interactive proposals that move at the speed of trust. Built for the creators who close.',

    // Auth — Page
    'auth.page.title': 'Your next deal starts here.',
    'auth.page.subtitle':
      'Sign in to DealSpace and unlock a smarter way to present, negotiate, and close.',

    // Auth — Tabs
    'auth.tab.signIn': 'Sign In',
    'auth.tab.signUp': 'Create Account',

    // Auth — Fields
    'auth.field.fullName': 'Full Name',
    'auth.field.fullName.placeholder': 'Your full name',
    'auth.field.email': 'Email Address',
    'auth.field.email.placeholder': 'you@yourdomain.com',
    'auth.field.password': 'Password',
    'auth.field.password.placeholder': 'Min. 8 characters',
    'auth.field.password.show': 'Show',
    'auth.field.password.hide': 'Hide',

    // Auth — Actions
    'auth.action.signIn': 'Sign In',
    'auth.action.signIn.loading': 'Signing in…',
    'auth.action.signUp': 'Create Account',
    'auth.action.signUp.loading': 'Creating account…',
    'auth.action.google': 'Continue with Google',
    'auth.action.google.loading': 'Redirecting…',
    'auth.action.magicLink': 'Send Magic Link',
    'auth.action.magicLink.loading': 'Sending link…',
    'auth.action.magicLink.sent': 'Check your inbox',
    'auth.action.forgotPassword': 'Forgot password?',
    'auth.action.resetPassword': 'Send Reset Link',
    'auth.action.resetPassword.loading': 'Sending…',
    'auth.action.resetPassword.sent': 'Reset link sent — check your email.',
    'auth.action.backToSignIn': '← Back to sign in',
    'auth.action.switchToMagicLink': 'Sign in with a magic link instead',
    'auth.action.switchToPassword': 'Sign in with password instead',

    // Auth — Dividers
    'auth.divider.or': 'or',

    // Auth — Social proof
    'auth.social.trusted': 'Trusted by 3,000+ creators across Israel & beyond',

    // Auth — Errors
    'auth.error.invalidCredentials': 'Incorrect email or password. Please try again.',
    'auth.error.emailNotConfirmed': 'Please verify your email before signing in.',
    'auth.error.userExists': 'An account with this email already exists.',
    'auth.error.passwordTooShort': 'Password must be at least 8 characters.',
    'auth.error.generic': 'Something went wrong. Please try again.',

    // Auth — Success
    'auth.success.signUp':
      'Account created! Check your email to confirm your address.',
    'auth.success.magicLink':
      'Magic link sent! Open your inbox and click the link to sign in instantly.',
    'auth.success.passwordReset': 'Password reset email sent. Check your inbox.',

    // Auth — Legal
    'auth.legal.agree': 'By continuing, you agree to our',
    'auth.legal.terms': 'Terms of Service',
    'auth.legal.and': 'and',
    'auth.legal.privacy': 'Privacy Policy',

    // Footer — Israeli compliance (immutable)
    'footer.legal':
      'The system is used solely as a proposal generation tool and does not constitute legal or financial advice.',
    'footer.rights': '© 2026 DealSpace. All rights reserved.',

    // Accessibility widget
    'a11y.open': 'Accessibility options',
    'a11y.textSize': 'Text size',
    'a11y.contrast': 'High contrast',
    'a11y.close': 'Close accessibility panel',
  },

  // ── Hebrew ────────────────────────────────────────────────────────────────
  he: {
    // Brand
    'brand.name': 'DealSpace',
    'brand.tagline': 'סגור עסקאות שמשאירות רושם.',
    'brand.description':
      'הצעות מחיר אינטראקטיביות שנעות במהירות של אמון. נבנה עבור יוצרים שסוגרים.',

    // Auth — Page
    'auth.page.title': 'העסקה הבאה שלך מתחילה כאן.',
    'auth.page.subtitle':
      'התחבר ל-DealSpace ופתח דרך חכמה יותר להציג, לנהל משא ומתן ולסגור.',

    // Auth — Tabs
    'auth.tab.signIn': 'כניסה',
    'auth.tab.signUp': 'יצירת חשבון',

    // Auth — Fields
    'auth.field.fullName': 'שם מלא',
    'auth.field.fullName.placeholder': 'השם המלא שלך',
    'auth.field.email': 'כתובת אימייל',
    'auth.field.email.placeholder': 'you@yourdomain.com',
    'auth.field.password': 'סיסמה',
    'auth.field.password.placeholder': 'לפחות 8 תווים',
    'auth.field.password.show': 'הצג',
    'auth.field.password.hide': 'הסתר',

    // Auth — Actions
    'auth.action.signIn': 'כניסה',
    'auth.action.signIn.loading': 'מתחבר…',
    'auth.action.signUp': 'יצירת חשבון',
    'auth.action.signUp.loading': 'יוצר חשבון…',
    'auth.action.google': 'המשך עם Google',
    'auth.action.google.loading': 'מעביר…',
    'auth.action.magicLink': 'שלח קישור קסם',
    'auth.action.magicLink.loading': 'שולח קישור…',
    'auth.action.magicLink.sent': 'בדוק את תיבת הדואר שלך',
    'auth.action.forgotPassword': 'שכחת סיסמה?',
    'auth.action.resetPassword': 'שלח קישור לאיפוס',
    'auth.action.resetPassword.loading': 'שולח…',
    'auth.action.resetPassword.sent': 'קישור איפוס נשלח — בדוק את האימייל שלך.',
    'auth.action.backToSignIn': '← חזרה לכניסה',
    'auth.action.switchToMagicLink': 'כניסה עם קישור קסם',
    'auth.action.switchToPassword': 'כניסה עם סיסמה',

    // Auth — Dividers
    'auth.divider.or': 'או',

    // Auth — Social proof
    'auth.social.trusted': 'מעל 3,000 יוצרים בישראל ומעבר לה כבר סומכים עלינו',

    // Auth — Errors
    'auth.error.invalidCredentials': 'אימייל או סיסמה שגויים. נסה שוב.',
    'auth.error.emailNotConfirmed': 'אנא אמת את האימייל שלך לפני הכניסה.',
    'auth.error.userExists': 'חשבון עם אימייל זה כבר קיים.',
    'auth.error.passwordTooShort': 'הסיסמה חייבת להכיל לפחות 8 תווים.',
    'auth.error.generic': 'משהו השתבש. נסה שוב.',

    // Auth — Success
    'auth.success.signUp': 'החשבון נוצר! בדוק את האימייל שלך לאישור הכתובת.',
    'auth.success.magicLink':
      'קישור הקסם נשלח! פתח את תיבת הדואר שלך ולחץ על הקישור להתחברות מיידית.',
    'auth.success.passwordReset': 'אימייל לאיפוס סיסמה נשלח. בדוק את תיבת הדואר שלך.',

    // Auth — Legal
    'auth.legal.agree': 'בלחיצה על המשך, אתה מסכים ל',
    'auth.legal.terms': 'תנאי השירות',
    'auth.legal.and': 'ול',
    'auth.legal.privacy': 'מדיניות הפרטיות',

    // Footer — Israeli compliance (immutable — required by law)
    'footer.legal':
      'המערכת משמשת ככלי ליצירת הצעות מחיר בלבד ואינה מהווה ייעוץ משפטי או פיננסי.',
    'footer.rights': '© 2026 DealSpace. כל הזכויות שמורות.',

    // Accessibility widget
    'a11y.open': 'אפשרויות נגישות',
    'a11y.textSize': 'גודל טקסט',
    'a11y.contrast': 'ניגודיות גבוהה',
    'a11y.close': 'סגור פאנל נגישות',
  },
}

// ─── Zustand i18n Store ───────────────────────────────────────────────────────

export const useI18n = create<I18nState>()(
  devtools(
    persist(
      (set, get) => ({
        locale: 'he',
        dir: 'rtl',

        t: (key: string, vars?: Record<string, string | number>) => {
          const { locale } = get()
          let str = translations[locale][key] ?? translations['en'][key] ?? key
          if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
              str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
            })
          }
          return str
        },

        setLocale: (locale: Locale) => {
          const dir: Dir = locale === 'he' ? 'rtl' : 'ltr'
          // Instantly flip the DOM direction — no layout jank
          document.documentElement.setAttribute('dir', dir)
          document.documentElement.setAttribute('lang', locale)
          set({ locale, dir })
        },
      }),
      {
        name: 'dealspace:locale',
        // Only persist locale preference, not the t function
        partialize: (s) => ({ locale: s.locale, dir: s.dir }),
        // Rehydrate the dir attribute on <html> after page load
        onRehydrateStorage: () => (state) => {
          if (state) {
            document.documentElement.setAttribute('dir', state.dir)
            document.documentElement.setAttribute('lang', state.locale)
          }
        },
      }
    ),
    { name: 'DealSpace:i18n' }
  )
)
