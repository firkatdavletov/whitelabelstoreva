"use client";

import Link from "next/link";
import {
  ChevronDown,
  Clock3,
  MapPin,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type {
  StorefrontCartDelivery,
  StorefrontCartDeliveryMethod,
} from "@/entities/cart";
import { resolveDeliveryQuoteEta } from "@/entities/cart";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useTenantTheme } from "@/features/tenant-theme";
import { formatCurrency } from "@/shared/lib/currency";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useUiStore } from "@/store/ui-store";

function isPickupDeliveryMethod(
  deliveryMethod: StorefrontCartDeliveryMethod | null | undefined,
): boolean {
  return (
    deliveryMethod === "PICKUP" || deliveryMethod === "YANDEX_PICKUP_POINT"
  );
}

function formatDeliveryAddress(
  delivery: StorefrontCartDelivery | null | undefined,
) {
  if (!delivery) {
    return null;
  }

  if (
    delivery.deliveryMethod === "PICKUP" ||
    delivery.deliveryMethod === "YANDEX_PICKUP_POINT"
  ) {
    return (
      delivery.pickupPointName ??
      delivery.pickupPointAddress ??
      delivery.quote?.pickupPointName ??
      delivery.quote?.pickupPointAddress ??
      null
    );
  }

  const addressParts = [
    delivery.address?.city,
    delivery.address?.street,
    delivery.address?.house,
    delivery.address?.apartment ? `кв. ${delivery.address.apartment}` : null,
  ].filter(Boolean);

  const addressLine = addressParts.join(", ");

  if (addressLine && delivery.quote?.zoneName) {
    return `${addressLine} · ${delivery.quote.zoneName}`;
  }

  return addressLine || delivery.quote?.zoneName || null;
}

function formatDeliveryEtaLabel(
  eta: ReturnType<typeof resolveDeliveryQuoteEta>,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (!eta) {
    return null;
  }

  if (eta.kind === "minutes") {
    return t("header.etaMinutes", {
      minutes: eta.value,
    });
  }

  if (eta.kind === "days") {
    return eta.value === 0
      ? t("header.etaToday")
      : t("header.etaDays", {
          days: eta.value,
        });
  }

  return eta.value;
}

export function Header() {
  const { href, locale, tenantSlug } = useStorefrontRoute();
  const openCartSidebar = useUiStore((state) => state.openCartSidebar);
  const tenantConfig = useTenantTheme();
  const { data: storefrontCart } = useStorefrontCartQuery(tenantSlug);
  const { t } = useTranslation();
  const isPickup = isPickupDeliveryMethod(
    storefrontCart?.delivery?.deliveryMethod,
  );
  const deliveryAddress = formatDeliveryAddress(storefrontCart?.delivery);
  const cartCount = storefrontCart?.itemsCount ?? 0;
  const cartTotal = storefrontCart?.totalPrice ?? 0;

  const addressLabel = t(
    isPickup ? "header.pickupAddressLabel" : "header.deliveryAddressLabel",
    {
      address: deliveryAddress ?? t("header.addressPending"),
    },
  );
  const etaLabel = formatDeliveryEtaLabel(
    storefrontCart?.delivery?.quote && !storefrontCart.delivery.quoteExpired
      ? resolveDeliveryQuoteEta(storefrontCart.delivery.quote)
      : null,
    t,
  );

  const cartTotalLabel =
    cartTotal > 0
      ? formatCurrency(cartTotal, tenantConfig.currency, locale, {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        })
      : null;

  return (
    <header className="border-border/60 bg-background/95 md:bg-background/85 border-b md:sticky md:top-0 md:z-40 md:backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            className="flex min-w-0 flex-1 items-center gap-3"
            href={href()}
          >
            <div className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold">
              {tenantConfig.logoText.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="font-heading truncate text-lg font-semibold tracking-[0.18em]">
                {tenantConfig.logoText}
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <Button
              className="rounded-full px-3 sm:px-5"
              type="button"
              variant="ghost"
            >
              <UserRound className="h-4 w-4" />
              {t("header.login")}
            </Button>
            <Button
              className="rounded-full px-3 sm:px-5"
              onClick={openCartSidebar}
              size="lg"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartTotalLabel
                ? t("header.cartWithTotal", {
                    total: cartTotalLabel,
                  })
                : t("navigation.cart")}
              {cartCount ? (
                <Badge className="bg-primary-foreground/15 text-primary-foreground border-transparent">
                  {cartCount}
                </Badge>
              ) : null}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <Input
              aria-label={t("header.searchPlaceholder")}
              className="border-border/80 bg-card/95 h-12 rounded-full pr-4 pl-11 text-base shadow-sm"
              placeholder={t("header.searchPlaceholder")}
              type="search"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:ml-3">
            <Button
              asChild
              className="border-border/80 bg-card/90 h-11 justify-between rounded-full px-4 text-left shadow-sm sm:min-w-80"
              variant="outline"
            >
              <Link href={href("/delivery")}>
                <span className="flex min-w-0 items-center gap-2">
                  <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="truncate">{addressLabel}</span>
                </span>
                <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
              </Link>
            </Button>

            {etaLabel ? (
              <div className="bg-secondary text-secondary-foreground inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-sm">
                <Clock3 className="h-4 w-4 shrink-0" />
                <span>{etaLabel}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
