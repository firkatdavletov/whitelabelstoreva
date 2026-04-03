import type { ProductDetailsDto } from "@/entities/product";
import type { RestaurantDto } from "@/entities/restaurant";

import type {
  CatalogCategoryDto,
  CatalogProductDto,
} from "@/features/menu-catalog/api/catalog.types";
import type { MenuCatalogDto } from "@/features/menu-catalog/api/menu-catalog.types";

const menuCatalogMocks: Record<string, MenuCatalogDto> = {
  "cedar-canteen": {
    categories: [
      {
        description: "Clean bowls with grains, greens, and crisp toppings.",
        id: "cat-bowls",
        name: "Bowls",
        slug: "bowls",
      },
      {
        description: "Comfort classics for colder city evenings.",
        id: "cat-comfort",
        name: "Comfort",
        slug: "comfort",
      },
      {
        description: "Low-intervention desserts and soft bakes.",
        id: "cat-bakery",
        name: "Bakery",
        slug: "bakery",
      },
    ],
    products: [
      {
        category_id: "cat-bowls",
        currency: "EUR",
        description: "Roasted salmon, barley, cucumber ribbons, dill yogurt.",
        id: "prod-nordic-salmon",
        is_available: true,
        name: "Nordic Salmon Bowl",
        price_minor: 1590,
        slug: "nordic-salmon-bowl",
        tags: ["signature", "fresh"],
        visual_hint: "S",
      },
      {
        category_id: "cat-bowls",
        currency: "EUR",
        description: "Crispy halloumi, beet hummus, lentils, herbs.",
        id: "prod-halloumi-lentil",
        is_available: true,
        name: "Halloumi Lentil Bowl",
        price_minor: 1390,
        slug: "halloumi-lentil-bowl",
        tags: ["vegetarian", "protein"],
        visual_hint: "H",
      },
      {
        category_id: "cat-comfort",
        currency: "EUR",
        description: "Braised beef, mashed potatoes, pickled onion.",
        id: "prod-beef-plate",
        is_available: true,
        name: "Braised Beef Plate",
        price_minor: 1740,
        slug: "braised-beef-plate",
        tags: ["comfort", "slow-cooked"],
        visual_hint: "B",
      },
      {
        category_id: "cat-bakery",
        currency: "EUR",
        description: "Cardamom bun with vanilla glaze.",
        id: "prod-cardamom-bun",
        is_available: false,
        name: "Cardamom Bun",
        price_minor: 590,
        slug: "cardamom-bun",
        tags: ["bakery", "sweet"],
        visual_hint: "C",
      },
    ],
    restaurant: {
      city: "Helsinki",
      currency: "EUR",
      delivery_eta_minutes: 28,
      id: "rest-cedar-canteen",
      kitchen_note: "Fresh bowls in under 30 minutes.",
      min_order_amount_minor: 1800,
      name: "Cedar Canteen Kitchen",
      tenant_slug: "cedar-canteen",
    },
  },
  "urban-bites": {
    categories: [
      {
        description: "Fast comfort food with bold flavor and easy sharing.",
        id: "cat-burgers",
        name: "Burgers",
        slug: "burgers",
      },
      {
        description: "Street-style sides and loaded comfort bowls.",
        id: "cat-sides",
        name: "Sides",
        slug: "sides",
      },
      {
        description: "Refreshing drinks for dense lunch rushes.",
        id: "cat-drinks",
        name: "Drinks",
        slug: "drinks",
      },
    ],
    products: [
      {
        category_id: "cat-burgers",
        currency: "USD",
        description: "Double smashed patties, cheddar, pickles, city sauce.",
        id: "prod-city-smash",
        is_available: true,
        name: "City Smash Burger",
        price_minor: 1490,
        slug: "city-smash-burger",
        tags: ["best seller", "fast"],
        visual_hint: "C",
      },
      {
        category_id: "cat-burgers",
        currency: "USD",
        description: "Hot honey chicken, slaw, butter bun.",
        id: "prod-hot-honey",
        is_available: true,
        name: "Hot Honey Chicken",
        price_minor: 1360,
        slug: "hot-honey-chicken",
        tags: ["spicy", "signature"],
        visual_hint: "H",
      },
      {
        category_id: "cat-sides",
        currency: "USD",
        description: "Crispy fries, smoked aioli, citrus salt.",
        id: "prod-loaded-fries",
        is_available: true,
        name: "Loaded Citrus Fries",
        price_minor: 690,
        slug: "loaded-citrus-fries",
        tags: ["shareable", "crispy"],
        visual_hint: "F",
      },
      {
        category_id: "cat-drinks",
        currency: "USD",
        description: "Sparkling yuzu lemonade with mint.",
        id: "prod-yuzu-fizz",
        is_available: true,
        name: "Yuzu Mint Fizz",
        price_minor: 540,
        slug: "yuzu-mint-fizz",
        tags: ["drink", "refreshing"],
        visual_hint: "Y",
      },
    ],
    restaurant: {
      city: "Brooklyn",
      currency: "USD",
      delivery_eta_minutes: 22,
      id: "rest-urban-bites",
      kitchen_note: "Takeout tuned for busy lunch peaks.",
      min_order_amount_minor: 1500,
      name: "Urban Bites Kitchen",
      tenant_slug: "urban-bites",
    },
  },
  "storeva-street": {
    categories: [
      {
        description: "Вкусные бургеры",
        id: "cat-burgers",
        name: "Бургеры",
        slug: "бургеры",
      },
      {
        description: "Street-style sides and loaded comfort bowls.",
        id: "cat-sides",
        name: "Sides",
        slug: "sides",
      },
      {
        description: "Refreshing drinks for dense lunch rushes.",
        id: "cat-drinks",
        name: "Drinks",
        slug: "drinks",
      },
    ],
    products: [
      {
        category_id: "cat-burgers",
        currency: "RUB",
        description: "Double smashed patties, cheddar, pickles, city sauce.",
        id: "prod-city-smash",
        is_available: true,
        name: "City Smash Burger",
        price_minor: 1490,
        slug: "city-smash-burger",
        tags: ["best seller", "fast"],
        visual_hint: "C",
      },
      {
        category_id: "cat-burgers",
        currency: "RUB",
        description: "Hot honey chicken, slaw, butter bun.",
        id: "prod-hot-honey",
        is_available: true,
        name: "Hot Honey Chicken",
        price_minor: 1360,
        slug: "hot-honey-chicken",
        tags: ["spicy", "signature"],
        visual_hint: "H",
      },
      {
        category_id: "cat-sides",
        currency: "RUB",
        description: "Crispy fries, smoked aioli, citrus salt.",
        id: "prod-loaded-fries",
        is_available: true,
        name: "Loaded Citrus Fries",
        price_minor: 690,
        slug: "loaded-citrus-fries",
        tags: ["shareable", "crispy"],
        visual_hint: "F",
      },
      {
        category_id: "cat-drinks",
        currency: "RUB",
        description: "Sparkling yuzu lemonade with mint.",
        id: "prod-yuzu-fizz",
        is_available: true,
        name: "Yuzu Mint Fizz",
        price_minor: 540,
        slug: "yuzu-mint-fizz",
        tags: ["drink", "refreshing"],
        visual_hint: "Y",
      },
    ],
    restaurant: {
      city: "Екатеринбург",
      currency: "RUB",
      delivery_eta_minutes: 25,
      id: "rest-storeva-street",
      kitchen_note: "Быстрая и удобная доставка.",
      min_order_amount_minor: 1500,
      name: "Storeva",
      tenant_slug: "storeva-street",
    },
  },
};

