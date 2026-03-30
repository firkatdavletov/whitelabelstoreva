import type { Locale } from "@/shared/types/common";

import { dictionaries } from "@/shared/i18n/resources";

export async function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
