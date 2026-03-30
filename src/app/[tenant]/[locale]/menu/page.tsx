import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMenuCatalog } from "@/features/menu-catalog";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import type { RouteParams } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { MenuGrid } from "@/widgets/menu-grid";

type MenuPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
  const { tenant } = await params;
  const tenantConfig = resolveTenant(tenant);

  return {
    description: tenantConfig?.description ?? "Tenant-specific food catalog.",
    title: tenantConfig ? `${tenantConfig.title} Menu` : "Menu",
  };
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const menuCatalog = await getMenuCatalog(tenant);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-semibold">
            {localeContext.dictionary.menu.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {localeContext.dictionary.menu.subtitle}
          </p>
        </div>
        <Badge variant="outline">{tenantConfig.logoText}</Badge>
      </div>
      <MenuGrid
        categories={menuCatalog.categories}
        emptyLabel={localeContext.dictionary.menu.empty}
        locale={localeContext.locale}
        products={menuCatalog.products}
      />
    </div>
  );
}
