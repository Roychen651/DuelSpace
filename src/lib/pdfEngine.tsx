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
  signatureTimestamp?: Date
  isDraft?: boolean
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function getBrandColor(p: Proposal): string {
  const c = p.brand_color
  return c && /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#6366f1'
}

function getInitials(name?: string | null): string {
  if (!name) return 'DS'
  return name.split(' ').map(n => n[0] ?? '').join('').slice(0, 2).toUpperCase()
}

function fmtDate(d: Date | string): string {
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`
}

/** Time as HH:MM — always a SEPARATE Text node from the date to prevent Bidi scrambling */
function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function fmtCurrencyPdf(amount: number, currency: string): string {
  const n = Math.round(amount).toLocaleString('en-US')
  if (currency === 'ILS') return `${n} \u20AA`
  if (currency === 'USD') return `$${n}`
  if (currency === 'EUR') return `\u20AC${n}`
  if (currency === 'GBP') return `\u00A3${n}`
  return `${n} ${currency}`
}

function forceWrap(text: string): string {
  return text.replace(/([/.\-_@])/g, '$1\u200B')
}

// ─── TipTap HTML → PDF block parser ───────────────────────────────────────────

interface InlineFrag { text: string; bold: boolean; italic: boolean }
interface HtmlBlock  { type: 'h1' | 'h2' | 'h3' | 'p' | 'li'; frags: InlineFrag[] }

function parseHtml(html: string): HtmlBlock[] {
  if (!html) return []
  const decode = (s: string) =>
    s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"')
     .replace(/&nbsp;/g,' ').replace(/&#(\d+);/g,(_,n:string)=>String.fromCharCode(parseInt(n,10)))
  function inline(src: string): InlineFrag[] {
    const cleaned = src
      .replace(/<a(?:[^>]*)>([\s\S]*?)<\/a>/gi,'$1')
      .replace(/<(?!\/?(?:strong|b|em|i)\b)[^>]+>/gi,' ')
    const frags: InlineFrag[] = []
    const re = /<(strong|b|em|i)(?:[^>]*)>([\s\S]*?)<\/\1>|([^<]+)/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(decode(cleaned))) !== null) {
      if (m[1]) {
        const tag = m[1].toLowerCase()
        const t   = m[2].replace(/<[^>]+>/g,'').trim()
        if (t) frags.push({ text:t, bold:tag==='strong'||tag==='b', italic:tag==='em'||tag==='i' })
      } else if (m[3]?.trim()) {
        frags.push({ text:m[3], bold:false, italic:false })
      }
    }
    if (!frags.length) {
      const plain = decode(cleaned.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()
      if (plain) frags.push({ text:plain, bold:false, italic:false })
    }
    return frags
  }
  const blocks: HtmlBlock[] = []
  const re = /<(h[1-3]|p|li)(?:[^>]*)>([\s\S]*?)<\/\1>/gi
  let bm: RegExpExecArray | null
  let found = false
  while ((bm = re.exec(html)) !== null) {
    found = true
    const tag = bm[1].toLowerCase()
    const type: HtmlBlock['type'] = tag==='h1'?'h1':tag==='h2'?'h2':tag==='h3'?'h3':tag==='li'?'li':'p'
    const frags = inline(bm[2])
    if (frags.length) blocks.push({ type, frags })
  }
  if (!found) {
    const plain = decode(html.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim()
    if (plain) blocks.push({ type:'p', frags:[{ text:plain, bold:false, italic:false }] })
  }
  return blocks
}

// ─── White Paper Palette ───────────────────────────────────────────────────────

const C = {
  bg:         '#FFFFFF',
  surface:    '#F9FAFB',
  border:     '#E5E7EB',
  borderDark: '#D1D5DB',
  text:       '#111827',
  textSec:    '#1F2937',
  muted:      '#6B7280',
  dim:        '#9CA3AF',
  white:      '#FFFFFF',
  successDark:'#15803D',
}

// ─── Style factory ─────────────────────────────────────────────────────────────

function makeStyles(brand: string) {
  return StyleSheet.create({

    // Pages
    coverPage:   { fontFamily:'Heebo', backgroundColor:C.bg, flexDirection:'column' },
    contentPage: { fontFamily:'Heebo', backgroundColor:C.bg, paddingTop:48, paddingBottom:40 },
    certPage:    { fontFamily:'Heebo', backgroundColor:C.bg },

    // ── Cover ─────────────────────────────────────────────────────────────────
    coverHero: {
      backgroundColor: brand,
      paddingHorizontal: 40,
      paddingTop: 36,
      paddingBottom: 32,
    },
    coverHeroInner: { alignItems: 'center' },
    coverLogoBox: {
      width: 52, height: 52, borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 12,
    },
    coverInitialText:  { fontSize:18, fontWeight:900, color:C.white },
    coverCompany:      { fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.95)', textAlign:'center', marginBottom:3 },
    coverDocLabel:     { fontSize:8, color:'rgba(255,255,255,0.60)', letterSpacing:2, textTransform:'uppercase', textAlign:'center' },
    coverAccentBar:    { height:4, backgroundColor:'rgba(255,255,255,0.18)' },

    // Cover body — vertically centered, everything center-aligned
    coverBody: {
      paddingHorizontal: 44,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    coverTitle: {
      fontSize:30, fontWeight:900, color:C.text,
      textAlign:'center', marginBottom:28, lineHeight:1.3, flexWrap:'wrap',
    },
    coverDivider: { height:1, backgroundColor:C.border, width:'100%', marginBottom:20 },
    coverPreparedLabel: {
      fontSize:7, fontWeight:700, color:brand, letterSpacing:2,
      textTransform:'uppercase', textAlign:'center', marginBottom:6,
    },
    coverClientName:    { fontSize:16, fontWeight:700, color:C.text, textAlign:'center', marginBottom:3 },
    coverClientCompany: { fontSize:10, color:C.muted, textAlign:'center' },
    coverMetaRow: {
      flexDirection:'row', justifyContent:'center', gap:14,
      marginTop:24, paddingTop:14, borderTop:`1px solid ${C.border}`,
    },
    coverMetaText: { fontSize:8, color:C.muted },

    // ── Fixed page header ──────────────────────────────────────────────────────
    pageHeader: {
      position:'absolute', top:0, left:0, right:0, height:38,
      flexDirection:'row', alignItems:'center', justifyContent:'space-between',
      paddingHorizontal:28, backgroundColor:C.bg, borderBottom:`1px solid ${C.border}`,
    },
    pageHeaderLeft:    { flexDirection:'row', alignItems:'center', gap:8 },
    pageHeaderBar:     { width:3, height:14, backgroundColor:brand, borderRadius:2 },
    pageHeaderCompany: { fontSize:8, fontWeight:700, color:C.text },
    pageHeaderDoc:     { fontSize:7.5, color:C.muted },
    pageHeaderPage:    { fontSize:7.5, color:C.muted },

    // ── Fixed page footer ──────────────────────────────────────────────────────
    pageFooter: {
      position:'absolute', bottom:0, left:0, right:0, height:28,
      flexDirection:'row', alignItems:'center', justifyContent:'space-between',
      paddingHorizontal:28, borderTop:`1px solid ${C.border}`, backgroundColor:C.bg,
    },
    pageFooterBrand: { fontSize:7, fontWeight:700, color:brand },
    pageFooterText:  { fontSize:7, color:C.dim },

    // ── Section chrome ─────────────────────────────────────────────────────────
    section:        { paddingHorizontal:28, paddingTop:16, paddingBottom:10 },
    sectionTitle: {
      fontSize:7.5, fontWeight:700, color:brand, letterSpacing:1.6,
      textTransform:'uppercase', textAlign:'right', marginBottom:10,
      paddingBottom:6, borderBottom:`1.5px solid ${C.border}`,
    },
    sectionDivider: { height:1, backgroundColor:C.border, marginHorizontal:28 },

    // ── Parties ─────────────────────────────────────────────────────────────────
    partyRow:   { flexDirection:'row', gap:12 },
    partyBox:   { flex:1, borderRadius:6, padding:12, backgroundColor:C.surface, border:`1px solid ${C.border}` },
    partyLabel: {
      fontSize:6.5, fontWeight:700, color:brand, letterSpacing:1.2,
      textTransform:'uppercase', textAlign:'right', marginBottom:6,
      paddingBottom:4, borderBottom:`1px solid ${C.border}`,
    },
    partyName:  { fontSize:10.5, fontWeight:700, color:C.text, textAlign:'right', marginBottom:4 },
    // Iron Grid row inside party box
    partyFieldRow:  { flexDirection:'row-reverse', marginBottom:2 },
    partyFieldLabel:{ width:'40%', textAlign:'right', fontSize:7.5, color:C.muted },
    partyFieldValue:{ width:'60%', textAlign:'left',  fontSize:7.5, color:C.textSec },

    // ── Description ─────────────────────────────────────────────────────────────
    descText: { fontSize:9, color:C.textSec, lineHeight:1.7, textAlign:'right' },
    htmlH1:   { fontSize:13, fontWeight:900, color:C.text,  textAlign:'right', marginBottom:5, marginTop:10 },
    htmlH2:   { fontSize:11, fontWeight:700, color:C.text,  textAlign:'right', marginBottom:4, marginTop:8 },
    htmlH3:   { fontSize:10, fontWeight:700, color:brand,   textAlign:'right', marginBottom:3, marginTop:7 },
    htmlP:    { fontSize:8.5, color:C.textSec, lineHeight:1.65, textAlign:'right', marginBottom:5 },
    htmlLi:   { fontSize:8.5, color:C.textSec, lineHeight:1.65, textAlign:'right', marginBottom:3, paddingRight:10 },
    htmlBold: { fontWeight:700, color:C.text },

    // ── Pricing table ───────────────────────────────────────────────────────────
    tableHeader: {
      flexDirection:'row-reverse', alignItems:'center',
      backgroundColor:brand, borderRadius:4,
      paddingHorizontal:14, paddingVertical:7,
    },
    tableHeaderCell: { fontSize:7.5, fontWeight:700, color:C.white, letterSpacing:1, textTransform:'uppercase' },
    tableRow: {
      flexDirection:'row-reverse', alignItems:'flex-start',
      paddingHorizontal:14, paddingVertical:8,
      borderBottom:`1px solid ${C.border}`, backgroundColor:C.bg,
    },
    tableRowAlt: {
      flexDirection:'row-reverse', alignItems:'flex-start',
      paddingHorizontal:14, paddingVertical:8,
      borderBottom:`1px solid ${C.border}`, backgroundColor:C.surface,
    },
    tableLabel:    { fontSize:9.5, color:C.text,  textAlign:'right' },
    tableLabelSub: { fontSize:7.5, color:C.muted, textAlign:'right', marginTop:2 },
    tablePrice:    { fontSize:10,  color:C.text,  fontWeight:700, width:'35%', textAlign:'left' },

    // ── VAT / discount box ──────────────────────────────────────────────────────
    vatBox: {
      marginHorizontal:28, marginTop:10, borderRadius:6,
      padding:12, backgroundColor:C.surface, border:`1px solid ${C.border}`,
    },
    vatRow:        { flexDirection:'row-reverse', marginBottom:4 },
    vatLabel:      { fontSize:8.5, color:C.muted,    textAlign:'right', width:'60%' },
    vatValue:      { fontSize:8.5, fontWeight:700, color:C.textSec, width:'40%', textAlign:'left' },
    vatDivider:    { height:1, backgroundColor:C.border, marginVertical:6 },
    vatTotalLabel: { fontSize:10, fontWeight:700, color:C.text, textAlign:'right', width:'60%' },
    vatTotalValue: { fontSize:10, fontWeight:700, color:C.text, width:'40%', textAlign:'left' },

    // ── Grand total ─────────────────────────────────────────────────────────────
    totalBox: {
      marginHorizontal:28, marginTop:12, borderRadius:6,
      paddingHorizontal:18, paddingVertical:14,
      backgroundColor:C.surface, border:`1.5px solid ${C.borderDark}`,
      borderLeft:`4px solid ${brand}`,
      flexDirection:'row-reverse', alignItems:'center',
    },
    totalLabel: { fontSize:11, fontWeight:700, color:C.text, textAlign:'right', width:'55%' },
    totalValue: { fontSize:22, fontWeight:900, color:brand,  width:'45%', textAlign:'left' },

    // ── Milestones ──────────────────────────────────────────────────────────────
    milestoneHeader: {
      flexDirection:'row', alignItems:'center',
      backgroundColor:brand, borderRadius:4,
      paddingHorizontal:14, paddingVertical:7,
    },
    milestoneHeaderCell: { fontSize:7.5, fontWeight:700, color:C.white, letterSpacing:1, textTransform:'uppercase' },
    milestoneRow: {
      flexDirection:'column',
      paddingHorizontal:14, paddingVertical:8, borderBottom:`1px solid ${C.border}`,
    },
    milestoneRowAlt: {
      flexDirection:'column',
      paddingHorizontal:14, paddingVertical:8,
      borderBottom:`1px solid ${C.border}`, backgroundColor:C.surface,
    },
    milestoneNumBadge: {
      width:20, height:20, borderRadius:10,
      backgroundColor:brand, alignItems:'center', justifyContent:'center',
      marginLeft:10, flexShrink:0,
    },
    milestoneNumText: { fontSize:7.5, fontWeight:700, color:C.white },
    milestoneName:    { fontSize:9.5, color:C.text,  textAlign:'right', flex:1 },
    milestonePct:     { fontSize:8.5, color:C.muted, fontWeight:700, width:50, textAlign:'center' },
    milestoneAmt:     { fontSize:10,  color:C.text,  fontWeight:700, width:80, textAlign:'left' },
    milestoneBarBg:   { height:2, backgroundColor:C.border, borderRadius:1, marginTop:5 },
    milestoneBarFill: { height:2, backgroundColor:brand, borderRadius:1 },

    // ── Terms ───────────────────────────────────────────────────────────────────
    termsPara: { fontSize:8, color:C.muted, lineHeight:1.65, textAlign:'right', marginBottom:6 },

    // ── Cert page ───────────────────────────────────────────────────────────────
    certHero: {
      backgroundColor:brand, paddingHorizontal:36, paddingVertical:26,
      flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    },
    certHeroTitle: { fontSize:16, fontWeight:900, color:C.white, textAlign:'right' },
    certHeroSub:   { fontSize:8.5, color:'rgba(255,255,255,0.70)', textAlign:'right', marginTop:4 },
    certCheckCircle: {
      width:44, height:44, borderRadius:22,
      backgroundColor:'rgba(255,255,255,0.22)',
      alignItems:'center', justifyContent:'center', flexShrink:0,
    },
    certCheckText: { fontSize:20, fontWeight:900, color:C.white },
    certBody:      { paddingHorizontal:36, paddingTop:24, paddingBottom:36 },

    // Signature row
    certSigRow: { flexDirection:'row', gap:20, marginBottom:20 },
    certSigBox: {
      width:160, height:80, borderRadius:6,
      border:`1px solid ${C.borderDark}`, backgroundColor:C.surface,
      overflow:'hidden', flexShrink:0,
      alignItems:'center', justifyContent:'center',
    },
    // Explicit px dimensions — objectFit is unreliable in @react-pdf/renderer v4
    certSigImage:  { width:156, height:72 },
    certSigMeta:   { flex:1 },
    certSigBadge:  { fontSize:9.5, fontWeight:700, color:C.successDark, marginBottom:10, textAlign:'right' },

    // Iron Grid row inside sig meta (label RIGHT 38%, value LEFT 62%)
    certSigIronRow:   { flexDirection:'row-reverse', marginBottom:4 },
    certSigIronLabel: { width:'38%', textAlign:'right', fontSize:7.5, color:C.muted },
    certSigIronValue: { width:'62%', textAlign:'left',  fontSize:7.5, fontWeight:700, color:C.text },

    // Token box
    certTokenBox: {
      borderRadius:6, border:`1px solid ${C.border}`, backgroundColor:C.surface,
      paddingHorizontal:14, paddingVertical:10, marginBottom:14,
    },
    certTokenLabel: { fontSize:7, fontWeight:700, color:brand, letterSpacing:1.5, textTransform:'uppercase', textAlign:'right', marginBottom:5 },
    certTokenValue: { fontSize:8, color:C.textSec, textAlign:'right', letterSpacing:0.3 },

    // Audit trail
    certAuditBox: { borderRadius:6, border:`1px solid ${C.border}`, overflow:'hidden', marginBottom:14 },
    certAuditTitle: {
      fontSize:7.5, fontWeight:700, color:C.white, letterSpacing:1.5,
      textTransform:'uppercase', textAlign:'right',
      paddingHorizontal:14, paddingVertical:7, backgroundColor:brand,
    },
    // Iron Grid audit rows — label LEFT 38%, value RIGHT 62% in row-reverse
    certAuditRow: {
      flexDirection:'row-reverse', paddingHorizontal:14, paddingVertical:5,
      borderBottom:`1px solid ${C.border}`, backgroundColor:C.bg,
    },
    certAuditRowAlt: {
      flexDirection:'row-reverse', paddingHorizontal:14, paddingVertical:5,
      borderBottom:`1px solid ${C.border}`, backgroundColor:C.surface,
    },
    certAuditRowLast:    { flexDirection:'row-reverse', paddingHorizontal:14, paddingVertical:5, backgroundColor:C.bg },
    certAuditRowLastAlt: { flexDirection:'row-reverse', paddingHorizontal:14, paddingVertical:5, backgroundColor:C.surface },
    certAuditLabel: { width:'40%', textAlign:'right', fontSize:7.5, color:C.muted },
    certAuditValue: { width:'60%', textAlign:'left',  fontSize:7.5, fontWeight:700, color:C.text },
    // Date + time sub-row (two separate Text nodes, never concatenated)
    certAuditDateRow: { width:'60%', flexDirection:'row', gap:6 },

    certLegalNote: {
      fontSize:7, color:C.dim, lineHeight:1.6, textAlign:'right',
      borderTop:`1px solid ${C.border}`, paddingTop:10,
    },
    certFooter: {
      position:'absolute', bottom:0, left:0, right:0, height:30,
      flexDirection:'row', alignItems:'center', justifyContent:'space-between',
      paddingHorizontal:36, borderTop:`1px solid ${C.border}`, backgroundColor:C.bg,
    },
    certFooterBrand: { fontSize:7, fontWeight:700, color:brand },
    certFooterText:  { fontSize:7, color:C.dim },
  })
}

// ─── HTML block renderer ────────────────────────────────────────────────────────

function HtmlBlocks({ blocks, s }: { blocks: HtmlBlock[]; s: ReturnType<typeof makeStyles> }) {
  return (
    <>
      {blocks.map((block, i) => {
        const base = block.type==='h1'?s.htmlH1:block.type==='h2'?s.htmlH2:block.type==='h3'?s.htmlH3:block.type==='li'?s.htmlLi:s.htmlP
        return (
          <Text key={i} style={base}>
            {block.type==='li'?'• ':''}
            {block.frags.map((f,j)=>(
              <Text key={j} style={f.bold?s.htmlBold:{}}>{f.text}</Text>
            ))}
          </Text>
        )
      })}
    </>
  )
}

// ─── PDF Document ──────────────────────────────────────────────────────────────

function ProposalDocument(opts: PdfOptions) {
  const { proposal, enabledAddOnIds, signatureDataUrl, locale, isDraft=false } = opts
  // Timestamp priority (legal document — must never use download time):
  // 1. signatureTimestamp from caller (already resolved to accepted_at)
  // 2. proposal.accepted_at — DB trigger sets this at the instant the client signs
  // 3. proposal.updated_at — last resort, always populated
  // new Date() is NEVER used for signed proposals
  const sigTs = opts.signatureTimestamp
    ?? (proposal.accepted_at ? new Date(proposal.accepted_at) : null)
    ?? new Date(proposal.updated_at)
  const isHe     = locale === 'he'
  const brand    = getBrandColor(proposal)
  const s        = makeStyles(brand)

  const enabledAddOns = proposal.add_ons.filter(a => enabledAddOnIds.includes(a.id))
  const milestones    = proposal.payment_milestones ?? []

  const vatRate = (() => {
    try {
      const v = parseFloat(localStorage.getItem('dealspace:vat-rate') ?? '')
      return isNaN(v) ? DEFAULT_VAT_RATE : v
    } catch { return DEFAULT_VAT_RATE }
  })()

  const lineItemsOverride: Record<string,{enabled:boolean;qty:number}> = {}
  proposal.add_ons.forEach(a => {
    lineItemsOverride[a.id] = {
      enabled: enabledAddOnIds.includes(a.id),
      qty: a.default_quantity ?? 1,
    }
  })

  const fin          = calculateFinancials(proposal, lineItemsOverride, vatRate)
  const displayTotal = fin.grandTotal
  const totalSavings = fin.totalSavings

  const creator      = proposal.creator_info
  const providerName = creator?.company_name?.trim() || creator?.full_name?.trim() || 'DealSpace Creator'
  const companyName  = creator?.company_name?.trim() || 'DealSpace'
  const initials     = getInitials(creator?.company_name)
  const projectTitle = proposal.project_title || (isHe ? 'הצעת מחיר' : 'Proposal')
  const dateStr      = fmtDate(sigTs)
  const timeStr      = fmtTime(sigTs)
  const createdStr   = fmtDate(proposal.created_at)
  const descBlocks   = proposal.description ? parseHtml(proposal.description) : []

  // ── Iron Grid row helpers ─────────────────────────────────────────────────────
  // Each row: label in a fixed right-aligned View, value in a fixed left-aligned View.
  // The colon lives INSIDE the label View (never concatenated with a dynamic value).
  // The fixed widths prevent any floating or overlap regardless of Bidi context.

  function AuditRow({ label, value, idx, total }: { label:string; value:string; idx:number; total:number }) {
    const isLast = idx === total - 1
    const isAlt  = idx % 2 !== 0
    const rowStyle = isLast ? (isAlt ? s.certAuditRowLastAlt : s.certAuditRowLast)
                             : (isAlt ? s.certAuditRowAlt     : s.certAuditRow)
    return (
      <View style={rowStyle}>
        <View style={{ width:'40%' }}>
          <Text style={s.certAuditLabel}>{label}</Text>
        </View>
        <View style={{ width:'60%' }}>
          <Text style={s.certAuditValue}>{value}</Text>
        </View>
      </View>
    )
  }

  function AuditDateRow({ label, date, time, idx, total }: { label:string; date:string; time:string; idx:number; total:number }) {
    const isLast = idx === total - 1
    const isAlt  = idx % 2 !== 0
    const rowStyle = isLast ? (isAlt ? s.certAuditRowLastAlt : s.certAuditRowLast)
                             : (isAlt ? s.certAuditRowAlt     : s.certAuditRow)
    return (
      <View style={rowStyle}>
        <View style={{ width:'40%' }}>
          <Text style={s.certAuditLabel}>{label}</Text>
        </View>
        {/* Date and time are SEPARATE Text nodes — never concatenated to avoid Bidi scrambling */}
        <View style={s.certAuditDateRow}>
          <Text style={s.certAuditValue}>{date}</Text>
          <Text style={s.certAuditValue}>{time}</Text>
        </View>
      </View>
    )
  }

  function SigMetaRow({ label, value }: { label:string; value:string }) {
    return (
      <View style={s.certSigIronRow}>
        <View style={{ width:'38%' }}>
          <Text style={s.certSigIronLabel}>{label}</Text>
        </View>
        <View style={{ width:'62%' }}>
          <Text style={s.certSigIronValue}>{value}</Text>
        </View>
      </View>
    )
  }

  function PartyField({ label, value }: { label:string; value:string }) {
    return (
      <View style={s.partyFieldRow}>
        <View style={{ width:'40%' }}>
          <Text style={s.partyFieldLabel}>{label}</Text>
        </View>
        <View style={{ width:'60%' }}>
          <Text style={s.partyFieldValue}>{value}</Text>
        </View>
      </View>
    )
  }

  // Audit trail rows definition
  const auditRows: Array<{ label:string; value:string; isDate?:boolean; date?:string; time?:string }> = [
    { label: isHe ? 'שם הפרויקט'        : 'Project Title',    value: projectTitle },
    { label: isHe ? 'נותן השירות'        : 'Service Provider', value: providerName },
    { label: isHe ? 'הלקוח'             : 'Client',           value: proposal.client_name ?? '—' },
    { label: isHe ? 'סכום החוזה'         : 'Contract Value',   value: fmtCurrencyPdf(displayTotal, proposal.currency) },
    { label: isHe ? 'תאריך יצירת המסמך' : 'Document Created', value: createdStr },
    { label: isHe ? 'תאריך ושעת חתימה'  : 'Signature Timestamp', value: '', isDate:true, date:dateStr, time:timeStr },
    { label: isHe ? 'פלטפורמה'           : 'Platform',         value: forceWrap('DealSpace — dealspace.app') },
    { label: isHe ? 'תוקף חוקי'          : 'Legal Framework',  value: isHe ? 'חוק חתימה אלקטרונית, התשס״א-2001' : 'Electronic Signature Law, 5761-2001 (Israel)' },
    ...(proposal.signer_ip ? [
      { label: isHe ? 'כתובת IP'    : 'Signer IP',      value: proposal.signer_ip },
    ] : []),
  ]

  return (
    <Document
      title={projectTitle}
      author={companyName}
      creator="DealSpace"
      producer="DealSpace"
      subject={isHe ? 'הסכם התקשרות והצעת מחיר' : 'Proposal & Service Agreement'}
    >

      {/* ════════════════════════════════════════════════════════════
          PAGE 1 — COVER
      ════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.coverPage}>

        {isDraft && (
          <View fixed style={{ position:'absolute', top:0, left:0, right:0, bottom:0, justifyContent:'center', alignItems:'center', zIndex:999 }}>
            <Text style={{ fontSize:72, fontWeight:900, color:'rgba(220,38,38,0.06)', transform:'rotate(-45deg)', letterSpacing:8, textTransform:'uppercase' }}>
              {isHe ? 'טיוטה' : 'DRAFT'}
            </Text>
          </View>
        )}

        {/* B'H marker */}
        {proposal.display_bsd && (
          <Text style={{ position:'absolute', top:12, right:16, fontSize:9, fontWeight:700, color:'#9CA3AF', textAlign:'right' }}>
            {'\u05D1\u05E1\u05F4\u05D3'}
          </Text>
        )}

        {/* Hero strip — brand color */}
        <View style={s.coverHero}>
          <View style={s.coverHeroInner}>
            {creator?.logo_url ? (
              <View style={{ marginBottom:10 }}>
                <Image src={creator.logo_url} style={{ width:100, height:36, objectFit:'contain' }} />
              </View>
            ) : (
              <View style={s.coverLogoBox}>
                <Text style={s.coverInitialText}>{initials}</Text>
              </View>
            )}
            <Text style={s.coverCompany}>{companyName}</Text>
            <Text style={s.coverDocLabel}>
              {proposal.is_document_only
                ? (isHe ? 'הסכם התקשרות' : 'SERVICE AGREEMENT')
                : (isHe ? 'הסכם התקשרות והצעת מחיר' : 'PROPOSAL & SERVICE AGREEMENT')}
            </Text>
          </View>
        </View>

        <View style={s.coverAccentBar} />

        {/* Body — vertically & horizontally centered */}
        <View style={s.coverBody}>
          <Text style={s.coverTitle}>{projectTitle}</Text>

          <View style={s.coverDivider} />

          <Text style={s.coverPreparedLabel}>{isHe ? 'הוכן עבור' : 'PREPARED FOR'}</Text>
          <Text style={s.coverClientName}>
            {proposal.client_name || (isHe ? 'לקוח' : 'Client')}
          </Text>
          {proposal.client_company_name
            ? <Text style={s.coverClientCompany}>{proposal.client_company_name}</Text>
            : null}

          <View style={s.coverMetaRow}>
            <Text style={s.coverMetaText}>{dateStr}</Text>
            <Text style={s.coverMetaText}>·</Text>
            <Text style={s.coverMetaText}>
              {isHe ? 'מזהה' : 'ID'}: {proposal.public_token.slice(0,12)}…
            </Text>
          </View>
        </View>
      </Page>

      {/* ════════════════════════════════════════════════════════════
          PAGE 2+ — CONTENT
      ════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.contentPage}>

        <View style={s.pageHeader} fixed>
          <View style={s.pageHeaderLeft}>
            <View style={s.pageHeaderBar} />
            <Text style={s.pageHeaderCompany}>{companyName}</Text>
            <Text style={s.pageHeaderDoc}>  ·  {projectTitle}</Text>
          </View>
          <Text style={s.pageHeaderPage} render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`} />
        </View>

        {/* ── Parties ─────────────────────────────────────────────── */}
        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>{isHe ? 'צדדים להסכם' : 'PARTIES TO THE AGREEMENT'}</Text>
          <View style={s.partyRow}>

            {/* Side A — Service Provider */}
            <View style={s.partyBox}>
              <Text style={s.partyLabel}>{isHe ? "צד א' — נותן השירות" : "SIDE A — SERVICE PROVIDER"}</Text>
              {(creator?.company_name || creator?.full_name) && (
                <Text style={s.partyName}>{creator.company_name || creator.full_name}</Text>
              )}
              {creator?.full_name && creator?.company_name && (
                <PartyField label={isHe ? 'שם' : 'Name'} value={creator.full_name} />
              )}
              {creator?.tax_id && (
                <PartyField label={isHe ? 'ח.פ / עוסק' : 'Tax ID'} value={creator.tax_id} />
              )}
              {creator?.address && (
                <PartyField label={isHe ? 'כתובת' : 'Address'} value={creator.address} />
              )}
              {creator?.phone && (
                <PartyField label={isHe ? 'טלפון' : 'Phone'} value={creator.phone} />
              )}
              {creator?.signatory_name && (
                <PartyField label={isHe ? 'מורשה חתימה' : 'Signatory'} value={creator.signatory_name} />
              )}
            </View>

            {/* Side B — Client */}
            <View style={s.partyBox}>
              <Text style={s.partyLabel}>{isHe ? "צד ב' — הלקוח" : "SIDE B — CLIENT"}</Text>
              {proposal.client_name && (
                <Text style={s.partyName}>{proposal.client_name}</Text>
              )}
              {proposal.client_company_name && (
                <PartyField label={isHe ? 'חברה' : 'Company'} value={proposal.client_company_name} />
              )}
              {proposal.client_tax_id && (
                <PartyField label={isHe ? 'ח.פ / ת.ז' : 'Tax ID'} value={proposal.client_tax_id} />
              )}
              {proposal.client_address && (
                <PartyField label={isHe ? 'כתובת' : 'Address'} value={proposal.client_address} />
              )}
              {proposal.client_email && (
                <PartyField label={isHe ? 'אימייל' : 'Email'} value={proposal.client_email} />
              )}
              {proposal.client_signer_role && (
                <PartyField label={isHe ? 'תפקיד' : 'Role'} value={proposal.client_signer_role} />
              )}
            </View>

          </View>
        </View>

        <View style={s.sectionDivider} />

        {/* ── Project description ──────────────────────────────────── */}
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

        {/* ── Pricing breakdown ──────────────────────────────────────── */}
        {!proposal.is_document_only && <View style={s.section}>
          <Text style={s.sectionTitle}>{isHe ? 'פירוט מחירים ושירותים' : 'SERVICES & PRICING'}</Text>

          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell,{width:'65%',textAlign:'right'}]}>
              {isHe ? 'פריט / שירות' : 'ITEM / SERVICE'}
            </Text>
            <Text style={[s.tableHeaderCell,{width:'35%',textAlign:'left'}]}>
              {isHe ? 'מחיר' : 'PRICE'}
            </Text>
          </View>

          <View style={s.tableRowAlt} wrap={false}>
            <View style={{width:'65%'}}>
              <Text style={s.tableLabel}>{isHe ? 'חבילת בסיס' : 'Base Package'}</Text>
            </View>
            <Text style={s.tablePrice}>{fmtCurrencyPdf(proposal.base_price, proposal.currency)}</Text>
          </View>

          {enabledAddOns.map((a, idx) => {
            const aqty = lineItemsOverride[a.id]?.qty ?? 1
            const disc = a.discount_pct || 0
            const unitPrice = Math.round(a.price * (1 - disc / 100))
            const lineTotal = unitPrice * aqty
            return (
              <View key={a.id} style={idx%2===0 ? s.tableRow : s.tableRowAlt} wrap={false}>
                <View style={{width:'65%',flexDirection:'column'}}>
                  <Text style={s.tableLabel}>{a.label}</Text>
                  {a.description ? <Text style={s.tableLabelSub}>{a.description}</Text> : null}
                  {aqty > 1 && (
                    <Text style={s.tableLabelSub}>
                      {`${aqty} × ${fmtCurrencyPdf(unitPrice, proposal.currency)}`}
                    </Text>
                  )}
                </View>
                <Text style={s.tablePrice}>{fmtCurrencyPdf(lineTotal, proposal.currency)}</Text>
              </View>
            )
          })}
        </View>}

        {/* ── Discount + VAT ─────────────────────────────────────────── */}
        {!proposal.is_document_only && (totalSavings > 0 || proposal.include_vat) && (
          <View style={s.vatBox} wrap={false}>
            {totalSavings > 0 && (
              <>
                <View style={s.vatRow}>
                  <Text style={s.vatLabel}>{isHe ? 'מחיר מלא' : 'Full Price'}</Text>
                  <Text style={s.vatValue}>{fmtCurrencyPdf(fin.originalGrandTotal, proposal.currency)}</Text>
                </View>
                <View style={s.vatRow}>
                  <Text style={[s.vatLabel,{color:C.successDark}]}>{isHe ? 'הנחה' : 'Discount'}</Text>
                  {/* Minus sign is first char — prevents Bidi flip */}
                  <Text style={[s.vatValue,{color:C.successDark}]}>
                    {`- ${fmtCurrencyPdf(totalSavings, proposal.currency)}`}
                  </Text>
                </View>
                {!proposal.include_vat && <View style={s.vatDivider} />}
              </>
            )}
            {proposal.include_vat && (
              <>
                {proposal.prices_include_vat ? (
                  <>
                    {/* Prices include VAT — show "of which" breakdown */}
                    <View style={s.vatRow}>
                      <Text style={s.vatLabel}>
                        {isHe ? `מתוכם מע״מ (${Math.round(vatRate*100)}%)` : `Of which VAT (${Math.round(vatRate*100)}%)`}
                      </Text>
                      <Text style={s.vatValue}>{fmtCurrencyPdf(fin.vatAmount, proposal.currency)}</Text>
                    </View>
                    <View style={s.vatRow}>
                      <Text style={s.vatLabel}>{isHe ? 'לפני מע״מ' : 'Before VAT'}</Text>
                      <Text style={s.vatValue}>{fmtCurrencyPdf(fin.beforeVat, proposal.currency)}</Text>
                    </View>
                    <View style={s.vatDivider} />
                    <View style={s.vatRow}>
                      <Text style={s.vatTotalLabel}>{isHe ? 'סה״כ כולל מע״מ' : 'Total incl. VAT'}</Text>
                      <Text style={s.vatTotalValue}>{fmtCurrencyPdf(displayTotal, proposal.currency)}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Prices are net — show "add VAT" breakdown */}
                    <View style={s.vatRow}>
                      <Text style={s.vatLabel}>{isHe ? 'סה״כ לפני מע״מ' : 'Subtotal (ex. VAT)'}</Text>
                      <Text style={s.vatValue}>{fmtCurrencyPdf(fin.beforeVat, proposal.currency)}</Text>
                    </View>
                    <View style={s.vatRow}>
                      <Text style={s.vatLabel}>
                        {isHe ? `${Math.round(vatRate*100)}% מע״מ` : `VAT ${Math.round(vatRate*100)}%`}
                      </Text>
                      <Text style={s.vatValue}>{fmtCurrencyPdf(fin.vatAmount, proposal.currency)}</Text>
                    </View>
                    <View style={s.vatDivider} />
                    <View style={s.vatRow}>
                      <Text style={s.vatTotalLabel}>{isHe ? 'סה״כ כולל מע״מ' : 'Total incl. VAT'}</Text>
                      <Text style={s.vatTotalValue}>{fmtCurrencyPdf(displayTotal, proposal.currency)}</Text>
                    </View>
                  </>
                )}
              </>
            )}
            {totalSavings > 0 && !proposal.include_vat && (
              <View style={s.vatRow}>
                <Text style={s.vatTotalLabel}>{isHe ? 'סה״כ לאחר הנחה' : 'Total after discount'}</Text>
                <Text style={s.vatTotalValue}>{fmtCurrencyPdf(displayTotal, proposal.currency)}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Grand total ──────────────────────────────────────────── */}
        {!proposal.is_document_only && !proposal.hide_grand_total && <View style={s.totalBox} wrap={false}>
          <Text style={s.totalLabel}>
            {isHe
              ? (proposal.include_vat ? 'סה״כ לתשלום (כולל מע״מ)' : 'סה״כ להשקעה')
              : (proposal.include_vat ? 'Grand Total (incl. VAT)' : 'Total Investment')}
          </Text>
          <Text style={s.totalValue}>{fmtCurrencyPdf(displayTotal, proposal.currency)}</Text>
        </View>}

        {/* ── Payment milestones ──────────────────────────────────────── */}
        {!proposal.is_document_only && milestones.length > 0 && (
          <>
            <View style={[s.section,{marginTop:8}]}>
              <Text style={s.sectionTitle}>
                {isHe ? 'לוח תשלומים — אבני דרך' : 'PAYMENT SCHEDULE — MILESTONES'}
              </Text>
              <View style={s.milestoneHeader}>
                <View style={{width:30}} />
                <Text style={[s.milestoneHeaderCell,{flex:1,textAlign:'right'}]}>
                  {isHe ? 'שלב / מטרה' : 'MILESTONE'}
                </Text>
                <Text style={[s.milestoneHeaderCell,{width:50,textAlign:'center'}]}>%</Text>
                <Text style={[s.milestoneHeaderCell,{width:80,textAlign:'left'}]}>
                  {isHe ? 'סכום' : 'AMOUNT'}
                </Text>
              </View>
              {milestones.map((m, i) => {
                const amt = Math.round((m.percentage/100) * displayTotal)
                return (
                  <View key={m.id} style={i%2===0 ? s.milestoneRow : s.milestoneRowAlt} wrap={false}>
                    <View style={{ flexDirection:'row-reverse', alignItems:'center' }}>
                      <View style={s.milestoneNumBadge}>
                        <Text style={s.milestoneNumText}>{i+1}</Text>
                      </View>
                      <View style={{flex:1}}>
                        <Text style={s.milestoneName}>
                          {m.name || (isHe ? `אבן דרך ${i+1}` : `Milestone ${i+1}`)}
                        </Text>
                      </View>
                      <Text style={s.milestonePct}>{m.percentage}%</Text>
                      <Text style={s.milestoneAmt}>{fmtCurrencyPdf(amt, proposal.currency)}</Text>
                    </View>
                    <View style={s.milestoneBarBg}>
                      <View style={[s.milestoneBarFill,{width:`${m.percentage}%` as unknown as number}]} />
                    </View>
                  </View>
                )
              })}
            </View>
            <View style={s.sectionDivider} />
          </>
        )}

        {/* ── Terms & Conditions ────────────────────────────────────── */}
        {/* Hebrew legal text rules:
            1. No "DealSpace" (Latin) embedded mid-Hebrew sentence — causes Bidi scrambling
            2. No trailing period after numbers or Latin (e.g. "2001.") — period takes LTR direction
            3. Each sentence is a separate <Text> node — shorter lines = fewer Bidi edge cases   */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isHe ? 'תנאים והתניות' : 'TERMS & CONDITIONS'}</Text>
          {isHe ? (
            <>
              <Text style={s.termsPara}>
                חתימה על הצעה זו מהווה הסכם מחייב בין הצדדים בהתאם לחוק חוזים (חלק כללי), תשל״ג-1973
              </Text>
              <Text style={s.termsPara}>
                תשלום יבוצע לפי לוח הזמנים המוסכם, וביטול לאחר חתימה כפוף לדמי ביטול
              </Text>
              <Text style={s.termsPara}>
                בעל העסק אינו אחראי לעיכובים שנגרמו מגורמים חיצוניים
              </Text>
              <Text style={s.termsPara}>
                שינויים בהיקף העבודה ידרשו הסכמה בכתב של שני הצדדים
              </Text>
              <Text style={s.termsPara}>
                מערכת החתימה משמשת כתשתית טכנולוגית בלבד ואינה צד להסכם
              </Text>
              <Text style={s.termsPara}>
                חתימה אלקטרונית זו כפופה לחוק חתימה אלקטרונית, התשס״א-2001
              </Text>
              <Text style={s.termsPara}>
                החוק החל הוא דין מדינת ישראל וכל סכסוך ידון בבית המשפט המוסמך במחוז תל אביב-יפו
              </Text>
            </>
          ) : (
            <>
              <Text style={s.termsPara}>
                Signing this proposal constitutes a binding agreement under applicable contract law.
              </Text>
              <Text style={s.termsPara}>
                Payment will be made per the agreed schedule. Cancellation after signing is subject to cancellation fees.
              </Text>
              <Text style={s.termsPara}>
                Neither the service provider nor DealSpace is liable for delays caused by external factors. Changes to scope require written agreement from both parties.
              </Text>
              <Text style={s.termsPara}>
                DealSpace serves solely as a technology intermediary and is not a party to this agreement.
              </Text>
              <Text style={s.termsPara}>
                This electronic signature is subject to applicable electronic signature laws. Governing law: State of Israel. Disputes resolved in the competent courts of Tel Aviv-Jaffa.
              </Text>
            </>
          )}
        </View>

        <View style={s.pageFooter} fixed>
          <Text style={s.pageFooterBrand}>DealSpace</Text>
          <Text style={s.pageFooterText}>dealspace.app</Text>
          <Text style={s.pageFooterText}>{proposal.public_token.slice(0,20)}…</Text>
        </View>

      </Page>

      {/* ════════════════════════════════════════════════════════════
          LAST PAGE — SIGNATURE CERTIFICATE  (or draft notice)
      ════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.certPage}>

        {isDraft ? (
          <>
            <View style={[s.certHero,{backgroundColor:'#7c3aed'}]}>
              <View>
                <Text style={s.certHeroTitle}>{isHe ? 'טיוטה — לא לתוקף משפטי' : 'DRAFT — NOT LEGALLY BINDING'}</Text>
                <Text style={s.certHeroSub}>{isHe ? 'מסמך זה הינו טיוטה לצורכי בדיקה בלבד' : 'This document is a preview for review purposes only'}</Text>
              </View>
              <View style={s.certCheckCircle}><Text style={s.certCheckText}>✎</Text></View>
            </View>
            <View style={s.certBody}>
              <View style={[s.certTokenBox,{marginBottom:24}]}>
                <Text style={s.certTokenLabel}>{isHe ? 'הודעה חשובה' : 'IMPORTANT NOTICE'}</Text>
                <Text style={[s.certTokenValue,{fontSize:10,lineHeight:1.7}]}>
                  {isHe
                    ? 'המסמך יקבל תוקף משפטי רק לאחר חתימה דיגיטלית של הלקוח במערכת DealSpace. טיוטה זו אינה מחייבת אף אחד מהצדדים.'
                    : "This document will become legally binding only after the client's digital signature via DealSpace. This draft does not obligate either party."}
                </Text>
              </View>
              <View style={s.certAuditBox}>
                <Text style={s.certAuditTitle}>{isHe ? 'פרטי הטיוטה' : 'DRAFT DETAILS'}</Text>
                {[
                  { label: isHe ? 'שם הפרויקט'  : 'Project Title',   value: projectTitle },
                  { label: isHe ? 'נותן השירות' : 'Service Provider', value: providerName },
                  { label: isHe ? 'לקוח'        : 'Client',           value: proposal.client_name ?? '—' },
                  { label: isHe ? 'סכום הצעה'   : 'Proposal Value',   value: fmtCurrencyPdf(displayTotal, proposal.currency) },
                ].map((row, idx, arr) => (
                  <AuditRow key={idx} label={row.label} value={row.value} idx={idx} total={arr.length + 1} />
                ))}
                <AuditDateRow label={isHe ? 'תאריך הפקה' : 'Generated'} date={createdStr} time={timeStr} idx={4} total={5} />
              </View>
              {isHe ? (
                <View style={{ borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                  <Text style={[s.certLegalNote, { borderTop:'none', paddingTop:0, marginBottom:2 }]}>
                    מסמך זה הופק לצורכי תצוגה מוקדמת בלבד
                  </Text>
                  <Text style={[s.certLegalNote, { borderTop:'none', paddingTop:0 }]}>
                    הוא אינו מהווה הסכם חתום ואינו מחייב משפטית
                  </Text>
                </View>
              ) : (
                <Text style={s.certLegalNote}>
                  This document was generated by DealSpace for preview purposes only. It is not legally binding.
                </Text>
              )}
            </View>
            <View style={s.certFooter}>
              <Text style={s.certFooterBrand}>DealSpace</Text>
              <Text style={s.certFooterText}>{isHe ? 'טיוטה — אין תוקף משפטי' : 'DRAFT — NOT LEGALLY BINDING'}</Text>
              <Text style={s.certFooterText}>{dateStr}</Text>
            </View>
          </>
        ) : (
          <>
            {/* Hero */}
            <View style={s.certHero}>
              <View style={{position:'absolute',top:-18,right:-18,width:90,height:90,borderRadius:45,backgroundColor:'rgba(255,255,255,0.06)'}} />
              <View>
                <Text style={s.certHeroTitle}>{isHe ? 'תעודת חתימה דיגיטלית' : 'DIGITAL SIGNATURE CERTIFICATE'}</Text>
                <Text style={s.certHeroSub}>
                  {isHe ? 'מסמך זה נחתם דיגיטלית ואובטח באמצעות מערכת DealSpace' : 'This document was digitally signed and secured via DealSpace'}
                </Text>
              </View>
              <View style={s.certCheckCircle}><Text style={s.certCheckText}>✓</Text></View>
            </View>

            <View style={s.certBody}>

              {/* ── Signature box + Iron Grid metadata ─── */}
              <View style={s.certSigRow} wrap={false}>
                {/* Signature image — always rendered when dataUrl exists */}
                <View style={s.certSigBox}>
                  {signatureDataUrl?.startsWith('data:image') ? (
                    <Image src={signatureDataUrl} style={s.certSigImage} />
                  ) : (
                    <Text style={{fontSize:8,color:C.dim,textAlign:'center'}}>
                      {isHe ? 'חתימה' : 'Signature'}
                    </Text>
                  )}
                </View>

                <View style={s.certSigMeta}>
                  <Text style={s.certSigBadge}>
                    {isHe ? '✓ אושר ונחתם אלקטרונית' : '✓ Electronically Approved & Signed'}
                  </Text>

                  {/* Iron Grid rows — label in fixed-width View (no colon concat with value) */}
                  {proposal.client_name && (
                    <SigMetaRow label={isHe ? 'שם' : 'Name'} value={proposal.client_name} />
                  )}
                  {proposal.client_company_name && (
                    <SigMetaRow label={isHe ? 'חברה' : 'Company'} value={proposal.client_company_name} />
                  )}
                  {proposal.client_signer_role && (
                    <SigMetaRow label={isHe ? 'תפקיד' : 'Role'} value={proposal.client_signer_role} />
                  )}
                  {proposal.client_tax_id && (
                    <SigMetaRow label={isHe ? 'ח.פ / ת.ז' : 'Tax ID'} value={proposal.client_tax_id} />
                  )}

                  {/* Date + time: two separate Text nodes in their own Views — never concatenated */}
                  <View style={s.certSigIronRow}>
                    <View style={{width:'38%'}}>
                      <Text style={s.certSigIronLabel}>{isHe ? 'תאריך חתימה' : 'Signed'}</Text>
                    </View>
                    <View style={{width:'62%', flexDirection:'row', gap:6}}>
                      <Text style={s.certSigIronValue}>{dateStr}</Text>
                      <Text style={s.certSigIronValue}>{timeStr}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ── Forensic Audit Data — only rendered when IP was captured ── */}
              {proposal.signer_ip && (
                <View
                  wrap={false}
                  style={{
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    backgroundColor: C.surface,
                    marginBottom: 14,
                    overflow: 'hidden',
                  }}
                >
                  {/* Section header — same brand-color style as audit trail */}
                  <Text style={{
                    fontSize: 7, fontWeight: 900, letterSpacing: 1.4, color: '#ffffff',
                    textTransform: 'uppercase', textAlign: 'right',
                    paddingHorizontal: 14, paddingVertical: 7,
                    backgroundColor: getBrandColor(proposal),
                  }}>
                    {isHe ? 'נתונים פורנזיים (Forensic Data)' : 'FORENSIC AUDIT DATA'}
                  </Text>

                  {/* IP Address row — Iron Grid: label RIGHT 38%, value LEFT 62% */}
                  <View style={{
                    flexDirection: 'row-reverse',
                    paddingHorizontal: 14, paddingVertical: 6,
                    borderBottom: `1px solid ${C.border}`,
                    backgroundColor: C.bg,
                  }}>
                    <View style={{ width: '38%' }}>
                      <Text style={{ fontSize: 7.5, color: C.muted, textAlign: 'right' }}>
                        {isHe ? 'כתובת IP' : 'IP Address'}
                      </Text>
                    </View>
                    <View style={{ width: '62%' }}>
                      <Text style={{ fontSize: 7.5, fontWeight: 700, color: C.text, textAlign: 'left' }}>
                        {proposal.signer_ip}
                      </Text>
                    </View>
                  </View>

                  {/* Device / Browser row — Iron Grid, UA truncated at 90 chars */}
                  <View style={{
                    flexDirection: 'row-reverse',
                    paddingHorizontal: 14, paddingVertical: 6,
                    backgroundColor: C.surface,
                  }}>
                    <View style={{ width: '38%' }}>
                      <Text style={{ fontSize: 7.5, color: C.muted, textAlign: 'right' }}>
                        {isHe ? 'מזהה מכשיר' : 'Device / Browser'}
                      </Text>
                    </View>
                    <View style={{ width: '62%' }}>
                      <Text style={{ fontSize: 6.5, fontWeight: 700, color: C.text, textAlign: 'left', lineHeight: 1.5 }}>
                        {proposal.signer_user_agent
                          ? (proposal.signer_user_agent.length > 160
                            ? proposal.signer_user_agent.slice(0, 160) + '…'
                            : proposal.signer_user_agent)
                          : '—'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Document token */}
              <View style={s.certTokenBox} wrap={false}>
                <Text style={s.certTokenLabel}>
                  {isHe ? 'מזהה מסמך ייחודי (Document Token)' : 'UNIQUE DOCUMENT TOKEN'}
                </Text>
                <Text style={s.certTokenValue}>{forceWrap(proposal.public_token)}</Text>
              </View>

              {/* Audit trail — Iron Grid rows with alternating backgrounds */}
              <View style={s.certAuditBox} wrap={false}>
                <Text style={s.certAuditTitle}>
                  {isHe ? 'רשומת ביקורת (Audit Trail)' : 'AUDIT TRAIL'}
                </Text>
                {auditRows.map((row, idx) =>
                  row.isDate ? (
                    <AuditDateRow
                      key={idx}
                      label={row.label}
                      date={row.date ?? dateStr}
                      time={row.time ?? timeStr}
                      idx={idx}
                      total={auditRows.length}
                    />
                  ) : (
                    <AuditRow
                      key={idx}
                      label={row.label}
                      value={row.value}
                      idx={idx}
                      total={auditRows.length}
                    />
                  )
                )}
              </View>

              {/* Cert legal note — each sentence is a separate <Text> to prevent Bidi reordering.
                  Hebrew sentences contain NO Latin brand names mid-sentence (causes scrambling).
                  No trailing period after numbers (e.g. "2001.") — period takes LTR direction. */}
              {isHe ? (
                <View style={{ borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                  <Text style={[s.certLegalNote, { borderTop:'none', paddingTop:0, marginBottom:2 }]}>
                    חתימה אלקטרונית זו כפופה לחוק חתימה אלקטרונית, התשס״א-2001
                  </Text>
                  <Text style={[s.certLegalNote, { borderTop:'none', paddingTop:0, marginBottom:2 }]}>
                    מסמך זה מהווה ראיה לקבלת ההצעה ולהסכמת הצדדים
                  </Text>
                  <Text style={[s.certLegalNote, { borderTop:'none', paddingTop:0, marginBottom:2 }]}>
                    מערכת החתימה מספקת שירות טכנולוגי בלבד ואינה צד להסכם
                  </Text>
                  <Text style={[s.certLegalNote, { borderTop:'none', paddingTop:0 }]}>
                    כל סכסוך ידון בבית המשפט המוסמך במחוז תל אביב-יפו
                  </Text>
                </View>
              ) : (
                <Text style={s.certLegalNote}>
                  This electronic signature is legally binding under the Electronic Signature Law, 5761-2001. This document serves as evidence of proposal acceptance. DealSpace provides technological infrastructure only and is not a party to this agreement. Disputes shall be resolved in the competent courts of Tel Aviv-Jaffa.
                </Text>
              )}
            </View>

            <View style={s.certFooter}>
              <Text style={s.certFooterBrand}>DealSpace</Text>
              <Text style={s.certFooterText}>
                {isHe ? 'מסמך זה נוצר ואובטח על ידי DealSpace' : 'Generated & Secured by DealSpace'}
              </Text>
              <Text style={s.certFooterText}>{proposal.public_token.slice(0,16)}…</Text>
            </View>
          </>
        )}

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
  a.download = `DealSpace_${(opts.proposal.project_title||'Proposal').replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
