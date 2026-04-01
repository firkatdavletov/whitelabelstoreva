import type { CartDeliveryDraftResponseDto } from "@/entities/cart/api/cart.dto";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type {
  DeliveryMethodsResponseDto,
  DetectCourierCartDeliveryDraftRequestDto,
  DetectCourierCartDeliveryDraftResponseDto,
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
