import type { CurrencyCode, Locale } from "@/shared/types/common";

export function formatCurrency(amount: number, currency: CurrencyCode, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}
