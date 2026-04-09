import { describe, expect, it } from "vitest";

import {
  hasSelectedCartDelivery,
  resolveCartCheckoutTarget,
} from "@/features/cart-summary/lib/cart-checkout-target";
import type { StorefrontCart } from "@/entities/cart";

function createCart(delivery: StorefrontCart["delivery"]): StorefrontCart {
  return {
    delivery,
    id: "cart-1",
    items: [],
    itemsCount: 0,
    totalPrice: 0,
  };
}

describe("cart checkout target", () => {
  it("redirects guests to auth when tenant disables guest checkout", () => {
    expect(
      resolveCartCheckoutTarget({
        allowGuestCheckout: false,
        authHref: "/account",
        checkoutHref: "/checkout",
        deliveryHref: "/delivery",
        isAuthorized: false,
        storefrontCart: createCart(null),
      }),
    ).toBe("/account");
  });

  it("redirects to delivery when checkout requires delivery selection", () => {
    expect(
      resolveCartCheckoutTarget({
        allowGuestCheckout: true,
        authHref: "/account",
        checkoutHref: "/checkout",
        deliveryHref: "/delivery",
        isAuthorized: false,
        storefrontCart: createCart({
          address: null,
          deliveryMethod: null,
          pickupPointAddress: null,
          pickupPointName: null,
          quote: null,
          quoteExpired: false,
        }),
      }),
    ).toBe("/delivery");
  });

  it("treats courier delivery with an address as ready for checkout", () => {
    expect(
      hasSelectedCartDelivery({
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
    ).toBe(true);
  });

  it("treats custom address delivery with an address as ready for checkout", () => {
    expect(
      hasSelectedCartDelivery({
        address: {
          apartment: null,
          city: "Екатеринбург",
          house: "10",
          street: "ул. Радищева",
        },
        deliveryMethod: "CUSTOM_DELIVERY_ADDRESS",
        pickupPointAddress: null,
        pickupPointName: null,
        quote: null,
        quoteExpired: false,
      }),
    ).toBe(true);
  });

  it("treats pickup delivery with pickup point details as ready for checkout", () => {
    expect(
      resolveCartCheckoutTarget({
        allowGuestCheckout: true,
        authHref: "/account",
        checkoutHref: "/checkout",
        deliveryHref: "/delivery",
        isAuthorized: true,
        storefrontCart: createCart({
          address: null,
          deliveryMethod: "PICKUP",
          pickupPointAddress: "Екатеринбург, ул. 8 Марта, 7",
          pickupPointName: "Storeva Центр",
          quote: null,
          quoteExpired: false,
        }),
      }),
    ).toBe("/checkout");
  });
});
