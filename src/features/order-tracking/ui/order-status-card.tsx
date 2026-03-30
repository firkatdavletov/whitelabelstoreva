"use client";

import { useTranslation } from "react-i18next";

import { useOrderTrackingQuery } from "@/features/order-tracking/hooks/use-order-tracking-query";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

type OrderStatusCardProps = {
  orderId: string;
  tenantSlug: string;
};

export function OrderStatusCard({
  orderId,
  tenantSlug,
}: OrderStatusCardProps) {
  const { data, isLoading } = useOrderTrackingQuery(orderId, tenantSlug);
  const { t } = useTranslation();

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("order.title")}</CardTitle>
          <CardDescription>{t("order.loading")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{t("order.title")}</CardTitle>
            <CardDescription>{t("order.subtitle")}</CardDescription>
          </div>
          <Badge>{data.statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("order.currentStatus")}
            </p>
            <p className="mt-2 font-medium">{data.statusLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("order.eta")}
            </p>
            <p className="mt-2 font-medium">{data.etaMinutes} min</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Items
            </p>
            <p className="mt-2 font-medium">{data.itemsCount}</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{t("order.timeline")}</p>
          {data.timeline.map((step) => (
            <div
              className="flex items-center justify-between rounded-xl border border-border/70 bg-card/70 px-4 py-3"
              key={`${step.status}-${step.timestamp}`}
            >
              <div>
                <p className="font-medium">{step.label}</p>
                <p className="text-sm text-muted-foreground">{step.timestamp}</p>
              </div>
              {step.isCurrent ? <Badge variant="secondary">Live</Badge> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
