"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  detectYandexLocations,
  getYandexPickupPoints,
} from "@/features/delivery-address/api/delivery-address.api";
import {
  mapYandexLocationVariantDto,
  mapYandexPickupPointDto,
  yandexPickupPointToMapMarker,
} from "@/features/delivery-address/lib/yandex-pickup.mapper";
import type { YandexPickupPoint } from "@/features/delivery-address/model/yandex-pickup.types";
import type { MapPickupMarker } from "@/features/delivery-address/lib/delivery-address.utils";

type UseYandexPickupFlowOptions = {
  enabled: boolean;
  initialExternalId?: string | null;
  initialSearchHint?: string | null;
};

export function useYandexPickupFlow({
  enabled,
  initialExternalId,
  initialSearchHint,
}: UseYandexPickupFlowOptions) {
  const [searchQuery, setSearchQuery] = useState(() => initialSearchHint ?? "");
  const [geoId, setGeoId] = useState<number | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(
    initialExternalId ?? null,
  );
  const didAutoSearchRef = useRef(false);

  const locationDetectMutation = useMutation({
    mutationFn: (query: string) => detectYandexLocations(query),
    onSuccess: (data) => {
      const variants = data.variants.map(mapYandexLocationVariantDto);
      const firstVariant = variants[0] ?? null;

      if (firstVariant) {
        setGeoId(firstVariant.geoId);
        setSearchQuery(firstVariant.address);
        return;
      }

      setGeoId(null);
    },
  });

  const pickupPointsQuery = useQuery({
    enabled: enabled && geoId !== null,
    gcTime: 5 * 60_000,
    queryFn: () => getYandexPickupPoints(geoId!),
    queryKey: ["yandex-pickup-points", geoId],
    select: (data) => data.points.map(mapYandexPickupPointDto),
    staleTime: 2 * 60_000,
  });

  const pickupPoints: YandexPickupPoint[] = pickupPointsQuery.data ?? [];

  // Derive resolved selection: if the stored selectedPointId is not in the
  // current list (e.g. after a new search), treat it as unselected.
  const resolvedSelectedPointId =
    selectedPointId && pickupPoints.some((p) => p.id === selectedPointId)
      ? selectedPointId
      : pickupPoints.length > 0
        ? null
        : selectedPointId;

  const selectedPoint =
    pickupPoints.find((point) => point.id === resolvedSelectedPointId) ?? null;

  const markers: MapPickupMarker[] = pickupPoints
    .map(yandexPickupPointToMapMarker)
    .filter((marker): marker is MapPickupMarker => marker !== null);

  // Auto-search on mount when we have an initial hint.
  // The mutation call is a side-effect on an external system (network) which
  // is a valid use-case for useEffect; we just avoid synchronous setState.
  useEffect(() => {
    if (
      enabled &&
      !didAutoSearchRef.current &&
      initialSearchHint &&
      !geoId &&
      !locationDetectMutation.isPending
    ) {
      didAutoSearchRef.current = true;
      locationDetectMutation.mutate(initialSearchHint);
    }
  }, [enabled, initialSearchHint, geoId, locationDetectMutation]);

  const submitSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();

      if (!trimmed) {
        return;
      }

      setGeoId(null);
      setSelectedPointId(null);
      locationDetectMutation.mutate(trimmed);
    },
    [locationDetectMutation],
  );

  const selectPoint = useCallback((pointId: string) => {
    setSelectedPointId(pointId);
  }, []);

  return {
    geoId,
    isLoadingLocation: locationDetectMutation.isPending,
    isLoadingPoints: pickupPointsQuery.isLoading && geoId !== null,
    locationError: locationDetectMutation.error,
    markers,
    pickupPoints,
    pointsError: pickupPointsQuery.error,
    refetchPoints: pickupPointsQuery.refetch,
    searchQuery,
    selectPoint,
    selectedPoint,
    selectedPointId: resolvedSelectedPointId,
    setSearchQuery,
    submitSearch,
  };
}
