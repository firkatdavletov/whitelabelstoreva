import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
      data: {
        delivery: null,
        id: "cart-1",
        items: [
          {
            countStep: 1,
            id: "item-1",
            lineTotal: 12.9,
            modifierNames: ["Сыр"],
            productId: "prod-1",
            quantity: 2,
            title: "Бургер",
            unit: "PIECE",
          },
        ],
        itemsCount: 2,
        totalPrice: 12.9,
      },
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
});
