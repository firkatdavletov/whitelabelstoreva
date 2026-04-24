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
  resolveMarkerClusterViewport,
  toYandexMapCenter,
} from "@/features/delivery-address/lib/delivery-address.utils";

const DEFAULT_MAP_ZOOM = 16;
const AUTO_FIT_MAX_ZOOM = 14;
const CLUSTER_CLICK_ZOOM_DELTA = 2;
const CLUSTER_DATA_SOURCE_ID = "pickup-points";
const CLUSTER_GRID_SIZE = 64;
const MIN_MAP_ZOOM = 10;
const MAX_MAP_ZOOM = 19;
const SCRIPT_ID = "yandex-maps-v3-script";
const YANDEX_MAPS_CDN_TEMPLATE = "https://cdn.jsdelivr.net/npm/{package}";
const YANDEX_CLUSTERER_PACKAGE = "@yandex/ymaps3-clusterer";
const YANDEX_CLUSTERER_CDN_PACKAGE = "@yandex/ymaps3-clusterer@0.012";

type MapStatus = "error" | "loading" | "missing-key" | "ready";

type YandexClusterFeature = {
  type: "Feature";
  id: string;
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  properties: {
    label: string;
  };
};

type YandexClustererModule = {
  clusterByGrid: (options: { gridSize: number }) => unknown;
  YMapClusterer: new (props: {
    cluster: (
      coordinates: [number, number],
      features: YandexClusterFeature[],
    ) => unknown;
    features: YandexClusterFeature[];
    marker: (feature: YandexClusterFeature) => unknown;
    method: unknown;
  }) => unknown;
};

function getYandexMapsLang(locale: Locale) {
  return locale === "ru" ? "ru_RU" : "en_US";
}

