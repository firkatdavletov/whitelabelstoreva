import type {
  CartDeliveryDraftResponseDto,
  PutCartDeliveryRequestDto,
} from "@/entities/cart/api/cart.dto";
import {
  isAddressDeliveryMethod,
  isPickupDeliveryMethod,
} from "@/entities/cart/lib/delivery-method";
import type { PickupPointDto } from "@/features/delivery-address/api/delivery-address.types";

export { isAddressDeliveryMethod, isPickupDeliveryMethod };

export type DeliveryMapCenter = {
  latitude: number;
  longitude: number;
};

export type MapPickupMarker = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export type DeliveryMapViewport = {
  center: DeliveryMapCenter;
  zoom: number;
};

const WORLD_DIMENSION_PX = 256;

function clampLatitude(latitude: number) {
  return Math.min(85.05112878, Math.max(-85.05112878, latitude));
}

function toMercatorLatitude(latitude: number) {
  const sin = Math.sin((clampLatitude(latitude) * Math.PI) / 180);

  return 0.5 * Math.log((1 + sin) / (1 - sin));
}

function normalizeLongitudeSpan(span: number) {
  if (span <= 180) {
    return span;
  }

  return 360 - span;
}

function resolveFractionZoom(mapDimensionPx: number, fraction: number) {
  if (fraction <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.log2(mapDimensionPx / WORLD_DIMENSION_PX / fraction);
}

function buildAddressLine(parts: Array<string | null | undefined>) {
  return (
    parts
      .map((part) => part?.trim() ?? "")
      .filter(Boolean)
      .join(", ") || null
  );
}

const defaultMapCenters: Record<string, DeliveryMapCenter> = {
  "storeva-mass": {
    latitude: 56.838011,
    longitude: 60.597465,
  },
  "storeva-premium": {
    latitude: 56.833742,
    longitude: 60.604944,
  },
  "storeva-street": {
    latitude: 56.851038,
    longitude: 60.649683,
  },
};

export function getDefaultDeliveryMapCenter(
  tenantSlug: string,
): DeliveryMapCenter {
  return defaultMapCenters[tenantSlug] ?? defaultMapCenters["storeva-street"];
}

export function toYandexMapCenter(center: DeliveryMapCenter): [number, number] {
  return [center.longitude, center.latitude];
}

export function fromYandexMapCenter(
  center: [number, number],
): DeliveryMapCenter {
  return {
    latitude: Number(center[1].toFixed(6)),
    longitude: Number(center[0].toFixed(6)),
  };
}

export function resolveMarkerClusterViewport(
  markers: MapPickupMarker[],
  {
    heightPx,
    maxZoom,
    minZoom,
    paddingPx = 48,
    widthPx,
  }: {
    heightPx: number;
    maxZoom: number;
    minZoom: number;
    paddingPx?: number;
    widthPx: number;
  },
): DeliveryMapViewport | null {
  if (!markers.length) {
    return null;
  }

  const latitudes = markers.map((marker) => marker.latitude);
  const longitudes = markers.map((marker) => marker.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const center = {
    latitude: Number(((minLatitude + maxLatitude) / 2).toFixed(6)),
    longitude: Number(((minLongitude + maxLongitude) / 2).toFixed(6)),
  };

  if (markers.length === 1) {
    return {
      center,
      zoom: maxZoom,
    };
  }

  const effectiveWidth = Math.max(1, widthPx - paddingPx * 2);
  const effectiveHeight = Math.max(1, heightPx - paddingPx * 2);
  const longitudeFraction =
    normalizeLongitudeSpan(maxLongitude - minLongitude) / 360;
  const latitudeFraction =
    Math.abs(
      toMercatorLatitude(maxLatitude) - toMercatorLatitude(minLatitude),
    ) /
    (2 * Math.PI);
  const resolvedZoom = Math.floor(
    Math.min(
      resolveFractionZoom(effectiveWidth, longitudeFraction),
      resolveFractionZoom(effectiveHeight, latitudeFraction),
      maxZoom,
    ),
  );

  return {
    center,
    zoom: Math.min(maxZoom, Math.max(minZoom, resolvedZoom)),
  };
}

export function formatDeliveryDraftAddress(
  draft: CartDeliveryDraftResponseDto | null | undefined,
) {
  if (!draft) {
    return null;
  }

  if (isPickupDeliveryMethod(draft.deliveryMethod)) {
    return (
      draft.pickupPointName ??
      draft.pickupPointAddress ??
      draft.quote?.pickupPointName ??
      draft.quote?.pickupPointAddress ??
      null
    );
  }

  return buildAddressLine([
    draft.address?.city ?? null,
    draft.address?.street ?? null,
    draft.address?.house ?? null,
    draft.address?.apartment ? `кв. ${draft.address.apartment}` : null,
    draft.address?.region ?? null,
    draft.address?.country ?? null,
  ]);
}

export function canSubmitAddressDeliveryDraft(
  deliveryMethod:
    | PutCartDeliveryRequestDto["deliveryMethod"]
    | null
    | undefined,
  draft: CartDeliveryDraftResponseDto | null | undefined,
  quoteAvailability: boolean | null,
) {
  if (!isAddressDeliveryMethod(deliveryMethod) || !draft?.address) {
    return false;
  }

  if (deliveryMethod === "CUSTOM_DELIVERY_ADDRESS") {
    return true;
  }

  return quoteAvailability === true;
}

export function pickupPointToMapCenter(
  pickupPoint: PickupPointDto,
): DeliveryMapCenter | null {
  if (
    pickupPoint.address.latitude == null ||
    pickupPoint.address.longitude == null
  ) {
    return null;
  }

  return {
    latitude: pickupPoint.address.latitude,
    longitude: pickupPoint.address.longitude,
  };
}

export function pickupPointToMapMarker(
  pickupPoint: PickupPointDto,
): MapPickupMarker | null {
  if (
    pickupPoint.address.latitude == null ||
    pickupPoint.address.longitude == null
  ) {
    return null;
  }

  return {
    id: pickupPoint.id,
    label: pickupPoint.name,
    latitude: pickupPoint.address.latitude,
    longitude: pickupPoint.address.longitude,
  };
}

export function formatPickupPointAddress(
  pickupPoint: PickupPointDto | null | undefined,
) {
  if (!pickupPoint) {
    return null;
  }

  const parts = [
    pickupPoint.address.city ?? null,
    pickupPoint.address.street ?? null,
    pickupPoint.address.house ?? null,
  ].filter(Boolean);

  return parts.join(", ") || null;
}

export function buildPutCartDeliveryRequest(
  deliveryMethod: PutCartDeliveryRequestDto["deliveryMethod"],
  draft: CartDeliveryDraftResponseDto | null | undefined,
  pickupPoint?: PickupPointDto | null,
): PutCartDeliveryRequestDto | null {
  if (isAddressDeliveryMethod(deliveryMethod)) {
    if (!draft?.address) {
      return null;
    }

    return {
      address: {
        apartment: draft.address.apartment ?? null,
        city: draft.address.city ?? null,
        comment: draft.address.comment ?? null,
        country: draft.address.country ?? null,
        entrance: draft.address.entrance ?? null,
        floor: draft.address.floor ?? null,
        house: draft.address.house ?? null,
        intercom: draft.address.intercom ?? null,
        latitude: draft.address.latitude ?? null,
        longitude: draft.address.longitude ?? null,
        postalCode: draft.address.postalCode ?? null,
        region: draft.address.region ?? null,
        street: draft.address.street ?? null,
      },
      deliveryMethod,
      pickupPointExternalId: null,
      pickupPointId: null,
    };
  }

  if (!draft) {
    if (!pickupPoint) {
      return null;
    }

    return {
      address: null,
      deliveryMethod,
      pickupPointExternalId: null,
      pickupPointId: pickupPoint.id,
    };
  }

  return {
    address: null,
    deliveryMethod,
    pickupPointExternalId: draft.pickupPointExternalId ?? null,
    pickupPointId: draft.pickupPointId ?? pickupPoint?.id ?? null,
  };
}

export function buildYandexPickupDeliveryRequest(
  yandexPickupPointExternalId: string,
): PutCartDeliveryRequestDto {
  return {
    address: null,
    deliveryMethod: "YANDEX_PICKUP_POINT",
    pickupPointExternalId: yandexPickupPointExternalId,
    pickupPointId: null,
  };
}
