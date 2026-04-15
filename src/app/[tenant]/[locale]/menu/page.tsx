import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMenuCatalog } from "@/features/menu-catalog";
import {
  normalizeMenuCategoryParam,
  resolveMenuCategory,
} from "@/features/menu-catalog/lib/catalog-navigation";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import {
  createStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { Locale, RouteParams } from "@/shared/types/common";
import { MenuGrid } from "@/widgets/menu-grid";

type MenuPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

function buildMenuPageDescription(locale: Locale, tenantTitle: string): string {
  if (locale === "ru") {
    return `Каталог ${tenantTitle}: выбирайте украшения и аксессуары по категориям и оформляйте заказ онлайн с доставкой или самовывозом.`;
  }

  return `${tenantTitle} catalog: browse categories and place an online order for delivery or pickup.`;
}

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return nonIndexableMetadata;
  }

  return createStorefrontMetadata({
    description: buildMenuPageDescription(
      localeContext.locale,
      tenantConfig.title,
    ),
    locale: localeContext.locale,
    pathname: "/menu",
    tenantConfig,
    title: `${localeContext.dictionary.navigation.menu} | ${tenantConfig.title}`,
  });
}

export default async function MenuPage({
  params,
  searchParams,
}: MenuPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const menuCatalog = await getMenuCatalog(tenant);
  const requestedCategory = normalizeMenuCategoryParam(
    (await searchParams).category,
  );
  const activeCategory = resolveMenuCategory(
    menuCatalog.categories,
    requestedCategory,
  );

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col lg:min-h-[calc(100dvh-9.5rem)]">
      <MenuGrid
        activeCategorySlug={activeCategory?.slug ?? null}
        categories={menuCatalog.categories}
        emptyLabel={localeContext.dictionary.menu.empty}
        locale={localeContext.locale}
        productCardVariant={tenantConfig.catalog.productCard}
        products={menuCatalog.products}
      />
    </div>
  );
}
