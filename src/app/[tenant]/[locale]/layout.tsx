import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RootProviders } from "@/app/providers/root-providers";
import { tenantConfigs } from "@/entities/tenant";
import { resolveLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { SUPPORTED_LOCALES } from "@/shared/config/routing";
import {
  createStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";
import { Footer } from "@/widgets/footer";
import { StorefrontHeader } from "@/widgets/header";

export const dynamic = "force-dynamic";

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
  const { locale, tenant } = await params;
  const resolvedLocale = resolveLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!resolvedLocale || !tenantConfig) {
    return nonIndexableMetadata;
  }

  return createStorefrontMetadata({
    description: tenantConfig.description,
    locale: resolvedLocale,
    tenantConfig,
    title: `${tenantConfig.title} Storefront`,
  });
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
      <div className="bg-background relative min-h-dvh">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary)_16%,transparent),transparent_60%)]" />
        <StorefrontHeader />
        <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer
          locale={resolvedLocale}
          supportEmail={tenantConfig.supportEmail}
          tenantSlug={tenantConfig.slug}
          tenantTitle={tenantConfig.title}
        />
      </div>
    </RootProviders>
  );
}
