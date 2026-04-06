import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StorefrontCart } from "@/entities/cart";

const mocks = vi.hoisted(() => ({
  removeMutate: vi.fn(),
  useRemoveStorefrontCartItemMutation: vi.fn(),
  useStorefrontCartQuery: vi.fn(),
  useTenantTheme: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: (props: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      switch (key) {
        case "cart.checkoutSubtitle":
          return "Проверьте состав заказа перед подтверждением.";
        case "cart.empty":
          return "Корзина пока пуста.";
        case "cart.loading":
          return "Обновляем корзину...";
        case "cart.delivery":
          return "Доставка";
        case "cart.deliveryFree":
          return "Доставка бесплатно";
        case "cart.summary":
          return "Состав корзины";
        case "cart.title":
          return "Корзина";
        case "shared.quantity":
          return "Кол-во";
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
    locale: "ru",
    tenantSlug: "storeva-street",
  }),
}));

vi.mock("@/features/cart-summary/hooks/use-storefront-cart-query", () => ({
  useStorefrontCartQuery: mocks.useStorefrontCartQuery,
}));

vi.mock("@/features/cart-summary/hooks/use-storefront-cart-mutations", () => ({
  useRemoveStorefrontCartItemMutation:
    mocks.useRemoveStorefrontCartItemMutation,
}));

vi.mock("@/features/tenant-theme", () => ({
  useTenantTheme: mocks.useTenantTheme,
}));

import { CartSummaryCard } from "@/features/cart-summary/ui/cart-summary-card";

function createStorefrontCart(
  delivery: StorefrontCart["delivery"] = null,
): StorefrontCart {
  return {
    delivery,
    id: "cart-1",
    items: [
      {
        countStep: 1,
        id: "item-1",
        lineTotal: 12.9,
        modifierNames: ["Сыр"],
        modifiers: [],
        productId: "prod-1",
        quantity: 2,
        title: "Бургер",
        unit: "PIECE",
        variantId: null,
      },
    ],
    itemsCount: 2,
    totalPrice: 12.9,
  };
}

describe("CartSummaryCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useTenantTheme.mockReturnValue({
      currency: "RUB",
    });
    mocks.useRemoveStorefrontCartItemMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.removeMutate,
    });
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: createStorefrontCart(),
      isLoading: false,
    });
  });

  it("hides remove controls in read-only checkout mode", () => {
    render(
      React.createElement(CartSummaryCard, {
        editable: false,
        showCheckoutCta: false,
      }),
    );

    expect(
      screen.getByText("Проверьте состав заказа перед подтверждением."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove Бургер" }),
    ).not.toBeInTheDocument();
  });

  it("shows free delivery text on checkout for courier delivery with zero price", () => {
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: createStorefrontCart({
        address: null,
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
          message: "бесплатно",
          pickupPointAddress: null,
          pickupPointName: null,
          priceMinor: 0,
          zoneName: "Центр",
        },
        quoteExpired: false,
      }),
      isLoading: false,
    });

    render(
      React.createElement(CartSummaryCard, {
        editable: false,
        showCheckoutCta: false,
      }),
    );

    expect(screen.getByText("Доставка бесплатно")).toBeInTheDocument();
  });

  it("shows delivery price on checkout and hides it for pickup", () => {
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: createStorefrontCart({
        address: null,
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
          priceMinor: 14900,
          zoneName: "Центр",
        },
        quoteExpired: false,
      }),
      isLoading: false,
    });

    const { rerender } = render(
      React.createElement(CartSummaryCard, {
        editable: false,
        showCheckoutCta: false,
      }),
    );

    expect(screen.getByText("Доставка")).toBeInTheDocument();
    expect(screen.getByText(/149/)).toBeInTheDocument();

    mocks.useStorefrontCartQuery.mockReturnValue({
      data: createStorefrontCart({
        address: null,
        deliveryMethod: "PICKUP",
        pickupPointAddress: "Екатеринбург, ул. 8 Марта, 7",
        pickupPointExternalId: null,
        pickupPointId: "pickup-1",
        pickupPointName: "Storeva Центр",
        quote: {
          available: true,
          currency: "RUB",
          estimatedDays: 0,
          estimatedMinutes: 25,
          message: null,
          pickupPointAddress: "Екатеринбург, ул. 8 Марта, 7",
          pickupPointName: "Storeva Центр",
          priceMinor: 14900,
          zoneName: "Центр",
        },
        quoteExpired: false,
      }),
      isLoading: false,
    });

    rerender(
      React.createElement(CartSummaryCard, {
        editable: false,
        showCheckoutCta: false,
      }),
    );

    expect(screen.queryByText("Доставка")).not.toBeInTheDocument();
    expect(screen.queryByText("Доставка бесплатно")).not.toBeInTheDocument();
  });
});
