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
