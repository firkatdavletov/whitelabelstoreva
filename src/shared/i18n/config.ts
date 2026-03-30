import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE } from "@/shared/config/routing";
import { i18nResources } from "@/shared/i18n/resources";

export const i18n = i18next.createInstance();

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false,
    },
    lng: DEFAULT_LOCALE,
    resources: i18nResources,
  });
}
