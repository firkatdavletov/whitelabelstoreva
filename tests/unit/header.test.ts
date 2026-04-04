import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useStorefrontCartQuery: vi.fn(),
  useTenantTheme: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: (props: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      switch (key) {
        case "header.addressPending":
          return "Адрес не выбран";
        case "header.cartWithTotal":
          return `Корзина ${options?.total}`;
        case "header.delivery":
          return "Доставка";
        case "header.login":
          return "Войти";
        case "header.search":
          return "Поиск";
        case "navigation.cart":
          return "Корзина";
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

vi.mock("@/features/tenant-theme", () => ({
  useTenantTheme: mocks.useTenantTheme,
}));

import { Header } from "@/widgets/header/ui/header";

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useTenantTheme.mockReturnValue({
      currency: "RUB",
      logoText: "SV",
      title: "Storeva",
    });
  });

  it("hides the cart button when the cart is empty", () => {
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: {
        delivery: null,
        id: "cart-1",
        items: [],
        itemsCount: 0,
        totalPrice: 0,
      },
    });

    render(React.createElement(Header));

    expect(screen.queryByRole("link", { name: /Корзина/i })).toBeNull();
  });

  it("renders the cart button without an items counter", () => {
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: {
        delivery: null,
        id: "cart-1",
        items: [
          {
            countStep: 1,
            id: "item-1",
            lineTotal: 12.9,
            modifierNames: [],
            productId: "prod-1",
            quantity: 3,
            title: "Бургер",
            unit: "PIECE",
          },
        ],
        itemsCount: 3,
        totalPrice: 0,
      },
    });

    render(React.createElement(Header));

    expect(screen.getByRole("link", { name: /Корзина/i })).toHaveAttribute(
      "href",
      "/cart",
    );
    expect(screen.queryByText(/^3$/)).not.toBeInTheDocument();
  });
});
