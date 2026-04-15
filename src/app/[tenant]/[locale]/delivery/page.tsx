import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeliveryAddressScreen } from "@/features/delivery-address";
import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import {
  createNonIndexableStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";

type DeliveryPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export async function generateMetadata({
  params,
}: DeliveryPageProps): Promise<Metadata> {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return nonIndexableMetadata;
  }

  return createNonIndexableStorefrontMetadata({
    description: localeContext.dictionary.deliveryAddress.subtitle,
    locale: localeContext.locale,
    pathname: "/delivery",
    tenantConfig,
    title: `${localeContext.dictionary.deliveryAddress.title} | ${tenantConfig.title}`,
  });
}

export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  return (
    <div className="relative left-1/2 -mt-6 -mb-16 w-dvw max-w-none -translate-x-1/2">
      <DeliveryAddressScreen />
    </div>
  );
}
