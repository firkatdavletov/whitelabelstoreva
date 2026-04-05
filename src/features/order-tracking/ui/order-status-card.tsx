"use client";

import { AlertCircle, CheckCircle2, Clock3, Package2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Order, OrderTimelineStep } from "@/entities/order";
import { useOrderTrackingQuery } from "@/features/order-tracking/hooks/use-order-tracking-query";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/lib/styles";
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

type OrderStatusCardProps = {
  initialData?: Order | null;
  orderId: string;
  tenantSlug: string;
};

function TrackingPageSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-10 w-56 rounded-full" />
        <Skeleton className="h-5 w-72 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function formatOrderDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

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

function formatEta(order: Order, t: ReturnType<typeof useTranslation>["t"]) {
  if (order.etaMinutes == null) {
    return t("order.missingEta");
  }

  return t("deliveryAddress.etaMinutes", { minutes: order.etaMinutes });
}

function resolveStatusBadgeVariant(order: Order) {
  if (order.stateType === "CANCELED" || order.stateType === "ON_HOLD") {
    return "outline" as const;
  }

  if (order.isFinal) {
    return "secondary" as const;
  }

  return "default" as const;
}

function resolveTrackingHints(
  order: Order,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const hints: string[] = [];

  if (order.trackingMeta.timelineSource === "derived") {
    hints.push(t("order.trackingFallbackTimeline"));
  }

  if (order.trackingMeta.etaSource === "missing") {
    hints.push(t("order.trackingFallbackEta"));
  }

  if (
    order.deliveryMethod === "COURIER" &&
    order.stateType === "OUT_FOR_DELIVERY" &&
    !order.trackingMeta.courierTrackingAvailable
  ) {
    hints.push(t("order.courierTrackingMissing"));
  }

  return hints;
}

function resolveStepLabel(
  step: OrderTimelineStep,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const translationKey = `order.states.${step.code}`;
  const translated = t(translationKey);

  return translated !== translationKey ? translated : (step.label ?? step.code);
}

function StepStatusBadge({
  step,
  t,
}: {
  step: OrderTimelineStep;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (step.isCurrent) {
    return <Badge variant="secondary">{t("order.live")}</Badge>;
  }

  if (step.isCompleted) {
    return <Badge variant="outline">{t("order.done")}</Badge>;
  }

  return null;
}

export function OrderStatusCard({
  initialData,
  orderId,
  tenantSlug,
}: OrderStatusCardProps) {
  const { data, error, isLoading, refetch } = useOrderTrackingQuery(
    orderId,
    tenantSlug,
    initialData,
  );
  const { locale } = useStorefrontRoute();
  const { t } = useTranslation();

  if (isLoading && !data) {
    return <TrackingPageSkeleton />;
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("order.title")}</CardTitle>
          <CardDescription>{t("order.trackingError")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-destructive/20 bg-destructive/6 p-4 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : t("order.trackingError")}
          </div>
          <Button onClick={() => refetch()} variant="outline">
            {t("shared.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const trackingHints = resolveTrackingHints(data, t);
  const orderAddress = data.pickupPointAddress ?? data.deliveryAddress;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_94%,white),color-mix(in_srgb,var(--secondary)_42%,white))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
              {t("order.orderNumber", { number: data.orderNumber })}
            </p>
            <div className="space-y-1.5">
              <CardTitle>{data.statusLabel}</CardTitle>
              <CardDescription>{t("order.activeSubtitle")}</CardDescription>
            </div>
          </div>
          <Badge
            className="w-fit"
            style={
              data.stateColor
                ? {
                    backgroundColor: `${data.stateColor}1A`,
                    borderColor: `${data.stateColor}40`,
                    color: data.stateColor,
                  }
                : undefined
            }
            variant={resolveStatusBadgeVariant(data)}
          >
            {data.statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {t("order.currentStatus")}
            </p>
            <p className="mt-3 text-lg font-semibold">{data.statusLabel}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`order.states.${data.stateType}`)}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {t("order.eta")}
            </p>
            <p className="mt-3 text-lg font-semibold">{formatEta(data, t)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.trackingMeta.etaSource === "backend"
                ? t("order.etaConfirmed")
                : t("order.etaPending")}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {t("order.total")}
            </p>
            <p className="mt-3 text-lg font-semibold">
              {formatOrderPrice(data.totalPrice, data.currency, locale)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("order.itemsCount", { count: data.itemsCount })}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {t("order.statusUpdated")}
            </p>
            <p className="mt-3 text-lg font-semibold">
              {formatOrderDateTime(data.statusChangedAt, locale)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("order.createdAt")}: {formatOrderDateTime(data.createdAt, locale)}
            </p>
          </div>
        </div>

        {trackingHints.length ? (
          <div className="rounded-[1.75rem] border border-amber-500/25 bg-amber-500/8 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-amber-500/12 p-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">{t("order.backendDataTitle")}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {trackingHints.map((hint) => (
                    <p key={hint}>{hint}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <section className="rounded-[2rem] border border-border/70 bg-background/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("order.timeline")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("order.timelineDescription")}
                </p>
              </div>
              <Clock3 className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-5 space-y-3">
              {data.timeline.map((step) => (
                <div
                  className={cn(
                    "flex items-start justify-between gap-4 rounded-[1.5rem] border p-4 transition-colors",
                    step.isCurrent
                      ? "border-primary/30 bg-primary/6"
                      : step.isCompleted
                        ? "border-border/60 bg-card/60"
                        : "border-border/70 bg-background/80",
                  )}
                  key={step.id}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 items-center justify-center rounded-full",
                        step.isCurrent
                          ? "bg-primary text-primary-foreground"
                          : step.isCompleted
                            ? "bg-secondary text-secondary-foreground"
                            : step.isIssue
                              ? "bg-destructive/12 text-destructive"
                              : "bg-muted text-muted-foreground",
                      )}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : step.isCurrent ? (
                        <Clock3 className="h-4 w-4" />
                      ) : (
                        <Package2 className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{resolveStepLabel(step, t)}</p>
                      {step.timestamp ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatOrderDateTime(step.timestamp, locale)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <StepStatusBadge step={step} t={t} />
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-[2rem] border border-border/70 bg-background/60 p-5">
              <p className="text-sm font-medium text-muted-foreground">
                {t("order.summary")}
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {t("order.deliveryMethod")}
                  </p>
                  <p className="mt-2 font-medium">{data.deliveryMethodName}</p>
                </div>

                <div className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {data.pickupPointAddress ? t("order.pickupPoint") : t("order.address")}
                  </p>
                  <p className="mt-2 font-medium">
                    {orderAddress ?? t("order.missingAddress")}
                  </p>
                  {data.pickupPointName ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {data.pickupPointName}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4">
                    <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                      {t("order.payment")}
                    </p>
                    <p className="mt-2 font-medium">
                      {data.paymentMethodName ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4">
                    <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                      {t("order.total")}
                    </p>
                    <p className="mt-2 font-medium">
                      {formatOrderPrice(data.totalPrice, data.currency, locale)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-background/60 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("order.items")}
                </p>
                <Badge variant="outline">
                  {t("order.itemsCount", { count: data.itemsCount })}
                </Badge>
              </div>

              <div className="mt-5 space-y-3">
                {data.items.length ? (
                  data.items.map((item) => (
                    <div
                      className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4"
                      key={item.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.modifiers.length ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.modifiers.join(", ")}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">×{item.quantity}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatOrderPrice(item.totalPrice, data.currency, locale)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                    {t("order.itemsPending")}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
