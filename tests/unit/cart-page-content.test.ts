import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  removeMutate: vi.fn(),
  updateMutate: vi.fn(),
  useChangeStorefrontCartItemQuantityMutation: vi.fn(),
  useRemoveStorefrontCartItemMutation: vi.fn(),
  useStorefrontCartQuery: vi.fn(),
  useTenantTheme: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", props),
}));

vi.mock("next/link", () => ({
  default: (props: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      switch (key) {
        case "cart.back":
          return "Назад";
        case "cart.checkout":
          return "Перейти к оформлению";
        case "cart.delivery":
          return "Доставка";
        case "cart.deliveryFree":
          return "Доставка бесплатно";
        case "cart.subtitle":
          return "Проверьте состав заказа и настройте количество перед оформлением.";
        case "cart.title":
          return "Корзина";
        case "shared.total":
          return "Итого";
        default:
          return key;
      }
    },
  }),
}));

vi.mock("@/shared/hooks/use-storefront-route", () => ({
  useStorefrontRoute: () => ({
    href: (pathname = "") => pathname,
    tenantSlug: "storeva-street",
  }),
}));

vi.mock("@/features/cart-summary/hooks/use-storefront-cart-query", () => ({
  useStorefrontCartQuery: mocks.useStorefrontCartQuery,
}));

vi.mock("@/features/cart-summary/hooks/use-storefront-cart-mutations", () => ({
  useChangeStorefrontCartItemQuantityMutation:
    mocks.useChangeStorefrontCartItemQuantityMutation,
  useRemoveStorefrontCartItemMutation:
    mocks.useRemoveStorefrontCartItemMutation,
}));

vi.mock("@/features/tenant-theme", () => ({
  useTenantTheme: mocks.useTenantTheme,
}));

import { CartPageContent } from "@/features/cart-summary/ui/cart-page-content";

describe("CartPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useTenantTheme.mockReturnValue({
      allowGuestCheckout: true,
      currency: "RUB",
    });
    mocks.useChangeStorefrontCartItemQuantityMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.updateMutate,
    });
    mocks.useRemoveStorefrontCartItemMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.removeMutate,
    });
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: {
        delivery: {
          address: {
            apartment: null,
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
            estimatedDays: 0,
            estimatedMinutes: 25,
            message: null,
            pickupPointAddress: null,
            pickupPointName: null,
            priceMinor: 20000,
            zoneName: "Центр",
          },
          quoteExpired: false,
        },
        id: "cart-1",
        items: [
          {
            countStep: 1,
            id: "item-1",
            lineTotal: 12.9,
            modifierNames: [],
            modifiers: [],
            productId: "prod-1",
            quantity: 1,
            title: "Бургер",
            unit: "PIECE",
            variantId: null,
          },
        ],
        itemsCount: 1,
        totalPrice: 12.9,
      },
      isLoading: false,
    });
  });

  it("shows delivery price in the cart summary", () => {
    render(
      React.createElement(CartPageContent, {
        isAuthorized: true,
        locale: "ru",
        products: [],
      }),
    );

    expect(screen.getByText("Доставка")).toBeInTheDocument();
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });
});
