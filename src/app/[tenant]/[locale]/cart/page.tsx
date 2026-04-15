import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CartPageContent } from "@/features/cart-summary";
import { getMenuCatalog } from "@/features/menu-catalog";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { buildServerRequestContext } from "@/shared/api/server-auth";
import {
  createNonIndexableStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";

type CartPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return nonIndexableMetadata;
  }

  return createNonIndexableStorefrontMetadata({
    description: localeContext.dictionary.cart.subtitle,
    locale: localeContext.locale,
    pathname: "/cart",
    tenantConfig,
    title: `${localeContext.dictionary.cart.title} | ${tenantConfig.title}`,
  });
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const { accessToken } = await buildServerRequestContext();
  const menuCatalog = await getMenuCatalog(tenant);

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col lg:min-h-[calc(100dvh-9.5rem)]">
      <CartPageContent
        isAuthorized={Boolean(accessToken)}
        locale={localeContext.locale}
        products={menuCatalog.products.map((product) => ({
          id: product.id,
          imageUrl: product.imageUrl,
          slug: product.slug,
          visual: product.visual,
        }))}
      />
    </div>
  );
}
