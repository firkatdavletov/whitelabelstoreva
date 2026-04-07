"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Order, OrderTimelineStep } from "@/entities/order";
import { useCurrentOrderQuery } from "@/features/order-tracking/hooks/use-current-order-query";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { cn } from "@/shared/lib/styles";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";

type CurrentOrderCardProps = {
  initialData?: Order | null;
};

function formatOrderDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
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

function resolveCurrentStep(order: Order) {
  return (
    order.timeline.find((step) => step.isCurrent) ??
    order.timeline.at(-1) ??
    null
  );
}

function resolveTimelineProgress(order: Order) {
  if (!order.timeline.length) {
    return 0;
  }

  const currentIndex = order.timeline.findIndex((step) => step.isCurrent);

  if (currentIndex === -1) {
    return order.isFinal ? 100 : 0;
  }

  return ((currentIndex + 1) / order.timeline.length) * 100;
}

function resolveStepLabel(
  step: OrderTimelineStep,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const translationKey = `order.states.${step.code}`;
  const translated = t(translationKey);

  return translated !== translationKey ? translated : (step.label ?? step.code);
}

export function CurrentOrderCard({ initialData }: CurrentOrderCardProps) {
  const { href, locale, tenantSlug } = useStorefrontRoute();
  const { t } = useTranslation();
  const { data } = useCurrentOrderQuery(tenantSlug, initialData);

  if (!data) {
    return null;
  }

  const currentStep = resolveCurrentStep(data);
  const progress = resolveTimelineProgress(data);

  return (
    <Link className="group block" href={href(`/orders/${data.id}`)}>
      <Card className="border-border/60 relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card)_96%,white),color-mix(in_srgb,var(--secondary)_62%,white)_58%,color-mix(in_srgb,var(--background)_84%,white))] shadow-[0_32px_80px_-46px_rgba(31,26,23,0.48)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_40px_96px_-44px_rgba(31,26,23,0.42)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_34%)]" />
        <div className="bg-primary/10 pointer-events-none absolute top-0 right-0 h-44 w-44 translate-x-1/4 -translate-y-1/4 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge
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
              <span className="border-border/60 bg-background/76 text-muted-foreground inline-flex items-center rounded-full border px-3 py-1 text-[0.68rem] font-medium tracking-[0.22em] uppercase">
                {data.deliveryMethodName}
              </span>
            </div>

            <ArrowUpRight className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <div className="mt-5 space-y-3">
            <h2 className="font-heading text-4xl leading-none font-semibold tracking-tight sm:text-[3.25rem]">
              {t("order.orderNumber", { number: data.orderNumber })}
            </h2>

            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
              {currentStep ? (
                <>
                  <span>{resolveStepLabel(currentStep, t)}</span>
                  <span className="bg-border h-1 w-1 rounded-full" />
                </>
              ) : null}
              <Clock3 className="h-4 w-4" />
              <span>{formatOrderDateTime(data.statusChangedAt, locale)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-foreground/10 relative h-1.5 overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--primary),color-mix(in_srgb,var(--primary)_52%,white))] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {data.timeline.map((step) => (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[0.72rem] font-medium transition-colors",
                    step.isCurrent
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : step.isCompleted
                        ? "border-border/70 bg-background/78 text-foreground"
                        : "border-border/60 text-muted-foreground bg-transparent",
                  )}
                  key={step.id}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      step.isCurrent
                        ? "bg-primary"
                        : step.isCompleted
                          ? "bg-primary/65"
                          : "bg-border",
                    )}
                  />
                  <span>{resolveStepLabel(step, t)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
