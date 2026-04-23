import { describe, expect, it } from "vitest";

import { formatCurrency } from "@/shared/lib/currency";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

describe("formatCurrency", () => {
  it("hides the fractional separator for whole amounts by default", () => {
    expect(normalizeWhitespace(formatCurrency(123, "RUB", "ru"))).toBe(
      "123 ₽",
    );
  });

  it("keeps the fractional part for non-whole amounts", () => {
    expect(normalizeWhitespace(formatCurrency(123.5, "RUB", "ru"))).toBe(
      "123,5 ₽",
    );
  });

  it("respects explicit minimum fraction digit overrides", () => {
    expect(
      normalizeWhitespace(
        formatCurrency(123, "RUB", "ru", {
          minimumFractionDigits: 2,
        }),
      ),
    ).toBe("123,00 ₽");
  });
});
