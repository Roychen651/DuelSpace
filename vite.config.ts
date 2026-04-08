import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @react-pdf/pdfkit → browserify-zlib → pako deep import fails in Rolldown
      // because pako is nested under browserify-zlib/node_modules/pako.
      // Alias the bare 'pako' specifier to the nested copy so Rolldown can resolve it.
      pako: path.resolve(__dirname, 'node_modules/browserify-zlib/node_modules/pako'),
    },
  },
})
