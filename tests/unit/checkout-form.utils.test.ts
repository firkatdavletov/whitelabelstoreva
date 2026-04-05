import { describe, expect, it } from "vitest";

import {
  buildCheckoutRequest,
  formatCheckoutDeliveryAddress,
  isPickupCheckoutDelivery,
  resolveCheckoutPaymentMethods,
} from "@/features/checkout-form/lib/checkout-form.utils";

describe("checkout form utils", () => {
  it("formats courier address from the selected cart delivery", () => {
    expect(
      formatCheckoutDeliveryAddress({
        address: {
          apartment: "12",
          city: "Екатеринбург",
          comment: null,
          country: "Россия",
          entrance: null,
          floor: null,
          house: "15",
          intercom: null,
          postalCode: "620014",
          region: "Свердловская область",
          street: "ул. Ленина",
        },
        deliveryMethod: "COURIER",
        pickupPointAddress: null,
        pickupPointName: null,
        quote: null,
        quoteExpired: false,
      }),
    ).toBe("Екатеринбург, ул. Ленина, дом 15");
  });

  it("normalizes pickup addresses and strips country, region, and postal code", () => {
    expect(
      formatCheckoutDeliveryAddress({
        address: null,
        deliveryMethod: "PICKUP",
        pickupPointAddress:
          "Россия, Свердловская область, 620014, Екатеринбург, ул. Ленина, 15",
        pickupPointName: "Storeva Центр",
        quote: null,
        quoteExpired: false,
      }),
    ).toBe("Екатеринбург, ул. Ленина, 15");
  });

  it("returns only active payment methods for the selected delivery option", () => {
    expect(
      resolveCheckoutPaymentMethods(
        [
          {
            code: "COURIER",
            name: "Доставка",
            paymentMethods: [
              {
                code: "CARD_ON_DELIVERY",
                description: null,
                isActive: true,
                isOnline: false,
                name: "Картой при получении",
              },
              {
                code: "SBP",
                description: null,
                isActive: false,
                isOnline: true,
                name: "СБП",
              },
            ],
            requiresAddress: true,
            requiresPickupPoint: false,
          },
        ],
        "COURIER",
      ),
    ).toEqual([
      {
        code: "CARD_ON_DELIVERY",
        description: null,
        isActive: true,
        isOnline: false,
        name: "Картой при получении",
      },
    ]);
  });

  it("builds checkout payload and normalizes blank fields into null", () => {
    expect(
      buildCheckoutRequest({
        apartment: "",
        comment: "  Позвоните за 5 минут  ",
        entrance: "",
        floor: "",
        fullName: "  Алексей Иванов  ",
        intercom: "",
        paymentMethodCode: "CARD_ON_DELIVERY",
        phone: "  +7 (999) 123-45-67  ",
      }),
    ).toEqual({
      comment: "Позвоните за 5 минут",
      customerName: "Алексей Иванов",
      customerPhone: "+7 (999) 123-45-67",
      paymentMethodCode: "CARD_ON_DELIVERY",
    });

    expect(
      buildCheckoutRequest({
        apartment: "",
        comment: "   ",
        entrance: "",
        floor: "",
        fullName: "",
        intercom: "",
        paymentMethodCode: "CASH",
        phone: "",
      }),
    ).toEqual({
      comment: null,
      customerName: null,
      customerPhone: null,
      paymentMethodCode: "CASH",
    });
  });

  it("appends courier meta fields to the checkout comment", () => {
    expect(
      buildCheckoutRequest(
        {
          apartment: "12",
          comment: "Позвоните за 5 минут",
          entrance: "3",
          floor: "7",
          fullName: "",
          intercom: "45",
          paymentMethodCode: "CARD_ON_DELIVERY",
          phone: "",
        },
        {
          additionalCommentParts: [
            "Квартира: 12",
            "Подъезд: 3",
            "Домофон: 45",
            "Этаж: 7",
          ],
        },
      ),
    ).toMatchObject({
      comment:
        "Квартира: 12. Подъезд: 3. Домофон: 45. Этаж: 7. Позвоните за 5 минут",
    });
  });

  it("detects pickup checkout delivery methods", () => {
    expect(isPickupCheckoutDelivery("PICKUP")).toBe(true);
    expect(isPickupCheckoutDelivery("YANDEX_PICKUP_POINT")).toBe(true);
    expect(isPickupCheckoutDelivery("COURIER")).toBe(false);
  });
});
