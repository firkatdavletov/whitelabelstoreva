import { describe, expect, it } from "vitest";

import {
  buildCheckoutRequest,
  formatCheckoutDeliveryAddress,
  isPickupCheckoutDelivery,
  resolveDeliveryMethodFallbackLabel,
  resolveCheckoutPaymentMethods,
} from "@/features/checkout-form/lib/checkout-form.utils";
import { createCheckoutFormSchema } from "@/features/checkout-form/model/checkout-form.schema";

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

  it("formats custom address delivery the same way as courier delivery", () => {
    expect(
      formatCheckoutDeliveryAddress({
        address: {
          apartment: null,
          city: "Екатеринбург",
          comment: null,
          country: "Россия",
          entrance: null,
          floor: null,
          house: "10",
          intercom: null,
          postalCode: "620014",
          region: "Свердловская область",
          street: "ул. Радищева",
        },
        deliveryMethod: "CUSTOM_DELIVERY_ADDRESS",
        pickupPointAddress: null,
        pickupPointName: null,
        quote: null,
        quoteExpired: false,
      }),
    ).toBe("Екатеринбург, ул. Радищева, дом 10");
  });

  it("normalizes pickup addresses and strips country, region, and postal code", () => {
    expect(
      formatCheckoutDeliveryAddress({
        address: null,
        deliveryMethod: "PICKUP",
        pickupPointAddress:
          "Россия, Свердловская область, 620014, Екатеринбург, ул. Ленина, house 15",
        pickupPointName: "Storeva Центр",
        quote: null,
        quoteExpired: false,
      }),
    ).toBe("Екатеринбург, ул. Ленина, дом 15");

    expect(
      formatCheckoutDeliveryAddress({
        address: null,
        deliveryMethod: "PICKUP",
        pickupPointAddress:
          "Russian Federation; Sverdlovsk Region; postal code 620014; Yekaterinburg; Lenina Ave; house 15",
        pickupPointName: "Storeva Center",
        quote: null,
        quoteExpired: false,
      }),
    ).toBe("Yekaterinburg, Lenina Ave, дом 15");
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
        isPrivateHouse: false,
        intercom: "",
        paymentMethodCode: "CARD_ON_DELIVERY",
        phone: "  +7 (999) 123-45-67  ",
      }),
    ).toEqual({
      address: null,
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
        isPrivateHouse: false,
        intercom: "",
        paymentMethodCode: "CASH",
        phone: "",
      }),
    ).toEqual({
      address: null,
      comment: null,
      customerName: null,
      customerPhone: null,
      paymentMethodCode: "CASH",
    });
  });

  it("sends courier meta fields in the checkout address payload", () => {
    expect(
      buildCheckoutRequest(
        {
          apartment: "12",
          comment: "Позвоните за 5 минут",
          entrance: "3",
          floor: "7",
          fullName: "",
          isPrivateHouse: false,
          intercom: "45",
          paymentMethodCode: "CARD_ON_DELIVERY",
          phone: "",
        },
        {
          deliveryAddress: {
            apartment: null,
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
        },
      ),
    ).toEqual({
      address: {
        apartment: "12",
        city: "Екатеринбург",
        comment: "Позвоните за 5 минут",
        country: "Россия",
        entrance: "3",
        floor: "7",
        house: "15",
        intercom: "45",
        postalCode: "620014",
        region: "Свердловская область",
        street: "ул. Ленина",
      },
      comment: "Позвоните за 5 минут",
      customerName: null,
      customerPhone: null,
      paymentMethodCode: "CARD_ON_DELIVERY",
    });
  });

  it("omits apartment metadata in the checkout address payload for private houses", () => {
    expect(
      buildCheckoutRequest(
        {
          apartment: "12",
          comment: "Позвоните у ворот",
          entrance: "3",
          floor: "7",
          fullName: "",
          isPrivateHouse: true,
          intercom: "45",
          paymentMethodCode: "CARD_ON_DELIVERY",
          phone: "",
        },
        {
          deliveryAddress: {
            apartment: null,
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
        },
      ),
    ).toEqual({
      address: {
        apartment: null,
        city: "Екатеринбург",
        comment: "Позвоните у ворот",
        country: "Россия",
        entrance: null,
        floor: null,
        house: "15",
        intercom: null,
        postalCode: "620014",
        region: "Свердловская область",
        street: "ул. Ленина",
      },
      comment: "Позвоните у ворот",
      customerName: null,
      customerPhone: null,
      paymentMethodCode: "CARD_ON_DELIVERY",
    });
  });

  it("detects pickup checkout delivery methods", () => {
    expect(isPickupCheckoutDelivery("PICKUP")).toBe(true);
    expect(isPickupCheckoutDelivery("YANDEX_PICKUP_POINT")).toBe(true);
    expect(isPickupCheckoutDelivery("COURIER")).toBe(false);
    expect(isPickupCheckoutDelivery("CUSTOM_DELIVERY_ADDRESS")).toBe(false);
  });

  it("returns a fallback label for custom address delivery", () => {
    expect(resolveDeliveryMethodFallbackLabel("CUSTOM_DELIVERY_ADDRESS")).toBe(
      "Доставка по адресу",
    );
  });

  it("requires apartment only for courier checkout", () => {
    const courierSchema = createCheckoutFormSchema({
      requiresApartment: true,
      requiresContactDetails: false,
    });
    const pickupSchema = createCheckoutFormSchema({
      requiresApartment: false,
      requiresContactDetails: false,
    });

    expect(
      courierSchema.safeParse({
        apartment: "",
        comment: "",
        entrance: "",
        floor: "",
        fullName: "",
        isPrivateHouse: false,
        intercom: "",
        paymentMethodCode: "CARD_ON_DELIVERY",
        phone: "",
      }).success,
    ).toBe(false);

    expect(
      pickupSchema.safeParse({
        apartment: "",
        comment: "",
        entrance: "",
        floor: "",
        fullName: "",
        isPrivateHouse: false,
        intercom: "",
        paymentMethodCode: "CARD_ON_DELIVERY",
        phone: "",
      }).success,
    ).toBe(true);
  });

  it("does not require apartment for courier checkout when private house is selected", () => {
    const courierSchema = createCheckoutFormSchema({
      requiresApartment: true,
      requiresContactDetails: false,
    });

    expect(
      courierSchema.safeParse({
        apartment: "",
        comment: "",
        entrance: "",
        floor: "",
        fullName: "",
        isPrivateHouse: true,
        intercom: "",
        paymentMethodCode: "CARD_ON_DELIVERY",
        phone: "",
      }).success,
    ).toBe(true);
  });
});
