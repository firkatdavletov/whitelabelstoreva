import type { Category } from "@/entities/category";
import { getTenantConfig } from "@/entities/tenant";
import {
  mapProductDetailsDtoToProduct,
  type Product,
  type ProductDetailsDto,
} from "@/entities/product";
import { mapRestaurantDtoToRestaurant } from "@/entities/restaurant";
import type { Restaurant } from "@/entities/restaurant/model/restaurant.types";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type {
  CatalogCategoryDto,
  CatalogProductDto,
} from "@/features/menu-catalog/api/catalog.types";
import {
  createMockCatalogCategoriesDto,
  createMockCatalogProductDetailsDto,
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
  includeProductDetails?: boolean;
};

async function getCatalogCategories(tenantSlug: string) {
  if (env.apiMocksEnabled) {
    return createMockCatalogCategoriesDto(tenantSlug);
  }

  return apiRequest<CatalogCategoryDto[]>("/v1/catalog/categories", {
    cache: "no-store",
    query: {
      activeOnly: true,
    },
  });
}

async function getCatalogProducts(tenantSlug: string) {
  if (env.apiMocksEnabled) {
    return createMockCatalogProductsDto(tenantSlug);
  }

  return apiRequest<CatalogProductDto[]>("/v1/catalog/products", {
    cache: "no-store",
  });
}

async function getCatalogProductDetails(product: Product, tenantSlug: string) {
  if (env.apiMocksEnabled) {
    return mapProductDetailsDtoToProduct(
      createMockCatalogProductDetailsDto(tenantSlug, product.id),
      product,
    );
  }

  const dto = await apiRequest<ProductDetailsDto>(
    `/v1/catalog/products/${product.id}`,
    {
      cache: "no-store",
    },
  );

  return mapProductDetailsDtoToProduct(dto, product);
}

// Catalog flow now composes the storefront from /api/v1/catalog collections.
// Restaurant meta is still mock-backed until a dedicated storefront/restaurant endpoint exists.
export async function getMenuCatalog(
  tenantSlug: string,
  options: GetMenuCatalogOptions = {},
): Promise<MenuCatalog> {
  const tenantConfig = getTenantConfig(tenantSlug);
  const [categoryDtos, productDtos] = await Promise.all([
    getCatalogCategories(tenantSlug),
    getCatalogProducts(tenantSlug),
  ]);
  const products = productDtos.map((product) =>
    mapCatalogProductDtoToProduct(product, tenantConfig?.currency ?? "RUB"),
  );
  const enrichedProducts = options.includeProductDetails
    ? await Promise.all(
        products.map(async (product) => {
          try {
            return await getCatalogProductDetails(product, tenantSlug);
          } catch {
            return product;
          }
        }),
      )
    : products;

  return {
    categories: categoryDtos.map(mapCatalogCategoryDtoToCategory),
    products: enrichedProducts,
    restaurant: mapRestaurantDtoToRestaurant(
      createMockCatalogRestaurantDto(tenantSlug),
    ),
  };
}
