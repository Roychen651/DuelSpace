/**
 * DealSpace Financial Math Engine
 *
 * All monetary values are whole numbers (integer ILS/USD).
 * Using Math.round + Number.EPSILON to eliminate floating-point drift.
 * This file is the single source of truth for every calculation in the app.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const ISRAELI_VAT_RATE = 0.18 // 18% — current rate as of 2024-2025

// ─── Core rounding ────────────────────────────────────────────────────────────

/** Integer rounding for ILS amounts (no fractional shekels in B2B) */
export function roundILS(value: number): number {
  return Math.round(value)
}

/** 2-decimal rounding for foreign currencies */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

// ─── VAT calculations ─────────────────────────────────────────────────────────

/**
 * B2B mode: prices are NET (exclusive of VAT).
 * Returns the VAT amount to add at checkout.
 */
export function vatOnNet(net: number, rate = ISRAELI_VAT_RATE): number {
  return roundILS(net * rate)
}

/**
 * B2C mode: prices are GROSS (inclusive of VAT).
 * Returns the VAT component embedded in the gross price.
 */
export function vatOnGross(gross: number, rate = ISRAELI_VAT_RATE): number {
  return roundILS(gross - gross / (1 + rate))
}

/** Strip VAT from a gross price → net price */
export function netFromGross(gross: number, rate = ISRAELI_VAT_RATE): number {
  return roundILS(gross / (1 + rate))
}

/** Add VAT to a net price → gross price */
export function grossFromNet(net: number, rate = ISRAELI_VAT_RATE): number {
  return roundILS(net * (1 + rate))
}

// ─── Deposit calculations ─────────────────────────────────────────────────────

export interface DepositRule {
  type: 'percent' | 'fixed'
  /** percent: 0–100 | fixed: amount in currency units */
  value: number
}

/** How much deposit is due now */
export function calcDeposit(total: number, rule: DepositRule): number {
  if (rule.type === 'percent') {
    return roundILS(total * (rule.value / 100))
  }
  return roundILS(Math.min(rule.value, total))
}

/** Remaining balance after deposit */
export function calcBalance(total: number, rule: DepositRule): number {
  return roundILS(total - calcDeposit(total, rule))
}

// ─── Proposal totals ──────────────────────────────────────────────────────────

export interface LineItem {
  price: number
  enabled: boolean
  qty?: number
}

export function calcSubtotal(basePrice: number, items: LineItem[]): number {
  const addOnsTotal = items
    .filter(i => i.enabled)
    .reduce((sum, i) => sum + i.price * (i.qty ?? 1), 0)
  return roundILS(basePrice + addOnsTotal)
}

// ─── Currency formatting ──────────────────────────────────────────────────────

/**
 * Format a monetary amount for display.
 * Intl.NumberFormat handles ₪ symbol positioning per locale automatically.
 * he-IL → ₪ on the right: ‎5,000 ₪
 * en-US → $ on the left: $5,000
 */
export function fmtCurrency(
  amount: number,
  currency = 'ILS',
  locale?: string
): string {
  const resolvedLocale = locale ?? (currency === 'ILS' ? 'he-IL' : 'en-US')
  return new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
