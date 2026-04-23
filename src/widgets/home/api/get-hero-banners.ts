import type { components } from "@/shared/api/generated/schema";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";
import type { Locale } from "@/shared/types/common";
import { getHomeBanners } from "@/widgets/home/lib/home-placeholders";

export type HeroBanner = components["schemas"]["HeroBannerStorefrontResponse"];

function getMockHeroBanners(tenantSlug: string, locale: Locale): HeroBanner[] {
  return getHomeBanners(locale, tenantSlug).map((banner, index) => ({
    id: banner.id,
    code: banner.id,
    placement: "HOME_HERO" as const,
    title: banner.title,
    subtitle: banner.eyebrow,
    description: banner.description,
    desktopImageUrl: banner.imageSrc,
    mobileImageUrl: banner.imageSrc,
    desktopImageAlt: "",
    mobileImageAlt: "",
    primaryActionLabel: null,
    primaryActionUrl: null,
    secondaryActionLabel: null,
    secondaryActionUrl: null,
    themeVariant: "LIGHT" as const,
    textAlignment: "LEFT" as const,
    sortOrder: index,
  }));
}

export async function getHeroBanners(
  tenantSlug: string,
  locale: Locale,
): Promise<HeroBanner[]> {
  if (env.apiMocksEnabled) {
    return getMockHeroBanners(tenantSlug, locale);
  }

  return apiRequest<HeroBanner[]>("/v1/public/hero-banners", {
    cache: "no-store",
    query: {
      locale,
      placement: "HOME_HERO",
      storefrontCode: tenantSlug,
    },
  });
}
