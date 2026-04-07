"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Navigation, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { useYandexPickupFlow } from "@/features/delivery-address/hooks/use-yandex-pickup-flow";
import { YandexMapPicker } from "@/features/delivery-address/ui/yandex-map-picker";
import { YandexPickupSearch } from "@/features/delivery-address/ui/yandex-pickup-search";
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
  buildYandexPickupDeliveryRequest,
  formatDeliveryDraftAddress,
  formatPickupPointAddress,
  getDefaultDeliveryMapCenter,
  isPickupDeliveryMethod,
  pickupPointToMapCenter,
  pickupPointToMapMarker,
  type DeliveryMapCenter,
  type MapPickupMarker,
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

function extractCourierAddressHint(
  delivery:
    | {
        address?: { city?: string | null; street?: string | null } | null;
        deliveryMethod?: string | null;
      }
    | null
    | undefined,
) {
  if (!delivery?.address) {
    return null;
  }

  const parts = [delivery.address.city, delivery.address.street].filter(
    Boolean,
  );

  return parts.length ? parts.join(", ") : null;
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

  const isYandexPickup = selectedMethodCode === "YANDEX_PICKUP_POINT";
  const isStorePickup = selectedMethodCode === "PICKUP";
  const isAnyPickup = isPickupDeliveryMethod(selectedMethodCode);

  const pickupPointsQuery = useQuery({
    enabled: isStorePickup,
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

  // Yandex pickup flow
  const courierAddressHint = extractCourierAddressHint(
    storefrontCart?.delivery,
  );
  const currentExternalId =
    currentMethodCode === "YANDEX_PICKUP_POINT"
      ? (storefrontCart?.delivery?.pickupPointExternalId ?? null)
      : null;
  const initialSearchHint =
    currentMethodCode === "YANDEX_PICKUP_POINT" && storefrontCart?.delivery
      ? (storefrontCart.delivery.pickupPointAddress ?? courierAddressHint)
      : null;

  const yandexPickup = useYandexPickupFlow({
    enabled: isYandexPickup,
    initialExternalId: currentExternalId,
    initialSearchHint,
  });

  const handleYandexLocateMe = useCallback(() => {
    if (typeof window === "undefined" || !window.navigator.geolocation) {
      toast.error(t("deliveryAddress.locationError"));
      return;
    }

    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        detectCourierCartDeliveryDraft(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          tenantSlug,
        )
          .then((draft) => {
            const cityQuery = draft?.address?.city;

            if (cityQuery) {
              yandexPickup.setSearchQuery(cityQuery);
              yandexPickup.submitSearch(cityQuery);
            }
          })
          .catch(() => {
            toast.error(t("deliveryAddress.yandexLocationError"));
          });
      },
      () => {
        toast.error(t("deliveryAddress.locationError"));
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  }, [t, tenantSlug, yandexPickup]);

  const handleYandexUseCourierAddress = useCallback(() => {
    if (courierAddressHint) {
      yandexPickup.setSearchQuery(courierAddressHint);
      yandexPickup.submitSearch(courierAddressHint);
    }
  }, [courierAddressHint, yandexPickup]);

  // Store pickup points
  const pickupPoints = pickupPointsQuery.data?.pickupPoints ?? [];
  const currentPickupAddress = storefrontCart?.delivery?.pickupPointAddress;
  const currentPickupName = storefrontCart?.delivery?.pickupPointName;
  const defaultSelectedPickupPointId =
    isStorePickup && pickupPoints.length
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

  // Map markers
  const storePickupMarkers: MapPickupMarker[] = isStorePickup
    ? pickupPoints
        .map(pickupPointToMapMarker)
        .filter((marker): marker is MapPickupMarker => marker !== null)
    : [];

  const yandexMapCenter =
    !pickupMapHasManualCenter &&
    yandexPickup.selectedPoint?.latitude != null &&
    yandexPickup.selectedPoint?.longitude != null
      ? {
          latitude: yandexPickup.selectedPoint.latitude,
          longitude: yandexPickup.selectedPoint.longitude,
        }
      : yandexPickup.markers.length > 0
        ? {
            latitude: yandexPickup.markers[0].latitude,
            longitude: yandexPickup.markers[0].longitude,
          }
        : mapCenter;

  const activeMarkers = isYandexPickup
    ? yandexPickup.markers
    : storePickupMarkers;
  const activeSelectedMarkerId = isYandexPickup
    ? yandexPickup.selectedPointId
    : isStorePickup
      ? selectedPickupPointId
      : null;
  const activeMapCenter =
    selectedMethodCode === "COURIER"
      ? mapCenter
      : isYandexPickup
        ? yandexMapCenter
        : pickupMapCenter;

  // Summary
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

  // Build cart delivery request
  const putCartDeliveryRequest = isYandexPickup
    ? yandexPickup.selectedPoint
      ? buildYandexPickupDeliveryRequest(yandexPickup.selectedPoint.id)
      : null
    : selectedMethodCode
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
      : isYandexPickup
        ? Boolean(yandexPickup.selectedPoint)
        : isStorePickup
          ? Boolean(selectedPickupPoint)
          : false);

  // Summary labels
  const selectedSummaryTitle = isYandexPickup
    ? t("deliveryAddress.yandexSelectedTitle")
    : isAnyPickup
      ? t("deliveryAddress.selectedPickupTitle")
      : t("deliveryAddress.selectedAddressTitle");

  const selectedSummaryPrimary = isYandexPickup
    ? yandexPickup.selectedPoint
      ? yandexPickup.selectedPoint.name
      : yandexPickup.isLoadingPoints
        ? t("deliveryAddress.mapLoading")
        : t("deliveryAddress.yandexSelectedPending")
    : isStorePickup
      ? (selectedPickupPoint?.name ??
        t("deliveryAddress.selectedPickupPending"))
      : courierDraftQuery.isLoading
        ? t("deliveryAddress.detecting")
        : (selectedAddressLabel ??
          t("deliveryAddress.selectedAddressPending"));

  const selectedSummarySecondary = isYandexPickup
    ? yandexPickup.selectedPoint
      ? (yandexPickup.selectedPoint.fullAddress ??
        yandexPickup.selectedPoint.address)
      : null
    : isStorePickup &&
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
        center={activeMapCenter}
        className="h-dvh rounded-none border-0 bg-muted/20"
        locale={locale}
        markers={activeMarkers}
        onCenterChange={(nextCenter) => {
          if (selectedMethodCode === "COURIER") {
            setMapCenter(nextCenter);
            return;
          }

          setPickupMapHasManualCenter(true);
          setMapCenter(nextCenter);
        }}
        onMarkerSelect={
          isAnyPickup
            ? (markerId) => {
                setPickupMapHasManualCenter(false);

                if (isYandexPickup) {
                  yandexPickup.selectPoint(markerId);
                } else {
                  setSelectedPickupPointIdOverride(markerId);
                }
              }
            : undefined
        }
        selectedMarkerId={activeSelectedMarkerId}
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

        {isYandexPickup ? (
          <div className="flex justify-center">
            <YandexPickupSearch
              courierAddressHint={courierAddressHint}
              isLoadingLocation={yandexPickup.isLoadingLocation}
              locationVariants={yandexPickup.locationVariants}
              onDismissVariants={yandexPickup.dismissVariants}
              onLocateMe={handleYandexLocateMe}
              onSelectVariant={yandexPickup.selectVariant}
              onSubmitSearch={yandexPickup.submitSearch}
              onUseCourierAddress={handleYandexUseCourierAddress}
              searchQuery={yandexPickup.searchQuery}
              setSearchQuery={yandexPickup.setSearchQuery}
            />
          </div>
        ) : null}
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
                {isYandexPickup &&
                yandexPickup.selectedPoint?.instruction ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("deliveryAddress.yandexInstruction")}:{" "}
                    {yandexPickup.selectedPoint.instruction}
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

            {isStorePickup && pickupPointsQuery.isLoading ? (
              <Skeleton className="h-12 rounded-2xl" />
            ) : null}

            {isStorePickup && pickupPointsQuery.isError ? (
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

            {isStorePickup &&
            !pickupPointsQuery.isLoading &&
            !pickupPointsQuery.isError &&
            !pickupPointsQuery.data?.pickupPoints.length ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                {t("deliveryAddress.pickupPointsEmpty")}
              </div>
            ) : null}

            {isYandexPickup && yandexPickup.isLoadingPoints ? (
              <Skeleton className="h-12 rounded-2xl" />
            ) : null}

            {isYandexPickup && yandexPickup.pointsError ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {yandexPickup.pointsError instanceof Error
                    ? yandexPickup.pointsError.message
                    : t("deliveryAddress.yandexPointsError")}
                </p>
                <Button
                  className="rounded-full"
                  onClick={() => yandexPickup.refetchPoints()}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("deliveryAddress.retry")}
                </Button>
              </div>
            ) : null}

            {isYandexPickup && yandexPickup.locationError ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-muted-foreground">
                {yandexPickup.locationError instanceof Error
                  ? yandexPickup.locationError.message
                  : t("deliveryAddress.yandexLocationError")}
              </div>
            ) : null}

            {isYandexPickup &&
            yandexPickup.geoId !== null &&
            !yandexPickup.isLoadingPoints &&
            !yandexPickup.pointsError &&
            yandexPickup.pickupPoints.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                {t("deliveryAddress.yandexEmptyPoints")}
              </div>
            ) : null}

            {isYandexPickup &&
            yandexPickup.geoId === null &&
            !yandexPickup.isLoadingLocation &&
            !yandexPickup.locationError ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                {t("deliveryAddress.yandexSearchHint")}
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
              {isYandexPickup
                ? t("deliveryAddress.yandexConfirm")
                : t("deliveryAddress.confirm")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
