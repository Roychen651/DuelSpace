import {
  Document, Page, Text, View, Image,
  StyleSheet, Font, pdf,
} from '@react-pdf/renderer'
import { DEFAULT_VAT_RATE } from '../types/proposal'
import type { Proposal } from '../types/proposal'
import { calculateFinancials } from './financialMath'

// ─── Font registration ─────────────────────────────────────────────────────────

Font.register({
  family: 'Heebo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSyccg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1Ebiuccg.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EICuccg.ttf', fontWeight: 900 },
  ],
})
Font.registerHyphenationCallback(word => [word])

// ─── Public types ──────────────────────────────────────────────────────────────

export interface PdfOptions {
  proposal: Proposal
  totalAmount: number
  enabledAddOnIds: string[]
  signatureDataUrl: string
  locale: 'he' | 'en'
  /** Exact moment the signature was captured; defaults to now() */
  signatureTimestamp?: Date
  /**
   * When true: adds a diagonal DRAFT watermark on every page and replaces the
   * signature certificate with a "not legally binding" notice page.
   */
  isDraft?: boolean
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function getBrandColor(p: Proposal): string {
  const c = p.brand_color
  return c && /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#6366f1'
}

/** Append a 2-hex-digit alpha to a 6-digit hex color, e.g. '#6366f1' + 0.15 → '#6366f126' */
function alpha(hex: string, a: number): string {
  return `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`
}

function getInitials(name?: string | null): string {
  if (!name) return 'DS'
  return name.split(' ').map(n => n[0] ?? '').join('').slice(0, 2).toUpperCase()
}

/**
 * Bidi-safe date formatter for react-pdf.
 * NEVER use toLocaleString('he-IL') inside the PDF engine — the Hebrew month
 * names mixed with Arabic numerals (e.g. "30 במרץ 2026") cause the Unicode
 * Bidi algorithm to scramble the string inside react-pdf's text shaper.
 * Always emit DD.MM.YYYY — pure digits + dots are direction-neutral.
 */
function fmtDate(d: Date | string): string {
  const dt = new Date(d)
  const dd   = String(dt.getDate()).padStart(2, '0')
  const mm   = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

function fmtDateTime(d: Date): string {
  const dd   = String(d.getDate()).padStart(2, '0')
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh   = String(d.getHours()).padStart(2, '0')
  const min  = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy}  ${hh}:${min}`
}

/**
 * Bidi-safe currency formatter for react-pdf.
 * Intl.NumberFormat with he-IL locale injects Unicode RTL marks (U+200F) into
 * the output string. react-pdf's text shaper interprets these and flips digit
 * order, producing "138 ₪ -" instead of "- ₪138". Always use en-US number
 * formatting and append the symbol manually so the string contains no Bidi
 * control characters.
 */
function fmtCurrencyPdf(amount: number, currency: string): string {
  const n = Math.round(amount).toLocaleString('en-US')
  if (currency === 'ILS') return `${n} \u20AA`   // ₪ is U+20AA — safe in all pdf fonts
  if (currency === 'USD') return `$${n}`
  if (currency === 'EUR') return `\u20AC${n}`
  if (currency === 'GBP') return `\u00A3${n}`
  return `${n} ${currency}`
}

/**
 * Formats a positive savings/discount amount with a leading minus.
 * The minus must be the very first character so the Bidi engine never
 * reorders it relative to the currency symbol or digits.
 */
function fmtDiscountPdf(amount: number, currency: string): string {
  return `- ${fmtCurrencyPdf(amount, currency)}`
}

/**
 * Inject zero-width spaces (U+200B) after every slash, dot, hyphen, or
 * underscore so react-pdf can break long continuous strings (URLs, tokens)
 * that it cannot wrap otherwise. Safe to call on any string — ZWS is
 * invisible and does not change the visual text content.
 */
function forceWrap(text: string): string {
  return text.replace(/([/.\-_@])/g, '$1\u200B')
}

// ─── TipTap HTML → PDF block parser ───────────────────────────────────────────

interface InlineFrag { text: string; bold: boolean; italic: boolean }
interface HtmlBlock  { type: 'h1' | 'h2' | 'h3' | 'p' | 'li'; frags: InlineFrag[] }

function parseHtml(html: string): HtmlBlock[] {
  if (!html) return []

  const decode = (s: string) =>
    s.replace(/&amp;/g,  '&')
     .replace(/&lt;/g,   '<')
     .replace(/&gt;/g,   '>')
     .replace(/&quot;/g, '"')
     .replace(/&nbsp;/g, ' ')
     .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(parseInt(n, 10)))

  function inline(src: string): InlineFrag[] {
    // Pre-clean: replace <a ...>inner</a> with just inner text, then strip
    // any remaining unknown tags. Without this, the regex's [^<]+ alternative
    // captures the raw attribute string "href=..." after the leading "<" is
    // skipped, causing raw HTML to leak into the rendered PDF text.
    const cleaned = src
      .replace(/<a(?:[^>]*)>([\s\S]*?)<\/a>/gi, '$1')           // <a> → inner text only
      .replace(/<(?!\/?(?:strong|b|em|i)\b)[^>]+>/gi, ' ')      // strip all other unknown tags

    const frags: InlineFrag[] = []
    const re = /<(strong|b|em|i)(?:[^>]*)>([\s\S]*?)<\/\1>|([^<]+)/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(decode(cleaned))) !== null) {
      if (m[1]) {
        const tag = m[1].toLowerCase()
        const t   = m[2].replace(/<[^>]+>/g, '').trim()
        if (t) frags.push({ text: t, bold: tag === 'strong' || tag === 'b', italic: tag === 'em' || tag === 'i' })
      } else if (m[3] && m[3].trim()) {
        frags.push({ text: m[3], bold: false, italic: false })
      }
    }
    if (frags.length === 0) {
      const plain = decode(cleaned.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
      if (plain) frags.push({ text: plain, bold: false, italic: false })
    }
    return frags
  }

  const blocks: HtmlBlock[] = []
  const blockRe = /<(h[1-3]|p|li)(?:[^>]*)>([\s\S]*?)<\/\1>/gi
  let bm: RegExpExecArray | null
  let found = false
  while ((bm = blockRe.exec(html)) !== null) {
    found = true
    const tag   = bm[1].toLowerCase()
    const type: HtmlBlock['type'] = tag === 'h1' ? 'h1' : tag === 'h2' ? 'h2' : tag === 'h3' ? 'h3' : tag === 'li' ? 'li' : 'p'
    const frags = inline(bm[2])
    if (frags.length) blocks.push({ type, frags })
  }
  if (!found) {
    const plain = decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
    if (plain) blocks.push({ type: 'p', frags: [{ text: plain, bold: false, italic: false }] })
  }
  return blocks
}

// ─── Color palette ─────────────────────────────────────────────────────────────

const C = {
  bg:      '#070710',
  surface: '#0E0E1C',
  card:    '#111120',
  border:  '#1C1C30',
  text:    '#E8EAF0',
  muted:   '#64748B',
  dim:     '#374151',
  white:   '#FFFFFF',
  lavender:'#C4B5FD',
  success: '#22C55E',
}

// ─── Style factory (called once per render with resolved brand color) ──────────

function makeStyles(brand: string) {
  const bDim    = alpha(brand, 0.10)
  const bBorder = alpha(brand, 0.25)

  return StyleSheet.create({

    // ── Page containers ───────────────────────────────────────────────────────
    coverPage: {
      fontFamily: 'Heebo',
      backgroundColor: C.bg,
      display: 'flex',
      flexDirection: 'column',
    },
    contentPage: {
      fontFamily: 'Heebo',
      backgroundColor: C.bg,
      paddingTop: 48,      // clears fixed header (38px + 10px gap)
      paddingBottom: 40,   // clears fixed footer (28px + 12px gap)
    },
    certPage: {
      fontFamily: 'Heebo',
      backgroundColor: C.bg,
    },

    // ── Cover ─────────────────────────────────────────────────────────────────
    coverHero: {
      backgroundColor: brand,
      paddingHorizontal: 36,
      paddingTop: 42,
      paddingBottom: 38,
    },
    coverInitialCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    coverInitialText: { fontSize: 15, fontWeight: 900, color: C.white },
    coverCompany: {
      fontSize: 12,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.92)',
      letterSpacing: 0.6,
      textAlign: 'right',
      marginBottom: 4,
    },
    coverDocLabel: {
      fontSize: 8,
      fontWeight: 400,
      color: 'rgba(255,255,255,0.52)',
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      textAlign: 'right',
    },
    coverAccentBar: { height: 3, backgroundColor: alpha(brand, 0.45) },
    coverBody: {
      paddingHorizontal: 36,
      paddingTop: 0,
      paddingBottom: 48,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',   // vertically centers content within remaining page height
    },
    coverTitle: {
      fontSize: 34,               // grander — enterprise contract feel
      fontWeight: 900,
      color: C.white,
      textAlign: 'right',
      marginBottom: 32,
      lineHeight: 1.25,
      flexWrap: 'wrap',           // prevents long project titles from overflowing
    },
    coverPreparedLabel: {
      fontSize: 7,
      fontWeight: 700,
      color: brand,
      letterSpacing: 2,
      textTransform: 'uppercase',
      textAlign: 'right',
      marginBottom: 6,
    },
    coverClientName: {
      fontSize: 15,
      fontWeight: 700,
      color: C.text,
      textAlign: 'right',
      marginBottom: 3,
    },
    coverClientCompany: {
      fontSize: 9.5,
      color: C.muted,
      textAlign: 'right',
    },
    coverMetaRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 20,
      marginTop: 28,
      paddingTop: 14,
      borderTop: `1px solid ${C.border}`,
    },
    coverMetaText: { fontSize: 8, color: C.muted },

    // ── Fixed page header (content pages) ─────────────────────────────────────
    pageHeader: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 38,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 28,
      backgroundColor: C.bg,
      borderBottom: `1px solid ${C.border}`,
    },
    pageHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pageHeaderBar:  { width: 3, height: 13, backgroundColor: brand, borderRadius: 2 },
    pageHeaderCompany: { fontSize: 8, fontWeight: 700, color: C.text },
    pageHeaderDoc:     { fontSize: 7.5, color: C.muted },
    pageHeaderPage:    { fontSize: 7.5, color: C.muted },

    // ── Fixed page footer (content pages) ─────────────────────────────────────
    pageFooter: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 28,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 28,
      borderTop: `1px solid ${C.border}`,
    },
    pageFooterBrand: { fontSize: 7, fontWeight: 700, color: brand },
    pageFooterText:  { fontSize: 7, color: C.dim },

    // ── Section chrome ─────────────────────────────────────────────────────────
    section: { paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12 },
    sectionTitle: {
      fontSize: 7.5,
      fontWeight: 700,
      color: brand,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      textAlign: 'right',
      marginBottom: 10,
      paddingBottom: 6,
      borderBottom: `1.5px solid ${bBorder}`,
    },
    sectionDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 28 },

    // ── Parties ────────────────────────────────────────────────────────────────
    partyRow: { flexDirection: 'row', gap: 12 },
    partyBox: {
      flex: 1,
      borderRadius: 6,
      padding: 12,
      backgroundColor: C.card,
      border: `1px solid ${C.border}`,
    },
    partyLabel: {
      fontSize: 6.5,
      fontWeight: 700,
      color: brand,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      textAlign: 'right',
      marginBottom: 6,
      paddingBottom: 4,
      borderBottom: `1px solid ${bBorder}`,
    },
    partyName:  { fontSize: 10.5, fontWeight: 700, color: C.text,  textAlign: 'right', marginBottom: 3 },
    partyMeta:  { fontSize: 8,    fontWeight: 400, color: C.muted, textAlign: 'right', marginBottom: 2, lineHeight: 1.45 },

    // ── Description / HTML blocks ──────────────────────────────────────────────
    descText:   { fontSize: 9, color: 'rgba(232,234,240,0.65)', lineHeight: 1.7, textAlign: 'right' },
    htmlH1:     { fontSize: 13, fontWeight: 900, color: C.text,  textAlign: 'right', marginBottom: 5, marginTop: 10 },
    htmlH2:     { fontSize: 11, fontWeight: 700, color: C.text,  textAlign: 'right', marginBottom: 4, marginTop: 8 },
    htmlH3:     { fontSize: 10, fontWeight: 700, color: brand,   textAlign: 'right', marginBottom: 3, marginTop: 7 },
    htmlP:      { fontSize: 8.5, color: 'rgba(232,234,240,0.70)', lineHeight: 1.65, textAlign: 'right', marginBottom: 5 },
    htmlLi:     { fontSize: 8.5, color: 'rgba(232,234,240,0.70)', lineHeight: 1.65, textAlign: 'right', marginBottom: 3, paddingRight: 10 },
    htmlBold:   { fontWeight: 700, color: C.text },

    // ── Pricing table ──────────────────────────────────────────────────────────
    tableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 7,
      marginBottom: 2,
    },
    tableHeaderCell: { fontSize: 7, fontWeight: 700, color: brand, letterSpacing: 1, textTransform: 'uppercase' },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderBottom: `1px solid ${C.border}`,
    },
    tableRowHighlight: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderBottom: `1px solid ${C.border}`,
      backgroundColor: bDim,
    },
    tableLabel:    { fontSize: 9.5, color: C.text,  flex: 1, textAlign: 'right', flexWrap: 'wrap' },
    tableLabelSub: { fontSize: 7.5, color: C.muted, flex: 1, textAlign: 'right', marginTop: 1, flexWrap: 'wrap' },
    tablePrice:    { fontSize: 10,  color: C.lavender, fontWeight: 700, width: 90, textAlign: 'left', flexShrink: 0 },

    // ── VAT box ────────────────────────────────────────────────────────────────
    vatBox: {
      marginHorizontal: 28,
      marginTop: 10,
      borderRadius: 6,
      padding: 12,
      backgroundColor: bDim,
      border: `1px solid ${bBorder}`,
    },
    vatRow:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    vatLabel:      { fontSize: 8.5, color: 'rgba(232,234,240,0.50)', textAlign: 'right' },
    vatValue:      { fontSize: 8.5, fontWeight: 700, color: 'rgba(232,234,240,0.50)' },
    vatDivider:    { height: 1, backgroundColor: C.border, marginVertical: 6 },
    vatTotalLabel: { fontSize: 10, fontWeight: 700, color: C.text,     textAlign: 'right' },
    vatTotalValue: { fontSize: 10, fontWeight: 700, color: C.lavender },

    // ── Grand total ────────────────────────────────────────────────────────────
    totalBox: {
      marginHorizontal: 28,
      marginTop: 12,
      borderRadius: 8,
      paddingHorizontal: 18,
      paddingVertical: 14,
      backgroundColor: C.card,
      border: `1.5px solid ${brand}`,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: { fontSize: 11, fontWeight: 700, color: C.text,     textAlign: 'right' },
    totalValue: { fontSize: 20, fontWeight: 900, color: C.lavender },

    // ── Milestones ─────────────────────────────────────────────────────────────
    milestoneHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surface,
      borderRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 7,
      marginBottom: 2,
    },
    milestoneHeaderCell: { fontSize: 7, fontWeight: 700, color: brand, letterSpacing: 1, textTransform: 'uppercase' },
    milestoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderBottom: `1px solid ${C.border}`,
    },
    milestoneNumBadge: {
      width: 20, height: 20, borderRadius: 10,
      backgroundColor: bDim,
      border: `1px solid ${bBorder}`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      flexShrink: 0,
    },
    milestoneNumText: { fontSize: 7.5, fontWeight: 700, color: brand },
    milestoneName:    { fontSize: 9.5, color: C.text,    textAlign: 'right', flex: 1 },
    milestonePct:     { fontSize: 8.5, color: C.muted,   fontWeight: 700, width: 50, textAlign: 'center' },
    milestoneAmt:     { fontSize: 10,  color: C.lavender, fontWeight: 700, width: 80, textAlign: 'left' },
    milestoneBarBg:   { height: 2, backgroundColor: C.border, borderRadius: 1, marginTop: 3 },
    milestoneBarFill: { height: 2, backgroundColor: brand,    borderRadius: 1 },

    // ── Terms ──────────────────────────────────────────────────────────────────
    termsPara: { fontSize: 8, color: 'rgba(100,116,139,0.9)', lineHeight: 1.65, textAlign: 'right', marginBottom: 6 },

    // ── Signature Certificate page ─────────────────────────────────────────────
    certHero: {
      backgroundColor: brand,
      paddingHorizontal: 36,
      paddingVertical: 26,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    certHeroTitle: { fontSize: 16, fontWeight: 900, color: C.white, textAlign: 'right' },
    certHeroSub:   { fontSize: 8.5, color: 'rgba(255,255,255,0.60)', textAlign: 'right', marginTop: 4 },
    certCheckCircle: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    certCheckText: { fontSize: 18, fontWeight: 900, color: C.white },
    certBody: { paddingHorizontal: 36, paddingTop: 26, paddingBottom: 36 },

    certSigRow: { flexDirection: 'row', gap: 20, marginBottom: 22 },
    certSigBox: {
      width: 160, height: 80,
      borderRadius: 8,
      border: `1.5px solid ${C.success}`,
      backgroundColor: C.card,
      overflow: 'hidden',
      flexShrink: 0,
    },
    certSigImage:  { width: '100%', height: '100%', objectFit: 'contain' },
    certSigMeta:   { flex: 1 },
    certSigBadge:  { fontSize: 10, fontWeight: 700, color: C.success, marginBottom: 8, textAlign: 'right' },
    certSigLine:   { fontSize: 8.5, color: C.muted,  textAlign: 'right', marginBottom: 3, lineHeight: 1.5 },
    certSigValue:  { fontWeight: 700, color: C.text },

    certTokenBox: {
      borderRadius: 6,
      border: `1px dashed ${bBorder}`,
      backgroundColor: bDim,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 14,
    },
    certTokenLabel: { fontSize: 7, fontWeight: 700, color: brand, letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'right', marginBottom: 5 },
    certTokenValue: { fontSize: 8, color: C.text, textAlign: 'right', letterSpacing: 0.5 },

    certAuditBox: {
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      backgroundColor: C.card,
      padding: 14,
      marginBottom: 14,
    },
    certAuditTitle: {
      fontSize: 7.5, fontWeight: 700, color: brand,
      letterSpacing: 1.5, textTransform: 'uppercase',
      textAlign: 'right', marginBottom: 10,
      paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
    },
    certAuditRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      borderBottom: `1px solid rgba(28,28,48,0.6)`,
    },
    certAuditRowLast: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    certAuditLabel: { fontSize: 7.5, color: C.muted, textAlign: 'right', width: '33%' },
    certAuditValue: { fontSize: 7.5, fontWeight: 700, color: C.text, textAlign: 'left', width: '65%' },

    certLegalNote: {
      fontSize: 7,
      color: C.dim,
      lineHeight: 1.6,
      textAlign: 'right',
      borderTop: `1px solid ${C.border}`,
      paddingTop: 10,
    },
    certFooter: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 36,
      borderTop: `1px solid ${C.border}`,
    },
    certFooterBrand: { fontSize: 7, fontWeight: 700, color: brand },
    certFooterText:  { fontSize: 7, color: C.dim },
  })
}

// ─── Inline HTML renderer helper ───────────────────────────────────────────────

function HtmlBlocks({ blocks, s }: { blocks: HtmlBlock[]; s: ReturnType<typeof makeStyles> }) {
  return (
    <>
      {blocks.map((block, i) => {
        const base = block.type === 'h1' ? s.htmlH1 : block.type === 'h2' ? s.htmlH2 : block.type === 'h3' ? s.htmlH3 : block.type === 'li' ? s.htmlLi : s.htmlP
        return (
          <Text key={i} style={base}>
            {block.type === 'li' ? '• ' : ''}
            {block.frags.map((f, j) => (
              <Text key={j} style={f.bold ? s.htmlBold : {}}>
                {f.text}
              </Text>
            ))}
          </Text>
        )
      })}
    </>
  )
}

// ─── PDF Document ──────────────────────────────────────────────────────────────

function ProposalDocument(opts: PdfOptions) {
  const { proposal, enabledAddOnIds, signatureDataUrl, locale, isDraft = false } = opts
  const sigTs     = opts.signatureTimestamp ?? new Date()
  const isHe      = locale === 'he'
  const brand     = getBrandColor(proposal)
  const s         = makeStyles(brand)

  const enabledAddOns = proposal.add_ons.filter(a => enabledAddOnIds.includes(a.id))
  const milestones    = proposal.payment_milestones ?? []

  const vatRate = (() => {
    try {
      const v = parseFloat(localStorage.getItem('dealspace:vat-rate') ?? '')
      return isNaN(v) ? DEFAULT_VAT_RATE : v
    } catch { return DEFAULT_VAT_RATE }
  })()

  // Build lineItems override from enabledAddOnIds so calculateFinancials
  // honours the client's add-on selections at signing time.
  const lineItemsOverride: Record<string, { enabled: boolean; qty: number }> = {}
  proposal.add_ons.forEach(a => {
    lineItemsOverride[a.id] = { enabled: enabledAddOnIds.includes(a.id), qty: 1 }
  })

  const fin          = calculateFinancials(proposal, lineItemsOverride, vatRate)
  const vatAmt       = fin.vatAmount
  const displayTotal = fin.grandTotal
  const totalSavings = fin.totalSavings

  const creator       = proposal.creator_info
  const companyName   = creator?.company_name ?? 'DealSpace'
  const initials      = getInitials(creator?.company_name)
  const projectTitle  = proposal.project_title || (isHe ? 'הצעת מחיר' : 'Proposal')
  const dateStr       = fmtDate(sigTs)
  const dateTimeStr   = fmtDateTime(sigTs)
  const createdStr    = fmtDate(proposal.created_at)

  const descBlocks = proposal.description ? parseHtml(proposal.description) : []

  return (
    <Document
      title={projectTitle}
      author={companyName}
      creator="DealSpace"
      producer="DealSpace"
      subject={isHe ? 'הסכם התקשרות והצעת מחיר' : 'Proposal & Service Agreement'}
    >

      {/* ════════════════════════════════════════════════════════════════════
          PAGE 1 — COVER
      ════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.coverPage}>

        {/* Draft watermark — diagonal, fixed across all pages */}
        {isDraft && (
          <View
            fixed
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
            }}
          >
            <Text
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: 'rgba(220,38,38,0.07)',
                transform: 'rotate(-45deg)',
                letterSpacing: 8,
                textTransform: 'uppercase',
              }}
            >
              {isHe ? 'טיוטה' : 'DRAFT'}
            </Text>
          </View>
        )}

        {/* Brand hero strip */}
        <View style={s.coverHero}>
          {/* Decorative circle top-right */}
          <View style={{ position: 'absolute', top: -24, right: -24, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.07)' }} />
          {/* Decorative circle bottom-left */}
          <View style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.10)' }} />

          <View>
            <View style={s.coverInitialCircle}>
              <Text style={s.coverInitialText}>{initials}</Text>
            </View>
            <Text style={s.coverCompany}>{companyName}</Text>
            <Text style={s.coverDocLabel}>
              {isHe ? 'הסכם התקשרות והצעת מחיר' : 'PROPOSAL & SERVICE AGREEMENT'}
            </Text>
          </View>
        </View>

        {/* Thin accent divider */}
        <View style={s.coverAccentBar} />

        {/* Body */}
        <View style={s.coverBody}>
          {/* Company logo — shown only if the creator has uploaded one */}
          {creator?.logo_url ? (
            <View style={{ marginBottom: 28, alignItems: 'flex-end' }}>
              <Image
                src={creator.logo_url}
                style={{ width: 120, height: 44, objectFit: 'contain' }}
              />
            </View>
          ) : null}

          <Text style={s.coverTitle}>{projectTitle}</Text>

          <View style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 0 }}>
            <Text style={s.coverPreparedLabel}>{isHe ? 'הוכן עבור' : 'PREPARED FOR'}</Text>
            <Text style={s.coverClientName}>
              {proposal.client_name || (isHe ? 'לקוח' : 'Client')}
            </Text>
            {proposal.client_company_name
              ? <Text style={s.coverClientCompany}>{proposal.client_company_name}</Text>
              : null}
          </View>

          <View style={s.coverMetaRow}>
            <Text style={s.coverMetaText}>{dateStr}</Text>
            <Text style={s.coverMetaText}>·</Text>
            <Text style={s.coverMetaText}>
              {isHe ? 'מזהה: ' : 'ID: '}{proposal.public_token.slice(0, 14)}…
            </Text>
          </View>
        </View>
      </Page>

      {/* ════════════════════════════════════════════════════════════════════
          PAGE 2+ — MAIN CONTENT  (auto-paginates; fixed header + footer)
      ════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.contentPage}>

        {/* Fixed header — repeated on every content page */}
        <View style={s.pageHeader} fixed>
          <View style={s.pageHeaderLeft}>
            <View style={s.pageHeaderBar} />
            <Text style={s.pageHeaderCompany}>{companyName}</Text>
            <Text style={s.pageHeaderDoc}>  ·  {projectTitle}</Text>
          </View>
          <Text style={s.pageHeaderPage} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* ── Parties ─────────────────────────────────────────────────────── */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>
            {isHe ? 'צדדים להסכם' : 'PARTIES TO THE AGREEMENT'}
          </Text>
          <View style={s.partyRow}>

            {/* Creator — Side A */}
            <View style={s.partyBox}>
              <Text style={s.partyLabel}>{isHe ? "צד א' — נותן השירות" : "SIDE A — SERVICE PROVIDER"}</Text>
              {creator?.company_name   ? <Text style={s.partyName}>{creator.company_name}</Text> : null}
              {creator?.full_name      ? <Text style={s.partyMeta}>{creator.full_name}</Text> : null}
              {creator?.tax_id         ? <Text style={s.partyMeta}>{isHe ? `ח.פ / עוסק: ${creator.tax_id}` : `Tax ID: ${creator.tax_id}`}</Text> : null}
              {creator?.address        ? <Text style={s.partyMeta}>{creator.address}</Text> : null}
              {creator?.phone          ? <Text style={s.partyMeta}>{creator.phone}</Text> : null}
              {creator?.signatory_name ? <Text style={s.partyMeta}>{isHe ? `מורשה חתימה: ${creator.signatory_name}` : `Authorized Signatory: ${creator.signatory_name}`}</Text> : null}
            </View>

            {/* Client — Side B */}
            <View style={s.partyBox}>
              <Text style={s.partyLabel}>{isHe ? "צד ב' — הלקוח" : "SIDE B — CLIENT"}</Text>
              {proposal.client_name         ? <Text style={s.partyName}>{proposal.client_name}</Text> : null}
              {proposal.client_company_name ? <Text style={s.partyMeta}>{proposal.client_company_name}</Text> : null}
              {proposal.client_tax_id       ? <Text style={s.partyMeta}>{isHe ? `ח.פ / ת.ז.: ${proposal.client_tax_id}` : `Tax ID: ${proposal.client_tax_id}`}</Text> : null}
              {proposal.client_address      ? <Text style={s.partyMeta}>{proposal.client_address}</Text> : null}
              {proposal.client_email        ? <Text style={s.partyMeta}>{proposal.client_email}</Text> : null}
              {proposal.client_signer_role  ? <Text style={s.partyMeta}>{isHe ? `תפקיד: ${proposal.client_signer_role}` : `Role: ${proposal.client_signer_role}`}</Text> : null}
            </View>

          </View>
        </View>

        <View style={s.sectionDivider} />

        {/* ── Project description ─────────────────────────────────────────── */}
        {proposal.description ? (
          <>
            <View style={s.section}>
              <Text style={s.sectionTitle}>{isHe ? 'תיאור הפרויקט' : 'PROJECT DESCRIPTION'}</Text>
              {descBlocks.length > 0
                ? <HtmlBlocks blocks={descBlocks} s={s} />
                : <Text style={s.descText}>{proposal.description}</Text>}
            </View>
            <View style={s.sectionDivider} />
          </>
        ) : null}

        {/* ── Pricing breakdown ───────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isHe ? 'פירוט מחירים ושירותים' : 'SERVICES & PRICING'}</Text>

          {/* Table header */}
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>
              {isHe ? 'פריט / שירות' : 'ITEM / SERVICE'}
            </Text>
            <Text style={[s.tableHeaderCell, { textAlign: 'left' }]}>
              {isHe ? 'מחיר' : 'PRICE'}
            </Text>
          </View>

          {/* Base row */}
          <View style={s.tableRowHighlight} wrap={false}>
            <Text style={s.tableLabel}>{isHe ? 'חבילת בסיס' : 'Base Package'}</Text>
            <Text style={s.tablePrice}>{fmtCurrencyPdf(proposal.base_price, proposal.currency)}</Text>
          </View>

          {/* Add-on rows */}
          {enabledAddOns.map(a => (
            <View key={a.id} style={s.tableRow} wrap={false}>
              <View style={{ flex: 1 }}>
                <Text style={s.tableLabel}>{a.label}</Text>
                {a.description ? <Text style={s.tableLabelSub}>{a.description}</Text> : null}
              </View>
              <Text style={s.tablePrice}>{fmtCurrencyPdf(a.price, proposal.currency)}</Text>
            </View>
          ))}
        </View>

        {/* ── Discount + VAT breakdown ─────────────────────────────────────── */}
        {(totalSavings > 0 || proposal.include_vat) && (
          <View style={s.vatBox} wrap={false}>

            {/* Discount row — legal paper trail */}
            {totalSavings > 0 && (
              <>
                <View style={s.vatRow}>
                  <Text style={s.vatLabel}>{isHe ? 'מחיר מלא' : 'Full Price'}</Text>
                  <Text style={s.vatValue}>{fmtCurrencyPdf(fin.originalGrandTotal, proposal.currency)}</Text>
                </View>
                <View style={s.vatRow}>
                  <Text style={[s.vatLabel, { color: '#22c55e' }]}>{isHe ? 'הנחה' : 'Discount'}</Text>
                  {/* fmtDiscountPdf forces "- N ₪" with minus first — prevents Bidi flip to "N ₪ -" */}
                  <Text style={[s.vatValue, { color: '#22c55e' }]}>
                    {fmtDiscountPdf(totalSavings, proposal.currency)}
                  </Text>
                </View>
                {!proposal.include_vat && <View style={s.vatDivider} />}
              </>
            )}

            {/* VAT rows */}
            {proposal.include_vat && (
              <>
                <View style={s.vatRow}>
                  <Text style={s.vatLabel}>{isHe ? 'סה״כ לפני מע״מ' : 'Subtotal (ex. VAT)'}</Text>
                  <Text style={s.vatValue}>{fmtCurrencyPdf(fin.beforeVat, proposal.currency)}</Text>
                </View>
                <View style={s.vatRow}>
                  <Text style={s.vatLabel}>
                    {isHe ? `${Math.round(vatRate * 100)}% מע״מ` : `VAT ${Math.round(vatRate * 100)}%`}
                  </Text>
                  <Text style={s.vatValue}>{fmtCurrencyPdf(vatAmt, proposal.currency)}</Text>
                </View>
                <View style={s.vatDivider} />
                <View style={s.vatRow}>
                  <Text style={s.vatTotalLabel}>{isHe ? 'סה״כ כולל מע״מ' : 'Total incl. VAT'}</Text>
                  <Text style={s.vatTotalValue}>{fmtCurrencyPdf(displayTotal, proposal.currency)}</Text>
                </View>
              </>
            )}

            {/* After-discount total when no VAT */}
            {totalSavings > 0 && !proposal.include_vat && (
              <View style={s.vatRow}>
                <Text style={s.vatTotalLabel}>{isHe ? 'סה״כ לאחר הנחה' : 'Total after discount'}</Text>
                <Text style={s.vatTotalValue}>{fmtCurrencyPdf(displayTotal, proposal.currency)}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Grand total ──────────────────────────────────────────────────── */}
        <View style={s.totalBox} wrap={false}>
          <Text style={s.totalLabel}>
            {isHe
              ? (proposal.include_vat ? 'סה״כ לתשלום (כולל מע״מ)' : 'סה״כ להשקעה')
              : (proposal.include_vat ? 'Grand Total (incl. VAT)' : 'Total Investment')}
          </Text>
          <Text style={s.totalValue}>{fmtCurrencyPdf(displayTotal, proposal.currency)}</Text>
        </View>

        {/* ── Payment milestones ───────────────────────────────────────────── */}
        {milestones.length > 0 && (
          <>
            <View style={[s.section, { marginTop: 8 }]}>
              <Text style={s.sectionTitle}>
                {isHe ? 'לוח תשלומים — אבני דרך' : 'PAYMENT SCHEDULE — MILESTONES'}
              </Text>

              {/* Header row */}
              <View style={s.milestoneHeader}>
                <View style={{ width: 30 }} />
                <Text style={[s.milestoneHeaderCell, { flex: 1, textAlign: 'right' }]}>
                  {isHe ? 'שלב / מטרה' : 'MILESTONE'}
                </Text>
                <Text style={[s.milestoneHeaderCell, { width: 50, textAlign: 'center' }]}>%</Text>
                <Text style={[s.milestoneHeaderCell, { width: 80, textAlign: 'left' }]}>
                  {isHe ? 'סכום' : 'AMOUNT'}
                </Text>
              </View>

              {milestones.map((m, i) => {
                const amt = Math.round((m.percentage / 100) * displayTotal)
                return (
                  <View key={m.id} style={s.milestoneRow} wrap={false}>
                    <View style={s.milestoneNumBadge}>
                      <Text style={s.milestoneNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.milestoneName}>
                        {m.name || (isHe ? `אבן דרך ${i + 1}` : `Milestone ${i + 1}`)}
                      </Text>
                      <View style={s.milestoneBarBg}>
                        <View style={[s.milestoneBarFill, { width: `${m.percentage}%` as unknown as number }]} />
                      </View>
                    </View>
                    <Text style={s.milestonePct}>{m.percentage}%</Text>
                    <Text style={s.milestoneAmt}>{fmtCurrencyPdf(amt, proposal.currency)}</Text>
                  </View>
                )
              })}
            </View>
            <View style={s.sectionDivider} />
          </>
        )}

        {/* ── Terms & Conditions ───────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isHe ? 'תנאים והתניות' : 'TERMS & CONDITIONS'}</Text>
          {isHe ? (
            <>
              <Text style={s.termsPara}>
                חתימה על הצעה זו מהווה הסכם מחייב בין הצדדים בהתאם לחוק חוזים (חלק כללי), תשל״ג-1973. תשלום יבוצע לפי לוח הזמנים המוסכם. ביטול לאחר חתימה כפוף לדמי ביטול.
              </Text>
              <Text style={s.termsPara}>
                בעל העסק ו-DealSpace אינם אחראים לעיכובים שנגרמו מגורמים חיצוניים. שינויים בהיקף העבודה ידרשו הסכמה בכתב של שני הצדדים. DealSpace מספקת תשתית טכנולוגית בלבד ואינה צד להסכם.
              </Text>
              <Text style={s.termsPara}>
                חתימה אלקטרונית זו כפופה לחוק חתימה אלקטרונית, התשס״א-2001. החוק החל הוא דין מדינת ישראל. כל סכסוך יובא לפני בית המשפט המוסמך במחוז תל אביב-יפו.
              </Text>
            </>
          ) : (
            <>
              <Text style={s.termsPara}>
                Signing this proposal constitutes a binding agreement under applicable contract law. Payment will be made per the agreed schedule. Cancellation after signing is subject to cancellation fees.
              </Text>
              <Text style={s.termsPara}>
                Neither the service provider nor DealSpace is liable for delays caused by external factors. Changes to scope require written agreement from both parties. DealSpace serves solely as a technology intermediary and is not a party to this agreement.
              </Text>
              <Text style={s.termsPara}>
                This electronic signature is subject to applicable electronic signature laws. Governing law: State of Israel. Disputes resolved in the competent courts of Tel Aviv-Jaffa.
              </Text>
            </>
          )}
        </View>

        {/* Fixed footer — repeated on every content page */}
        <View style={s.pageFooter} fixed>
          <Text style={s.pageFooterBrand}>DealSpace</Text>
          <Text style={s.pageFooterText}>dealspace.app</Text>
          <Text style={s.pageFooterText}>{proposal.public_token.slice(0, 20)}…</Text>
        </View>

      </Page>

      {/* ════════════════════════════════════════════════════════════════════
          LAST PAGE — DIGITAL SIGNATURE CERTIFICATE  (or draft notice)
      ════════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.certPage}>
        {isDraft && (
          <>
            {/* Draft notice — replaces the full certificate */}
            <View style={[s.certHero, { backgroundColor: '#7c3aed' }]}>
              <View>
                <Text style={s.certHeroTitle}>
                  {isHe ? 'טיוטה — לא לתוקף משפטי' : 'DRAFT — NOT LEGALLY BINDING'}
                </Text>
                <Text style={s.certHeroSub}>
                  {isHe
                    ? 'מסמך זה הינו טיוטה לצורכי בדיקה בלבד'
                    : 'This document is a preview for review purposes only'}
                </Text>
              </View>
              <View style={s.certCheckCircle}>
                <Text style={s.certCheckText}>✎</Text>
              </View>
            </View>
            <View style={s.certBody}>
              <View style={[s.certTokenBox, { marginBottom: 24, borderColor: alpha('#7c3aed', 0.4) }]}>
                <Text style={[s.certTokenLabel, { color: '#a78bfa' }]}>
                  {isHe ? 'הודעה חשובה' : 'IMPORTANT NOTICE'}
                </Text>
                <Text style={[s.certTokenValue, { fontSize: 10, lineHeight: 1.7 }]}>
                  {isHe
                    ? 'המסמך יקבל תוקף משפטי רק לאחר חתימה דיגיטלית של הלקוח במערכת DealSpace. טיוטה זו אינה מחייבת אף אחד מהצדדים.'
                    : 'This document will become legally binding only after the client\'s digital signature via DealSpace. This draft does not obligate either party.'}
                </Text>
              </View>
              <View style={s.certAuditBox}>
                <Text style={s.certAuditTitle}>
                  {isHe ? 'פרטי הטיוטה' : 'DRAFT DETAILS'}
                </Text>
                {[
                  [isHe ? 'שם הפרויקט'  : 'Project Title',   proposal.project_title],
                  [isHe ? 'נותן השירות' : 'Service Provider', creator?.company_name ?? creator?.full_name ?? '—'],
                  [isHe ? 'לקוח'        : 'Client',           proposal.client_name ?? '—'],
                  [isHe ? 'סכום הצעה'   : 'Proposal Value',   fmtCurrencyPdf(displayTotal, proposal.currency)],
                  [isHe ? 'תאריך הפקה'  : 'Generated',        fmtDateTime(sigTs)],
                ].map(([label, value], idx) => (
                  <View key={idx} style={s.certAuditRow}>
                    <Text style={s.certAuditLabel}>{label}</Text>
                    <Text style={s.certAuditValue}>{value}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.certLegalNote}>
                {isHe
                  ? 'מסמך זה הופק על ידי DealSpace לצורכי תצוגה מוקדמת בלבד. הוא אינו מהווה הסכם חתום ואינו מחייב משפטית. לחתימה ואישור מחייבים, יש להשתמש בממשק DealSpace הרשמי.'
                  : 'This document was generated by DealSpace for preview purposes only. It does not constitute a signed agreement and is not legally binding. For binding execution, use the official DealSpace signing interface.'}
              </Text>
            </View>
            <View style={s.certFooter}>
              <Text style={s.certFooterBrand}>DealSpace</Text>
              <Text style={s.certFooterText}>{isHe ? 'טיוטה — אין תוקף משפטי' : 'DRAFT — NOT LEGALLY BINDING'}</Text>
              <Text style={s.certFooterText}>{fmtDate(sigTs)}</Text>
            </View>
          </>
        )}
        {!isDraft && (<>

        {/* Hero */}
        <View style={s.certHero}>
          <View style={{ position: 'absolute', top: -18, right: -18, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <View>
            <Text style={s.certHeroTitle}>
              {isHe ? 'תעודת חתימה דיגיטלית' : 'DIGITAL SIGNATURE CERTIFICATE'}
            </Text>
            <Text style={s.certHeroSub}>
              {isHe
                ? 'מסמך זה נחתם דיגיטלית ואובטח באמצעות מערכת DealSpace'
                : 'This document was digitally signed and secured via DealSpace'}
            </Text>
          </View>
          <View style={s.certCheckCircle}>
            <Text style={s.certCheckText}>✓</Text>
          </View>
        </View>

        <View style={s.certBody}>

          {/* Signature + metadata */}
          <View style={s.certSigRow} wrap={false}>
            <View style={s.certSigBox}>
              {signatureDataUrl?.startsWith('data:image')
                ? <Image src={signatureDataUrl} style={s.certSigImage} />
                : null}
            </View>
            <View style={s.certSigMeta}>
              <Text style={s.certSigBadge}>
                {isHe ? '✓ אושר ונחתם אלקטרונית' : '✓ Electronically Approved & Signed'}
              </Text>
              {proposal.client_name
                ? <Text style={s.certSigLine}>{isHe ? 'שם: ' : 'Name: '}<Text style={s.certSigValue}>{proposal.client_name}</Text></Text>
                : null}
              {proposal.client_company_name
                ? <Text style={s.certSigLine}>{isHe ? 'חברה: ' : 'Company: '}<Text style={s.certSigValue}>{proposal.client_company_name}</Text></Text>
                : null}
              {proposal.client_signer_role
                ? <Text style={s.certSigLine}>{isHe ? 'תפקיד: ' : 'Role: '}<Text style={s.certSigValue}>{proposal.client_signer_role}</Text></Text>
                : null}
              {proposal.client_tax_id
                ? <Text style={s.certSigLine}>{isHe ? 'ח.פ / ת.ז.: ' : 'Tax ID: '}<Text style={s.certSigValue}>{proposal.client_tax_id}</Text></Text>
                : null}
              <Text style={s.certSigLine}>{isHe ? 'תאריך חתימה: ' : 'Signed: '}<Text style={s.certSigValue}>{dateTimeStr}</Text></Text>
            </View>
          </View>

          {/* Document token */}
          <View style={s.certTokenBox} wrap={false}>
            <Text style={s.certTokenLabel}>
              {isHe ? 'מזהה מסמך ייחודי (Document Token)' : 'UNIQUE DOCUMENT TOKEN'}
            </Text>
            <Text style={s.certTokenValue}>{forceWrap(proposal.public_token)}</Text>
          </View>

          {/* Audit trail */}
          <View style={s.certAuditBox} wrap={false}>
            <Text style={s.certAuditTitle}>
              {isHe ? 'רשומת ביקורת (Audit Trail)' : 'AUDIT TRAIL'}
            </Text>

            {[
              [isHe ? 'שם הפרויקט'        : 'Project Title',        proposal.project_title],
              [isHe ? 'נותן השירות'        : 'Service Provider',     creator?.company_name ?? creator?.full_name ?? '—'],
              [isHe ? 'הלקוח'             : 'Client',               proposal.client_name ?? '—'],
              [isHe ? 'סכום החוזה'         : 'Contract Value',       fmtCurrencyPdf(displayTotal, proposal.currency)],
              [isHe ? 'תאריך יצירת המסמך' : 'Document Created',     createdStr],
              [isHe ? 'תאריך ושעת חתימה'  : 'Signature Timestamp',  dateTimeStr],
              [isHe ? 'פלטפורמה'           : 'Platform',             forceWrap('DealSpace — dealspace.app')],
            ].map(([label, value], idx, arr) => (
              <View key={idx} style={idx === arr.length - 1 ? s.certAuditRowLast : s.certAuditRow}>
                <Text style={s.certAuditLabel}>{label}</Text>
                <Text style={s.certAuditValue}>{value}</Text>
              </View>
            ))}

            <View style={s.certAuditRow}>
              <Text style={s.certAuditLabel}>{isHe ? 'תוקף חוקי' : 'Legal Framework'}</Text>
              <Text style={s.certAuditValue}>
                {isHe ? 'חוק חתימה אלקטרונית, התשס״א-2001' : 'Electronic Signature Law, 5761-2001 (Israel)'}
              </Text>
            </View>
          </View>

          {/* Legal disclaimer */}
          <Text style={s.certLegalNote}>
            {isHe
              ? 'חתימה אלקטרונית זו כפופה לחוק חתימה אלקטרונית, התשס״א-2001. המסמך הינו ראיה לקבלת ההצעה ולהסכמת הצדדים. DealSpace מספקת שירות טכנולוגי בלבד ואינה צד להסכם. כל סכסוך ידון בבית המשפט המוסמך במחוז תל אביב-יפו.'
              : 'This electronic signature is legally binding under the Electronic Signature Law, 5761-2001. This document serves as evidence of proposal acceptance and agreement. DealSpace provides technological infrastructure only and is not a party to this agreement. Disputes shall be resolved in the competent courts of Tel Aviv-Jaffa.'}
          </Text>
        </View>

        {/* Cert footer */}
        <View style={s.certFooter}>
          <Text style={s.certFooterBrand}>DealSpace</Text>
          <Text style={s.certFooterText}>
            {isHe ? 'מסמך זה נוצר ואובטח על ידי DealSpace' : 'Generated & Secured by DealSpace'}
          </Text>
          <Text style={s.certFooterText}>{proposal.public_token.slice(0, 16)}…</Text>
        </View>
        </>)}

      </Page>
    </Document>
  )
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function generateProposalPdf(opts: PdfOptions): Promise<void> {
  const blob = await pdf(<ProposalDocument {...opts} />).toBlob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `DealSpace_${(opts.proposal.project_title || 'Proposal').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
