import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderStatusCard } from "@/features/order-tracking";
import { getOrderTracking } from "@/features/order-tracking/api/get-order-tracking";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { ApiError } from "@/shared/api";
import { buildServerRequestContext } from "@/shared/api/server-auth";
import {
  createNonIndexableStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";

type OrderPageProps = {
  params: RouteParams<{
    id: string;
    locale: string;
    tenant: string;
  }>;
};

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { id, locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return nonIndexableMetadata;
  }

  return createNonIndexableStorefrontMetadata({
    description: localeContext.dictionary.order.activeSubtitle,
    locale: localeContext.locale,
    pathname: `/orders/${id}`,
    tenantConfig,
    title: `${localeContext.dictionary.order.title} | ${tenantConfig.title}`,
  });
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id, locale, tenant } = await params;
  const tenantConfig = resolveTenant(tenant);

  if (!(await bootstrapLocale(locale)) || !tenantConfig) {
    notFound();
  }

  const requestContext = await buildServerRequestContext();

  let initialOrder = null;

  try {
    initialOrder = await getOrderTracking(id, tenant, requestContext);
  } catch (error) {
    if (error instanceof ApiError && [403, 404].includes(error.statusCode)) {
      notFound();
    }
  }

  return (
    <OrderStatusCard
      initialData={initialOrder}
      orderId={id}
      tenantSlug={tenant}
    />
  );
}
