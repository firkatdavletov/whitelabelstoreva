import { env } from "@/shared/config/env";
import type { Locale } from "@/shared/types/common";

export const SUPPORTED_LOCALES = ["en", "ru"] as const satisfies ReadonlyArray<Locale>;

export const DEFAULT_LOCALE = env.defaultLocale;

export const DEFAULT_TENANT = env.NEXT_PUBLIC_DEFAULT_TENANT;

type StorefrontPathInput = {
  locale: Locale;
  pathname?: string;
  tenantSlug: string;
};

export function buildStorefrontPath({
  locale,
  pathname = "",
  tenantSlug,
}: StorefrontPathInput) {
  const normalizedPath = pathname
    ? `/${pathname.replace(/^\/+/, "").replace(/\/+$/, "")}`
    : "";

  return `/${tenantSlug}/${locale}${normalizedPath}`;
}
