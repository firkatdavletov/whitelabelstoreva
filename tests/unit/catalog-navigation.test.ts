import type { Category } from "@/entities/category";
import type { Product } from "@/entities/product";
import {
  buildMenuCategoryHref,
  getMenuCategoryProducts,
  normalizeMenuCategoryParam,
  resolveMenuCategory,
} from "@/features/menu-catalog/lib/catalog-navigation";

const categories: Category[] = [
  {
    description: "",
    id: "cat-burgers",
    imageUrl: null,
    name: "Burgers",
    slug: "burgers",
  },
  {
    description: "",
    id: "cat-drinks",
    imageUrl: null,
    name: "Drinks",
    slug: "drinks",
  },
];

const products: Product[] = [
  {
    categoryId: "cat-burgers",
    countStep: 1,
    currency: "USD",
    defaultVariantId: null,
    description: "",
    id: "prod-1",
    imageUrl: null,
    isAvailable: true,
    isConfigured: false,
    modifierGroups: [],
    name: "City Smash Burger",
    optionGroups: [],
    price: 14.9,
    slug: "city-smash-burger",
    tags: [],
    unit: "PIECE",
    variants: [],
    visual: "C",
  },
  {
    categoryId: "cat-drinks",
    countStep: 1,
    currency: "USD",
    defaultVariantId: null,
    description: "",
    id: "prod-2",
    imageUrl: null,
    isAvailable: true,
    isConfigured: false,
    modifierGroups: [],
    name: "Yuzu Mint Fizz",
    optionGroups: [],
    price: 5.4,
    slug: "yuzu-mint-fizz",
    tags: [],
    unit: "PIECE",
    variants: [],
    visual: "Y",
  },
];

describe("catalog navigation", () => {
  it("normalizes category params from strings and arrays", () => {
    expect(normalizeMenuCategoryParam(" burgers ")).toBe("burgers");
    expect(normalizeMenuCategoryParam(["drinks", "burgers"])).toBe("drinks");
    expect(normalizeMenuCategoryParam("   ")).toBeNull();
    expect(normalizeMenuCategoryParam(undefined)).toBeNull();
  });

  it("resolves categories by slug or id and falls back to the first category", () => {
    expect(resolveMenuCategory(categories, "drinks")).toEqual(categories[1]);
    expect(resolveMenuCategory(categories, "cat-burgers")).toEqual(
      categories[0],
    );
    expect(resolveMenuCategory(categories, "missing")).toEqual(categories[0]);
    expect(resolveMenuCategory([], "missing")).toBeNull();
  });

  it("filters products by category id", () => {
    expect(getMenuCategoryProducts(products, "cat-drinks")).toEqual([
      products[1],
    ]);
    expect(getMenuCategoryProducts(products, null)).toEqual(products);
  });

  it("builds category deeplinks and preserves other query params", () => {
    expect(buildMenuCategoryHref("/urban-bites/en/menu", "burgers")).toBe(
      "/urban-bites/en/menu?category=burgers",
    );
    expect(
      buildMenuCategoryHref(
        "/storeva-street/ru/menu?tab=popular#menu-content",
        "бургеры",
      ),
    ).toBe(
      "/storeva-street/ru/menu?tab=popular&category=%D0%B1%D1%83%D1%80%D0%B3%D0%B5%D1%80%D1%8B#menu-content",
    );
  });
});
