import { describe, expect, it } from "vitest";

import {
  mapCartDtoToStorefrontCart,
  resolveDeliveryQuoteEta,
} from "@/entities/cart";

describe("resolveDeliveryQuoteEta", () => {
  it("prefers structured minute ETA over backend message text", () => {
    expect(
      resolveDeliveryQuoteEta({
        estimatedDays: 0,
        estimatesMinutes: 25,
        message: "от 25 минут",
      }),
    ).toEqual({
      kind: "minutes",
      value: 25,
    });
  });

  it("falls back to message and day ETA when minutes are unavailable", () => {
    expect(
      resolveDeliveryQuoteEta({
        estimatedDays: 2,
        message: "within two business days",
      }),
    ).toEqual({
      kind: "message",
      value: "within two business days",
    });

    expect(
      resolveDeliveryQuoteEta({
        estimatedDays: 2,
        message: "   ",
      }),
    ).toEqual({
      kind: "days",
      value: 2,
    });
  });
});

describe("mapCartDtoToStorefrontCart", () => {
  it("maps API minute ETA into the storefront cart model", () => {
    const storefrontCart = mapCartDtoToStorefrontCart({
      delivery: {
        address: null,
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
          estimatesMinutes: 25,
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
      },
      id: "cart-1",
      items: [
        {
          countStep: 1,
          id: "item-1",
          lineTotalMinor: 1490,
          modifiers: [],
          modifiersTotalMinor: 0,
          priceMinor: 1490,
          productId: "product-1",
          quantity: 1,
          title: "City Smash",
          unit: "PIECE",
          unitPriceMinor: 1490,
          variantId: null,
        },
      ],
      status: "ACTIVE",
      totalPriceMinor: 1490,
    });

    expect(storefrontCart.delivery?.quote?.estimatedMinutes).toBe(25);
    expect(storefrontCart.items[0]).toMatchObject({
      countStep: 1,
      quantity: 1,
      unit: "PIECE",
    });
  });
});
