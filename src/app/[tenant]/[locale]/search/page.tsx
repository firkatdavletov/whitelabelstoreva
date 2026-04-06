import Link from "next/link";
import { notFound } from "next/navigation";

import {
  normalizeCatalogSearchQuery,
  searchCatalogProducts,
} from "@/features/menu-catalog/api/search-catalog-products";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { buildStorefrontPath } from "@/shared/config/routing";
import type { RouteParams } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { MenuGrid } from "@/widgets/menu-grid";

type SearchPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
  searchParams: Promise<{
    query?: string | string[];
  }>;
};

function interpolateMessage(
  template: string,
  values: Record<string, number | string>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  );
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
  const products = normalizedSearchQuery
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
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <Badge>{tenantConfig.title}</Badge>
          <h1 className="font-heading text-4xl font-semibold">
            {localeContext.dictionary.search.title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            {localeContext.dictionary.search.subtitle}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{localeContext.dictionary.search.cardTitle}</CardTitle>
            <CardDescription>
              {localeContext.dictionary.search.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="flex flex-col gap-3 sm:flex-row" method="get">
              <Input
                defaultValue={normalizedSearchQuery ?? ""}
                name="query"
                placeholder={localeContext.dictionary.search.inputPlaceholder}
              />
              <Button className="sm:min-w-32" type="submit">
                {localeContext.dictionary.search.submit}
              </Button>
            </form>

            <Button asChild variant="outline">
              <Link
                href={buildStorefrontPath({
                  locale: localeContext.locale,
                  pathname: "/menu",
                  tenantSlug: tenantConfig.slug,
                })}
              >
                {localeContext.dictionary.search.openMenu}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {!normalizedSearchQuery ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {localeContext.dictionary.search.initialTitle}
            </CardTitle>
            <CardDescription>
              {localeContext.dictionary.search.initialDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : searchError ? (
        <Card>
          <CardHeader>
            <CardTitle>{localeContext.dictionary.search.errorTitle}</CardTitle>
            <CardDescription>
              {localeContext.dictionary.search.errorDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{searchError}</p>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-5">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-semibold">
              {localeContext.dictionary.search.cardTitle}
            </h2>
            <p className="text-muted-foreground text-sm">
              {interpolateMessage(
                localeContext.dictionary.search.resultsCount,
                {
                  count: products.length,
                },
              )}
            </p>
          </div>

          <MenuGrid
            activeCategorySlug={null}
            categories={[]}
            emptyLabel={interpolateMessage(
              localeContext.dictionary.search.empty,
              {
                query: normalizedSearchQuery,
              },
            )}
            locale={localeContext.locale}
            products={products}
          />
        </section>
      )}
    </div>
  );
}
