import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { CurrentOrderCard, getCurrentOrder } from "@/features/order-tracking";
import { getMenuCatalog } from "@/features/menu-catalog";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { buildServerRequestContext } from "@/shared/api/server-auth";
import {
  buildStorefrontPath,
  getRequestHostnameFromHeaders,
} from "@/shared/config/routing";
import {
  createStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";
import { getHomeCategoryCards } from "@/widgets/home/lib/home-placeholders";
import { getHeroBanners } from "@/widgets/home/api/get-hero-banners";
import { FashionHeroBanners } from "@/widgets/home/ui/fashion-hero-banners";
import { HomeBannerPager } from "@/widgets/home/ui/home-banner-pager";
import { HomeCategoryGrid } from "@/widgets/home/ui/home-category-grid";

type HomePageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

const HOME_CATEGORY_LIMIT = 6;

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return nonIndexableMetadata;
  }

  return createStorefrontMetadata({
    description: tenantConfig.heroCopy,
    locale: localeContext.locale,
    tenantConfig,
    title: `${localeContext.dictionary.navigation.home} | ${tenantConfig.title}`,
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const requestContext = await buildServerRequestContext();
  const requestHostname = getRequestHostnameFromHeaders(await headers());
  const [menuCatalog, currentOrder, heroBanners] = await Promise.all([
    getMenuCatalog(tenant, { categoryLimit: HOME_CATEGORY_LIMIT }),
    getCurrentOrder(tenant, requestContext).catch(() => null),
    getHeroBanners(tenant, localeContext.locale).catch(() => []),
  ]);
  const menuHref = buildStorefrontPath({
    hostname: requestHostname,
    locale: localeContext.locale,
    pathname: "/menu",
    tenantSlug: tenantConfig.slug,
  });
  const HeroBannersComponent =
    tenantConfig.home.heroBanners === "hero-fashion"
      ? FashionHeroBanners
      : HomeBannerPager;

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <HeroBannersComponent
        banners={heroBanners}
        nextLabel={localeContext.dictionary.home.bannerNext}
        previousLabel={localeContext.dictionary.home.bannerPrevious}
      />

      <CurrentOrderCard initialData={currentOrder} />

      <HomeCategoryGrid
        actionHref={menuHref}
        actionLabel={localeContext.dictionary.home.browseMenu}
        categories={getHomeCategoryCards(menuCatalog.categories)}
        categoryCardVariant={tenantConfig.catalog.categoryCard}
      />
    </div>
  );
}
