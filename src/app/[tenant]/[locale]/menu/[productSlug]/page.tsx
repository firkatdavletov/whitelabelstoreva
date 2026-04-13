import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getMenuCatalog, ProductDetailsPage } from "@/features/menu-catalog";
import {
  normalizeMenuCategoryParam,
  resolveMenuCategory,
  resolveMenuProduct,
} from "@/features/menu-catalog/lib/catalog-navigation";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import {
  buildStorefrontPath,
  getRequestHostnameFromHeaders,
} from "@/shared/config/routing";
import {
  createStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";

type ProductPageProps = {
  params: RouteParams<{
    locale: string;
    productSlug: string;
    tenant: string;
  }>;
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

async function getProductPageData(params: ProductPageProps["params"]) {
  const { locale, productSlug, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return null;
  }

  const menuCatalog = await getMenuCatalog(tenant);
  const product = resolveMenuProduct(menuCatalog.products, productSlug);

  if (!product) {
    return null;
  }

  const productCategory =
    menuCatalog.categories.find(
      (category) => category.id === product.categoryId,
    ) ?? null;

  return {
    localeContext,
    menuCatalog,
    product,
    productCategory,
    tenantConfig,
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const data = await getProductPageData(params);

  if (!data) {
    return nonIndexableMetadata;
  }

  return createStorefrontMetadata({
    description: data.product.description || data.tenantConfig.description,
    image: data.product.imageUrl,
    keywords: data.product.tags,
    locale: data.localeContext.locale,
    pathname: `/menu/${data.product.slug}`,
    tenantConfig: data.tenantConfig,
    title: `${data.product.name} | ${data.tenantConfig.title}`,
  });
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const data = await getProductPageData(params);

  if (!data) {
    notFound();
  }

  const requestedCategory = normalizeMenuCategoryParam(
    (await searchParams).category,
  );
  const activeCategory = resolveMenuCategory(
    data.menuCatalog.categories,
    requestedCategory,
  );
  const backCategory =
    activeCategory?.id === data.product.categoryId
      ? activeCategory
      : data.productCategory;
  const requestHostname = getRequestHostnameFromHeaders(await headers());
  const menuHref = buildStorefrontPath({
    hostname: requestHostname,
    locale: data.localeContext.locale,
    pathname: "/menu",
    tenantSlug: data.tenantConfig.slug,
  });
  const backHref = backCategory
    ? `${menuHref}?category=${encodeURIComponent(backCategory.slug)}`
    : menuHref;

  return (
    <ProductDetailsPage
      backHref={backHref}
      locale={data.localeContext.locale}
      product={data.product}
    />
  );
}
