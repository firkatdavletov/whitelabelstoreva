"use client";

import { LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { env } from "@/shared/config/env";
import type { Locale } from "@/shared/types/common";

import type { DeliveryMapCenter } from "@/features/delivery-address/lib/delivery-address.utils";
import {
  fromYandexMapCenter,
  toYandexMapCenter,
} from "@/features/delivery-address/lib/delivery-address.utils";
import type { PickupPointDto } from "@/features/delivery-address/api/delivery-address.types";

const MAP_ZOOM = 16;
const SCRIPT_ID = "yandex-maps-v3-script";

type MapStatus = "error" | "loading" | "missing-key" | "ready";

function getYandexMapsLang(locale: Locale) {
  return locale === "ru" ? "ru_RU" : "en_US";
}

function hasSameCenter(a: DeliveryMapCenter, b: DeliveryMapCenter) {
  return (
    Math.abs(a.latitude - b.latitude) < 0.000001 &&
    Math.abs(a.longitude - b.longitude) < 0.000001
  );
}

async function loadYandexMapsApi(apiKey: string, locale: Locale) {
  if (typeof window === "undefined") {
    throw new Error("Yandex Maps API can be loaded only in the browser.");
  }

  if (!window.__yandexMapsPromise__) {
    const lang = getYandexMapsLang(locale);

    window.__yandexMapsPromise__ = new Promise<YandexMapsNamespace>(
      (resolve, reject) => {
        const handleReady = () => {
          if (!window.ymaps3) {
            reject(new Error("Yandex Maps API did not initialize."));
            return;
          }

          window.ymaps3.ready.then(() => resolve(window.ymaps3!)).catch(reject);
        };

        if (window.ymaps3) {
          handleReady();
          return;
        }

        const existingScript = document.getElementById(
          SCRIPT_ID,
        ) as HTMLScriptElement | null;

        if (existingScript) {
          existingScript.addEventListener("load", handleReady, { once: true });
          existingScript.addEventListener(
            "error",
            () => reject(new Error("Failed to load Yandex Maps API.")),
            {
              once: true,
            },
          );
          return;
        }

        const script = document.createElement("script");

        script.async = true;
        script.id = SCRIPT_ID;
        script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(
          apiKey,
        )}&lang=${lang}`;
        script.addEventListener("load", handleReady, { once: true });
        script.addEventListener(
          "error",
          () => reject(new Error("Failed to load Yandex Maps API.")),
          { once: true },
        );
        document.head.appendChild(script);
      },
    ).catch((error) => {
      window.__yandexMapsPromise__ = undefined;
      throw error;
    });
  }

  return window.__yandexMapsPromise__;
}

type YandexMapPickerProps = {
  center: DeliveryMapCenter;
  locale: Locale;
  onCenterChange: (center: DeliveryMapCenter) => void;
  pickupPoints?: PickupPointDto[];
  selectedPickupPointId?: string | null;
  onPickupPointSelect?: (pickupPoint: PickupPointDto) => void;
};

export function YandexMapPicker({
  center,
  locale,
  onCenterChange,
  pickupPoints = [],
  selectedPickupPointId = null,
  onPickupPointSelect,
}: YandexMapPickerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const latestCenterRef = useRef(center);
  const markersRef = useRef<unknown[]>([]);
  const onCenterChangeRef = useRef(onCenterChange);
  const onPickupPointSelectRef = useRef(onPickupPointSelect);
  const [status, setStatus] = useState<MapStatus>(
    env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ? "loading" : "missing-key",
  );

  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
  }, [onCenterChange]);

  useEffect(() => {
    onPickupPointSelectRef.current = onPickupPointSelect;
  }, [onPickupPointSelect]);

  useEffect(() => {
    if (!mapRef.current || status !== "ready") {
      return;
    }

    if (hasSameCenter(latestCenterRef.current, center)) {
      return;
    }

    latestCenterRef.current = center;
    mapRef.current.update({
      location: {
        center: toYandexMapCenter(center),
        duration: 180,
        zoom: MAP_ZOOM,
      },
    });
  }, [center, status]);

  useEffect(() => {
    if (!mapRef.current || status !== "ready" || !window.ymaps3) {
      return;
    }

    const ymaps3 = window.ymaps3;

    markersRef.current.forEach((marker) => {
      mapRef.current?.removeChild?.(marker);
    });
    markersRef.current = [];

    pickupPoints.forEach((pickupPoint) => {
      if (
        pickupPoint.address.latitude == null ||
        pickupPoint.address.longitude == null
      ) {
        return;
      }

      const markerElement = document.createElement("button");
      const isActive = pickupPoint.id === selectedPickupPointId;

      markerElement.className =
        "group flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all " +
        (isActive
          ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
          : "border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--primary)]");
      markerElement.type = "button";
      markerElement.setAttribute("aria-label", pickupPoint.name);
      markerElement.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M16 4h2a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h2"/><path d="M9 2h6v4H9z"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>';
      markerElement.addEventListener("click", () => {
        onPickupPointSelectRef.current?.(pickupPoint);
      });

      try {
        const marker = new ymaps3.YMapMarker(
          {
            coordinates: [
              pickupPoint.address.longitude,
              pickupPoint.address.latitude,
            ],
            id: pickupPoint.id,
            zIndex: isActive ? 2000 : 1000,
          },
          markerElement,
        );

        mapRef.current?.addChild(marker);
        markersRef.current.push(marker);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to attach pickup marker", error);
        }
      }
    });
  }, [pickupPoints, selectedPickupPointId, status]);

  useEffect(() => {
    if (!env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY) {
      setStatus("missing-key");
      return;
    }

    if (!containerRef.current) {
      return;
    }

    let cancelled = false;

    async function setupMap() {
      try {
        const ymaps3 = await loadYandexMapsApi(
          env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY!,
          locale,
        );

        if (cancelled || !containerRef.current) {
          return;
        }

        const map = new ymaps3.YMap(containerRef.current, {
          behaviors: ["drag", "pinchZoom", "mouseZoom"],
          location: {
            center: toYandexMapCenter(center),
            zoom: MAP_ZOOM,
          },
        });

        map.addChild(new ymaps3.YMapDefaultSchemeLayer());

        if (ymaps3.YMapDefaultFeaturesLayer) {
          map.addChild(new ymaps3.YMapDefaultFeaturesLayer());
        }

        map.addChild(
          new ymaps3.YMapListener({
            onActionEnd: (event) => {
              if (!event.location?.center) {
                return;
              }

              const nextCenter = fromYandexMapCenter(event.location.center);
              latestCenterRef.current = nextCenter;
              onCenterChangeRef.current(nextCenter);
            },
          }),
        );

        mapRef.current = map;
        latestCenterRef.current = center;
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    setupMap();

    return () => {
      cancelled = true;
      markersRef.current = [];
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, [locale]);

  return (
    <div className="relative overflow-hidden rounded-[calc(var(--radius)+0.2rem)] border border-border/70 bg-muted/30">
      <div className="h-[420px] w-full" ref={containerRef} />

      {status !== "ready" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-card/95">
          <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
            {status === "loading" ? (
              <>
                <LoaderCircle className="text-primary h-6 w-6 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  {t("deliveryAddress.mapLoading")}
                </p>
              </>
            ) : status === "missing-key" ? (
              <p className="text-sm text-muted-foreground">
                {t("deliveryAddress.mapKeyMissing")}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("deliveryAddress.mapLoadError")}
              </p>
            )}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
          {pickupPoints.length
            ? t("deliveryAddress.pickupMapHint")
            : t("deliveryAddress.dragMapHint")}
        </div>
      </div>

      {status === "ready" && pickupPoints.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="bg-primary/12 absolute bottom-1 h-3 w-3 rounded-full blur-[2px]" />
            <div className="bg-background border-border/80 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg">
              <MapPin className="text-primary h-5 w-5" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
