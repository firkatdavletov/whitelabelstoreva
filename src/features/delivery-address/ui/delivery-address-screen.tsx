"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Navigation, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { resolveDeliveryQuoteEta } from "@/entities/cart";
import type { PutCartDeliveryRequestDto } from "@/entities/cart/api/cart.dto";
import { useUpdateStorefrontCartDeliveryMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import {
  detectCourierCartDeliveryDraft,
  findPickupPointById,
  getDeliveryMethods,
  getDeliveryPickupPoints,
} from "@/features/delivery-address/api/delivery-address.api";
import { YandexMapPicker } from "@/features/delivery-address/ui/yandex-map-picker";
import { env } from "@/shared/config/env";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/lib/styles";
import type { CurrencyCode } from "@/shared/types/common";
import { Button } from "@/shared/ui/button";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Skeleton } from "@/shared/ui/skeleton";

import {
  buildPutCartDeliveryRequest,
  formatDeliveryDraftAddress,
  formatPickupPointAddress,
  getDefaultDeliveryMapCenter,
  isPickupDeliveryMethod,
  pickupPointToMapCenter,
  type DeliveryMapCenter,
} from "@/features/delivery-address/lib/delivery-address.utils";
import {
  resolveDeliveryQuoteAvailability,
  resolveDeliveryQuoteUnavailableMessage,
} from "@/features/delivery-address/lib/delivery-quote.utils";

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

