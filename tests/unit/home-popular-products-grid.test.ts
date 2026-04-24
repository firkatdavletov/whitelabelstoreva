import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Product } from "@/entities/product";

vi.mock("@/widgets/menu-grid/ui/product-card", () => ({
  ClassicProductCard: ({
    product,
    productHref,
  }: {
    product: Product;
    productHref: string;
  }) =>
    React.createElement(
      "a",
      { "data-testid": "classic-card", href: productHref },
      product.name,
    ),
  FashionProductCard: ({
    product,
    productHref,
  }: {
    product: Product;
    productHref: string;
  }) =>
    React.createElement(
      "a",
      { "data-testid": "fashion-card", href: productHref },
      product.name,
    ),
}));

import { HomePopularProductsGrid } from "@/widgets/home/ui/home-popular-products-grid";

const baseProduct: Product = {
  categoryId: "cat-1",
  countStep: 1,
  currency: "RUB",
  defaultVariantId: null,
  description: "",
  id: "prod-1",
  imageUrl: null,
  isAvailable: true,
  isConfigured: false,
  modifierGroups: [],
  name: "Product",
  optionGroups: [],
  price: 12.9,
  slug: "product",
  tags: [],
  unit: "PIECE",
  variants: [],
  visual: "P",
};

describe("HomePopularProductsGrid", () => {
  it("does not render the heading when the popular collection is empty", () => {
    render(
      React.createElement(HomePopularProductsGrid, {
        getProductHref: (product: Product) => `/menu/${product.slug}`,
        locale: "ru",
        products: [],
        title: "Популярное",
      }),
    );

    expect(
      screen.queryByRole("heading", { name: "Популярное" }),
    ).not.toBeInTheDocument();
  });

  it("renders popular product cards with menu links", () => {
    render(
      React.createElement(HomePopularProductsGrid, {
        getProductHref: (product: Product) => `/menu/${product.slug}`,
        locale: "ru",
        productCardVariant: "clothes-fashion",
        products: [baseProduct],
        title: "Популярное",
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Популярное" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("fashion-card")).toHaveAttribute(
      "href",
      "/menu/product",
    );
  });
});
