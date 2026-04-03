import { describe, expect, it } from "vitest";

import type { ProductModifierGroup } from "@/entities/product";
import { getNextSelectedModifierIds } from "@/features/menu-catalog/lib/product-configurator";

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
