import { notFound } from "next/navigation";

import { CartPageContent } from "@/features/cart-summary";
import { getMenuCatalog } from "@/features/menu-catalog";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import type { RouteParams } from "@/shared/types/common";

type CartPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export default async function CartPage({ params }: CartPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const menuCatalog = await getMenuCatalog(tenant);

  return (
    <CartPageContent
      locale={localeContext.locale}
      products={menuCatalog.products.map((product) => ({
        id: product.id,
        imageUrl: product.imageUrl,
        slug: product.slug,
        visual: product.visual,
      }))}
    />
  );
}
