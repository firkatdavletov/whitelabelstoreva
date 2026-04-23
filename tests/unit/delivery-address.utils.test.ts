import { describe, expect, it } from "vitest";

import {
  buildPutCartDeliveryRequest,
  buildYandexPickupDeliveryRequest,
  canSubmitAddressDeliveryDraft,
  formatDeliveryDraftAddress,
  resolveMarkerClusterViewport,
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

  it("formats custom address draft even when only city and region are resolved", () => {
    const formattedAddress = formatDeliveryDraftAddress({
      address: {
        city: "Екатеринбург",
        country: "Россия",
        region: "Свердловская область",
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

    expect(formattedAddress).toBe("Екатеринбург, Свердловская область, Россия");
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

  it("allows submitting custom address delivery draft when address is resolved", () => {
    const canSubmit = canSubmitAddressDeliveryDraft(
      "CUSTOM_DELIVERY_ADDRESS",
      {
        address: {
          city: "Екатеринбург",
          latitude: 56.847001,
          longitude: 60.611512,
        },
        deliveryMethod: "CUSTOM_DELIVERY_ADDRESS",
        pickupPointAddress: null,
        pickupPointExternalId: null,
        pickupPointId: null,
        pickupPointName: null,
        quote: null,
        quoteExpired: false,
        updatedAt: null,
      },
      null,
    );

    expect(canSubmit).toBe(true);
  });

  it("requires an available quote for courier draft submission", () => {
    const canSubmit = canSubmitAddressDeliveryDraft(
      "COURIER",
      {
        address: {
          city: "Екатеринбург",
          latitude: 56.851038,
          longitude: 60.649683,
        },
        deliveryMethod: "COURIER",
        pickupPointAddress: null,
        pickupPointExternalId: null,
        pickupPointId: null,
        pickupPointName: null,
        quote: null,
        quoteExpired: false,
        updatedAt: null,
      },
      null,
    );

    expect(canSubmit).toBe(false);
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

  it("builds a wider pickup viewport for multiple markers so clusters can appear", () => {
    const viewport = resolveMarkerClusterViewport(
      [
        {
          id: "pickup-center",
          label: "Storeva Центр",
          latitude: 56.851972,
          longitude: 60.612427,
        },
        {
          id: "pickup-park",
          label: "Storeva Парк",
          latitude: 56.858129,
          longitude: 60.632941,
        },
      ],
      {
        heightPx: 420,
        maxZoom: 14,
        minZoom: 10,
        widthPx: 420,
      },
    );

    expect(viewport).toEqual({
      center: {
        latitude: 56.855051,
        longitude: 60.622684,
      },
      zoom: 14,
    });
  });
});
