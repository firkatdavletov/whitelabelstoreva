import { describe, expect, it } from "vitest";

import {
  resolveDeliveryQuoteAvailability,
  resolveDeliveryQuoteUnavailableMessage,
} from "@/features/delivery-address/lib/delivery-quote.utils";

describe("delivery quote utils", () => {
  it("returns quote availability from available", () => {
    expect(
      resolveDeliveryQuoteAvailability({
        available: false,
        message: "Доставка вне зоны",
      }),
    ).toBe(false);
  });

  it("returns null when quote availability is missing", () => {
    expect(
      resolveDeliveryQuoteAvailability({
        message: "Нет данных",
      }),
    ).toBeNull();
  });

  it("returns a trimmed unavailable message", () => {
    expect(
      resolveDeliveryQuoteUnavailableMessage({
        message: "  Доставка вне зоны  ",
      }),
    ).toBe("Доставка вне зоны");

    expect(
      resolveDeliveryQuoteUnavailableMessage({
        message: "   ",
      }),
    ).toBeNull();
  });
});
