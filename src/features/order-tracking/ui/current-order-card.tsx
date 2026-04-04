"use client";

import Link from "next/link";
import { ArrowRight, Clock3, ReceiptText } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Order } from "@/entities/order";
import { useCurrentOrderQuery } from "@/features/order-tracking/hooks/use-current-order-query";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import { Badge } from "@/shared/ui/badge";

type CurrentOrderCardProps = {
  initialData?: Order | null;
};

function formatOrderPrice(
  value: number,
  currency: string,
  locale: string,
) {
  try {
    return formatCurrency(value, currency as "EUR" | "RUB" | "USD", locale as "en" | "ru");
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function CurrentOrderCard({ initialData }: CurrentOrderCardProps) {
  const { href, locale, tenantSlug } = useStorefrontRoute();
  const { t } = useTranslation();
  const { data } = useCurrentOrderQuery(tenantSlug, initialData);

  if (!data) {
    return null;
  }

  const locationLabel = data.pickupPointAddress ?? data.deliveryAddress;

  return (
    <Link
      className="group block"
      href={href(`/orders/${data.id}`)}
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_94%,white),color-mix(in_srgb,var(--secondary)_54%,white))] p-6 shadow-[0_28px_80px_-46px_rgba(31,26,23,0.48)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_36px_90px_-44px_rgba(31,26,23,0.44)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.88),transparent_28%)]" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[0.7rem] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                {t("order.currentOrder")}
              </span>
              <Badge>{data.statusLabel}</Badge>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-[2.2rem]">
                {t("order.orderNumber", { number: data.orderNumber })}
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {t("order.currentOrderSubtitle")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/70 bg-background/86 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-xs font-medium tracking-[0.18em] uppercase">
                    {t("order.eta")}
                  </span>
                </div>
                <p className="mt-3 font-semibold">
                  {data.etaMinutes == null
                    ? t("order.missingEta")
                    : t("deliveryAddress.etaMinutes", { minutes: data.etaMinutes })}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-background/86 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ReceiptText className="h-4 w-4" />
                  <span className="text-xs font-medium tracking-[0.18em] uppercase">
                    {t("order.total")}
                  </span>
                </div>
                <p className="mt-3 font-semibold">
                  {formatOrderPrice(data.totalPrice, data.currency, locale)}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-background/86 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ReceiptText className="h-4 w-4" />
                  <span className="text-xs font-medium tracking-[0.18em] uppercase">
                    {t("order.items")}
                  </span>
                </div>
                <p className="mt-3 font-semibold">
                  {t("order.itemsCount", { count: data.itemsCount })}
                </p>
              </div>
            </div>

            {locationLabel ? (
              <p className="text-sm text-muted-foreground">
                {locationLabel}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 self-start rounded-full border border-border/60 bg-background/84 px-4 py-2 text-sm font-medium shadow-sm transition-transform duration-300 group-hover:translate-x-1 lg:self-end">
            <span>{t("order.trackOrder")}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </section>
    </Link>
  );
}
