import type { Metadata } from "next";

import type { TenantConfig } from "@/entities/tenant";
import { env } from "@/shared/config/env";
import { buildStorefrontPath, SUPPORTED_LOCALES } from "@/shared/config/routing";
import type { Locale } from "@/shared/types/common";

const DEFAULT_SITE_DESCRIPTION =
  "White label storefront starter for food ordering.";
const DEFAULT_SITE_TITLE = "White Label Storefront";
const DEFAULT_SOCIAL_IMAGE_PATH = "/api/og";

export const nonIndexableMetadata: Metadata = {
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export function getMetadataBase() {
  return new URL(env.NEXT_PUBLIC_SITE_URL);
}

export function toAbsoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, getMetadataBase()).toString();
}

export function buildTenantSocialImagePath(tenantSlug?: string) {
  if (!tenantSlug) {
    return DEFAULT_SOCIAL_IMAGE_PATH;
  }

  return `${DEFAULT_SOCIAL_IMAGE_PATH}?tenant=${encodeURIComponent(tenantSlug)}`;
}

export function resolveSocialImageUrl(
  imageSrc: string | null | undefined,
  tenantSlug?: string,
) {
  const normalizedImageSrc = imageSrc?.trim();

  if (!normalizedImageSrc || normalizedImageSrc.startsWith("data:")) {
    return toAbsoluteUrl(buildTenantSocialImagePath(tenantSlug));
  }

  return toAbsoluteUrl(normalizedImageSrc);
}

function getOpenGraphLocale(locale: Locale) {
  return locale === "ru" ? "ru_RU" : "en_US";
}

function buildLanguageAlternates(tenantSlug: string, pathname = "") {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [
      locale,
      buildStorefrontPath({
        locale,
        pathname,
        tenantSlug,
      }),
    ]),
  );
}

type StorefrontMetadataInput = {
  description: string;
  image?: string | null;
  keywords?: string[];
  locale: Locale;
  pathname?: string;
  tenantConfig: TenantConfig;
  title: string;
};

export function createSiteMetadata(): Metadata {
  const socialImage = resolveSocialImageUrl(null);

  return {
    applicationName: DEFAULT_SITE_TITLE,
    alternates: {
      canonical: "/",
    },
    description: DEFAULT_SITE_DESCRIPTION,
    metadataBase: getMetadataBase(),
    openGraph: {
      description: DEFAULT_SITE_DESCRIPTION,
      images: [socialImage],
      siteName: DEFAULT_SITE_TITLE,
      title: DEFAULT_SITE_TITLE,
      type: "website",
      url: "/",
    },
    robots: {
      follow: true,
      index: true,
    },
    title: DEFAULT_SITE_TITLE,
    twitter: {
      card: "summary_large_image",
      description: DEFAULT_SITE_DESCRIPTION,
      images: [socialImage],
      title: DEFAULT_SITE_TITLE,
    },
  };
}

export function createStorefrontMetadata({
  description,
  image,
  keywords,
  locale,
  pathname = "",
  tenantConfig,
  title,
}: StorefrontMetadataInput): Metadata {
  const canonical = buildStorefrontPath({
    locale,
    pathname,
    tenantSlug: tenantConfig.slug,
  });
  const socialImage = resolveSocialImageUrl(image, tenantConfig.slug);

  return {
    alternates: {
      canonical,
      languages: buildLanguageAlternates(tenantConfig.slug, pathname),
    },
    description,
    icons: tenantConfig.faviconUrl
      ? {
          icon: tenantConfig.faviconUrl,
          shortcut: tenantConfig.faviconUrl,
        }
      : undefined,
    keywords,
    openGraph: {
      description,
      images: [socialImage],
      locale: getOpenGraphLocale(locale),
      siteName: tenantConfig.title,
      title,
      type: "website",
      url: canonical,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [socialImage],
      title,
    },
  };
}
