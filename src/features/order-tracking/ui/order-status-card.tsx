"use client";

import { CheckCircle2, Clock3, Package2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Order, OrderTimelineStep } from "@/entities/order";
import { useOrderTrackingQuery } from "@/features/order-tracking/hooks/use-order-tracking-query";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/lib/styles";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

type OrderStatusCardProps = {
  initialData?: Order | null;
  orderId: string;
  supportEmail?: string;
  tenantSlug: string;
};

type OrderDetailRowProps = {
  hint?: string | null;
  label: string;
  value: string;
};

function TrackingPageSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[2.25rem]">
      <CardContent className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-36 rounded-full" />
            </div>
            <Skeleton className="h-14 w-72 rounded-full" />
            <Skeleton className="h-5 w-64 rounded-full" />
            <div className="space-y-3 pt-3">
              <Skeleton className="h-24 rounded-[1.75rem]" />
              <Skeleton className="h-24 rounded-[1.75rem]" />
              <Skeleton className="h-24 rounded-[1.75rem]" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-56 rounded-[1.75rem]" />
            <Skeleton className="h-72 rounded-[1.75rem]" />
          </div>
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

function formatOrderPrice(value: number, currency: string, locale: string) {
  try {
    return formatCurrency(
      value,
      currency as "EUR" | "RUB" | "USD",
      locale as "en" | "ru",
    );
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
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

function resolveStepLabel(
  step: OrderTimelineStep,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const translationKey = `order.states.${step.code}`;
  const translated = t(translationKey);

  return translated !== translationKey ? translated : (step.label ?? step.code);
}

function buildCancelOrderHref(
  order: Order,
  supportEmail: string,
  subjectLabel: string,
) {
  const subject = encodeURIComponent(`${subjectLabel}: ${order.orderNumber}`);
  const body = encodeURIComponent(
    `Order number: ${order.orderNumber}\nOrder ID: ${order.id}\n`,
  );

  return `mailto:${supportEmail}?subject=${subject}&body=${body}`;
}

function OrderDetailRow({ hint, label, value }: OrderDetailRowProps) {
  return (
    <div className="border-border/65 bg-background/72 space-y-1.5 rounded-[1.4rem] border p-4">
      <p className="text-muted-foreground text-[0.68rem] font-medium tracking-[0.2em] uppercase">
        {label}
      </p>
      <p className="text-sm font-medium sm:text-[0.98rem]">{value}</p>
      {hint ? <p className="text-muted-foreground text-sm">{hint}</p> : null}
    </div>
  );
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
  supportEmail,
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
      <Card className="rounded-[2rem]">
        <CardContent className="space-y-4 p-6 sm:p-8">
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : t("order.trackingError")}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            {t("shared.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const orderAddress = data.pickupPointAddress ?? data.deliveryAddress;
  const cancelOrderHref =
    data.isCancellable && supportEmail
      ? buildCancelOrderHref(data, supportEmail, t("order.cancelOrder"))
      : null;

  return (
    <Card className="border-border/70 overflow-hidden rounded-[2.5rem] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_96%,white),color-mix(in_srgb,var(--secondary)_24%,white)_48%,color-mix(in_srgb,var(--background)_92%,white))] shadow-[0_36px_110px_-56px_rgba(31,26,23,0.42)]">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <section className="border-border/60 relative overflow-hidden border-b lg:border-r lg:border-b-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_34%)]" />
            <div className="pointer-events-none absolute top-0 right-0 h-52 w-52 translate-x-1/4 -translate-y-1/4 rounded-full bg-[color-mix(in_srgb,var(--primary)_18%,white)] blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 -translate-x-1/4 translate-y-1/4 rounded-full bg-[color-mix(in_srgb,var(--secondary)_54%,white)] blur-3xl" />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge
                        className="rounded-full px-3.5 py-1.5"
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
                      <span className="border-border/60 bg-background/76 text-muted-foreground inline-flex items-center rounded-full border px-3.5 py-1.5 text-[0.68rem] font-medium tracking-[0.22em] uppercase">
                        {data.deliveryMethodName}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <CardTitle className="max-w-[11ch] text-4xl leading-none font-semibold tracking-tight sm:text-[3.4rem]">
                        {data.statusLabel}
                      </CardTitle>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                        <span>
                          {t("order.orderNumber", { number: data.orderNumber })}
                        </span>
                        <span className="bg-border h-1 w-1 rounded-full" />
                        <span>
                          {formatOrderDateTime(data.createdAt, locale)}
                        </span>
                        <span className="bg-border h-1 w-1 rounded-full" />
                        <span>
                          {t("order.itemsCount", { count: data.itemsCount })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px]">
                    <div className="border-border/60 bg-background/80 rounded-[1.85rem] border p-5 sm:text-right">
                      <p className="text-muted-foreground text-[0.68rem] font-medium tracking-[0.22em] uppercase">
                        {t("order.total")}
                      </p>
                      <p className="font-heading mt-3 text-3xl font-semibold tracking-tight">
                        {formatOrderPrice(
                          data.totalPrice,
                          data.currency,
                          locale,
                        )}
                      </p>
                    </div>

                    {cancelOrderHref ? (
                      <Button
                        asChild
                        className="border-destructive/18 bg-background/84 text-foreground hover:border-destructive/36 hover:bg-destructive/6 h-11 rounded-full"
                        size="lg"
                        variant="outline"
                      >
                        <a href={cancelOrderHref}>{t("order.cancelOrder")}</a>
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3">
                  {data.timeline.map((step) => (
                    <div
                      className={cn(
                        "flex items-start justify-between gap-4 rounded-[1.65rem] border p-4 transition-colors sm:p-5",
                        step.isCurrent
                          ? "border-primary/28 bg-background/84 shadow-[0_18px_40px_-30px_var(--primary)]"
                          : step.isCompleted
                            ? "border-border/60 bg-card/68"
                            : "border-border/70 bg-background/74",
                      )}
                      key={step.id}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={cn(
                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
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

                        <div className="space-y-1">
                          <p className="font-medium">
                            {resolveStepLabel(step, t)}
                          </p>
                          {step.timestamp ? (
                            <p className="text-muted-foreground text-sm">
                              {formatOrderDateTime(step.timestamp, locale)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <StepStatusBadge step={step} t={t} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_98%,white),color-mix(in_srgb,var(--background)_90%,white))] p-6 sm:p-8">
            <div className="space-y-4">
              <section className="border-border/65 bg-card/72 rounded-[1.9rem] border p-5">
                <div className="grid gap-3">
                  <OrderDetailRow
                    label={t("order.deliveryMethod")}
                    value={data.deliveryMethodName}
                  />
                  <OrderDetailRow
                    hint={data.pickupPointName}
                    label={
                      data.pickupPointAddress
                        ? t("order.pickupPoint")
                        : t("order.address")
                    }
                    value={orderAddress ?? t("order.missingAddress")}
                  />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <OrderDetailRow
                      label={t("order.payment")}
                      value={data.paymentMethodName ?? "—"}
                    />
                    <OrderDetailRow
                      label={t("order.statusUpdated")}
                      value={formatOrderDateTime(data.statusChangedAt, locale)}
                    />
                  </div>
                </div>
              </section>

              <section className="border-border/65 bg-card/72 rounded-[1.9rem] border p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-muted-foreground text-[0.7rem] font-medium tracking-[0.22em] uppercase">
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
                        className="border-border/60 bg-background/76 rounded-[1.45rem] border p-4"
                        key={item.id}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.modifiers.length ? (
                              <p className="text-muted-foreground mt-1 text-sm">
                                {item.modifiers.join(", ")}
                              </p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">×{item.quantity}</p>
                            <p className="text-muted-foreground mt-1 text-sm">
                              {formatOrderPrice(
                                item.totalPrice,
                                data.currency,
                                locale,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-border/70 bg-background/54 text-muted-foreground rounded-[1.45rem] border border-dashed p-4 text-sm">
                      {t("order.itemsPending")}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
}
