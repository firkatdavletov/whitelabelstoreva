"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useRemoveStorefrontCartItemMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useTenantTheme } from "@/features/tenant-theme";
import { formatCurrency } from "@/shared/lib/currency";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

type CartSummaryCardProps = {
  editable?: boolean;
  showCheckoutCta?: boolean;
};

export function CartSummaryCard({
  editable = true,
  showCheckoutCta = true,
}: CartSummaryCardProps) {
  const { href, locale, tenantSlug } = useStorefrontRoute();
  const tenantConfig = useTenantTheme();
  const { data: storefrontCart, isLoading } =
    useStorefrontCartQuery(tenantSlug);
  const removeCartItemMutation =
    useRemoveStorefrontCartItemMutation(tenantSlug);
  const { t } = useTranslation();
  const summaryDescription = editable
    ? t("cart.subtitle")
    : t("cart.checkoutSubtitle");

  if (isLoading && !storefrontCart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cart.title")}</CardTitle>
          <CardDescription>{t("cart.loading")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!storefrontCart || !storefrontCart.items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cart.title")}</CardTitle>
          <CardDescription>{summaryDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{t("cart.empty")}</p>
          <Button asChild className="w-full">
            <Link href={href("/menu")}>{t("cart.continue")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{t("cart.summary")}</CardTitle>
            <CardDescription>{summaryDescription}</CardDescription>
          </div>
          <Badge>{storefrontCart.itemsCount}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {storefrontCart.items.map((item) => (
            <div
              className="border-border/70 bg-background/80 flex items-start justify-between gap-4 rounded-xl border p-3"
              key={item.id}
            >
              <div className="min-w-0">
                <p className="font-medium">{item.title}</p>
                {item.modifierNames.length ? (
                  <p className="text-muted-foreground text-sm">
                    {item.modifierNames.join(", ")}
                  </p>
                ) : null}
                <p className="text-muted-foreground text-sm">
                  {t("shared.quantity")}: {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {formatCurrency(
                    item.lineTotal,
                    tenantConfig.currency,
                    locale,
                  )}
                </p>
                {editable ? (
                  <Button
                    aria-label={`Remove ${item.title}`}
                    disabled={removeCartItemMutation.isPending}
                    onClick={() => removeCartItemMutation.mutate(item.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div className="border-border flex items-center justify-between border-t border-dashed pt-4">
          <span className="text-muted-foreground text-sm">
            {t("shared.total")}
          </span>
          <span className="text-xl font-semibold">
            {formatCurrency(
              storefrontCart.totalPrice,
              tenantConfig.currency,
              locale,
            )}
          </span>
        </div>
        {showCheckoutCta ? (
          <Button asChild className="w-full" size="lg">
            <Link href={href("/checkout")}>{t("cart.checkout")}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
