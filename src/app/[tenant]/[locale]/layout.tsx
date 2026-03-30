import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RootProviders } from "@/app/providers/root-providers";
import { tenantConfigs } from "@/entities/tenant";
import { resolveLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { SUPPORTED_LOCALES } from "@/shared/config/routing";
import type { RouteParams } from "@/shared/types/common";
import { CartSidebar } from "@/widgets/cart-sidebar";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

type StorefrontLayoutProps = {
  children: React.ReactNode;
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export function generateStaticParams() {
  return tenantConfigs.flatMap((tenant) =>
    SUPPORTED_LOCALES.map((locale) => ({
      locale,
      tenant: tenant.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: Pick<StorefrontLayoutProps, "params">): Promise<Metadata> {
  const { tenant } = await params;
  const tenantConfig = resolveTenant(tenant);

  return {
    description:
      tenantConfig?.description ??
      "White label storefront starter for food ordering.",
    title: tenantConfig ? `${tenantConfig.title} Storefront` : "White Label Storefront",
  };
}

export default async function StorefrontLayout({
  children,
  params,
}: StorefrontLayoutProps) {
  const { locale, tenant } = await params;
  const resolvedLocale = resolveLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!resolvedLocale || !tenantConfig) {
    notFound();
  }

  return (
    <RootProviders locale={resolvedLocale} tenantConfig={tenantConfig}>
      <div className="relative min-h-dvh bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary)_16%,transparent),transparent_60%)]" />
        <Header />
        <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
        <CartSidebar />
      </div>
    </RootProviders>
  );
}
