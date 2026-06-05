/**
 * Single source of truth for supported currencies on the client.
 * Keep this list in sync with the `baseCurrency` enum on the server's User model.
 */

export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD";

export type CurrencyInfo = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
};

export const SUPPORTED_CURRENCIES: readonly CurrencyInfo[] = [
  { code: "INR", symbol: "₹", label: "Indian Rupee", locale: "en-IN" },
  { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "€", label: "Euro", locale: "de-DE" },
  { code: "GBP", symbol: "£", label: "British Pound", locale: "en-GB" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", locale: "ja-JP" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", locale: "en-AU" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar", locale: "en-CA" },
] as const;

export const CURRENCY_BY_CODE: Record<CurrencyCode, CurrencyInfo> =
  SUPPORTED_CURRENCIES.reduce(
    (acc, c) => {
      acc[c.code] = c;
      return acc;
    },
    {} as Record<CurrencyCode, CurrencyInfo>,
  );

export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export function getCurrencySymbol(code: string): string {
  return CURRENCY_BY_CODE[code as CurrencyCode]?.symbol ?? code;
}

export function formatCurrency(amount: number, code: string): string {
  const info = CURRENCY_BY_CODE[code as CurrencyCode];
  try {
    return new Intl.NumberFormat(info?.locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code}`;
  }
}
