import { describe, expect, it } from "vitest";

import { mapProductDtoToProduct } from "@/entities/product";

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
      currency: "USD",
      description: "Double smash patty.",
      id: "prod-1",
      isAvailable: true,
      name: "City Smash",
      price: 14.9,
      slug: "city-smash",
      tags: ["best seller"],
      visual: "C",
    });
  });
});
