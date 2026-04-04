import { describe, expect, it } from "vitest";

import {
  buildCheckoutRequest,
  formatCheckoutDeliveryAddress,
  resolveCheckoutPaymentMethods,
} from "@/features/checkout-form/lib/checkout-form.utils";

describe("checkout form utils", () => {
  it("formats courier address from the selected cart delivery", () => {
    expect(
      formatCheckoutDeliveryAddress({
        address: {
          apartment: "12",
          city: "Екатеринбург",
          house: "15",
          street: "ул. Ленина",
        },
        deliveryMethod: "COURIER",
        pickupPointAddress: null,
        pickupPointName: null,
        quote: null,
        quoteExpired: false,
      }),
    ).toBe("Екатеринбург, ул. Ленина, 15, 12");
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
        comment: "  Позвоните за 5 минут  ",
        fullName: "  Алексей Иванов  ",
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
        comment: "   ",
        fullName: "",
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
});
