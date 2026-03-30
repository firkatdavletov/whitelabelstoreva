import { enMessages } from "@/shared/i18n/locales/en/common";
import { ruMessages } from "@/shared/i18n/locales/ru/common";

export const dictionaries = {
  en: enMessages,
  ru: ruMessages,
} as const;

export const i18nResources = {
  en: {
    translation: enMessages,
  },
  ru: {
    translation: ruMessages,
  },
} as const;
