import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Product } from "@/entities/product";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock("@/shared/hooks/use-storefront-route", () => ({
  useStorefrontRoute: () => ({
    href: (pathname = "") => pathname,
  }),
}));

vi.mock("@/widgets/menu-grid/ui/product-card", () => ({
  ClassicProductCard: () =>
    React.createElement("div", { "data-testid": "classic-card" }, "Classic"),
  FashionProductCard: () =>
    React.createElement("div", { "data-testid": "fashion-card" }, "Fashion"),
}));

import { MenuGrid } from "@/widgets/menu-grid/ui/menu-grid";

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

describe("MenuGrid", () => {
  it("uses a fixed three-column desktop grid for the fashion variant", () => {
    render(
      React.createElement(MenuGrid, {
        activeCategorySlug: null,
        categories: [],
        emptyLabel: "Empty",
        locale: "ru",
        productCardVariant: "clothes-fashion",
        products: [baseProduct],
      }),
    );

    const grid = screen.getByTestId("fashion-card").parentElement;

    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("md:grid-cols-3");
  });

  it("keeps the classic variant grid unchanged", () => {
    render(
      React.createElement(MenuGrid, {
        activeCategorySlug: null,
        categories: [],
        emptyLabel: "Empty",
        locale: "ru",
        productCardVariant: "food-classic",
        products: [baseProduct],
      }),
    );

    const grid = screen.getByTestId("classic-card").parentElement;

    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("grid-cols-2");
    expect(grid?.className).toContain(
      "md:grid-cols-[repeat(auto-fit,minmax(280px,280px))]",
    );
  });
});
