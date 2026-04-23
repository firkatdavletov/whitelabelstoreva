"use client";

import { createContext, useContext } from "react";

import type { TenantConfig } from "@/entities/tenant";
import { createTenantCssVariables } from "@/features/tenant-theme/lib/theme-css";

type TenantThemeContextValue = {
  tenantConfig: TenantConfig;
};

const TenantThemeContext = createContext<TenantThemeContextValue | null>(null);

type TenantThemeProviderProps = {
  children: React.ReactNode;
  tenantConfig: TenantConfig;
};

export function TenantThemeProvider({
  children,
  tenantConfig,
}: TenantThemeProviderProps) {
  return (
    <TenantThemeContext.Provider value={{ tenantConfig }}>
      <div
        className="text-foreground min-h-dvh"
        data-tenant={tenantConfig.slug}
        style={createTenantCssVariables(tenantConfig.theme)}
      >
        {children}
      </div>
    </TenantThemeContext.Provider>
  );
}

export function useTenantTheme() {
  const context = useContext(TenantThemeContext);

  if (!context) {
    throw new Error("useTenantTheme must be used within TenantThemeProvider.");
  }

  return context.tenantConfig;
}
