import { notFound } from "next/navigation";

import { searchCatalogProducts } from "@/features/menu-catalog/api/search-catalog-products";
import {
  isCatalogSearchQueryEligible,
  normalizeCatalogSearchQuery,
} from "@/features/menu-catalog/lib/catalog-search";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { buildStorefrontPath } from "@/shared/config/routing";
import { nonIndexableMetadata } from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";
import { CatalogSearchShell } from "@/widgets/catalog-search";

export const metadata = nonIndexableMetadata;

type SearchPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
  searchParams: Promise<{
    query?: string | string[];
  }>;
};

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

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col lg:min-h-[calc(100dvh-9.5rem)]">
      <CatalogSearchShell
        initialError={searchError}
        initialProducts={initialProducts}
        initialQuery={normalizedSearchQuery}
        locale={localeContext.locale}
        menuHref={buildStorefrontPath({
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
