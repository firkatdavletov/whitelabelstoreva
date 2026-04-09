import { describe, expect, it } from "vitest";

import {
  buildPutCartDeliveryRequest,
  buildYandexPickupDeliveryRequest,
  formatDeliveryDraftAddress,
} from "@/features/delivery-address/lib/delivery-address.utils";

describe("delivery address utils", () => {
  it("formats courier address without zone name", () => {
    const formattedAddress = formatDeliveryDraftAddress({
      address: {
        apartment: "12",
        city: "Екатеринбург",
        house: "15",
        street: "ул. Ленина",
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
        message: "от 25 минут",
        pickupPointAddress: null,
        pickupPointExternalId: null,
        pickupPointId: null,
        pickupPointName: null,
        priceMinor: 0,
        zoneCode: null,
        zoneName: "Центр",
      },
      quoteExpired: false,
      updatedAt: null,
    });

    expect(formattedAddress).toBe("Екатеринбург, ул. Ленина, 15, кв. 12");
  });

  it("builds cart delivery payload for courier draft", () => {
    const payload = buildPutCartDeliveryRequest("COURIER", {
      address: {
        apartment: null,
        city: "Екатеринбург",
        comment: null,
        country: "Россия",
        entrance: null,
        floor: null,
        house: "24",
        intercom: null,
        latitude: 56.851038,
        longitude: 60.649683,
        postalCode: null,
        region: "Свердловская область",
        street: "пр. Мира",
      },
      deliveryMethod: "COURIER",
      pickupPointAddress: null,
      pickupPointExternalId: null,
      pickupPointId: null,
      pickupPointName: null,
      quote: null,
      quoteExpired: false,
      updatedAt: null,
    });

    expect(payload).toEqual({
      address: {
        apartment: null,
        city: "Екатеринбург",
        comment: null,
        country: "Россия",
        entrance: null,
        floor: null,
        house: "24",
        intercom: null,
        latitude: 56.851038,
        longitude: 60.649683,
        postalCode: null,
        region: "Свердловская область",
        street: "пр. Мира",
      },
      deliveryMethod: "COURIER",
      pickupPointExternalId: null,
      pickupPointId: null,
    });
  });

  it("builds cart delivery payload for custom address delivery", () => {
    const payload = buildPutCartDeliveryRequest("CUSTOM_DELIVERY_ADDRESS", {
      address: {
        apartment: "8",
        city: "Екатеринбург",
        comment: "Офис",
        country: "Россия",
        entrance: "2",
        floor: "4",
        house: "10",
        intercom: "45",
        latitude: 56.847001,
        longitude: 60.611512,
        postalCode: "620014",
        region: "Свердловская область",
        street: "ул. Радищева",
      },
      deliveryMethod: "CUSTOM_DELIVERY_ADDRESS",
      pickupPointAddress: null,
      pickupPointExternalId: null,
      pickupPointId: null,
      pickupPointName: null,
      quote: null,
      quoteExpired: false,
      updatedAt: null,
    });

    expect(payload).toEqual({
      address: {
        apartment: "8",
        city: "Екатеринбург",
        comment: "Офис",
        country: "Россия",
        entrance: "2",
        floor: "4",
        house: "10",
        intercom: "45",
        latitude: 56.847001,
        longitude: 60.611512,
        postalCode: "620014",
        region: "Свердловская область",
        street: "ул. Радищева",
      },
      deliveryMethod: "CUSTOM_DELIVERY_ADDRESS",
      pickupPointExternalId: null,
      pickupPointId: null,
    });
  });

  it("builds cart delivery payload for pickup point", () => {
    const payload = buildPutCartDeliveryRequest("PICKUP", null, {
      address: {
        city: "Екатеринбург",
        country: "Россия",
        house: "7",
        latitude: 56.851972,
        longitude: 60.612427,
        region: "Свердловская область",
        street: "ул. 8 Марта",
      },
      code: "pickup-center",
      id: "7ef13ed2-4c3f-4f8d-94c7-e28ea7d5e5d2",
      isActive: true,
      name: "Storeva Центр",
    });

    expect(payload).toEqual({
      address: null,
      deliveryMethod: "PICKUP",
      pickupPointExternalId: null,
      pickupPointId: "7ef13ed2-4c3f-4f8d-94c7-e28ea7d5e5d2",
    });
  });

  it("builds cart delivery payload for Yandex pickup point", () => {
    const payload = buildYandexPickupDeliveryRequest("yandex-pvz-1");

    expect(payload).toEqual({
      address: null,
      deliveryMethod: "YANDEX_PICKUP_POINT",
      pickupPointExternalId: "yandex-pvz-1",
      pickupPointId: null,
    });
  });
});
