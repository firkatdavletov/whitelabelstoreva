import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CartSummaryCard } from "@/features/cart-summary";
import { CheckoutForm } from "@/features/checkout-form";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { buildServerRequestContext } from "@/shared/api/server-auth";
import {
  createNonIndexableStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";

type CheckoutPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return nonIndexableMetadata;
  }

  return createNonIndexableStorefrontMetadata({
    description: localeContext.dictionary.cart.checkoutSubtitle,
    locale: localeContext.locale,
    pathname: "/checkout",
    tenantConfig,
    title: `${localeContext.dictionary.checkout.title} | ${tenantConfig.title}`,
  });
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const { accessToken } = await buildServerRequestContext();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <CheckoutForm isAuthorized={Boolean(accessToken)} />
      <CartSummaryCard editable={false} showCheckoutCta={false} />
    </div>
  );
}
