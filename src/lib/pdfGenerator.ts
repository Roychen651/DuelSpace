import { jsPDF } from 'jspdf'
import { formatCurrency } from '../types/proposal'
import type { Proposal } from '../types/proposal'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PdfOptions {
  proposal: Proposal
  /** Final accepted total (may differ from base if add-ons were toggled) */
  totalAmount: number
  /** Enabled add-on ids at acceptance time */
  enabledAddOnIds: string[]
  /** Signature data URL (image/png) from SignaturePad canvas */
  signatureDataUrl: string
  locale: 'he' | 'en'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function wrapText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  lines.forEach((line: string) => {
    doc.text(line, x, y)
    y += lineHeight
  })
  return y
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generateProposalPdf(opts: PdfOptions): Promise<void> {
  const { proposal, totalAmount, enabledAddOnIds, signatureDataUrl, locale } = opts
  const isHe = locale === 'he'

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const PAGE_W = 210
  const PAGE_H = 297
  const MARGIN = 20
  const CONTENT_W = PAGE_W - MARGIN * 2
  let y = MARGIN

  // ── Color palette ──────────────────────────────────────────────────────────
  const C_BG       = hexToRgb('#05050A')
  const C_SURFACE  = hexToRgb('#111118')
  const C_BORDER   = hexToRgb('#1e1e2e')
  const C_ACCENT   = hexToRgb('#6366f1')
  const C_VIOLET   = hexToRgb('#a855f7')
  const C_TEXT     = hexToRgb('#e5e7eb')
  const C_MUTED    = hexToRgb('#6b7280')
  const C_SUCCESS  = hexToRgb('#22c55e')
  const C_WHITE    = hexToRgb('#ffffff')

  // ── Page background ────────────────────────────────────────────────────────
  doc.setFillColor(...C_BG)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

  // ── Header bar ─────────────────────────────────────────────────────────────
  // Brand gradient block
  doc.setFillColor(...C_ACCENT)
  doc.rect(0, 0, PAGE_W, 18, 'F')

  // Accent stripe (right half violet)
  doc.setFillColor(...C_VIOLET)
  doc.rect(PAGE_W / 2, 0, PAGE_W / 2, 18, 'F')

  // Brand name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...C_WHITE)
  doc.text('DealSpace', MARGIN, 12)

  // "Signed Proposal" badge
  const badgeLabel = isHe ? 'הצעה חתומה' : 'Signed Proposal'
  doc.setFontSize(9)
  doc.text(badgeLabel, PAGE_W - MARGIN, 12, { align: 'right' })

  y = 26

  // ── Title block ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...C_TEXT)
  const titleText = proposal.project_title || (isHe ? 'הצעת מחיר' : 'Proposal')
  doc.text(titleText, MARGIN, y)
  y += 7

  if (proposal.client_name) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...C_MUTED)
    const clientLabel = isHe ? `ללקוח: ${proposal.client_name}` : `Client: ${proposal.client_name}`
    doc.text(clientLabel, MARGIN, y)
    y += 5
  }

  // Date
  const dateStr = new Date().toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  doc.setFontSize(9)
  doc.setTextColor(...C_MUTED)
  const dateLabel = isHe ? `תאריך חתימה: ${dateStr}` : `Signed: ${dateStr}`
  doc.text(dateLabel, MARGIN, y)
  y += 10

  // Divider
  doc.setDrawColor(...C_BORDER)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 8

  // ── Description ────────────────────────────────────────────────────────────
  if (proposal.description) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(180, 180, 200)
    y = wrapText(doc, proposal.description, MARGIN, y, CONTENT_W, 5)
    y += 6
  }

  // ── Line items table ───────────────────────────────────────────────────────
  // Table header
  doc.setFillColor(...C_SURFACE)
  doc.roundedRect(MARGIN, y, CONTENT_W, 9, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C_MUTED)
  const colItem = isHe ? 'פריט' : 'Item'
  const colPrice = isHe ? 'מחיר' : 'Price'
  doc.text(colItem.toUpperCase(), MARGIN + 4, y + 6)
  doc.text(colPrice.toUpperCase(), PAGE_W - MARGIN - 4, y + 6, { align: 'right' })
  y += 13

  // Base package row
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...C_TEXT)
  const baseLabel = isHe ? 'חבילת בסיס' : 'Base Package'
  doc.text(baseLabel, MARGIN + 4, y)
  doc.setTextColor(196, 181, 253)
  doc.text(formatCurrency(proposal.base_price, proposal.currency), PAGE_W - MARGIN - 4, y, { align: 'right' })
  y += 7

  // Add-on rows
  const enabledAddOns = proposal.add_ons.filter(a => enabledAddOnIds.includes(a.id))
  enabledAddOns.forEach(addOn => {
    doc.setTextColor(...C_TEXT)
    const addOnName = `+ ${addOn.label}`
    doc.text(addOnName, MARGIN + 4, y)
    doc.setTextColor(196, 181, 253)
    doc.text(formatCurrency(addOn.price, proposal.currency), PAGE_W - MARGIN - 4, y, { align: 'right' })
    y += 6
  })

  y += 3

  // Total row
  doc.setFillColor(30, 30, 60)
  doc.roundedRect(MARGIN, y, CONTENT_W, 11, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...C_TEXT)
  const totalLabel = isHe ? 'סה״כ להשקעה' : 'Total Investment'
  doc.text(totalLabel, MARGIN + 4, y + 7.5)
  doc.setFontSize(12)
  doc.setTextColor(196, 181, 253)
  doc.text(formatCurrency(totalAmount, proposal.currency), PAGE_W - MARGIN - 4, y + 7.5, { align: 'right' })
  y += 18

  // ── Legal terms ────────────────────────────────────────────────────────────
  doc.setDrawColor(...C_BORDER)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C_ACCENT)
  const termsTitle = isHe ? 'תנאים והתניות' : 'Terms & Conditions'
  doc.text(termsTitle, MARGIN, y)
  y += 5

  const termsText = isHe
    ? `חתימה על הצעה זו מהווה הסכם מחייב בין הצדדים. תשלום ישבוצע לפי לוח הזמנים המוסכם. ביטול לאחר חתימה כפוף לדמי ביטול. בעל העסק ו-DealSpace אינם אחראים לעיכובים שנגרמו מגורמים חיצוניים. שינויים בהיקף העבודה ידרשו הסכמה בכתב. חוק החל: דין מדינת ישראל.`
    : `Signing this proposal constitutes a binding agreement between the parties. Payment will be made according to the agreed schedule. Cancellation after signing is subject to cancellation fees. Neither the service provider nor DealSpace is liable for delays caused by external factors. Scope changes require written agreement. Governing law: State of Israel.`

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C_MUTED)
  y = wrapText(doc, termsText, MARGIN, y, CONTENT_W, 4.5)
  y += 8

  // ── Signature ──────────────────────────────────────────────────────────────
  // Check if we have room, otherwise add page
  if (y > PAGE_H - 60) {
    doc.addPage()
    doc.setFillColor(...C_BG)
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
    y = MARGIN
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C_ACCENT)
  const sigTitle = isHe ? 'חתימה דיגיטלית' : 'Digital Signature'
  doc.text(sigTitle, MARGIN, y)
  y += 5

  // Signature box
  const SIG_W = 90
  const SIG_H = 36
  doc.setFillColor(...C_SURFACE)
  doc.setDrawColor(...C_SUCCESS)
  doc.setLineWidth(0.5)
  doc.roundedRect(MARGIN, y, SIG_W, SIG_H, 3, 3, 'FD')

  // Embed signature image if provided
  if (signatureDataUrl && signatureDataUrl.startsWith('data:image')) {
    try {
      doc.addImage(signatureDataUrl, 'PNG', MARGIN + 3, y + 3, SIG_W - 6, SIG_H - 6)
    } catch {
      // Signature image failed to embed — skip silently
    }
  }

  // Accepted checkmark label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...C_SUCCESS)
  const acceptedLabel = isHe ? '✓ אושר ונחתם אלקטרונית' : '✓ Electronically Approved & Signed'
  doc.text(acceptedLabel, MARGIN + SIG_W + 6, y + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...C_MUTED)
  const sigDateLabel = isHe ? `תאריך: ${dateStr}` : `Date: ${dateStr}`
  doc.text(sigDateLabel, MARGIN + SIG_W + 6, y + 19)

  if (proposal.client_name) {
    doc.setFontSize(7.5)
    const sigClientLabel = isHe ? `שם: ${proposal.client_name}` : `Name: ${proposal.client_name}`
    doc.text(sigClientLabel, MARGIN + SIG_W + 6, y + 25)
  }

  y += SIG_H + 10

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerY = PAGE_H - 14
  doc.setDrawColor(...C_BORDER)
  doc.line(MARGIN, footerY - 4, PAGE_W - MARGIN, footerY - 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...C_MUTED)
  const footerLeft = isHe
    ? 'מסמך זה נוצר על ידי DealSpace ומהווה ראיה לקבלת ההצעה.'
    : 'This document was generated by DealSpace and serves as evidence of proposal acceptance.'
  doc.text(footerLeft, MARGIN, footerY)
  doc.text('dealspace.app', PAGE_W - MARGIN, footerY, { align: 'right' })

  // ── Save ───────────────────────────────────────────────────────────────────
  const filename = `DealSpace_${(proposal.project_title || 'Proposal').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
