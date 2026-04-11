import { describe, expect, it } from "vitest";

import {
  mapProductDetailsDtoToProduct,
  mapProductDtoToProduct,
} from "@/entities/product";

describe("mapProductDtoToProduct", () => {
  it("maps backend minor units into a storefront-friendly domain model", () => {
    const product = mapProductDtoToProduct({
      category_id: "cat-burgers",
      currency: "USD",
      description: "Double smash patty.",
      id: "prod-1",
      is_available: true,
      name: "City Smash",
      price_minor: 1490,
      slug: "city-smash",
      tags: ["best seller"],
      visual_hint: "C",
    });

    expect(product).toEqual({
      categoryId: "cat-burgers",
      countStep: 1,
      currency: "USD",
      defaultVariantId: null,
      description: "Double smash patty.",
      id: "prod-1",
      imageUrl: null,
      imageUrls: [],
      isAvailable: true,
      isConfigured: false,
      modifierGroups: [],
      name: "City Smash",
      optionGroups: [],
      price: 14.9,
      slug: "city-smash",
      tags: ["best seller"],
      unit: "PIECE",
      variants: [],
      visual: "C",
    });
  });

  it("hydrates catalog products with detailed variants and modifiers", () => {
    const detailedProduct = mapProductDetailsDtoToProduct(
      {
        categoryId: "cat-burgers",
        countStep: 1,
        defaultVariantId: "variant-double",
        description: "Choose size and extras.",
        id: "prod-1",
        imageUrls: ["https://cdn.example.com/city-smash.jpg"],
        isActive: true,
        isConfigured: true,
        modifierGroups: [
          {
            code: "extras",
            id: "group-extras",
            isActive: true,
            isRequired: false,
            maxSelected: 2,
            minSelected: 0,
            name: "Extras",
            options: [
              {
                applicationScope: "PER_ITEM",
                code: "cheese",
                description: "Cheddar slice",
                id: "option-cheese",
                isActive: true,
                isDefault: false,
                name: "Extra cheese",
                price: 150,
                priceType: "FIXED",
                sortOrder: 1,
              },
            ],
            sortOrder: 1,
          },
        ],
        oldPriceMinor: null,
        optionGroups: [
          {
            code: "size",
            id: "group-size",
            sortOrder: 1,
            title: "Size",
            values: [
              {
                code: "double",
                id: "value-double",
                sortOrder: 1,
                title: "Double",
              },
            ],
          },
        ],
        priceMinor: 1490,
        sku: null,
        slug: "city-smash",
        title: "City Smash",
        unit: "PIECE",
        variants: [
          {
            externalId: null,
            id: "variant-double",
            imageUrls: ["https://cdn.example.com/city-smash-double.jpg"],
            isActive: true,
            oldPriceMinor: null,
            optionValueIds: ["value-double"],
            priceMinor: 1490,
            sku: "city-smash-double",
            sortOrder: 1,
            title: "Double",
          },
        ],
      },
      {
        categoryId: "cat-burgers",
        countStep: 1,
        currency: "USD",
        defaultVariantId: null,
        description: "Double smash patty.",
        id: "prod-1",
        imageUrl: null,
        imageUrls: [],
        isAvailable: true,
        isConfigured: false,
        modifierGroups: [],
        name: "City Smash",
        optionGroups: [],
        price: 14.9,
        slug: "city-smash",
        tags: ["best seller"],
        unit: "PIECE",
        variants: [],
        visual: "C",
      },
    );

    expect(detailedProduct).toEqual({
      categoryId: "cat-burgers",
      countStep: 1,
      currency: "USD",
      defaultVariantId: "variant-double",
      description: "Choose size and extras.",
      id: "prod-1",
      imageUrl: "https://cdn.example.com/city-smash.jpg",
      imageUrls: ["https://cdn.example.com/city-smash.jpg"],
      isAvailable: true,
      isConfigured: true,
      modifierGroups: [
        {
          id: "group-extras",
          isRequired: false,
          maxSelected: 2,
          minSelected: 0,
          name: "Extras",
          options: [
            {
              description: "Cheddar slice",
              id: "option-cheese",
              isActive: true,
              isDefault: false,
              name: "Extra cheese",
              price: 1.5,
              priceType: "FIXED",
            },
          ],
        },
      ],
      name: "City Smash",
      optionGroups: [
        {
          id: "group-size",
          title: "Size",
          values: [
            {
              id: "value-double",
              title: "Double",
            },
          ],
        },
      ],
      price: 14.9,
      slug: "city-smash",
      tags: ["best seller"],
      unit: "PIECE",
      variants: [
        {
          id: "variant-double",
          imageUrl: "https://cdn.example.com/city-smash-double.jpg",
          imageUrls: ["https://cdn.example.com/city-smash-double.jpg"],
          isActive: true,
          optionValueIds: ["value-double"],
          price: 14.9,
          title: "Double",
        },
      ],
      visual: "C",
    });
  });
});
