import type { Category } from "@/entities/category";
import { getTenantConfig } from "@/entities/tenant";
import type { Product } from "@/entities/product";
import { mapRestaurantDtoToRestaurant } from "@/entities/restaurant";
import type { Restaurant } from "@/entities/restaurant/model/restaurant.types";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type {
  CatalogCategoriesQuery,
  CatalogCategoryDto,
  CatalogProductDto,
} from "@/features/menu-catalog/api/catalog.types";
import { PUBLIC_CATALOG_REQUEST_CONTEXT } from "@/features/menu-catalog/api/catalog-public-request";
import {
  createMockCatalogCategoriesDto,
  createMockCatalogProductsDto,
  createMockCatalogRestaurantDto,
} from "@/features/menu-catalog/api/menu-catalog.mock";
import {
  mapCatalogCategoryDtoToCategory,
  mapCatalogProductDtoToProduct,
} from "@/features/menu-catalog/lib/catalog.mapper";

export type MenuCatalog = {
  categories: Category[];
  products: Product[];
  restaurant: Restaurant;
};

type GetMenuCatalogOptions = {
  categoryLimit?: number;
};

async function getCatalogCategories(
  tenantSlug: string,
  options: GetMenuCatalogOptions = {},
) {
  const { categoryLimit } = options;

  if (env.apiMocksEnabled) {
    const categories = createMockCatalogCategoriesDto(tenantSlug);

    return categoryLimit === undefined
      ? categories
      : categories.slice(0, categoryLimit);
  }

  const query: CatalogCategoriesQuery = {
    activeOnly: true,
    limit: categoryLimit,
  };

  return apiRequest<CatalogCategoryDto[]>("/v1/catalog/categories", {
    ...PUBLIC_CATALOG_REQUEST_CONTEXT,
    cache: "no-store",
    query,
  });
}

async function getCatalogProducts(tenantSlug: string) {
  if (env.apiMocksEnabled) {
    return createMockCatalogProductsDto(tenantSlug);
  }

  return apiRequest<CatalogProductDto[]>("/v1/catalog/products", {
    ...PUBLIC_CATALOG_REQUEST_CONTEXT,
    cache: "no-store",
  });
}

// Catalog flow now composes the storefront from /api/v1/catalog collections.
// Restaurant meta is still mock-backed until a dedicated storefront/restaurant endpoint exists.
export async function getMenuCatalog(
  tenantSlug: string,
  options: GetMenuCatalogOptions = {},
): Promise<MenuCatalog> {
  const tenantConfig = getTenantConfig(tenantSlug);
  const [categoryDtos, productDtos] = await Promise.all([
    getCatalogCategories(tenantSlug, options),
    getCatalogProducts(tenantSlug),
  ]);

  return {
    categories: categoryDtos.map(mapCatalogCategoryDtoToCategory),
    products: productDtos.map((product) =>
      mapCatalogProductDtoToProduct(product, tenantConfig?.currency ?? "RUB"),
    ),
    restaurant: mapRestaurantDtoToRestaurant(
      createMockCatalogRestaurantDto(tenantSlug),
    ),
  };
}
