import Link from "next/link";
import { notFound } from "next/navigation";

import { getMenuCatalog } from "@/features/menu-catalog";
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
import { MenuGrid } from "@/widgets/menu-grid";

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

  const menuCatalog = await getMenuCatalog(tenant);
  const featuredProducts = menuCatalog.products.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="gap-4">
            <Badge>{localeContext.dictionary.home.eyebrow}</Badge>
            <div className="space-y-4">
              <CardTitle className="text-4xl sm:text-5xl">{tenantConfig.title}</CardTitle>
              <CardDescription className="max-w-2xl text-base">
                {tenantConfig.heroCopy}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="max-w-2xl text-sm text-muted-foreground">
              {localeContext.dictionary.home.subtitle}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link
                  href={buildStorefrontPath({
                    locale: localeContext.locale,
                    pathname: "/menu",
                    tenantSlug: tenantConfig.slug,
                  })}
                >
                  {localeContext.dictionary.home.browseMenu}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link
                  href={buildStorefrontPath({
                    locale: localeContext.locale,
                    pathname: "/checkout",
                    tenantSlug: tenantConfig.slug,
                  })}
                >
                  {localeContext.dictionary.home.checkout}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tenantConfig.tagline}</CardTitle>
            <CardDescription>{menuCatalog.restaurant.kitchenNote}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">City</p>
              <p className="mt-2 text-lg font-semibold">{menuCatalog.restaurant.city}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Delivery ETA
              </p>
              <p className="mt-2 text-lg font-semibold">
                {menuCatalog.restaurant.deliveryEtaMinutes} min
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Restaurant
              </p>
              <p className="mt-2 text-lg font-semibold">{menuCatalog.restaurant.name}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-3xl font-semibold">
            {localeContext.dictionary.home.featured}
          </h2>
          <Badge variant="outline">{tenantConfig.slug}</Badge>
        </div>
        <MenuGrid
          categories={menuCatalog.categories}
          emptyLabel={localeContext.dictionary.menu.empty}
          locale={localeContext.locale}
          products={featuredProducts}
        />
      </section>
    </div>
  );
}
