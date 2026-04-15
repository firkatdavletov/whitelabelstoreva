import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { searchCatalogProducts } from "@/features/menu-catalog/api/search-catalog-products";
import {
  isCatalogSearchQueryEligible,
  normalizeCatalogSearchQuery,
} from "@/features/menu-catalog/lib/catalog-search";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import {
  buildStorefrontPath,
  getRequestHostnameFromHeaders,
} from "@/shared/config/routing";
import {
  createNonIndexableStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";
import { CatalogSearchShell } from "@/widgets/catalog-search";

type SearchPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
  searchParams: Promise<{
    query?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return nonIndexableMetadata;
  }

  const searchQuery = normalizeCatalogSearchQuery((await searchParams).query);
  const pageDescription = searchQuery
    ? localeContext.locale === "ru"
      ? `Результаты поиска «${searchQuery}» в каталоге ${tenantConfig.title}.`
      : `Search results for "${searchQuery}" in the ${tenantConfig.title} catalog.`
    : localeContext.dictionary.search.errorDescription;

  return createNonIndexableStorefrontMetadata({
    description: pageDescription,
    locale: localeContext.locale,
    pathname: "/search",
    tenantConfig,
    title: `${localeContext.dictionary.search.title} | ${tenantConfig.title}`,
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const normalizedSearchQuery = normalizeCatalogSearchQuery(
    (await searchParams).query,
  );

  let searchError: string | null = null;
  const initialProducts =
    normalizedSearchQuery && isCatalogSearchQueryEligible(normalizedSearchQuery)
      ? await searchCatalogProducts(tenant, normalizedSearchQuery).catch(
          (error) => {
            searchError =
              error instanceof Error
                ? error.message
                : localeContext.dictionary.search.errorTitle;

            return [];
          },
        )
      : [];
  const requestHostname = getRequestHostnameFromHeaders(await headers());

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col lg:min-h-[calc(100dvh-9.5rem)]">
      <CatalogSearchShell
        initialError={searchError}
        initialProducts={initialProducts}
        initialQuery={normalizedSearchQuery}
        locale={localeContext.locale}
        menuHref={buildStorefrontPath({
          hostname: requestHostname,
          locale: localeContext.locale,
          pathname: "/menu",
          tenantSlug: tenantConfig.slug,
        })}
        searchMessages={localeContext.dictionary.search}
        tenantSlug={tenantConfig.slug}
      />
    </div>
  );
}
