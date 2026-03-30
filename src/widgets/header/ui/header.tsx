"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { cartSelectors, useCartStore } from "@/entities/cart";
import { useTenantTheme } from "@/features/tenant-theme";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { cn } from "@/shared/lib/styles";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/store/ui-store";

const navigationItems = [
  { key: "home", pathname: "" },
  { key: "menu", pathname: "/menu" },
  { key: "cart", pathname: "/cart" },
  { key: "checkout", pathname: "/checkout" },
];

export function Header() {
  const pathname = usePathname();
  const { href, locale } = useStorefrontRoute();
  const cartCount = useCartStore((state) => cartSelectors.itemsCount(state.items));
  const openCartSidebar = useUiStore((state) => state.openCartSidebar);
  const tenantConfig = useTenantTheme();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" href={href()}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
            {tenantConfig.logoText.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold">{tenantConfig.logoText}</p>
            <p className="truncate text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {tenantConfig.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navigationItems.map((item) => {
            const itemHref = href(item.pathname);
            const isActive = pathname === itemHref;

            return (
              <Link
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                href={itemHref}
                key={item.key}
              >
                {t(`navigation.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Badge variant="outline">
            {t("header.localeLabel")}: {locale.toUpperCase()}
          </Badge>
          <Button onClick={openCartSidebar} variant="outline">
            <ShoppingBag className="h-4 w-4" />
            {t("navigation.cart")}
            <Badge className="ml-1">{cartCount}</Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}
