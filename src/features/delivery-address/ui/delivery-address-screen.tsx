"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Navigation, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { PutCartDeliveryRequestDto } from "@/entities/cart/api/cart.dto";
import { useUpdateStorefrontCartDeliveryMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import {
  detectCourierCartDeliveryDraft,
  getDeliveryMethods,
} from "@/features/delivery-address/api/delivery-address.api";
import { YandexMapPicker } from "@/features/delivery-address/ui/yandex-map-picker";
import { env } from "@/shared/config/env";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import type { CurrencyCode } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Skeleton } from "@/shared/ui/skeleton";

import {
  buildPutCartDeliveryRequest,
  formatDeliveryDraftAddress,
  getDefaultDeliveryMapCenter,
  isPickupDeliveryMethod,
  type DeliveryMapCenter,
} from "@/features/delivery-address/lib/delivery-address.utils";

function formatQuotePrice(
  currency: string,
  locale: "en" | "ru",
  priceMinor: number | null | undefined,
) {
  if (priceMinor == null || priceMinor === 0) {
    return null;
  }

  if (currency === "EUR" || currency === "RUB" || currency === "USD") {
    return formatCurrency(priceMinor / 100, currency as CurrencyCode, locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  return `${priceMinor / 100} ${currency}`;
}

export function DeliveryAddressScreen() {
  const router = useRouter();
  const { href, locale, tenantSlug } = useStorefrontRoute();
  const { t } = useTranslation();
  const { data: storefrontCart } = useStorefrontCartQuery(tenantSlug);
  const [mapCenter, setMapCenter] = useState<DeliveryMapCenter>(() =>
    getDefaultDeliveryMapCenter(tenantSlug),
  );
  const [debouncedMapCenter, setDebouncedMapCenter] = useState(mapCenter);
  const [selectedMethodCode, setSelectedMethodCode] =
    useState<PutCartDeliveryRequestDto["deliveryMethod"] | null>(null);
  const updateCartDeliveryMutation =
    useUpdateStorefrontCartDeliveryMutation(tenantSlug);

  const deliveryMethodsQuery = useQuery({
    gcTime: 0,
    queryFn: getDeliveryMethods,
    queryKey: ["delivery-methods", tenantSlug],
    refetchOnMount: "always",
    staleTime: 0,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedMapCenter(mapCenter);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mapCenter]);

  useEffect(() => {
    if (!deliveryMethodsQuery.data?.methods.length || selectedMethodCode) {
      return;
    }

    const currentMethod = storefrontCart?.delivery?.deliveryMethod;
    const matchingMethod = deliveryMethodsQuery.data.methods.find(
      (method) => method.code === currentMethod,
    );

    setSelectedMethodCode(
      (matchingMethod?.code ??
        deliveryMethodsQuery.data.methods[0]?.code) as PutCartDeliveryRequestDto["deliveryMethod"],
    );
  }, [
    deliveryMethodsQuery.data?.methods,
    selectedMethodCode,
    storefrontCart?.delivery?.deliveryMethod,
  ]);

  const courierDraftQuery = useQuery({
    enabled: selectedMethodCode === "COURIER",
    queryFn: () =>
      detectCourierCartDeliveryDraft(
        {
          latitude: debouncedMapCenter.latitude,
          longitude: debouncedMapCenter.longitude,
        },
        tenantSlug,
      ),
    queryKey: [
      "courier-delivery-draft",
      tenantSlug,
      debouncedMapCenter.latitude,
      debouncedMapCenter.longitude,
    ],
  });

  const selectedMethod = deliveryMethodsQuery.data?.methods.find(
    (method) => method.code === selectedMethodCode,
  );
  const isPickup = isPickupDeliveryMethod(selectedMethodCode);
  const selectedCourierDraft =
    selectedMethodCode === "COURIER" ? courierDraftQuery.data : null;
  const selectedAddressLabel = formatDeliveryDraftAddress(selectedCourierDraft);
  const quotePriceLabel = selectedCourierDraft?.quote
    ? formatQuotePrice(
        selectedCourierDraft.quote.currency,
        locale,
        selectedCourierDraft.quote.priceMinor,
      )
    : null;
  const putCartDeliveryRequest = selectedMethodCode
    ? buildPutCartDeliveryRequest(selectedMethodCode, selectedCourierDraft)
    : null;
  const canSubmitSelectedAddress =
    Boolean(putCartDeliveryRequest) &&
    selectedMethodCode === "COURIER" &&
    Boolean(selectedCourierDraft?.quote?.available) &&
    Boolean(env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(href("/"));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Button className="-ml-3 w-fit" onClick={handleBack} variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("deliveryAddress.back")}
          </Button>
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-semibold">
              {t("deliveryAddress.title")}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("deliveryAddress.subtitle")}
            </p>
          </div>
        </div>

        {selectedMethod ? <Badge>{selectedMethod.name}</Badge> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("deliveryAddress.methodTitle")}</CardTitle>
          <CardDescription>
            {t("deliveryAddress.methodSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deliveryMethodsQuery.isLoading ? (
            <Skeleton className="h-12 w-full max-w-md rounded-full" />
          ) : deliveryMethodsQuery.isError ? (
            <div className="flex flex-col gap-3 rounded-[calc(var(--radius)+0.15rem)] border border-border/70 bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {deliveryMethodsQuery.error instanceof Error
                  ? deliveryMethodsQuery.error.message
                  : t("deliveryAddress.methodsError")}
              </p>
              <Button
                onClick={() => deliveryMethodsQuery.refetch()}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                {t("deliveryAddress.retry")}
              </Button>
            </div>
          ) : deliveryMethodsQuery.data?.methods.length ? (
            <SegmentedControl
              onValueChange={(value) =>
                setSelectedMethodCode(
                  value as PutCartDeliveryRequestDto["deliveryMethod"],
                )
              }
              options={deliveryMethodsQuery.data.methods.map((method) => ({
                label: method.name,
                value: method.code,
              }))}
              value={selectedMethodCode ?? deliveryMethodsQuery.data.methods[0].code}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("deliveryAddress.methodsEmpty")}
            </p>
          )}
        </CardContent>
      </Card>

      {selectedMethodCode === "COURIER" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>{t("deliveryAddress.mapTitle")}</CardTitle>
              <CardDescription>
                {t("deliveryAddress.mapSubtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <YandexMapPicker
                center={mapCenter}
                locale={locale}
                onCenterChange={setMapCenter}
              />
            </CardContent>
          </Card>

          <Card className="h-fit xl:sticky xl:top-28">
            <CardHeader>
              <CardTitle>{t("deliveryAddress.summaryTitle")}</CardTitle>
              <CardDescription>
                {t("deliveryAddress.summarySubtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-muted/35 p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-background text-primary rounded-full border border-border/70 p-2">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {t("deliveryAddress.selectedAddressTitle")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {courierDraftQuery.isLoading
                        ? t("deliveryAddress.detecting")
                        : selectedAddressLabel ??
                          t("deliveryAddress.selectedAddressPending")}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCourierDraft?.quote ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t("deliveryAddress.conditionsEta")}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {selectedCourierDraft.quote.message ??
                        t("deliveryAddress.conditionNotAvailable")}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t("deliveryAddress.conditionsPrice")}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {quotePriceLabel ?? t("deliveryAddress.free")}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t("deliveryAddress.conditionsZone")}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {selectedCourierDraft.quote.zoneName ??
                        t("deliveryAddress.conditionNotAvailable")}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t("deliveryAddress.conditionsStatus")}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {selectedCourierDraft.quote.available
                        ? t("deliveryAddress.available")
                        : t("deliveryAddress.unavailable")}
                    </p>
                  </div>
                </div>
              ) : courierDraftQuery.isError ? (
                <div className="rounded-[calc(var(--radius)+0.1rem)] border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
                  {courierDraftQuery.error instanceof Error
                    ? courierDraftQuery.error.message
                    : t("deliveryAddress.detectError")}
                </div>
              ) : null}

              {!env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ? (
                <div className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
                  {t("deliveryAddress.mapKeyMissing")}
                </div>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={
                  !canSubmitSelectedAddress ||
                  courierDraftQuery.isLoading ||
                  updateCartDeliveryMutation.isPending
                }
                onClick={() => {
                  if (!putCartDeliveryRequest) {
                    return;
                  }

                  updateCartDeliveryMutation.mutate(putCartDeliveryRequest, {
                    onError: (error) => {
                      toast.error(t("deliveryAddress.saveErrorTitle"), {
                        description:
                          error instanceof Error
                            ? error.message
                            : t("deliveryAddress.saveErrorDescription"),
                      });
                    },
                    onSuccess: () => {
                      toast.success(t("deliveryAddress.saveSuccessTitle"), {
                        description: t(
                          "deliveryAddress.saveSuccessDescription",
                        ),
                      });
                      handleBack();
                    },
                  });
                }}
                size="lg"
              >
                {updateCartDeliveryMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {t("deliveryAddress.confirm")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : isPickup ? null : null}
    </div>
  );
}