function formatDeliveryEtaLabel(
  eta: ReturnType<typeof resolveDeliveryQuoteEta>,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (!eta) {
    return null;
  }

  if (eta.kind === "minutes") {
    return t("deliveryAddress.etaMinutes", {
      minutes: eta.value,
    });
  }

  if (eta.kind === "days") {
    return eta.value === 0
      ? t("deliveryAddress.etaToday")
      : t("deliveryAddress.etaDays", {
          days: eta.value,
        });
  }

  return eta.value;
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
  const [selectedMethodCodeOverride, setSelectedMethodCodeOverride] = useState<
    PutCartDeliveryRequestDto["deliveryMethod"] | null
  >(null);
  const [selectedPickupPointIdOverride, setSelectedPickupPointIdOverride] =
    useState<string | null>(null);
  const [pickupMapHasManualCenter, setPickupMapHasManualCenter] =
    useState(false);
  const updateCartDeliveryMutation =
    useUpdateStorefrontCartDeliveryMutation(tenantSlug);

  const deliveryMethodsQuery = useQuery({
    gcTime: 0,
    queryFn: getDeliveryMethods,
    queryKey: ["delivery-methods", tenantSlug],
    refetchOnMount: "always",
    staleTime: 0,
  });

  const deliveryMethods = deliveryMethodsQuery.data?.methods ?? [];
  const currentMethodCode = storefrontCart?.delivery?.deliveryMethod;
  const defaultSelectedMethodCode =
    deliveryMethods.find((method) => method.code === currentMethodCode)?.code ??
    deliveryMethods[0]?.code ??
    null;
  const selectedMethodCode =
    (selectedMethodCodeOverride &&
    deliveryMethods.some((method) => method.code === selectedMethodCodeOverride)
      ? selectedMethodCodeOverride
      : null) ?? defaultSelectedMethodCode;
  const isPickup = isPickupDeliveryMethod(selectedMethodCode);

  const pickupPointsQuery = useQuery({
    enabled: isPickup,
    gcTime: 0,
    queryFn: () => getDeliveryPickupPoints(tenantSlug),
    queryKey: ["delivery-pickup-points", tenantSlug],
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
  const pickupPoints = pickupPointsQuery.data?.pickupPoints ?? [];
  const currentPickupAddress = storefrontCart?.delivery?.pickupPointAddress;
  const currentPickupName = storefrontCart?.delivery?.pickupPointName;
  const defaultSelectedPickupPointId =
    isPickup && pickupPoints.length
      ? (pickupPoints.find((pickupPoint) => {
          const formattedAddress = formatPickupPointAddress(pickupPoint);

          return (
            pickupPoint.name === currentPickupName ||
            formattedAddress === currentPickupAddress
          );
        })?.id ?? pickupPoints[0].id)
      : null;
  const selectedPickupPointId =
    (selectedPickupPointIdOverride &&
    pickupPoints.some(
      (pickupPoint) => pickupPoint.id === selectedPickupPointIdOverride,
    )
      ? selectedPickupPointIdOverride
      : null) ?? defaultSelectedPickupPointId;
  const selectedPickupPoint = findPickupPointById(
    pickupPoints,
    selectedPickupPointId,
  );
  const pickupMapCenter =
    !pickupMapHasManualCenter && selectedPickupPoint
      ? (pickupPointToMapCenter(selectedPickupPoint) ?? mapCenter)
      : mapCenter;

  const selectedCourierDraft =
    selectedMethodCode === "COURIER" ? courierDraftQuery.data : null;
  const selectedAddressLabel = formatDeliveryDraftAddress(selectedCourierDraft);
  const selectedPickupAddressLabel =
    formatPickupPointAddress(selectedPickupPoint);
  const selectedCourierQuoteEtaLabel = formatDeliveryEtaLabel(
    resolveDeliveryQuoteEta(selectedCourierDraft?.quote),
    t,
  );
  const selectedCourierQuoteAvailability = resolveDeliveryQuoteAvailability(
    selectedCourierDraft?.quote,
  );
  const selectedCourierQuoteUnavailableMessage =
    selectedCourierQuoteAvailability === false
      ? (resolveDeliveryQuoteUnavailableMessage(selectedCourierDraft?.quote) ??
        t("deliveryAddress.quoteUnavailableFallback"))
      : null;
  const quotePriceLabel = selectedCourierDraft?.quote
    ? formatQuotePrice(
        selectedCourierDraft.quote.currency,
        locale,
        selectedCourierDraft.quote.priceMinor,
      )
    : null;
  const putCartDeliveryRequest = selectedMethodCode
    ? buildPutCartDeliveryRequest(
        selectedMethodCode,
        selectedCourierDraft,
        selectedPickupPoint,
      )
    : null;
  const canSubmitSelectedAddress =
    Boolean(putCartDeliveryRequest) &&
    (selectedMethodCode === "COURIER"
      ? selectedCourierQuoteAvailability === true &&
        Boolean(env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY)
      : isPickup
        ? Boolean(selectedPickupPoint)
        : false);
  const selectedSummaryTitle = isPickup
    ? t("deliveryAddress.selectedPickupTitle")
    : t("deliveryAddress.selectedAddressTitle");
  const selectedSummaryPrimary = isPickup
    ? (selectedPickupPoint?.name ?? t("deliveryAddress.selectedPickupPending"))
    : courierDraftQuery.isLoading
      ? t("deliveryAddress.detecting")
      : (selectedAddressLabel ?? t("deliveryAddress.selectedAddressPending"));
  const selectedSummarySecondary =
    isPickup &&
    selectedPickupAddressLabel &&
    selectedPickupAddressLabel !== selectedPickupPoint?.name
      ? selectedPickupAddressLabel
      : null;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(href("/"));
  };

  const handleConfirm = () => {
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
          description: t("deliveryAddress.saveSuccessDescription"),
        });
        handleBack();
      },
    });
  };

  return (
    <section className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary)_12%,transparent),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--background)_94%,transparent),color-mix(in_srgb,var(--background)_78%,transparent))]">
      <YandexMapPicker
        center={selectedMethodCode === "COURIER" ? mapCenter : pickupMapCenter}
        className="h-dvh rounded-none border-0 bg-muted/20"
        locale={locale}
        onCenterChange={(nextCenter) => {
          if (selectedMethodCode === "COURIER") {
            setMapCenter(nextCenter);
            return;
          }

          setPickupMapHasManualCenter(true);
          setMapCenter(nextCenter);
        }}
        onPickupPointSelect={
          isPickup
            ? (pickupPoint) => {
                setPickupMapHasManualCenter(false);
                setSelectedPickupPointIdOverride(pickupPoint.id);
              }
            : undefined
        }
        pickupPoints={isPickup ? pickupPointsQuery.data?.pickupPoints ?? [] : []}
        selectedPickupPointId={isPickup ? selectedPickupPointId : null}
        showHint={false}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-36 bg-gradient-to-b from-background/88 via-background/36 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-48 bg-gradient-to-t from-background/92 via-background/48 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-3 p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Button
            className="pointer-events-auto h-11 rounded-full border-border/70 bg-background/86 px-4 shadow-lg backdrop-blur-xl"
            onClick={handleBack}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("deliveryAddress.back")}</span>
          </Button>

          {(deliveryMethodsQuery.isLoading ||
            deliveryMethodsQuery.isError ||
            !deliveryMethodsQuery.data?.methods.length) && (
            <div className="h-11 w-11 sm:w-28" />
          )}
        </div>

        <div className="flex justify-center">
          {deliveryMethodsQuery.isLoading ? (
            <Skeleton className="pointer-events-auto h-12 w-full max-w-md rounded-full border border-border/60 bg-background/75 shadow-lg backdrop-blur-xl" />
          ) : deliveryMethodsQuery.isError ? (
            <div className="pointer-events-auto flex max-w-xl flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-background/84 p-4 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {deliveryMethodsQuery.error instanceof Error
                  ? deliveryMethodsQuery.error.message
                  : t("deliveryAddress.methodsError")}
              </p>
              <Button
                className="rounded-full"
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
              className="pointer-events-auto border-border/70 bg-background/82 shadow-lg backdrop-blur-xl"
              onValueChange={(value) => {
                const nextMethodCode =
                  value as PutCartDeliveryRequestDto["deliveryMethod"];

                setSelectedMethodCodeOverride(nextMethodCode);

                if (isPickupDeliveryMethod(nextMethodCode)) {
                  setPickupMapHasManualCenter(false);
                }
              }}
              options={deliveryMethodsQuery.data.methods.map((method) => ({
                label: method.name,
                value: method.code,
              }))}
              value={
                selectedMethodCode ?? deliveryMethodsQuery.data.methods[0].code
              }
            />
          ) : (
            <div className="pointer-events-auto rounded-full border border-border/70 bg-background/84 px-5 py-3 text-sm text-muted-foreground shadow-lg backdrop-blur-xl">
              {t("deliveryAddress.methodsEmpty")}
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-3 sm:p-5">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-border/70 bg-background/84 shadow-[0_36px_120px_-64px_rgba(15,23,42,0.75)] backdrop-blur-2xl">
          <div className="pointer-events-auto space-y-4 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/88">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                  {selectedSummaryTitle}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground sm:text-base">
                  {selectedSummaryPrimary}
                </p>
                {selectedSummarySecondary ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedSummarySecondary}
                  </p>
                ) : null}
              </div>
            </div>

            {selectedMethodCode === "COURIER" && selectedCourierDraft?.quote ? (
              selectedCourierQuoteAvailability === false ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-destructive">
                  {selectedCourierQuoteUnavailableMessage}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                      {t("deliveryAddress.conditionsEta")}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {selectedCourierQuoteEtaLabel ??
                        t("deliveryAddress.conditionNotAvailable")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                      {t("deliveryAddress.conditionsPrice")}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {quotePriceLabel ?? t("deliveryAddress.free")}
                    </p>
                  </div>
                </div>
              )
            ) : null}

            {selectedMethodCode === "COURIER" && courierDraftQuery.isError ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-muted-foreground">
                {courierDraftQuery.error instanceof Error
                  ? courierDraftQuery.error.message
                  : t("deliveryAddress.detectError")}
              </div>
            ) : null}

            {isPickup && pickupPointsQuery.isLoading ? (
              <Skeleton className="h-12 rounded-2xl" />
            ) : null}

            {isPickup && pickupPointsQuery.isError ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {pickupPointsQuery.error instanceof Error
                    ? pickupPointsQuery.error.message
                    : t("deliveryAddress.pickupPointsError")}
                </p>
                <Button
                  className="rounded-full"
                  onClick={() => pickupPointsQuery.refetch()}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("deliveryAddress.retry")}
                </Button>
              </div>
            ) : null}

            {isPickup &&
            !pickupPointsQuery.isLoading &&
            !pickupPointsQuery.isError &&
            !pickupPointsQuery.data?.pickupPoints.length ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                {t("deliveryAddress.pickupPointsEmpty")}
              </div>
            ) : null}

            {!env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                {t("deliveryAddress.mapKeyMissing")}
              </div>
            ) : null}

            <Button
              className={cn(
                "h-12 w-full rounded-2xl shadow-none",
                !canSubmitSelectedAddress && "opacity-100",
              )}
              disabled={
                !canSubmitSelectedAddress ||
                courierDraftQuery.isLoading ||
                pickupPointsQuery.isLoading ||
                updateCartDeliveryMutation.isPending
              }
              onClick={handleConfirm}
              size="lg"
            >
              {updateCartDeliveryMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {t("deliveryAddress.confirm")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
