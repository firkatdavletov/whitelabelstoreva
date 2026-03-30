import { notFound } from "next/navigation";

import { CartSummaryCard } from "@/features/cart-summary";
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-3">
        <h1 className="font-heading text-4xl font-semibold">
          {localeContext.dictionary.cart.title}
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          {localeContext.dictionary.cart.subtitle}
        </p>
      </div>
      <CartSummaryCard />
    </div>
  );
}
