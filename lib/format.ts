import type { Currency } from './pricing/types.ts';

const moneyFormats = new Map<Currency, Intl.NumberFormat>();

export function money(value: number, currency: Currency): string {
  let f = moneyFormats.get(currency);
  if (!f) {
    f = new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 });
    moneyFormats.set(currency, f);
  }
  return f.format(value);
}

const plain = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });
export const num = (value: number) => plain.format(value);

/** Parse user-typed numbers like "31,000", "6.2%" or "  12 ". Returns null when there is no number. */
export function parseNumber(text: string): number | null {
  const cleaned = text.replace(/[^\d.]/g, '');
  if (!cleaned || cleaned === '.') return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}