export function createMockMenuCatalogDto(tenantSlug: string): MenuCatalogDto {
  return menuCatalogMocks[tenantSlug] ?? menuCatalogMocks["urban-bites"];
}

export function createMockCatalogCategoriesDto(
  tenantSlug: string,
): CatalogCategoryDto[] {
  return createMockMenuCatalogDto(tenantSlug).categories.map((category) => ({
    id: category.id,
    imageUrls: [],
    isActive: true,
    name: category.name,
    slug: category.slug,
  }));
}

function isMockProductConfigured(tenantSlug: string, productId: string) {
  return (
    tenantSlug === "storeva-street" &&
    ["prod-city-smash", "prod-hot-honey", "prod-loaded-fries"].includes(
      productId,
    )
  );
}

export function createMockCatalogProductsDto(
  tenantSlug: string,
): CatalogProductDto[] {
  return createMockMenuCatalogDto(tenantSlug).products.map((product) => ({
    brand: product.tags[0] ?? null,
    categoryId: product.category_id,
    countStep: 1,
    description: product.description,
    id: product.id,
    imageUrls: [],
    isActive: product.is_available,
    isConfigured: isMockProductConfigured(tenantSlug, product.id),
    oldPriceMinor: null,
    priceMinor: product.price_minor,
    sku: null,
    slug: product.slug,
    title: product.name,
    unit: "PIECE",
  }));
}