function registerYandexMapsCdnPackages(ymaps3: YandexMapsNamespace) {
  if (window.__yandexMapsCdnRegistered__) {
    return;
  }

  if (typeof ymaps3.import.registerCdn !== "function") {
    return;
  }

  ymaps3.import.registerCdn(YANDEX_MAPS_CDN_TEMPLATE, [
    YANDEX_CLUSTERER_CDN_PACKAGE,
  ]);
  window.__yandexMapsCdnRegistered__ = true;
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

function createPickupMarkerElement({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  const markerElement = document.createElement("button");

  markerElement.className =
    "group flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all " +
    (isActive
      ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
      : "border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--primary)]");
  markerElement.type = "button";
  markerElement.setAttribute("aria-label", label);
  markerElement.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M16 4h2a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h2"/><path d="M9 2h6v4H9z"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>';
  markerElement.addEventListener("click", onClick);

  return markerElement;
}

function createClusterElement({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  const clusterElement = document.createElement("button");
  const countLabel = document.createElement("span");

  clusterElement.className =
    "flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary text-primary-foreground shadow-[0_18px_36px_-18px_rgba(15,23,42,0.72)] transition-transform hover:scale-[1.03]";
  clusterElement.type = "button";
  clusterElement.setAttribute("aria-label", String(count));
  clusterElement.addEventListener("click", onClick);

  countLabel.className = "text-xs font-semibold";
  countLabel.textContent = count > 99 ? "99+" : String(count);
  clusterElement.appendChild(countLabel);

  return clusterElement;
}

function toClusterFeatures(markers: MapPickupMarker[]): YandexClusterFeature[] {
  return markers.map((marker) => ({
    type: "Feature",
    id: marker.id,
    geometry: {
      coordinates: [marker.longitude, marker.latitude],
      type: "Point",
    },
    properties: {
      label: marker.label,
    },
  }));
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

          window.ymaps3.ready
            .then(() => {
              const ymaps3 = window.ymaps3!;

              registerYandexMapsCdnPackages(ymaps3);
              resolve(ymaps3);
            })
            .catch(reject);
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
  autoLocateOnReady?: boolean;
  autoFitMarkers?: boolean;
  center: DeliveryMapCenter;
  className?: string;
  emptyStateHint?: string | null;
  locale: Locale;
  markers?: MapPickupMarker[];
  onCenterChange: (center: DeliveryMapCenter) => void;
  onLocate?: (position: GeolocationPosition) => void | Promise<void>;
  onMarkerSelect?: (markerId: string) => void;
  selectedMarkerId?: string | null;
  showHint?: boolean;
};

export function YandexMapPicker({
  autoLocateOnReady = false,
  autoFitMarkers = false,
  center,
  className,
  emptyStateHint = null,
  locale,
  markers = [],
  onCenterChange,
  onLocate,
  onMarkerSelect,
  selectedMarkerId = null,
  showHint = true,
}: YandexMapPickerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const latestCenterRef = useRef(center);
  const latestZoomRef = useRef(DEFAULT_MAP_ZOOM);
  const clustererModuleRef = useRef<YandexClustererModule | null>(null);
  const clustererRef = useRef<unknown | null>(null);
  const autoFitMarkersKeyRef = useRef<string | null>(null);
  const didAutoLocateRef = useRef(false);
  const fallbackMarkersRef = useRef<unknown[]>([]);
  const onCenterChangeRef = useRef(onCenterChange);
  const onLocateRef = useRef(onLocate);
  const onMarkerSelectRef = useRef(onMarkerSelect);
  const [status, setStatus] = useState<MapStatus>(() =>
    env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ? "loading" : "missing-key",
  );
  const [zoom, setZoom] = useState(DEFAULT_MAP_ZOOM);
  const [isLocating, setIsLocating] = useState(false);
  const [showEmptyStateSearchHint, setShowEmptyStateSearchHint] =
    useState(false);

  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
  }, [onCenterChange]);

  useEffect(() => {
    onLocateRef.current = onLocate;
  }, [onLocate]);

  useEffect(() => {
    onMarkerSelectRef.current = onMarkerSelect;
  }, [onMarkerSelect]);

  useEffect(() => {
    if (!mapRef.current || status !== "ready") {
      return;
    }

    if (autoFitMarkers && markers.length > 1) {
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
  }, [autoFitMarkers, center, markers.length, status]);

  useEffect(() => {
    if (
      !autoFitMarkers ||
      !mapRef.current ||
      status !== "ready" ||
      markers.length <= 1
    ) {
      return;
    }

    const markersKey = markers
      .map((marker) => marker.id)
      .sort()
      .join("|");

    if (autoFitMarkersKeyRef.current === markersKey) {
      return;
    }

    const viewport = resolveMarkerClusterViewport(markers, {
      heightPx: containerRef.current?.clientHeight ?? 420,
      maxZoom: AUTO_FIT_MAX_ZOOM,
      minZoom: MIN_MAP_ZOOM,
      widthPx: containerRef.current?.clientWidth ?? 420,
    });

    if (!viewport) {
      return;
    }

    autoFitMarkersKeyRef.current = markersKey;
    latestCenterRef.current = viewport.center;
    latestZoomRef.current = viewport.zoom;

    mapRef.current.update({
      location: {
        center: toYandexMapCenter(viewport.center),
        duration: 220,
        zoom: viewport.zoom,
      },
    });

    setZoom(viewport.zoom);
    onCenterChangeRef.current(viewport.center);
  }, [autoFitMarkers, markers, status]);

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

    let cancelled = false;

    function clearRenderedMarkers() {
      if (clustererRef.current) {
        mapRef.current?.removeChild?.(clustererRef.current);
        clustererRef.current = null;
      }

      fallbackMarkersRef.current.forEach((marker) => {
        mapRef.current?.removeChild?.(marker);
      });
      fallbackMarkersRef.current = [];
    }

    function renderPlainMarkers() {
      markers.forEach((pickupMarker) => {
        const isActive = pickupMarker.id === selectedMarkerId;
        const markerElement = createPickupMarkerElement({
          isActive,
          label: pickupMarker.label,
          onClick: () => {
            onMarkerSelectRef.current?.(pickupMarker.id);
          },
        });

        try {
          const marker = new ymaps3.YMapMarker(
            {
              coordinates: [pickupMarker.longitude, pickupMarker.latitude],
              id: pickupMarker.id,
              source: CLUSTER_DATA_SOURCE_ID,
              zIndex: isActive ? 2000 : 1000,
            },
            markerElement,
          );

          mapRef.current?.addChild(marker);
          fallbackMarkersRef.current.push(marker);
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Failed to attach pickup marker", error);
          }
        }
      });
    }

    async function renderMarkers() {
      clearRenderedMarkers();

      if (!markers.length) {
        return;
      }

      try {
        if (
          !ymaps3.YMapFeatureDataSource ||
          !ymaps3.YMapLayer ||
          typeof ymaps3.import !== "function"
        ) {
          renderPlainMarkers();
          return;
        }

        const clustererModule =
          clustererModuleRef.current ??
          (await ymaps3.import<YandexClustererModule>(
            YANDEX_CLUSTERER_PACKAGE,
          ));

        if (cancelled || !mapRef.current) {
          return;
        }

        clustererModuleRef.current = clustererModule;

        const clusterer = new clustererModule.YMapClusterer({
          cluster: (coordinates, features) =>
            new ymaps3.YMapMarker(
              {
                coordinates,
                source: CLUSTER_DATA_SOURCE_ID,
                zIndex: 1500,
              },
              createClusterElement({
                count: features.length,
                onClick: () => {
                  const nextCenter = fromYandexMapCenter(coordinates);
                  const nextZoom = clampMapZoom(
                    latestZoomRef.current + CLUSTER_CLICK_ZOOM_DELTA,
                  );

                  latestCenterRef.current = nextCenter;
                  latestZoomRef.current = nextZoom;

                  mapRef.current?.update({
                    location: {
                      center: coordinates,
                      duration: 220,
                      zoom: nextZoom,
                    },
                  });

                  setZoom(nextZoom);
                  onCenterChangeRef.current(nextCenter);
                },
              }),
            ),
          features: toClusterFeatures(markers),
          marker: (feature) =>
            new ymaps3.YMapMarker(
              {
                coordinates: feature.geometry.coordinates,
                id: feature.id,
                source: CLUSTER_DATA_SOURCE_ID,
                zIndex: feature.id === selectedMarkerId ? 2000 : 1000,
              },
              createPickupMarkerElement({
                isActive: feature.id === selectedMarkerId,
                label: feature.properties.label,
                onClick: () => {
                  onMarkerSelectRef.current?.(feature.id);
                },
              }),
            ),
          method: clustererModule.clusterByGrid({
            gridSize: CLUSTER_GRID_SIZE,
          }),
        });

        mapRef.current.addChild(clusterer);
        clustererRef.current = clusterer;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to initialize marker clustering", error);
        }

        if (!cancelled) {
          renderPlainMarkers();
        }
      }
    }

    void renderMarkers();

    return () => {
      cancelled = true;
      clearRenderedMarkers();
    };
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

        if (ymaps3.YMapFeatureDataSource && ymaps3.YMapLayer) {
          map.addChild(
            new ymaps3.YMapFeatureDataSource({
              id: CLUSTER_DATA_SOURCE_ID,
            }),
          );
          map.addChild(
            new ymaps3.YMapLayer({
              source: CLUSTER_DATA_SOURCE_ID,
              type: "markers",
              zIndex: 1800,
            }),
          );
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
      autoFitMarkersKeyRef.current = null;
      clustererRef.current = null;
      fallbackMarkersRef.current = [];
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, [locale]);

  const canZoomIn = zoom < MAX_MAP_ZOOM;
  const canZoomOut = zoom > MIN_MAP_ZOOM;

  const handleZoomChange = (delta: number) => {
    setZoom((currentZoom) => clampMapZoom(currentZoom + delta));
  };

  const handleLocateMe = ({
    silentError = false,
    triggeredAutomatically = false,
  }: {
    silentError?: boolean;
    triggeredAutomatically?: boolean;
  } = {}) => {
    if (typeof window === "undefined" || !window.navigator.geolocation) {
      if (!silentError) {
        toast.error(t("deliveryAddress.locationError"));
      }
      return;
    }

    setShowEmptyStateSearchHint(false);
    setIsLocating(true);

    window.navigator.geolocation.getCurrentPosition(
      async (position) => {
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

        try {
          await onLocateRef.current?.(position);
        } catch {
          // The caller is responsible for any user-facing error handling.
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);

        if (triggeredAutomatically && error.code === 1) {
          setShowEmptyStateSearchHint(true);
        }

        if (!silentError) {
          toast.error(t("deliveryAddress.locationError"));
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 10_000,
      },
    );
  };

  useEffect(() => {
    if (!autoLocateOnReady) {
      didAutoLocateRef.current = false;
      setShowEmptyStateSearchHint(false);
      return;
    }

    if (
      status !== "ready" ||
      isLocating ||
      didAutoLocateRef.current ||
      !onLocateRef.current
    ) {
      return;
    }

    didAutoLocateRef.current = true;
    handleLocateMe({
      silentError: true,
      triggeredAutomatically: true,
    });
  }, [autoLocateOnReady, isLocating, status]);

  return (
    <div
      className={cn(
        "border-border/70 bg-muted/30 relative h-[420px] touch-none overflow-hidden rounded-xl border",
        className,
      )}
    >
      <div className="h-full w-full touch-none" ref={containerRef} />

      {status !== "ready" ? (
        <div className="bg-card/95 absolute inset-0 flex items-center justify-center">
          <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
            {status === "loading" ? (
              <>
                <LoaderCircle className="text-primary h-6 w-6 animate-spin" />
                <p className="text-muted-foreground text-sm">
                  {t("deliveryAddress.mapLoading")}
                </p>
              </>
            ) : status === "missing-key" ? (
              <p className="text-muted-foreground text-sm">
                {t("deliveryAddress.mapKeyMissing")}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("deliveryAddress.mapLoadError")}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {showHint ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <div className="border-border/70 bg-background/90 text-muted-foreground rounded-full border px-4 py-2 text-xs font-medium shadow-sm backdrop-blur-sm">
            {markers.length
              ? t("deliveryAddress.pickupMapHint")
              : t("deliveryAddress.dragMapHint")}
          </div>
        </div>
      ) : null}

      {status === "ready" ? (
        <div className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 flex-col gap-2 sm:right-5">
          <button
            aria-label={t("deliveryAddress.locateMe")}
            className="border-border/70 bg-background/90 text-foreground hover:bg-background flex h-11 w-11 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-sm transition disabled:cursor-wait disabled:opacity-70"
            disabled={isLocating}
            onClick={() => handleLocateMe()}
            title={t("deliveryAddress.locateMe")}
            type="button"
          >
            {isLocating ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
          </button>

          <div className="border-border/70 bg-background/90 overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm">
            <button
              aria-label={t("deliveryAddress.zoomIn")}
              className="text-foreground hover:bg-background flex h-11 w-11 items-center justify-center transition disabled:opacity-40"
              disabled={!canZoomIn}
              onClick={() => handleZoomChange(1)}
              title={t("deliveryAddress.zoomIn")}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="bg-border/70 h-px w-full" />
            <button
              aria-label={t("deliveryAddress.zoomOut")}
              className="text-foreground hover:bg-background flex h-11 w-11 items-center justify-center transition disabled:opacity-40"
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
          <div className="relative flex items-center gap-3 px-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <div className="bg-primary/12 absolute bottom-1 h-3 w-3 rounded-full blur-[2px]" />
              <div className="bg-background border-border/80 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg">
                <MapPin className="text-primary h-5 w-5" />
              </div>
            </div>

            {showEmptyStateSearchHint && emptyStateHint ? (
              <div className="bg-background/94 border-border/80 text-foreground max-w-[16rem] rounded-2xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm">
                {emptyStateHint}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
