import { notFound } from "next/navigation";

import { OrderStatusCard } from "@/features/order-tracking";
import { getOrderTracking } from "@/features/order-tracking/api/get-order-tracking";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { ApiError } from "@/shared/api";
import { buildServerRequestContext } from "@/shared/api/server-auth";
import type { RouteParams } from "@/shared/types/common";

type OrderPageProps = {
  params: RouteParams<{
    id: string;
    locale: string;
    tenant: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id, locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
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
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-semibold">
          {localeContext.dictionary.order.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {localeContext.dictionary.order.subtitle}
        </p>
      </div>
      <OrderStatusCard
        initialData={initialOrder}
        orderId={id}
        tenantSlug={tenant}
      />
    </div>
  );
}
