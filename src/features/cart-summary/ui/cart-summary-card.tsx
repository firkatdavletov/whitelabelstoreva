"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useRemoveStorefrontCartItemMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useTenantTheme } from "@/features/tenant-theme";
import { formatCurrency } from "@/shared/lib/currency";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import type { CurrencyCode } from "@/shared/types/common";
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

function formatDeliveryPrice(
  locale: "en" | "ru",
  priceMinor: number | null | undefined,
  currency: string | null | undefined,
) {
  if (priceMinor == null) {
    return "—";
  }

  if (currency === "EUR" || currency === "RUB" || currency === "USD") {
    return formatCurrency(priceMinor / 100, currency as CurrencyCode, locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  if (!currency) {
    return `${priceMinor / 100}`;
  }

  return `${priceMinor / 100} ${currency}`;
}

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
  const deliveryMethod = storefrontCart?.delivery?.deliveryMethod;
  const isCustomAddressDelivery = deliveryMethod === "CUSTOM_DELIVERY_ADDRESS";
  const shouldShowDeliveryPrice =
    !editable && Boolean(deliveryMethod) && deliveryMethod !== "PICKUP";
  const isFreeDelivery =
    shouldShowDeliveryPrice &&
    !isCustomAddressDelivery &&
    storefrontCart?.delivery?.quote?.priceMinor === 0;
  const deliveryPriceLabel = shouldShowDeliveryPrice
    ? formatDeliveryPrice(
        locale,
        storefrontCart?.delivery?.quote?.priceMinor,
        storefrontCart?.delivery?.quote?.currency,
      )
    : null;

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
          <Button
            asChild
            className="text-primary-foreground hover:text-primary-foreground w-full"
          >
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
              className="border-border/70 bg-background/80 flex items-start gap-3 rounded-xl border p-3"
              key={item.id}
            >
              {item.imageUrl ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--secondary)_74%,white)]">
                  <Image
                    alt={item.title}
                    className="object-cover"
                    fill
                    sizes="40px"
                    src={item.imageUrl}
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
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
            </div>
          ))}
        </div>
        <div className="border-border space-y-2 border-t border-dashed pt-4">
          {shouldShowDeliveryPrice ? (
            isCustomAddressDelivery ? (
              <p className="text-muted-foreground text-sm">
                {t("cart.deliveryCalculatedIndividually")}
              </p>
            ) : (
              <div className="flex items-center justify-between gap-4">
                {isFreeDelivery ? (
                  <span className="text-muted-foreground text-sm">
                    {t("cart.deliveryFree")}
                  </span>
                ) : (
                  <>
                    <span className="text-muted-foreground text-sm">
                      {t("cart.delivery")}
                    </span>
                    <span className="text-sm font-medium">
                      {deliveryPriceLabel}
                    </span>
                  </>
                )}
              </div>
            )
          ) : null}
          <div className="flex items-center justify-between">
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
        </div>
        {showCheckoutCta ? (
          <Button
            asChild
            className="text-primary-foreground hover:text-primary-foreground w-full"
            size="lg"
          >
            <Link href={href("/checkout")}>{t("cart.checkout")}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
