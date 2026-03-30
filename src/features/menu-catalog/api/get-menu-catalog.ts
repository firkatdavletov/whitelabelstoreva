import { mapCategoryDtoToCategory } from "@/entities/category";
import { mapProductDtoToProduct } from "@/entities/product";
import { mapRestaurantDtoToRestaurant } from "@/entities/restaurant";
import { apiRequest } from "@/shared/api";
import { buildServerRequestContext } from "@/shared/api/server-auth";
import { env } from "@/shared/config/env";

import { createMockMenuCatalogDto } from "@/features/menu-catalog/api/menu-catalog.mock";
import type { MenuCatalogDto } from "@/features/menu-catalog/api/menu-catalog.types";

export type MenuCatalog = {
  categories: ReturnType<typeof mapCategoryDtoToCategory>[];
  products: ReturnType<typeof mapProductDtoToProduct>[];
  restaurant: ReturnType<typeof mapRestaurantDtoToRestaurant>;
};

function mapMenuCatalogDto(dto: MenuCatalogDto): MenuCatalog {
  return {
    categories: dto.categories.map(mapCategoryDtoToCategory),
    products: dto.products.map(mapProductDtoToProduct),
    restaurant: mapRestaurantDtoToRestaurant(dto.restaurant),
  };
}

// The feature owns this use case because it combines multiple entity DTOs into one storefront-ready view model.
export async function getMenuCatalog(tenantSlug: string) {
  if (env.apiMocksEnabled) {
    return mapMenuCatalogDto(createMockMenuCatalogDto(tenantSlug));
  }

  const authContext = await buildServerRequestContext();

  const dto = await apiRequest<MenuCatalogDto>(`/storefront/tenants/${tenantSlug}/menu`, {
    cache: "no-store",
    headers: {
      "x-tenant-id": tenantSlug,
    },
    ...authContext,
  });

  return mapMenuCatalogDto(dto);
}
