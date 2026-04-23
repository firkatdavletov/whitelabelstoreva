import { describe, expect, it } from "vitest";

import { getProductThumbnailImageSrc } from "@/entities/product/lib/product-card";

describe("getProductThumbnailImageSrc", () => {
  it("rewrites card webp urls to thumb webp urls", () => {
    expect(
      getProductThumbnailImageSrc(
        "https://cdn.example.com/products/poke_card.webp",
      ),
    ).toBe("https://cdn.example.com/products/poke_thumb.webp");
  });

  it("preserves query params while rewriting the image suffix", () => {
    expect(
      getProductThumbnailImageSrc(
        "https://cdn.example.com/products/poke_card.webp?v=42",
      ),
    ).toBe("https://cdn.example.com/products/poke_thumb.webp?v=42");
  });

  it("keeps non-card urls unchanged", () => {
    expect(
      getProductThumbnailImageSrc("https://cdn.example.com/products/poke.jpg"),
    ).toBe("https://cdn.example.com/products/poke.jpg");
  });
});
