import { describe, expect, it } from "vitest";

import type { Product, ProductModifierGroup } from "@/entities/product";
import {
  createInitialOptionSelection,
  getNextSelectedModifierIds,
  resolveVariantForSelectedOptions,
} from "@/features/menu-catalog/lib/product-configurator";

function createModifierGroup(
  overrides?: Partial<ProductModifierGroup>,
): ProductModifierGroup {
  return {
    id: "group-1",
    isRequired: false,
    maxSelected: 2,
    minSelected: 0,
    name: "Extras",
    options: [
      {
        description: "",
        id: "option-1",
        isActive: true,
        isDefault: false,
        name: "Option 1",
        price: 1,
        priceType: "FIXED",
      },
      {
        description: "",
        id: "option-2",
        isActive: true,
        isDefault: false,
        name: "Option 2",
        price: 1,
        priceType: "FIXED",
      },
      {
        description: "",
        id: "option-3",
        isActive: true,
        isDefault: false,
        name: "Option 3",
        price: 1,
        priceType: "FIXED",
      },
    ],
    ...overrides,
  };
}

function createConfiguredProduct(overrides?: Partial<Product>): Product {
  return {
    categoryId: "cat-1",
    countStep: 1,
    currency: "RUB",
    defaultVariantId: "variant-default",
    description: "Configured product",
    id: "prod-1",
    imageUrl: "https://example.com/product.jpg",
    isAvailable: true,
    isConfigured: true,
    modifierGroups: [],
    name: "Configured burger",
    optionGroups: [
      {
        id: "group-size",
        title: "Размер",
        values: [
          {
            id: "value-small",
            title: "Small",
          },
          {
            id: "value-large",
            title: "Large",
          },
        ],
      },
      {
        id: "group-bread",
        title: "Булка",
        values: [
          {
            id: "value-brioche",
            title: "Бриошь",
          },
          {
            id: "value-potato",
            title: "Картофельная",
          },
        ],
      },
    ],
    price: 12.9,
    slug: "configured-burger",
    tags: [],
    unit: "PIECE",
    variants: [
      {
        id: "variant-default",
        imageUrl: null,
        isActive: true,
        optionValueIds: ["value-small", "value-brioche"],
        price: 12.9,
        title: "Small / Бриошь",
      },
      {
        id: "variant-large",
        imageUrl: null,
        isActive: true,
        optionValueIds: ["value-large", "value-brioche"],
        price: 14.9,
        title: "Large / Бриошь",
      },
    ],
    visual: "C",
    ...overrides,
  };
}

describe("getNextSelectedModifierIds", () => {
  it("replaces the earliest selected option when a multi-select group exceeds its limit", () => {
    const group = createModifierGroup();

    expect(
      getNextSelectedModifierIds(group, ["option-1", "option-2"], "option-3"),
    ).toEqual(["option-2", "option-3"]);
  });

  it("keeps required selections from being deselected below the minimum", () => {
    const group = createModifierGroup({
      isRequired: true,
      maxSelected: 3,
      minSelected: 1,
    });

    expect(getNextSelectedModifierIds(group, ["option-1"], "option-1")).toEqual(
      ["option-1"],
    );
  });
});

describe("product option selection", () => {
  it("initializes option values from the default variant", () => {
    const product = createConfiguredProduct();

    expect(createInitialOptionSelection(product)).toEqual({
      "group-bread": "value-brioche",
      "group-size": "value-small",
    });
  });

  it("resolves the active variant from the selected option combination", () => {
    const product = createConfiguredProduct();

    const variant = resolveVariantForSelectedOptions(product, {
      "group-bread": "value-brioche",
      "group-size": "value-large",
    });

    expect(variant?.id).toBe("variant-large");
  });

  it("returns null when the selected option combination has no variant", () => {
    const product = createConfiguredProduct();

    const variant = resolveVariantForSelectedOptions(product, {
      "group-bread": "value-potato",
      "group-size": "value-large",
    });

    expect(variant).toBeNull();
  });
});
