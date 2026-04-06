import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Product } from "@/entities/product";

const mocks = vi.hoisted(() => ({
  addCartItemMutation: vi.fn(),
  changeCartItemQuantityMutation: vi.fn(),
  openCartSidebar: vi.fn(),
  productDetailsRefetch: vi.fn(),
  removeCartItemMutation: vi.fn(),
  toastSuccess: vi.fn(),
  useAddStorefrontCartItemMutation: vi.fn(),
  useChangeStorefrontCartItemQuantityMutation: vi.fn(),
  useMenuProductDetailsQuery: vi.fn(),
  useRemoveStorefrontCartItemMutation: vi.fn(),
  useStorefrontCartQuery: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string; className?: string; src?: string }) =>
    React.createElement("img", {
      alt: props.alt ?? "",
      className: props.className,
      src: props.src ?? "",
    }),
}));

vi.mock("next/link", () => ({
  default: (props: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      switch (key) {
        case "navigation.menu":
          return "Меню";
        case "product.addToCart":
          return "Добавить в корзину";
        case "product.chooseAtLeast":
          return `Минимум ${options?.count}`;
        case "product.chooseUpTo":
          return `До ${options?.count} опций`;
        case "product.decreaseQuantity":
          return "Уменьшить количество";
        case "product.increaseQuantity":
          return "Увеличить количество";
        case "product.included":
          return "Входит в цену";
        case "product.loadError":
          return "Не удалось загрузить детали товара.";
        case "product.modifiersTotal":
          return "Дополнительно";
        case "product.noCustomization":
          return "Без дополнительных настроек.";
        case "product.optional":
          return "Опционально";
        case "product.readyToOrder":
          return "Можно заказывать";
        case "product.required":
          return "Обязательно";
        case "product.selectOne":
          return "Выберите один вариант";
        case "product.unavailable":
          return "Нет в наличии";
        case "product.variantTitle":
          return "Вариант товара";
        case "shared.retry":
          return "Повторить";
        case "shared.total":
          return "Итого";
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

vi.mock("@/features/menu-catalog/hooks/use-menu-product-details-query", () => ({
  useMenuProductDetailsQuery: mocks.useMenuProductDetailsQuery,
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

vi.mock("@/store/ui-store", () => ({
  useUiStore: (selector: (state: { openCartSidebar: () => void }) => unknown) =>
    selector({ openCartSidebar: mocks.openCartSidebar }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
  },
}));

import { ProductDetailsPage } from "@/features/menu-catalog/ui/product-details-page";

const baseProduct: Product = {
  categoryId: "cat-1",
  countStep: 1,
  currency: "RUB",
  defaultVariantId: "variant-regular",
  description: "Свежий поке с лососем и рисом.",
  id: "prod-1",
  imageUrl: "https://example.com/poke.jpg",
  isAvailable: true,
  isConfigured: true,
  modifierGroups: [
    {
      id: "group-sauce",
      isRequired: true,
      maxSelected: 1,
      minSelected: 1,
      name: "Соус",
      options: [
        {
          description: "",
          id: "sauce-hot",
          isActive: true,
          isDefault: true,
          name: "Острый",
          price: 1,
          priceType: "FIXED",
        },
        {
          description: "",
          id: "sauce-cheese",
          isActive: true,
          isDefault: false,
          name: "Сырный",
          price: 2,
          priceType: "FIXED",
        },
      ],
    },
  ],
  name: "Поке",
  optionGroups: [
    {
      id: "size",
      title: "Размер",
      values: [
        {
          id: "size-regular",
          title: "Обычный",
        },
      ],
    },
  ],
  price: 12.9,
  slug: "poke",
  tags: [],
  unit: "PIECE",
  variants: [
    {
      id: "variant-regular",
      imageUrl: null,
      isActive: true,
      optionValueIds: ["size-regular"],
      price: 14.9,
      title: "Обычный",
    },
  ],
  visual: "P",
};

const plainProduct: Product = {
  ...baseProduct,
  defaultVariantId: null,
  isConfigured: false,
  modifierGroups: [],
  optionGroups: [],
  variants: [],
};

function renderProductDetails() {
  return render(
    React.createElement(ProductDetailsPage, {
      backHref: "/menu",
      locale: "ru",
      product: baseProduct,
    }),
  );
}

describe("ProductDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useMenuProductDetailsQuery.mockReturnValue({
      data: baseProduct,
      error: null,
      isError: false,
      isPending: false,
      refetch: mocks.productDetailsRefetch,
    });
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: null,
    });
    mocks.useAddStorefrontCartItemMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.addCartItemMutation,
    });
    mocks.useChangeStorefrontCartItemQuantityMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.changeCartItemQuantityMutation,
    });
    mocks.useRemoveStorefrontCartItemMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.removeCartItemMutation,
    });
  });

  it("renders quantity controls only for the selected cart configuration", async () => {
    const user = userEvent.setup();

    mocks.useStorefrontCartQuery.mockReturnValue({
      data: {
        delivery: null,
        id: "cart-1",
        items: [
          {
            countStep: 1,
            id: "item-1",
            lineTotal: 31.8,
            modifiers: [
              {
                modifierGroupId: "group-sauce",
                modifierOptionId: "sauce-hot",
                optionName: "Острый",
                quantity: 1,
              },
            ],
            modifierNames: ["Острый"],
            productId: "prod-1",
            quantity: 2,
            title: "Поке · Обычный",
            unit: "PIECE",
            variantId: "variant-regular",
          },
        ],
        itemsCount: 2,
        totalPrice: 31.8,
      },
    });

    renderProductDetails();

    expect(screen.queryByText("Доступно")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Добавить в корзину" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Уменьшить количество" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Увеличить количество" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 шт")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Увеличить количество" }),
    );

    expect(mocks.addCartItemMutation).toHaveBeenCalledWith(
      {
        countStep: 1,
        modifiers: [
          expect.objectContaining({
            modifierGroupId: "group-sauce",
            modifierOptionId: "sauce-hot",
            optionName: "Острый",
          }),
        ],
        productId: "prod-1",
        title: "Поке · Обычный",
        unit: "PIECE",
        unitPrice: 14.9,
        variantId: "variant-regular",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );

    await user.click(
      screen.getByRole("button", { name: "Уменьшить количество" }),
    );

    expect(mocks.changeCartItemQuantityMutation).toHaveBeenCalledWith({
      itemId: "item-1",
      quantity: 1,
    });
  });

  it("keeps the floating add button when the cart contains a different configuration", () => {
    mocks.useStorefrontCartQuery.mockReturnValue({
      data: {
        delivery: null,
        id: "cart-1",
        items: [
          {
            countStep: 1,
            id: "item-1",
            lineTotal: 33.8,
            modifiers: [
              {
                modifierGroupId: "group-sauce",
                modifierOptionId: "sauce-cheese",
                optionName: "Сырный",
                quantity: 1,
              },
            ],
            modifierNames: ["Сырный"],
            productId: "prod-1",
            quantity: 2,
            title: "Поке · Обычный",
            unit: "PIECE",
            variantId: "variant-regular",
          },
        ],
        itemsCount: 2,
        totalPrice: 33.8,
      },
    });

    renderProductDetails();

    expect(
      screen.getByRole("button", { name: "Добавить в корзину" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Уменьшить количество" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Увеличить количество" }),
    ).not.toBeInTheDocument();
  });

  it("does not render the ready-to-order info block for products without customizations", () => {
    mocks.useMenuProductDetailsQuery.mockReturnValue({
      data: plainProduct,
      error: null,
      isError: false,
      isPending: false,
      refetch: mocks.productDetailsRefetch,
    });

    render(
      React.createElement(ProductDetailsPage, {
        backHref: "/menu",
        locale: "ru",
        product: plainProduct,
      }),
    );

    expect(screen.queryByText("Можно заказывать")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Без дополнительных настроек."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Добавить в корзину" }),
    ).toBeInTheDocument();
  });
});
