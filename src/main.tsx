import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useI18n } from './lib/i18n.ts'

// Initialize locale & DOM dir before first render
const { locale, dir } = useI18n.getState()
document.documentElement.setAttribute('dir', dir)
document.documentElement.setAttribute('lang', locale)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
