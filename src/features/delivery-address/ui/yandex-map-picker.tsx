"use client";

import { LoaderCircle, LocateFixed, MapPin, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { env } from "@/shared/config/env";
import { cn } from "@/shared/lib/styles";
import type { Locale } from "@/shared/types/common";

import type {
  DeliveryMapCenter,
  MapPickupMarker,
} from "@/features/delivery-address/lib/delivery-address.utils";
import {
  fromYandexMapCenter,
  toYandexMapCenter,
} from "@/features/delivery-address/lib/delivery-address.utils";

const DEFAULT_MAP_ZOOM = 16;
const MIN_MAP_ZOOM = 10;
const MAX_MAP_ZOOM = 19;
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

function clampMapZoom(zoom: number) {
  return Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, Math.round(zoom)));
}

function normalizeMapCenter(
  latitude: number,
  longitude: number,
): DeliveryMapCenter {
  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
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
  className?: string;
  locale: Locale;
  markers?: MapPickupMarker[];
  onCenterChange: (center: DeliveryMapCenter) => void;
  onMarkerSelect?: (markerId: string) => void;
  selectedMarkerId?: string | null;
  showHint?: boolean;
};

export function YandexMapPicker({
  center,
  className,
  locale,
  markers = [],
  onCenterChange,
  onMarkerSelect,
  selectedMarkerId = null,
  showHint = true,
}: YandexMapPickerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const latestCenterRef = useRef(center);
  const latestZoomRef = useRef(DEFAULT_MAP_ZOOM);
  const markersRef = useRef<unknown[]>([]);
  const onCenterChangeRef = useRef(onCenterChange);
  const onMarkerSelectRef = useRef(onMarkerSelect);
  const [status, setStatus] = useState<MapStatus>(
    () => (env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ? "loading" : "missing-key"),
  );
  const [zoom, setZoom] = useState(DEFAULT_MAP_ZOOM);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
  }, [onCenterChange]);

  useEffect(() => {
    onMarkerSelectRef.current = onMarkerSelect;
  }, [onMarkerSelect]);

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
        zoom: latestZoomRef.current,
      },
    });
  }, [center, status]);

  useEffect(() => {
    latestZoomRef.current = zoom;

    if (!mapRef.current || status !== "ready") {
      return;
    }

    mapRef.current.update({
      location: {
        center: toYandexMapCenter(latestCenterRef.current),
        duration: 180,
        zoom,
      },
    });
  }, [status, zoom]);

  useEffect(() => {
    if (!mapRef.current || status !== "ready" || !window.ymaps3) {
      return;
    }

    const ymaps3 = window.ymaps3;

    markersRef.current.forEach((marker) => {
      mapRef.current?.removeChild?.(marker);
    });
    markersRef.current = [];

    markers.forEach((pickupMarker) => {
      const markerElement = document.createElement("button");
      const isActive = pickupMarker.id === selectedMarkerId;

      markerElement.className =
        "group flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all " +
        (isActive
          ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
          : "border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--primary)]");
      markerElement.type = "button";
      markerElement.setAttribute("aria-label", pickupMarker.label);
      markerElement.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M16 4h2a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h2"/><path d="M9 2h6v4H9z"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>';
      markerElement.addEventListener("click", () => {
        onMarkerSelectRef.current?.(pickupMarker.id);
      });

      try {
        const marker = new ymaps3.YMapMarker(
          {
            coordinates: [pickupMarker.longitude, pickupMarker.latitude],
            id: pickupMarker.id,
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
  }, [markers, selectedMarkerId, status]);

  useEffect(() => {
    if (!env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY) {
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
            center: toYandexMapCenter(latestCenterRef.current),
            zoom: latestZoomRef.current,
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
              const nextZoom =
                typeof event.location.zoom === "number"
                  ? clampMapZoom(event.location.zoom)
                  : latestZoomRef.current;

              latestCenterRef.current = nextCenter;

              if (nextZoom !== latestZoomRef.current) {
                latestZoomRef.current = nextZoom;
                setZoom(nextZoom);
              }

              onCenterChangeRef.current(nextCenter);
            },
          }),
        );

        mapRef.current = map;
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

  const canZoomIn = zoom < MAX_MAP_ZOOM;
  const canZoomOut = zoom > MIN_MAP_ZOOM;

  const handleZoomChange = (delta: number) => {
    setZoom((currentZoom) => clampMapZoom(currentZoom + delta));
  };

  const handleLocateMe = () => {
    if (typeof window === "undefined" || !window.navigator.geolocation) {
      toast.error(t("deliveryAddress.locationError"));
      return;
    }

    setIsLocating(true);

    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = normalizeMapCenter(
          position.coords.latitude,
          position.coords.longitude,
        );
        const nextZoom = Math.max(latestZoomRef.current, DEFAULT_MAP_ZOOM);

        latestCenterRef.current = nextCenter;
        latestZoomRef.current = nextZoom;

        mapRef.current?.update({
          location: {
            center: toYandexMapCenter(nextCenter),
            duration: 240,
            zoom: nextZoom,
          },
        });

        onCenterChangeRef.current(nextCenter);
        setZoom(nextZoom);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        toast.error(t("deliveryAddress.locationError"));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 10_000,
      },
    );
  };

  return (
    <div
      className={cn(
        "relative h-[420px] touch-none overflow-hidden rounded-xl border border-border/70 bg-muted/30",
        className,
      )}
    >
      <div className="h-full w-full touch-none" ref={containerRef} />

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

      {showHint ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <div className="rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            {markers.length
              ? t("deliveryAddress.pickupMapHint")
              : t("deliveryAddress.dragMapHint")}
          </div>
        </div>
      ) : null}

      {status === "ready" ? (
        <div
          className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 flex-col gap-2 sm:right-5"
        >
          <button
            aria-label={t("deliveryAddress.locateMe")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition hover:bg-background disabled:cursor-wait disabled:opacity-70"
            disabled={isLocating}
            onClick={handleLocateMe}
            title={t("deliveryAddress.locateMe")}
            type="button"
          >
            {isLocating ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
          </button>

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/90 shadow-lg backdrop-blur-sm">
            <button
              aria-label={t("deliveryAddress.zoomIn")}
              className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-background disabled:opacity-40"
              disabled={!canZoomIn}
              onClick={() => handleZoomChange(1)}
              title={t("deliveryAddress.zoomIn")}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="h-px w-full bg-border/70" />
            <button
              aria-label={t("deliveryAddress.zoomOut")}
              className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-background disabled:opacity-40"
              disabled={!canZoomOut}
              onClick={() => handleZoomChange(-1)}
              title={t("deliveryAddress.zoomOut")}
              type="button"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {status === "ready" && markers.length === 0 ? (
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
