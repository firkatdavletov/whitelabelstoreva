import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type {
  CheckoutOptionsResponseDto,
  CheckoutOrderResponseDto,
  CheckoutRequestDto,
} from "@/features/checkout-form/api/checkout.types";

type GetCheckoutOptionsInput = {
  pickupPointId?: string | null;
};

function createMockCheckoutOptionsResponse({
  pickupPointId,
}: GetCheckoutOptionsInput = {}): CheckoutOptionsResponseDto {
  return {
    options: [
      {
        code: "COURIER",
        name: "Доставка",
        paymentMethods: [
          {
            code: "CARD_ON_DELIVERY",
            description: "Оплата картой курьеру при получении.",
            isActive: true,
            isOnline: false,
            name: "Картой при получении",
          },
          {
            code: "CASH",
            description: "Оплата наличными при получении.",
            isActive: true,
            isOnline: false,
            name: "Наличными",
          },
          {
            code: "CARD_ONLINE",
            description: "Онлайн-оплата банковской картой.",
            isActive: true,
            isOnline: true,
            name: "Картой онлайн",
          },
        ],
        requiresAddress: true,
        requiresPickupPoint: false,
      },
      {
        code: "PICKUP",
        name: "Самовывоз",
        paymentMethods: [
          {
            code: "CARD_ON_DELIVERY",
            description: "Оплата на кассе при получении.",
            isActive: true,
            isOnline: false,
            name: "Картой при получении",
          },
          {
            code: "CASH",
            description: "Оплата наличными на кассе.",
            isActive: true,
            isOnline: false,
            name: "Наличными",
          },
        ],
        requiresAddress: false,
        requiresPickupPoint: true,
      },
      ...(pickupPointId
        ? [
            {
              code: "YANDEX_PICKUP_POINT" as const,
              name: "ПВЗ Яндекс",
              paymentMethods: [
                {
                  code: "CARD_ONLINE" as const,
                  description: "Онлайн-оплата картой для Яндекс ПВЗ.",
                  isActive: true,
                  isOnline: true,
                  name: "Картой онлайн",
                },
                {
                  code: "SBP" as const,
                  description: "Оплата через СБП для выбранного ПВЗ.",
                  isActive: true,
                  isOnline: true,
                  name: "СБП",
                },
              ],
              requiresAddress: false,
              requiresPickupPoint: true,
            },
          ]
        : []),
    ],
  };
}

function createMockCheckoutOrderResponse(
  input: CheckoutRequestDto,
): CheckoutOrderResponseDto {
  return {
    comment: input.comment ?? null,
    createdAt: new Date().toISOString(),
    customerEmail: input.customerEmail ?? null,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    customerType:
      input.customerName || input.customerPhone ? "GUEST" : "USER",
    delivery: {
      address: {
        apartment: "12",
        city: "Екатеринбург",
        comment: null,
        country: "Россия",
        entrance: null,
        floor: null,
        house: "15",
        intercom: null,
        latitude: 56.838011,
        longitude: 60.597465,
        postalCode: null,
        region: "Свердловская область",
        street: "ул. Ленина",
      },
      currency: "RUB",
      estimatedDays: 0,
      estimatesMinutes: 25,
      method: "COURIER",
      methodName: "Доставка",
      pickupPointAddress: null,
      pickupPointExternalId: null,
      pickupPointId: null,
      pickupPointName: null,
      priceMinor: 0,
      zoneCode: "CENTER",
      zoneName: "Центр",
    },
    deliveryFeeMinor: 0,
    deliveryMethod: "COURIER",
    id: crypto.randomUUID(),
    items: [],
    orderNumber: `WL-${Date.now().toString().slice(-6)}`,
    payment: {
      code: input.paymentMethodCode,
      name: input.paymentMethodCode,
    },
    status: "PENDING",
    subtotalMinor: 0,
    totalMinor: 0,
    updatedAt: new Date().toISOString(),
    userId: null,
    guestInstallId: null,
  };
}

export async function getCheckoutOptions({
  pickupPointId,
}: GetCheckoutOptionsInput = {}) {
  if (env.apiMocksEnabled) {
    return createMockCheckoutOptionsResponse({ pickupPointId });
  }

  return apiRequest<CheckoutOptionsResponseDto>("/v1/checkout/options", {
    cache: "no-store",
    query: pickupPointId ? { pickupPointId } : undefined,
  });
}

export async function checkoutCurrentCart(input: CheckoutRequestDto) {
  if (env.apiMocksEnabled) {
    return createMockCheckoutOrderResponse(input);
  }

  return apiRequest<CheckoutOrderResponseDto, CheckoutRequestDto>(
    "/v1/orders/checkout",
    {
      body: input,
      method: "POST",
    },
  );
}
