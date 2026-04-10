import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Product } from "@/entities/product";

vi.mock("next/image", () => ({
  default: (props: { alt?: string; className?: string; src?: string }) =>
    React.createElement("img", {
      alt: props.alt ?? "",
      className: props.className,
      src: props.src ?? "",
    }),
}));

vi.mock("next/link", () => ({
  default: (props: {
    children: React.ReactNode;
    className?: string;
    href: string;
  }) =>
    React.createElement(
      "a",
      {
        className: props.className,
        href: props.href,
      },
      props.children,
    ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "product.preview") {
        return "Открыть";
      }

      return key;
    },
  }),
}));

vi.mock("@/features/add-to-cart", () => ({
  AddToCartButton: () =>
    React.createElement("button", { type: "button" }, "Mock add to cart"),
}));

import {
  ClassicProductCard,
  FashionProductCard,
} from "@/widgets/menu-grid/ui/product-card";

const baseProduct: Product = {
  categoryId: "cat-1",
  countStep: 1,
  currency: "RUB",
  defaultVariantId: null,
  description: "Лаконичное описание товара",
  id: "prod-1",
  imageUrl: "https://example.com/product.jpg",
  isAvailable: true,
  isConfigured: false,
  modifierGroups: [],
  name: "Платье",
  optionGroups: [],
  price: 12.9,
  slug: "dress",
  tags: [],
  unit: "PIECE",
  variants: [],
  visual: "B",
};

describe("Product cards", () => {
  it("does not render the add-to-cart button in the fashion variant", () => {
    render(
      React.createElement(FashionProductCard, {
        locale: "ru",
        product: baseProduct,
        productHref: "/menu/dress",
      }),
    );

    expect(
      screen.queryByRole("button", { name: "Mock add to cart" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the add-to-cart button in the classic variant", () => {
    render(
      React.createElement(ClassicProductCard, {
        locale: "ru",
        product: baseProduct,
        productHref: "/menu/dress",
      }),
    );

    expect(
      screen.getByRole("button", { name: "Mock add to cart" }),
    ).toBeInTheDocument();
  });
});
