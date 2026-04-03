import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/entities/product";

const mocks = vi.hoisted(() => ({
  removeCartItemMutation: vi.fn(),
  routerPush: vi.fn(),
  toastSuccess: vi.fn(),
  useAddStorefrontCartItemMutation: vi.fn(),
  useChangeStorefrontCartItemQuantityMutation: vi.fn(),
  useRemoveStorefrontCartItemMutation: vi.fn(),
  useStorefrontCartQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      switch (key) {
        case "product.add":
          return "Добавить";
        case "product.choose":
          return "Выбрать";
        case "product.decreaseQuantity":
          return "Уменьшить количество";
        case "product.inCartWithQuantity":
          return `В корзине ${options?.quantity}`;
        case "product.increaseQuantity":
          return "Увеличить количество";
        case "toast.itemAddedDescription":
          return `${options?.name} добавлен в корзину.`;
        case "toast.itemAddedTitle":
          return "Позиция добавлена";
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
  useAddStorefrontCartItemMutation: mocks.useAddStorefrontCartItemMutation,
  useChangeStorefrontCartItemQuantityMutation:
    mocks.useChangeStorefrontCartItemQuantityMutation,
  useRemoveStorefrontCartItemMutation:
    mocks.useRemoveStorefrontCartItemMutation,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
  },
}));

import { AddToCartButton } from "@/features/add-to-cart/ui/add-to-cart-button";

const baseProduct: Product = {
  categoryId: "cat-1",
  countStep: 1,
  currency: "RUB",
  defaultVariantId: null,
  description: "Сочный бургер",
  id: "prod-1",
  imageUrl: null,
  isAvailable: true,
  isConfigured: false,
  modifierGroups: [],
  name: "Бургер",
  optionGroups: [],
  price: 12.9,
  slug: "burger",
  tags: [],
  unit: "PIECE",
  variants: [],
  visual: "B",
};

describe("AddToCartButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useStorefrontCartQuery.mockReturnValue({ data: null });
    mocks.useAddStorefrontCartItemMutation.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    });
    mocks.useChangeStorefrontCartItemQuantityMutation.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
    mocks.useRemoveStorefrontCartItemMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.removeCartItemMutation,
    });
  });

  it("renders only the choose button for configurable items outside the cart", async () => {
    const user = userEvent.setup();

    render(
      React.createElement(AddToCartButton, {
        product: {
          ...baseProduct,
          defaultVariantId: "variant-default",
          isConfigured: true,
        },
        productHref: "/menu/burger",
      }),
    );

    expect(screen.queryByRole("button", { name: "Добавить" })).toBeNull();

    const chooseButton = screen.getByRole("button", { name: "Выбрать" });

    expect(chooseButton).toHaveClass("bg-primary", "text-primary-foreground");

    await user.click(chooseButton);

    expect(mocks.routerPush).toHaveBeenCalledWith("/menu/burger");
  });

  it("renders the in-cart button for configurable items already in cart", async () => {
    const user = userEvent.setup();

    mocks.useStorefrontCartQuery.mockReturnValue({
      data: {
        delivery: null,
        id: "cart-1",
        items: [
          {
            countStep: 1,
            id: "item-1",
            lineTotal: 25.8,
            modifierNames: ["Мягкая"],
            productId: "prod-1",
            quantity: 2,
            title: "Бургер · Бургер",
            unit: "PIECE",
          },
        ],
        itemsCount: 2,
        totalPrice: 25.8,
      },
    });

    render(
      React.createElement(AddToCartButton, {
        product: {
          ...baseProduct,
          defaultVariantId: "variant-default",
          isConfigured: true,
        },
        productHref: "/menu/burger",
      }),
    );

    const inCartButton = screen.getByRole("button", { name: "В корзине 2 шт" });

    expect(inCartButton).toHaveClass("bg-primary", "text-primary-foreground");
    expect(screen.queryByRole("button", { name: "Выбрать" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Добавить" }),
    ).not.toBeInTheDocument();

    await user.click(inCartButton);

    expect(mocks.routerPush).toHaveBeenCalledWith("/menu/burger");
  });

  it("adds a non-configured product when the item is outside the cart", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    mocks.useAddStorefrontCartItemMutation.mockReturnValue({
      isPending: false,
      mutate,
      mutateAsync: vi.fn(),
    });

    render(
      React.createElement(AddToCartButton, {
        product: baseProduct,
        productHref: "/menu/burger",
      }),
    );

    const addButton = screen.getByRole("button", { name: "Добавить" });

    expect(addButton).toHaveClass("relative", "z-20", "mt-auto");

    await user.click(addButton);

    expect(mutate).toHaveBeenCalledWith(
      {
        countStep: 1,
        productId: "prod-1",
        title: "Бургер",
        unit: "PIECE",
        unitPrice: 12.9,
        variantId: null,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("renders simple quantity controls for non-configured items in cart", () => {
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: {
        delivery: null,
        id: "cart-1",
        items: [
          {
            countStep: 1,
            id: "item-1",
            lineTotal: 25.8,
            modifierNames: [],
            productId: "prod-1",
            quantity: 2,
            title: "Бургер",
            unit: "PIECE",
          },
        ],
        itemsCount: 2,
        totalPrice: 25.8,
      },
    });

    render(
      React.createElement(AddToCartButton, {
        product: baseProduct,
        productHref: "/menu/burger",
      }),
    );

    expect(
      screen.getByRole("button", { name: "Уменьшить количество" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Увеличить количество" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 шт")).not.toHaveClass("bg-secondary/55");
  });
});
