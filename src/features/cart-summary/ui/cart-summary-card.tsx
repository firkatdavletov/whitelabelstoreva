"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cartSelectors, useCartStore } from "@/entities/cart";
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

type CartSummaryCardProps = {
  showCheckoutCta?: boolean;
};

export function CartSummaryCard({
  showCheckoutCta = true,
}: CartSummaryCardProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const { href, locale } = useStorefrontRoute();
  const { t } = useTranslation();

  if (!items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cart.title")}</CardTitle>
          <CardDescription>{t("cart.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("cart.empty")}</p>
          <Button asChild className="w-full">
            <Link href={href("/menu")}>{t("cart.continue")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currency = items[0]?.currency ?? "USD";
  const total = cartSelectors.total(items);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{t("cart.summary")}</CardTitle>
            <CardDescription>{t("cart.subtitle")}</CardDescription>
          </div>
          <Badge>{cartSelectors.itemsCount(items)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-background/80 p-3"
              key={item.productId}
            >
              <div className="min-w-0">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t("shared.quantity")}: {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {formatCurrency(item.price * item.quantity, item.currency, locale)}
                </p>
                <Button
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeItem(item.productId)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-border pt-4">
          <span className="text-sm text-muted-foreground">{t("shared.total")}</span>
          <span className="text-xl font-semibold">
            {formatCurrency(total, currency, locale)}
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
