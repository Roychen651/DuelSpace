// ─── Smart Contract Variables Engine ─────────────────────────────────────────
// Replaces {Variable_Name} tags in proposal descriptions/contracts with live values.
// Safe: unrecognised tags are left as-is (no data loss).

import type { Proposal } from '../types/proposal'
import { proposalTotal, formatCurrency } from '../types/proposal'

// ─── Variable registry ────────────────────────────────────────────────────────

type VarFn = (proposal: Proposal, locale: string) => string

const VARIABLE_MAP: Record<string, VarFn> = {
  Client_Name:    (p) => p.client_name || '',
  Project_Title:  (p) => p.project_title || '',
  Grand_Total:    (p) => formatCurrency(proposalTotal(p), p.currency),
  Date_Today:     () => {
    const d = new Date()
    // Use en-US formatting — avoids Hebrew Bidi marks in output HTML
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  },
  Company_Name:   (p) => p.creator_info?.company_name || '',
  Signatory_Name: (p) => p.creator_info?.signatory_name || '',
  Client_Email:   (p) => p.client_email || '',
  Currency:       (p) => p.currency,
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Replaces `{Variable_Name}` tokens in `text` with live proposal values.
 * Works on both plain text and HTML strings (tokens inside tag content are replaced;
 * tokens inside HTML attributes are not expected and left as-is).
 * Unrecognised tokens are preserved verbatim.
 */
export function parseSmartVariables(
  text: string,
  proposal: Proposal,
  locale: string,
): string {
  return text.replace(/\{([A-Za-z_]+)\}/g, (match, key: string) => {
    const fn = VARIABLE_MAP[key]
    return fn ? fn(proposal, locale) : match
  })
}

// ─── Tag definitions (used by EditorPanel helper strip) ───────────────────────

export interface SmartVarTag {
  key: string
  label_he: string
  label_en: string
}

export const SMART_VAR_TAGS: SmartVarTag[] = [
  { key: 'Client_Name',    label_he: 'שם לקוח',    label_en: 'Client Name'    },
  { key: 'Project_Title',  label_he: 'שם פרויקט',  label_en: 'Project Title'  },
  { key: 'Grand_Total',    label_he: 'סה"כ',        label_en: 'Grand Total'    },
  { key: 'Date_Today',     label_he: 'תאריך היום',  label_en: "Today's Date"   },
  { key: 'Company_Name',   label_he: 'שם חברה',     label_en: 'Company Name'   },
]
