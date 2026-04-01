import type { CartDeliveryDraftResponseDto } from "@/entities/cart/api/cart.dto";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type {
  DeliveryMethodsResponseDto,
  DetectCourierCartDeliveryDraftRequestDto,
  DetectCourierCartDeliveryDraftResponseDto,
  PickupPointDto,
  PickupPointsResponseDto,
} from "@/features/delivery-address/api/delivery-address.types";

function createMockDeliveryMethodsResponse(): DeliveryMethodsResponseDto {
  return {
    methods: [
      {
        code: "COURIER",
        name: "Доставка",
        requiresAddress: true,
        requiresPickupPoint: false,
      },
      {
        code: "PICKUP",
        name: "Самовывоз",
        requiresAddress: false,
        requiresPickupPoint: true,
      },
    ],
    pickupPoints: [],
  };
}

function createMockPickupPointsResponse(
  tenantSlug: string,
): PickupPointsResponseDto {
  const commonCity = resolveMockCity(tenantSlug);

  return {
    pickupPoints: [
      {
        address: {
          city: commonCity,
          country: "Россия",
          house: "7",
          latitude: 56.851972,
          longitude: 60.612427,
          region: "Свердловская область",
          street: "ул. 8 Марта",
        },
        code: "pickup-center",
        id: "pickup-center",
        isActive: true,
        name: "Storeva Центр",
      },
      {
        address: {
          city: commonCity,
          country: "Россия",
          house: "14",
          latitude: 56.858129,
          longitude: 60.632941,
          region: "Свердловская область",
          street: "ул. Ленина",
        },
        code: "pickup-park",
        id: "pickup-park",
        isActive: true,
        name: "Storeva Парк",
      },
    ],
  };
}

function resolveMockCity(tenantSlug: string) {
  if (tenantSlug === "storeva-premium" || tenantSlug === "storeva-mass") {
    return "Екатеринбург";
  }

  return "Екатеринбург";
}

function createMockCourierDraft(
  input: DetectCourierCartDeliveryDraftRequestDto,
  tenantSlug: string,
): CartDeliveryDraftResponseDto {
  const house = String((Math.abs(Math.round(input.longitude * 10)) % 120) + 1);
  const estimatedMinutes =
    25 + (Math.abs(Math.round(input.latitude * 100)) % 15);

  return {
    address: {
      apartment: null,
      city: resolveMockCity(tenantSlug),
      comment: null,
      country: "Россия",
      entrance: null,
      floor: null,
      house,
      intercom: null,
      latitude: input.latitude,
      longitude: input.longitude,
      postalCode: null,
      region: "Свердловская область",
      street: "ул. Малышева",
    },
    deliveryMethod: "COURIER",
    pickupPointAddress: null,
    pickupPointExternalId: null,
    pickupPointId: null,
    pickupPointName: null,
    quote: {
      available: true,
      currency: "RUB",
      deliveryMethod: "COURIER",
      estimatedDays: 0,
      estimatesMinutes: estimatedMinutes,
      message: `от ${estimatedMinutes} минут`,
      pickupPointAddress: null,
      pickupPointExternalId: null,
      pickupPointId: null,
      pickupPointName: null,
      priceMinor: 0,
      zoneCode: null,
      zoneName: input.longitude > 60.61 ? "Центр" : "Пионерский",
    },
    quoteExpired: false,
    updatedAt: new Date().toISOString(),
  };
}

export async function getDeliveryMethods() {
  if (env.apiMocksEnabled) {
    return createMockDeliveryMethodsResponse();
  }

  return apiRequest<DeliveryMethodsResponseDto>("/v1/delivery/methods", {
    cache: "no-store",
  });
}

export async function getDeliveryPickupPoints(tenantSlug: string) {
  if (env.apiMocksEnabled) {
    return createMockPickupPointsResponse(tenantSlug);
  }

  return apiRequest<PickupPointsResponseDto>("/v1/delivery/pickup-points", {
    cache: "no-store",
  });
}

export async function detectCourierCartDeliveryDraft(
  input: DetectCourierCartDeliveryDraftRequestDto,
  tenantSlug: string,
) {
  if (env.apiMocksEnabled) {
    return createMockCourierDraft(input, tenantSlug);
  }

  return apiRequest<
    DetectCourierCartDeliveryDraftResponseDto,
    DetectCourierCartDeliveryDraftRequestDto
  >("/v1/delivery/courier/draft-detect", {
    body: input,
    cache: "no-store",
    method: "POST",
  });
}

export function findPickupPointById(
  pickupPoints: PickupPointDto[] | undefined,
  pickupPointId: string | null | undefined,
) {
  if (!pickupPoints?.length || !pickupPointId) {
    return null;
  }

  return pickupPoints.find((point) => point.id === pickupPointId) ?? null;
}
