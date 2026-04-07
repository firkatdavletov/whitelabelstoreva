import { notFound } from "next/navigation";

import { CurrentOrderCard, getCurrentOrder } from "@/features/order-tracking";
import { getMenuCatalog } from "@/features/menu-catalog";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { buildServerRequestContext } from "@/shared/api/server-auth";
import { buildStorefrontPath } from "@/shared/config/routing";
import type { RouteParams } from "@/shared/types/common";
import {
  getHomeBanners,
  getHomeCategoryCards,
} from "@/widgets/home/lib/home-placeholders";
import { HomeBannerPager } from "@/widgets/home/ui/home-banner-pager";
import { HomeCategoryGrid } from "@/widgets/home/ui/home-category-grid";

type HomePageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const requestContext = await buildServerRequestContext();
  const [menuCatalog, currentOrder] = await Promise.all([
    getMenuCatalog(tenant),
    getCurrentOrder(tenant, requestContext).catch(() => null),
  ]);
  const menuHref = buildStorefrontPath({
    locale: localeContext.locale,
    pathname: "/menu",
    tenantSlug: tenantConfig.slug,
  });

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <HomeBannerPager
        banners={getHomeBanners(localeContext.locale)}
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
