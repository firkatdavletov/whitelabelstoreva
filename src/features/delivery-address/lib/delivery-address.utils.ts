import type {
  CartDeliveryDraftResponseDto,
  PutCartDeliveryRequestDto,
} from "@/entities/cart/api/cart.dto";

export type DeliveryMapCenter = {
  latitude: number;
  longitude: number;
};

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

export function isPickupDeliveryMethod(deliveryMethod: string | null | undefined) {
  return (
    deliveryMethod === "PICKUP" || deliveryMethod === "YANDEX_PICKUP_POINT"
  );
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

  const addressParts = [
    draft.address?.city ?? null,
    draft.address?.street ?? null,
    draft.address?.house ?? null,
    draft.address?.apartment ? `кв. ${draft.address.apartment}` : null,
  ].filter(Boolean);

  const addressLine = addressParts.join(", ");

  if (addressLine && draft.quote?.zoneName) {
    return `${addressLine} · ${draft.quote.zoneName}`;
  }

  return addressLine || draft.quote?.zoneName || null;
}

export function buildPutCartDeliveryRequest(
  deliveryMethod: PutCartDeliveryRequestDto["deliveryMethod"],
  draft: CartDeliveryDraftResponseDto | null | undefined,
): PutCartDeliveryRequestDto | null {
  if (deliveryMethod === "COURIER") {
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
    return null;
  }

  return {
    address: null,
    deliveryMethod,
    pickupPointExternalId: draft.pickupPointExternalId ?? null,
    pickupPointId: draft.pickupPointId ?? null,
  };
}
