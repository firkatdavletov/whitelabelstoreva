"use client";

import type { TenantConfig } from "@/entities/tenant";
import { TenantThemeProvider } from "@/features/tenant-theme";
import { AppI18nProvider } from "@/shared/i18n/i18n-provider";
import type { Locale } from "@/shared/types/common";
import { AppToaster } from "@/shared/ui/sonner";

import { QueryProvider } from "@/app/providers/query-provider";

type RootProvidersProps = {
  children: React.ReactNode;
  locale: Locale;
  tenantConfig: TenantConfig;
};

// App-level composition belongs here so route segments stay focused on orchestration instead of provider plumbing.
export function RootProviders({
  children,
  locale,
  tenantConfig,
}: RootProvidersProps) {
  return (
    <QueryProvider>
      <AppI18nProvider locale={locale}>
        <TenantThemeProvider tenantConfig={tenantConfig}>
          {children}
          <AppToaster />
        </TenantThemeProvider>
      </AppI18nProvider>
    </QueryProvider>
  );
}
