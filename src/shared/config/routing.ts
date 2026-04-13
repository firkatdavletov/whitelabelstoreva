import { env } from "@/shared/config/env";
import type { Locale } from "@/shared/types/common";

export const SUPPORTED_LOCALES = [
  "en",
  "ru",
] as const satisfies ReadonlyArray<Locale>;

export const DEFAULT_LOCALE = env.defaultLocale;

export const DEFAULT_TENANT = env.NEXT_PUBLIC_DEFAULT_TENANT;

const TENANT_HOSTNAME_MAP = {
  aiymbrand: ["aiymbrand.ru", "www.aiymbrand.ru"],
} as const satisfies Record<string, readonly string[]>;

type StorefrontPathInput = {
  hostname?: string | null;
  locale: Locale;
  pathname?: string;
  tenantSlug: string;
};

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeHostname(hostname?: string | null) {
  if (!hostname) {
    return null;
  }

  const normalizedHost = hostname
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  return normalizedHost || null;
}

export function getRequestHostnameFromHeaders(headers: Pick<Headers, "get">) {
  return normalizeHostname(
    headers.get("x-forwarded-host") ?? headers.get("host"),
  );
}

export function getTenantPrimaryHostname(tenantSlug: string) {
  return normalizeHostname(
    TENANT_HOSTNAME_MAP[tenantSlug as keyof typeof TENANT_HOSTNAME_MAP]?.[0] ??
      null,
  );
}

export function resolveTenantSlugByHostname(hostname?: string | null) {
  const normalizedHostname = normalizeHostname(hostname);

  if (!normalizedHostname) {
    return null;
  }

  return (
    Object.entries(TENANT_HOSTNAME_MAP).find(([, hostnames]) =>
      hostnames.some((host) => normalizeHostname(host) === normalizedHostname),
    )?.[0] ?? null
  );
}

export function shouldHideTenantSlugInUrl(
  tenantSlug: string,
  hostname?: string | null,
) {
  return resolveTenantSlugByHostname(hostname) === tenantSlug;
}

export function buildStorefrontPath({
  hostname,
  locale,
  pathname = "",
  tenantSlug,
}: StorefrontPathInput) {
  const normalizedPath = pathname
    ? `/${pathname.replace(/^\/+/, "").replace(/\/+$/, "")}`
    : "";
  const localePrefix = shouldHideTenantSlugInUrl(tenantSlug, hostname)
    ? `/${locale}`
    : `/${tenantSlug}/${locale}`;

  return `${localePrefix}${normalizedPath}`;
}
