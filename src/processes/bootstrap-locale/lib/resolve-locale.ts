import { SUPPORTED_LOCALES } from "@/shared/config/routing";
import { getDictionary } from "@/shared/i18n/dictionary";
import type { Locale } from "@/shared/types/common";

export function resolveLocale(locale: string): Locale | null {
  return SUPPORTED_LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : null;
}

export async function bootstrapLocale(locale: string) {
  const resolvedLocale = resolveLocale(locale);

  if (!resolvedLocale) {
    return null;
  }

  return {
    dictionary: await getDictionary(resolvedLocale),
    locale: resolvedLocale,
  };
}
