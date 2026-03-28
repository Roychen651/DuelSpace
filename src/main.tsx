import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useI18n } from './lib/i18n.ts'

// Initialize locale & DOM dir before first render
const { locale, dir } = useI18n.getState()
document.documentElement.setAttribute('dir', dir)
document.documentElement.setAttribute('lang', locale)

// StrictMode removed: framer-motion v12 animate-from-opacity-0 sticks in
// React 19 double-invoke mode — re-enable after framer-motion releases a patch.
createRoot(document.getElementById('root')!).render(<App />)
