import {
  Document, Page, Text, View, Image,
  StyleSheet, Font, pdf,
} from '@react-pdf/renderer'
import { formatCurrency, DEFAULT_VAT_RATE } from '../types/proposal'
import type { Proposal } from '../types/proposal'

// ─── Font registration ─────────────────────────────────────────────────────────
// Full Heebo TTF (Hebrew + Latin) from Google Fonts CDN v28 (CORS-enabled)

Font.register({
  family: 'Heebo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSyccg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1Ebiuccg.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EICuccg.ttf', fontWeight: 900 },
  ],
})

Font.registerHyphenationCallback(word => [word])

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PdfOptions {
  proposal: Proposal
  totalAmount: number
  enabledAddOnIds: string[]
  signatureDataUrl: string
  locale: 'he' | 'en'
}

// ─── Color helper ──────────────────────────────────────────────────────────────

function getBrandColor(proposal: Proposal): string {
  const c = proposal.brand_color
  return c && /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#6366f1'
}

// ─── Styles factory ────────────────────────────────────────────────────────────

const C = {
  bg:      '#05050A',
  surface: '#111118',
  border:  '#1e1e2e',
  text:    '#e5e7eb',
  muted:   '#6b7280',
  white:   '#ffffff',
  lavender:'#c4b5fd',
  success: '#22c55e',
}

function makeStyles(brand: string) {
  return StyleSheet.create({
    page: {
      fontFamily: 'Heebo',
      backgroundColor: C.bg,
      paddingBottom: 44,
    },
    // ── Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 28,
      paddingVertical: 14,
      backgroundColor: brand,
    },
    headerBrand: { fontSize: 11, fontWeight: 700, color: C.white },
    headerBadge: { fontSize: 9,  fontWeight: 400, color: 'rgba(255,255,255,0.8)' },
    // ── Section
    section: {
      paddingHorizontal: 28,
      paddingTop: 16,
      paddingBottom: 14,
      borderBottom: `1px solid ${C.border}`,
    },
    sectionTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: brand,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 8,
      textAlign: 'right',
    },
    // ── Cover
    projectTitle: { fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 6, textAlign: 'right' },
    coverMeta: { fontSize: 9, color: C.muted, textAlign: 'right', marginBottom: 2 },
    // ── Two-column party row
    partyRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    partyBox: {
      flex: 1,
      borderRadius: 5,
      padding: 10,
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
    },
    partyLabel: {
      fontSize: 7,
      fontWeight: 700,
      color: brand,
      textTransform: 'uppercase',
      letterSpacing: 0.9,
      marginBottom: 5,
      textAlign: 'right',
    },
    partyName: { fontSize: 10, fontWeight: 700, color: C.text, textAlign: 'right', marginBottom: 2 },
    partyMeta: { fontSize: 8, color: C.muted, textAlign: 'right', marginBottom: 2 },
    // ── Description
    descText: { fontSize: 9.5, color: 'rgba(229,231,235,0.65)', lineHeight: 1.65, textAlign: 'right' },
    // ── Table
    tableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: C.surface,
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 2,
    },
    tableHeaderText: {
      fontSize: 7.5, fontWeight: 700, color: C.muted,
      textTransform: 'uppercase', letterSpacing: 0.8,
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderBottom: `1px solid ${C.border}`,
    },
    tableRowLabel: { fontSize: 9.5, color: C.text, flex: 1, textAlign: 'right' },
    tableRowPrice: { fontSize: 9.5, color: C.lavender, fontWeight: 700, textAlign: 'left' },
    // ── VAT
    vatBox: {
      marginHorizontal: 28,
      marginTop: 8,
      borderRadius: 6,
      padding: 10,
      backgroundColor: `${brand}10`,
      border: `1px solid ${brand}25`,
    },
    vatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    vatLabel: { fontSize: 9, color: 'rgba(229,231,235,0.5)', textAlign: 'right' },
    vatValue: { fontSize: 9, color: 'rgba(229,231,235,0.5)', textAlign: 'left', fontWeight: 700 },
    vatDivider: { height: 1, backgroundColor: C.border, marginVertical: 5 },
    vatTotalLabel: { fontSize: 10, fontWeight: 700, color: C.text, textAlign: 'right' },
    vatTotalValue: { fontSize: 10, fontWeight: 700, color: C.lavender, textAlign: 'left' },
    // ── Grand total
    totalBox: {
      marginHorizontal: 28,
      marginTop: 10,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: 'rgba(30,30,60,0.9)',
      border: `1px solid ${brand}50`,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: { fontSize: 11, fontWeight: 700, color: C.text, textAlign: 'right' },
    totalValue: { fontSize: 16, fontWeight: 900, color: C.lavender, textAlign: 'left' },
    // ── Milestones
    milestoneRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      backgroundColor: C.surface,
      marginBottom: 3,
    },
    milestoneLeft: { flex: 1 },
    milestoneName: { fontSize: 9.5, color: C.text, textAlign: 'right' },
    milestonePct: { fontSize: 8, color: C.muted, textAlign: 'right' },
    milestoneAmt: { fontSize: 10, fontWeight: 700, color: C.lavender },
    // ── Terms
    termsParagraph: {
      fontSize: 8,
      color: 'rgba(107,114,128,0.9)',
      lineHeight: 1.6,
      textAlign: 'right',
      marginBottom: 6,
    },
    // ── Signature
    sigRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
    sigBox: {
      width: 130, height: 60, borderRadius: 6,
      border: `1px solid ${C.success}`,
      backgroundColor: C.surface,
      overflow: 'hidden',
    },
    sigImage: { width: '100%', height: '100%', objectFit: 'contain' },
    sigMeta: { flex: 1 },
    sigBadge: { fontSize: 9, fontWeight: 700, color: C.success, marginBottom: 5, textAlign: 'right' },
    sigDetail: { fontSize: 8, color: C.muted, marginBottom: 3, textAlign: 'right' },
    sigHash: { fontSize: 7, color: 'rgba(107,114,128,0.5)', marginTop: 4, textAlign: 'right' },
    // ── Footer
    footer: {
      position: 'absolute',
      bottom: 14,
      left: 28,
      right: 28,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTop: `1px solid ${C.border}`,
      paddingTop: 6,
    },
    footerText: { fontSize: 7, color: 'rgba(107,114,128,0.6)' },
  })
}