function createBaseMockProductDetailsDto(
  tenantSlug: string,
  productId: string,
): ProductDetailsDto {
  const product = createMockMenuCatalogDto(tenantSlug).products.find(
    (candidate) => candidate.id === productId,
  );

  if (!product) {
    throw new Error(
      `Mock product details not found for ${tenantSlug}:${productId}`,
    );
  }

  return {
    categoryId: product.category_id,
    countStep: 1,
    defaultVariantId: null,
    description: product.description,
    id: product.id,
    imageUrls: [],
    isActive: product.is_available,
    isConfigured: isMockProductConfigured(tenantSlug, product.id),
    modifierGroups: [],
    oldPriceMinor: null,
    optionGroups: [],
    priceMinor: product.price_minor,
    sku: null,
    slug: product.slug,
    title: product.name,
    unit: "PIECE",
    variants: [],
  };
}

export function createMockCatalogProductDetailsDto(
  tenantSlug: string,
  productId: string,
): ProductDetailsDto {
  const baseProduct = createBaseMockProductDetailsDto(tenantSlug, productId);

  if (tenantSlug === "storeva-street" && productId === "prod-city-smash") {
    return {
      ...baseProduct,
      defaultVariantId: "variant-city-smash-double",
      modifierGroups: [
        {
          code: "sauces",
          id: "group-city-smash-sauces",
          isActive: true,
          isRequired: false,
          maxSelected: 1,
          minSelected: 0,
          name: "Соус",
          options: [
            {
              applicationScope: "PER_ITEM",
              code: "signature",
              description: "Фирменный соус Storeva",
              id: "option-city-smash-signature",
              isActive: true,
              isDefault: true,
              name: "Фирменный",
              price: 0,
              priceType: "FREE",
              sortOrder: 1,
            },
            {
              applicationScope: "PER_ITEM",
              code: "bbq",
              description: "Классический дымный BBQ",
              id: "option-city-smash-bbq",
              isActive: true,
              isDefault: false,
              name: "BBQ",
              price: 49,
              priceType: "FIXED",
              sortOrder: 2,
            },
            {
              applicationScope: "PER_ITEM",
              code: "mustard",
              description: "Сладкая медовая горчица",
              id: "option-city-smash-mustard",
              isActive: true,
              isDefault: false,
              name: "Медовая горчица",
              price: 39,
              priceType: "FIXED",
              sortOrder: 3,
            },
          ],
          sortOrder: 1,
        },
        {
          code: "extras",
          id: "group-city-smash-extras",
          isActive: true,
          isRequired: false,
          maxSelected: 3,
          minSelected: 0,
          name: "Добавки",
          options: [
            {
              applicationScope: "PER_ITEM",
              code: "cheese",
              description: "Плавленый чеддер",
              id: "option-city-smash-cheese",
              isActive: true,
              isDefault: false,
              name: "Доп. сыр",
              price: 59,
              priceType: "FIXED",
              sortOrder: 1,
            },
            {
              applicationScope: "PER_ITEM",
              code: "bacon",
              description: "Хрустящий бекон",
              id: "option-city-smash-bacon",
              isActive: true,
              isDefault: false,
              name: "Бекон",
              price: 89,
              priceType: "FIXED",
              sortOrder: 2,
            },
            {
              applicationScope: "PER_ITEM",
              code: "jalapeno",
              description: "Маринованный халапеньо",
              id: "option-city-smash-jalapeno",
              isActive: true,
              isDefault: false,
              name: "Халапеньо",
              price: 39,
              priceType: "FIXED",
              sortOrder: 3,
            },
          ],
          sortOrder: 2,
        },
      ],
      optionGroups: [
        {
          code: "size",
          id: "group-city-smash-size",
          sortOrder: 1,
          title: "Размер",
          values: [
            {
              code: "single",
              id: "value-city-smash-single",
              sortOrder: 1,
              title: "Single",
            },
            {
              code: "double",
              id: "value-city-smash-double",
              sortOrder: 2,
              title: "Double",
            },
            {
              code: "triple",
              id: "value-city-smash-triple",
              sortOrder: 3,
              title: "Triple",
            },
          ],
        },
      ],
      variants: [
        {
          externalId: null,
          id: "variant-city-smash-single",
          imageUrls: [],
          isActive: true,
          oldPriceMinor: null,
          optionValueIds: ["value-city-smash-single"],
          priceMinor: 1290,
          sku: "city-smash-single",
          sortOrder: 1,
          title: "Single",
        },
        {
          externalId: null,
          id: "variant-city-smash-double",
          imageUrls: [],
          isActive: true,
          oldPriceMinor: null,
          optionValueIds: ["value-city-smash-double"],
          priceMinor: 1490,
          sku: "city-smash-double",
          sortOrder: 2,
          title: "Double",
        },
        {
          externalId: null,
          id: "variant-city-smash-triple",
          imageUrls: [],
          isActive: true,
          oldPriceMinor: null,
          optionValueIds: ["value-city-smash-triple"],
          priceMinor: 1790,
          sku: "city-smash-triple",
          sortOrder: 3,
          title: "Triple",
        },
      ],
    };
  }

  if (tenantSlug === "storeva-street" && productId === "prod-hot-honey") {
    return {
      ...baseProduct,
      defaultVariantId: "variant-hot-honey-classic",
      modifierGroups: [
        {
          code: "spice",
          id: "group-hot-honey-spice",
          isActive: true,
          isRequired: true,
          maxSelected: 1,
          minSelected: 1,
          name: "Острота",
          options: [
            {
              applicationScope: "PER_ITEM",
              code: "mild",
              description: "Мягкий уровень без лишней остроты",
              id: "option-hot-honey-mild",
              isActive: true,
              isDefault: true,
              name: "Мягкая",
              price: 0,
              priceType: "FREE",
              sortOrder: 1,
            },
            {
              applicationScope: "PER_ITEM",
              code: "medium",
              description: "Баланс сладости и остроты",
              id: "option-hot-honey-medium",
              isActive: true,
              isDefault: false,
              name: "Средняя",
              price: 0,
              priceType: "FREE",
              sortOrder: 2,
            },
            {
              applicationScope: "PER_ITEM",
              code: "hot",
              description: "Яркий акцент чили",
              id: "option-hot-honey-hot",
              isActive: true,
              isDefault: false,
              name: "Острая",
              price: 0,
              priceType: "FREE",
              sortOrder: 3,
            },
          ],
          sortOrder: 1,
        },
      ],
      optionGroups: [
        {
          code: "combo",
          id: "group-hot-honey-combo",
          sortOrder: 1,
          title: "Формат",
          values: [
            {
              code: "classic",
              id: "value-hot-honey-classic",
              sortOrder: 1,
              title: "Бургер",
            },
            {
              code: "combo",
              id: "value-hot-honey-combo",
              sortOrder: 2,
              title: "Комбо",
            },
          ],
        },
      ],
      variants: [
        {
          externalId: null,
          id: "variant-hot-honey-classic",
          imageUrls: [],
          isActive: true,
          oldPriceMinor: null,
          optionValueIds: ["value-hot-honey-classic"],
          priceMinor: 1360,
          sku: "hot-honey-classic",
          sortOrder: 1,
          title: "Бургер",
        },
        {
          externalId: null,
          id: "variant-hot-honey-combo",
          imageUrls: [],
          isActive: true,
          oldPriceMinor: null,
          optionValueIds: ["value-hot-honey-combo"],
          priceMinor: 1690,
          sku: "hot-honey-combo",
          sortOrder: 2,
          title: "Комбо + картофель",
        },
      ],
    };
  }

  if (tenantSlug === "storeva-street" && productId === "prod-loaded-fries") {
    return {
      ...baseProduct,
      modifierGroups: [
        {
          code: "toppings",
          id: "group-loaded-fries-toppings",
          isActive: true,
          isRequired: false,
          maxSelected: 2,
          minSelected: 0,
          name: "Топпинги",
          options: [
            {
              applicationScope: "PER_ITEM",
              code: "parmesan",
              description: "Тёртый пармезан",
              id: "option-loaded-fries-parmesan",
              isActive: true,
              isDefault: false,
              name: "Пармезан",
              price: 49,
              priceType: "FIXED",
              sortOrder: 1,
            },
            {
              applicationScope: "PER_ITEM",
              code: "truffle",
              description: "Трюфельный соус",
              id: "option-loaded-fries-truffle",
              isActive: true,
              isDefault: false,
              name: "Трюфельный соус",
              price: 69,
              priceType: "FIXED",
              sortOrder: 2,
            },
          ],
          sortOrder: 1,
        },
      ],
    };
  }

  return baseProduct;
}

export function createMockCatalogRestaurantDto(
  tenantSlug: string,
): RestaurantDto {
  return createMockMenuCatalogDto(tenantSlug).restaurant;
}
