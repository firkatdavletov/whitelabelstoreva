"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import { i18n } from "@/shared/i18n/config";
import type { Locale } from "@/shared/types/common";

type I18nProviderProps = {
  children: React.ReactNode;
  locale: Locale;
};

export function AppI18nProvider({ children, locale }: I18nProviderProps) {
  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