// ─── PDF Document component ───────────────────────────────────────────────────

function ProposalDocument({ proposal, totalAmount, enabledAddOnIds, signatureDataUrl, locale }: PdfOptions) {
  const isHe = locale === 'he'
  const brand = getBrandColor(proposal)
  const s = makeStyles(brand)

  const enabledAddOns = proposal.add_ons.filter(a => enabledAddOnIds.includes(a.id))
  const milestones = proposal.payment_milestones ?? []

  const vatRate = (() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('dealspace:vat-rate') : null
    const v = stored ? parseFloat(stored) : DEFAULT_VAT_RATE
    return isNaN(v) ? DEFAULT_VAT_RATE : v
  })()
  const vatAmt = proposal.include_vat ? Math.round(totalAmount * vatRate) : 0
  const totalWithVat = totalAmount + vatAmt
  const displayTotal = proposal.include_vat ? totalWithVat : totalAmount

  const dateStr = new Date().toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const creator = proposal.creator_info

  return (
    <Document title={proposal.project_title || 'DealSpace Proposal'} author="DealSpace" creator="DealSpace">
      <Page size="A4" style={s.page}>

        {/* ── Header bar ──────────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.headerBrand}>
            {creator?.company_name ? creator.company_name : 'DealSpace'}
          </Text>
          <Text style={s.headerBadge}>
            {isHe ? 'הצעת מחיר חתומה' : 'Signed Proposal'}
          </Text>
        </View>

        {/* ── Project title ────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.projectTitle}>
            {proposal.project_title || (isHe ? 'הצעת מחיר' : 'Proposal')}
          </Text>
          <Text style={s.coverMeta}>
            {isHe ? `תאריך: ${dateStr}` : `Date: ${dateStr}`}
          </Text>
          {proposal.expires_at && (
            <Text style={s.coverMeta}>
              {isHe
                ? `בתוקף עד: ${new Date(proposal.expires_at).toLocaleDateString('he-IL')}`
                : `Valid until: ${new Date(proposal.expires_at).toLocaleDateString('en-US')}`}
            </Text>
          )}
        </View>

        {/* ── Creator + Client side-by-side ────────────────────────────────── */}
        <View style={[s.section, { paddingTop: 14 }]}>
          <View style={s.partyRow}>
            {/* Creator (service provider) */}
            <View style={s.partyBox}>
              <Text style={s.partyLabel}>{isHe ? 'נותן השירות' : 'Service Provider'}</Text>
              {creator?.company_name ? (
                <Text style={s.partyName}>{creator.company_name}</Text>
              ) : null}
              {creator?.full_name ? (
                <Text style={s.partyMeta}>{creator.full_name}</Text>
              ) : null}
              {creator?.tax_id ? (
                <Text style={s.partyMeta}>
                  {isHe ? `ח.פ.: ${creator.tax_id}` : `Tax ID: ${creator.tax_id}`}
                </Text>
              ) : null}
              {creator?.address ? (
                <Text style={s.partyMeta}>{creator.address}</Text>
              ) : null}
              {creator?.phone ? (
                <Text style={s.partyMeta}>{creator.phone}</Text>
              ) : null}
              {creator?.signatory_name ? (
                <Text style={s.partyMeta}>
                  {isHe ? `מורשה חתימה: ${creator.signatory_name}` : `Signatory: ${creator.signatory_name}`}
                </Text>
              ) : null}
            </View>

            {/* Client */}
            <View style={s.partyBox}>
              <Text style={s.partyLabel}>{isHe ? 'הלקוח' : 'Client'}</Text>
              {proposal.client_name ? (
                <Text style={s.partyName}>{proposal.client_name}</Text>
              ) : null}
              {proposal.client_company_name ? (
                <Text style={s.partyMeta}>{proposal.client_company_name}</Text>
              ) : null}
              {proposal.client_tax_id ? (
                <Text style={s.partyMeta}>
                  {isHe ? `ח.פ./ת.ז.: ${proposal.client_tax_id}` : `Tax ID: ${proposal.client_tax_id}`}
                </Text>
              ) : null}
              {proposal.client_address ? (
                <Text style={s.partyMeta}>{proposal.client_address}</Text>
              ) : null}
              {proposal.client_email ? (
                <Text style={s.partyMeta}>{proposal.client_email}</Text>
              ) : null}
              {proposal.client_signer_role ? (
                <Text style={s.partyMeta}>
                  {isHe ? `תפקיד: ${proposal.client_signer_role}` : `Role: ${proposal.client_signer_role}`}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Description ─────────────────────────────────────────────────── */}
        {proposal.description ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{isHe ? 'תיאור הפרויקט' : 'Project Description'}</Text>
            <Text style={s.descText}>{proposal.description}</Text>
          </View>
        ) : null}

        {/* ── Price breakdown ─────────────────────────────────────────────── */}
        <View style={[s.section, { borderBottom: 'none' }]}>
          <Text style={s.sectionTitle}>{isHe ? 'פירוט מחירים' : 'Price Breakdown'}</Text>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, { textAlign: 'right', flex: 1 }]}>
              {isHe ? 'פריט' : 'Item'}
            </Text>
            <Text style={[s.tableHeaderText, { textAlign: 'left' }]}>
              {isHe ? 'מחיר' : 'Price'}
            </Text>
          </View>
          <View style={s.tableRow}>
            <Text style={s.tableRowLabel}>{isHe ? 'חבילת בסיס' : 'Base Package'}</Text>
            <Text style={s.tableRowPrice}>{formatCurrency(proposal.base_price, proposal.currency)}</Text>
          </View>
          {enabledAddOns.map(a => (
            <View key={a.id} style={s.tableRow}>
              <Text style={s.tableRowLabel}>+ {a.label}</Text>
              <Text style={s.tableRowPrice}>{formatCurrency(a.price, proposal.currency)}</Text>
            </View>
          ))}
        </View>

        {/* ── VAT breakdown ───────────────────────────────────────────────── */}
        {proposal.include_vat && (
          <View style={s.vatBox}>
            <View style={s.vatRow}>
              <Text style={s.vatLabel}>{isHe ? 'לפני מע״מ' : 'Before VAT'}</Text>
              <Text style={s.vatValue}>{formatCurrency(totalAmount, proposal.currency)}</Text>
            </View>
            <View style={s.vatRow}>
              <Text style={s.vatLabel}>
                {isHe ? `מע״מ (${Math.round(vatRate * 100)}%)` : `VAT (${Math.round(vatRate * 100)}%)`}
              </Text>
              <Text style={s.vatValue}>{formatCurrency(vatAmt, proposal.currency)}</Text>
            </View>
            <View style={s.vatDivider} />
            <View style={s.vatRow}>
              <Text style={s.vatTotalLabel}>{isHe ? 'סה״כ כולל מע״מ' : 'Total incl. VAT'}</Text>
              <Text style={s.vatTotalValue}>{formatCurrency(totalWithVat, proposal.currency)}</Text>
            </View>
          </View>
        )}

        {/* ── Grand total ─────────────────────────────────────────────────── */}
        <View style={s.totalBox}>
          <Text style={s.totalLabel}>
            {isHe
              ? (proposal.include_vat ? 'סה״כ לתשלום (כולל מע״מ)' : 'סה״כ להשקעה')
              : (proposal.include_vat ? 'Grand Total (incl. VAT)' : 'Total Investment')}
          </Text>
          <Text style={s.totalValue}>{formatCurrency(displayTotal, proposal.currency)}</Text>
        </View>

        {/* ── Payment milestones ──────────────────────────────────────────── */}
        {milestones.length > 0 && (
          <View style={[s.section, { marginTop: 14 }]}>
            <Text style={s.sectionTitle}>{isHe ? 'תנאי תשלום — אבני דרך' : 'Payment Terms — Milestones'}</Text>
            {milestones.map((m, i) => {
              const amt = Math.round((m.percentage / 100) * displayTotal)
              return (
                <View key={m.id} style={s.milestoneRow}>
                  <View style={s.milestoneLeft}>
                    <Text style={s.milestoneName}>{m.name || (isHe ? `אבן דרך ${i + 1}` : `Milestone ${i + 1}`)}</Text>
                    <Text style={s.milestonePct}>{m.percentage}%</Text>
                  </View>
                  <Text style={s.milestoneAmt}>{formatCurrency(amt, proposal.currency)}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* ── Terms & Conditions ──────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isHe ? 'תנאים והתניות' : 'Terms & Conditions'}</Text>
          {isHe ? (
            <>
              <Text style={s.termsParagraph}>
                חתימה על הצעה זו מהווה הסכם מחייב בין הצדדים בהתאם לחוק חוזים (חלק כללי), תשל״ג-1973. תשלום יבוצע לפי לוח הזמנים המוסכם. ביטול לאחר חתימה כפוף לדמי ביטול.
              </Text>
              <Text style={s.termsParagraph}>
                בעל העסק ו-DealSpace אינם אחראים לעיכובים שנגרמו מגורמים חיצוניים. שינויים בהיקף העבודה ידרשו הסכמה בכתב של שני הצדדים. DealSpace מספקת תשתית טכנולוגית בלבד ואינה צד להסכם.
              </Text>
              <Text style={s.termsParagraph}>
                חתימה אלקטרונית זו כפופה לחוק חתימה אלקטרונית, התשס״א-2001. החוק החל הוא דין מדינת ישראל. כל סכסוך יובא לפני בית המשפט המוסמך במחוז תל אביב-יפו.
              </Text>
            </>
          ) : (
            <>
              <Text style={s.termsParagraph}>
                Signing this proposal constitutes a binding agreement subject to applicable contract law. Payment will be made according to the agreed schedule. Cancellation after signing is subject to cancellation fees.
              </Text>
              <Text style={s.termsParagraph}>
                Neither the service provider nor DealSpace is liable for delays caused by external factors. Changes to scope require written agreement from both parties. DealSpace serves solely as a technology intermediary and is not a party to this agreement.
              </Text>
              <Text style={s.termsParagraph}>
                This electronic signature is subject to applicable electronic signature laws. Governing law: State of Israel. Disputes resolved in the competent courts of Tel Aviv-Jaffa.
              </Text>
            </>
          )}
        </View>

        {/* ── Digital Signature ───────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isHe ? 'חתימה דיגיטלית' : 'Digital Signature'}</Text>
          <View style={s.sigRow}>
            <View style={s.sigBox}>
              {signatureDataUrl?.startsWith('data:image') && (
                <Image src={signatureDataUrl} style={s.sigImage} />
              )}
            </View>
            <View style={s.sigMeta}>
              <Text style={s.sigBadge}>
                {isHe ? '✓ אושר ונחתם אלקטרונית' : '✓ Electronically Approved & Signed'}
              </Text>
              <Text style={s.sigDetail}>
                {isHe ? `תאריך: ${dateStr}` : `Date: ${dateStr}`}
              </Text>
              {proposal.client_name ? (
                <Text style={s.sigDetail}>
                  {isHe ? `שם: ${proposal.client_name}` : `Name: ${proposal.client_name}`}
                </Text>
              ) : null}
              {proposal.client_signer_role ? (
                <Text style={s.sigDetail}>
                  {isHe ? `תפקיד: ${proposal.client_signer_role}` : `Role: ${proposal.client_signer_role}`}
                </Text>
              ) : null}
              {proposal.client_tax_id ? (
                <Text style={s.sigDetail}>
                  {isHe ? `ח.פ./ת.ז.: ${proposal.client_tax_id}` : `Tax ID: ${proposal.client_tax_id}`}
                </Text>
              ) : null}
              <Text style={s.sigHash}>Proposal ID: {proposal.id}</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>dealspace.app</Text>
          <Text style={s.footerText}>
            {isHe
              ? 'מסמך זה נוצר על ידי DealSpace ומהווה ראיה לקבלת ההצעה'
              : 'Generated by DealSpace — evidence of proposal acceptance'}
          </Text>
        </View>

      </Page>
    </Document>
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateProposalPdf(opts: PdfOptions): Promise<void> {
  const blob = await pdf(<ProposalDocument {...opts} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `DealSpace_${(opts.proposal.project_title || 'Proposal').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
