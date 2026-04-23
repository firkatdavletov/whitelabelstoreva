import type { CurrencyCode, Locale } from "@/shared/types/common";

type FormatCurrencyOptions = {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  locale: Locale,
  options: FormatCurrencyOptions = {},
) {
  const formatOptions: Intl.NumberFormatOptions = {
    currency,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    style: "currency",
  };

  if (options.maximumFractionDigits !== undefined) {
    formatOptions.maximumFractionDigits = options.maximumFractionDigits;
  }

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}
