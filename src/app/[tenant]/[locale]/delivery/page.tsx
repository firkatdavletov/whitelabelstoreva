import { notFound } from "next/navigation";

import { DeliveryAddressScreen } from "@/features/delivery-address";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import type { RouteParams } from "@/shared/types/common";

type DeliveryPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  return <DeliveryAddressScreen />;
}
