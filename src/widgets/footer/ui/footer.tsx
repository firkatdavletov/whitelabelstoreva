"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useTenantTheme } from "@/features/tenant-theme";

export function Footer() {
  const tenantConfig = useTenantTheme();
  const pathname = usePathname();
  const { t } = useTranslation();

  if (pathname.endsWith("/delivery")) {
    return null;
  }

  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p className="font-medium text-foreground">{tenantConfig.title}</p>
        <p>{t("footer.subtitle")}</p>
        <p>{t("footer.caption")}</p>
        <p>{tenantConfig.supportEmail}</p>
      </div>
    </footer>
  );
}
