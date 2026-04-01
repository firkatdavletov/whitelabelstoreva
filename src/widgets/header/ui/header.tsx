"use client";

import { Search, ShoppingBag, UserRound } from "lucide-react";
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
import { useUiStore } from "@/store/ui-store";
import {
  HeaderActionLink,
  HeaderAddressLink,
  HeaderBrand,
} from "@/widgets/header/ui/header-primitives";

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
  const deliveryAddress =
    formatDeliveryAddress(storefrontCart?.delivery) ??
    t("header.addressPending");
  const cartCount = storefrontCart?.itemsCount ?? 0;
  const cartTotal = storefrontCart?.totalPrice ?? 0;
  const etaLabel = formatDeliveryEtaLabel(
    storefrontCart?.delivery?.quote && !storefrontCart.delivery.quoteExpired
      ? resolveDeliveryQuoteEta(storefrontCart.delivery.quote)
      : null,
    t,
  );
  const deliveryModeLabel = t(isPickup ? "header.pickup" : "header.delivery");

  const cartTotalLabel =
    cartTotal > 0
      ? formatCurrency(cartTotal, tenantConfig.currency, locale, {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        })
      : null;
  const cartButtonLabel = cartTotalLabel
    ? t("header.cartWithTotal", {
        total: cartTotalLabel,
      })
    : t("navigation.cart");

  return (
    <header className="border-border/60 bg-background/88 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 lg:grid-cols-[minmax(240px,0.9fr)_minmax(320px,0.8fr)_auto]">
          <HeaderBrand
            href={href()}
            logoText={tenantConfig.logoText}
            title={tenantConfig.title}
          />

          <div className="hidden lg:block">
            <HeaderAddressLink
              address={deliveryAddress}
              etaLabel={etaLabel}
              href={href("/delivery")}
              label={deliveryModeLabel}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <HeaderActionLink
              href={href("/search")}
              icon={<Search className="h-4 w-4" />}
              label={t("header.search")}
              labelClassName="xl:inline"
            />
            <HeaderActionLink
              href={href("/account")}
              icon={<UserRound className="h-4 w-4" />}
              label={t("header.login")}
              labelClassName="lg:inline"
            />
            <Button
              aria-label={cartButtonLabel}
              className="relative h-10 w-10 rounded-full px-0 shadow-sm sm:w-auto sm:px-4"
              onClick={openCartSidebar}
              size="lg"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className="sr-only">{cartButtonLabel}</span>
              <span className="hidden text-sm font-medium sm:inline xl:hidden">
                {t("navigation.cart")}
              </span>
              <span className="hidden text-sm font-medium xl:inline">
                {cartButtonLabel}
              </span>
              {cartCount ? (
                <Badge className="absolute -top-1 -right-1 min-w-5 justify-center px-1.5 py-0.5 sm:static sm:ml-1">
                  {cartCount}
                </Badge>
              ) : null}
            </Button>
          </div>
        </div>

        <div className="pb-3 lg:hidden">
          <HeaderAddressLink
            address={deliveryAddress}
            etaLabel={etaLabel}
            href={href("/delivery")}
            label={deliveryModeLabel}
          />
        </div>
      </div>
    </header>
  );
}
