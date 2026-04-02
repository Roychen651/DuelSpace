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

// ─── Discount engine ──────────────────────────────────────────────────────────

/** Discounted price for a single line item after applying its per-item discount */
export function itemDiscountedPrice(price: number, discountPct = 0): number {
  return roundILS(price * (1 - discountPct / 100))
}

export interface DiscountLineItem {
  price: number
  enabled: boolean
  qty?: number
  discount_pct?: number
}

/**
 * Subtotal = base_price + SUM(enabled add-ons at their discounted price × qty)
 * Step 1 of the canonical discount calculation order.
 */
export function calcDiscountedSubtotal(basePrice: number, items: DiscountLineItem[]): number {
  const addOnsTotal = items
    .filter(i => i.enabled)
    .reduce((sum, i) => sum + itemDiscountedPrice(i.price, i.discount_pct) * (i.qty ?? 1), 0)
  return roundILS(basePrice + addOnsTotal)
}

/**
 * Total Before VAT = Subtotal × (1 − global_discount_pct / 100)
 * Step 2 of the canonical discount calculation order.
 */
export function applyGlobalDiscount(subtotal: number, globalDiscountPct = 0): number {
  return roundILS(subtotal * (1 - globalDiscountPct / 100))
}

/**
 * Grand Total — prices always include VAT when includeVat=true.
 * No VAT is added on top; the entered total IS the final amount.
 * Canonical entry point — use this everywhere instead of ad-hoc math.
 */
export function calcGrandTotal(
  basePrice: number,
  items: DiscountLineItem[],
  globalDiscountPct = 0,
  _includeVat = false,
  _vatRate = ISRAELI_VAT_RATE,
): number {
  const subtotal = calcDiscountedSubtotal(basePrice, items)
  return applyGlobalDiscount(subtotal, globalDiscountPct)
}

/**
 * Undiscounted total — all items at full price, no global discount.
 * Used for the strikethrough "original price" display.
 * Prices always include VAT — no extra VAT added.
 */
export function calcOriginalTotal(
  basePrice: number,
  items: DiscountLineItem[],
  _includeVat = false,
  _vatRate = ISRAELI_VAT_RATE,
): number {
  const addOnsTotal = items
    .filter(i => i.enabled)
    .reduce((sum, i) => sum + i.price * (i.qty ?? 1), 0)
  return roundILS(basePrice + addOnsTotal)
}

/** Absolute savings = original total − discounted total. Always ≥ 0. */
export function calcSavings(originalTotal: number, discountedTotal: number): number {
  return Math.max(0, originalTotal - discountedTotal)
}

// ─── Unified financial breakdown ─────────────────────────────────────────────

export interface Financials {
  /** Full price of all enabled add-ons + base, zero discounts, before VAT */
  originalSubtotal: number
  /** originalSubtotal + VAT on original (for strikethrough display) */
  originalGrandTotal: number
  /** Savings from per-item discount_pct fields */
  itemSavings: number
  /** Savings from the global_discount_pct slider */
  globalSavings: number
  /** Total money the client saves = itemSavings + globalSavings */
  totalSavings: number
  /** After per-item discounts, before global discount */
  discountedSubtotal: number
  /** After all discounts, before VAT */
  beforeVat: number
  /** VAT component (0 when include_vat is false) */
  vatAmount: number
  /** The actual amount the client pays */
  grandTotal: number
}

/**
 * Single source of truth for all financial calculations.
 *
 * @param proposal   - needs base_price, add_ons (with id), global_discount_pct, include_vat
 * @param lineItems  - optional DealRoom client overrides { [addOnId]: { enabled, qty } }
 * @param vatRate    - decimal (default ISRAELI_VAT_RATE = 0.18)
 */
export function calculateFinancials(
  proposal: {
    base_price: number
    add_ons: Array<{ id: string; price: number; enabled: boolean; discount_pct?: number; default_quantity?: number }>
    global_discount_pct?: number | null
    include_vat?: boolean
  },
  lineItems?: Record<string, { enabled: boolean; qty: number }>,
  vatRate = ISRAELI_VAT_RATE,
): Financials {
  const globalDiscountPct = proposal.global_discount_pct || 0

  // Resolve active add-ons with optional client overrides (toggle only — qty is fixed by creator).
  const resolved = proposal.add_ons.map(a => ({
    price:        a.price,
    enabled:      lineItems ? (lineItems[a.id]?.enabled ?? a.enabled) : a.enabled,
    qty:          a.default_quantity ?? 1,
    discount_pct: a.discount_pct,
  }))

  // ── Step 1: original (no discounts) ────────────────────────────────────────
  const addOnsOriginal = resolved
    .filter(a => a.enabled)
    .reduce((sum, a) => sum + a.price * a.qty, 0)
  const originalSubtotal = roundILS(proposal.base_price + addOnsOriginal)

  // ── Step 2: per-item discounts ─────────────────────────────────────────────
  const addOnsItemDiscounted = resolved
    .filter(a => a.enabled)
    .reduce((sum, a) => sum + itemDiscountedPrice(a.price, a.discount_pct) * a.qty, 0)
  const discountedSubtotal = roundILS(proposal.base_price + addOnsItemDiscounted)
  const itemSavings = roundILS(originalSubtotal - discountedSubtotal)

  // ── Step 3: global discount ────────────────────────────────────────────────
  const afterGlobalDiscount = applyGlobalDiscount(discountedSubtotal, globalDiscountPct)
  const globalSavings = roundILS(discountedSubtotal - afterGlobalDiscount)

  // ── Step 4: VAT ────────────────────────────────────────────────────────────
  // Israeli VAT model: prices entered by the creator ALWAYS include VAT.
  // When include_vat is true, we extract the VAT from within the total.
  // When include_vat is false (עוסק פטור), no VAT exists — total is as entered.
  let beforeVat: number
  let vatAmt: number
  let grandTotal: number

  if (proposal.include_vat) {
    // Prices include VAT — grand total IS the entered sum, extract VAT from within
    grandTotal = afterGlobalDiscount
    beforeVat = netFromGross(grandTotal, vatRate)
    vatAmt = roundILS(grandTotal - beforeVat)
  } else {
    // No VAT (עוסק פטור) — prices are final, no VAT component
    beforeVat = afterGlobalDiscount
    vatAmt = 0
    grandTotal = beforeVat
  }

  // Original grand total (for strikethrough) — same as original subtotal since prices include VAT
  const originalGrandTotal = originalSubtotal

  return {
    originalSubtotal,
    originalGrandTotal,
    itemSavings,
    globalSavings,
    totalSavings: roundILS(itemSavings + globalSavings),
    discountedSubtotal,
    beforeVat,
    vatAmount: vatAmt,
    grandTotal,
  }
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
