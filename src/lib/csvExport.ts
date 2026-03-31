// ─── CSV Export Engine ────────────────────────────────────────────────────────
// Generates a clean CSV from the currently filtered proposals and
// triggers a browser download named DealSpace_Report_YYYY-MM-DD.csv

import type { Proposal } from '../types/proposal'
import { proposalTotal } from '../types/proposal'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const yr = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${dy}/${mo}/${yr}`
}

function escapeCsv(val: string | number | null | undefined): string {
  const s = String(val ?? '')
  // Wrap in quotes if the value contains comma, quote, or newline
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportProposalsCsv(proposals: Proposal[], locale: 'he' | 'en'): void {
  const isHe = locale === 'he'

  const headers = isHe
    ? ['תאריך', 'פרויקט', 'לקוח', 'אימייל', 'סטטוס', 'מחיר בסיס', 'מטבע', 'סה"כ']
    : ['Date', 'Project', 'Client', 'Email', 'Status', 'Base Price', 'Currency', 'Total']

  const STATUS_LABELS: Record<string, { en: string; he: string }> = {
    draft:          { en: 'Draft',    he: 'טיוטה' },
    sent:           { en: 'Sent',     he: 'נשלח' },
    viewed:         { en: 'Viewed',   he: 'נצפה' },
    accepted:       { en: 'Accepted', he: 'אושר' },
    rejected:       { en: 'Rejected', he: 'נדחה' },
    needs_revision: { en: 'Revision', he: 'בתיקון' },
  }

  const rows = proposals.map(p => {
    const statusLabel = STATUS_LABELS[p.status]
    return [
      fmtDate(p.created_at),
      p.project_title || '',
      p.client_name || '',
      p.client_email || '',
      isHe ? (statusLabel?.he ?? p.status) : (statusLabel?.en ?? p.status),
      String(p.base_price ?? 0),
      p.currency ?? 'ILS',
      String(proposalTotal(p)),
    ].map(escapeCsv).join(',')
  })

  const bom = '\uFEFF' // BOM for Excel to correctly render Hebrew/UTF-8
  const csv = bom + [headers.map(escapeCsv).join(','), ...rows].join('\r\n')

  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const filename = `DealSpace_Report_${dateStr}.csv`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
