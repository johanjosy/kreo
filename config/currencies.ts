import type { Currency } from '../lib/pricing/types.ts';

/**
 * Currencies KREO can price in. Benchmarks in benchmarks.ts are set in euros and converted with `perEur`.
 * shortcut: static, approximate exchange rates (set 2026-11-15) so rates aren't 165× too low in yen; refresh them periodically or load live rates if precision matters.
 * Assumption: converting at the exchange rate ignores local market differences, so treat converted rates as a starting point.
 */
export const currencies: Record<Currency, { name: string; perEur: number }> = {
  AED: { name: 'UAE dirhams', perEur: 3.97 },
  AUD: { name: 'Australian dollars', perEur: 1.65 },
  BRL: { name: 'Brazilian reais', perEur: 6 },
  CAD: { name: 'Canadian dollars', perEur: 1.48 },
  CHF: { name: 'Swiss francs', perEur: 0.95 },
  CNY: { name: 'Chinese yuan', perEur: 7.8 },
  CZK: { name: 'Czech koruna', perEur: 25 },
  DKK: { name: 'Danish kroner', perEur: 7.46 },
  EUR: { name: 'euros', perEur: 1 },
  GBP: { name: 'British pounds', perEur: 0.85 },
  HKD: { name: 'Hong Kong dollars', perEur: 8.4 },
  IDR: { name: 'Indonesian rupiah', perEur: 17500 },
  ILS: { name: 'Israeli shekels', perEur: 4 },
  INR: { name: 'Indian rupees', perEur: 92 },
  JPY: { name: 'Japanese yen', perEur: 165 },
  KRW: { name: 'South Korean won', perEur: 1480 },
  MXN: { name: 'Mexican pesos', perEur: 20 },
  MYR: { name: 'Malaysian ringgit', perEur: 4.9 },
  NOK: { name: 'Norwegian kroner', perEur: 11.7 },
  NZD: { name: 'New Zealand dollars', perEur: 1.8 },
  PHP: { name: 'Philippine pesos', perEur: 62 },
  PLN: { name: 'Polish złoty', perEur: 4.3 },
  SAR: { name: 'Saudi riyals', perEur: 4.05 },
  SEK: { name: 'Swedish kronor', perEur: 11.4 },
  SGD: { name: 'Singapore dollars', perEur: 1.45 },
  THB: { name: 'Thai baht', perEur: 38 },
  TRY: { name: 'Turkish lira', perEur: 38 },
  USD: { name: 'US dollars', perEur: 1.08 },
  ZAR: { name: 'South African rand', perEur: 20 },
};
