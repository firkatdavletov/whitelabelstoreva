import type { Product } from "@/entities/product";
import { getTenantConfig } from "@/entities/tenant";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type {
  CatalogPopularProductDto,
  CatalogPopularProductsQuery,
} from "@/features/menu-catalog/api/catalog.types";
import { PUBLIC_CATALOG_REQUEST_CONTEXT } from "@/features/menu-catalog/api/catalog-public-request";
import { createMockCatalogProductsDto } from "@/features/menu-catalog/api/menu-catalog.mock";
import { mapCatalogProductDtoToProduct } from "@/features/menu-catalog/lib/catalog.mapper";

type GetPopularCatalogProductsOptions = {
  limit?: number;
};

const DEFAULT_MOCK_POPULAR_PRODUCTS_LIMIT = 4;

export async function getPopularCatalogProducts(
  tenantSlug: string,
  options: GetPopularCatalogProductsOptions = {},
): Promise<Product[]> {
  const tenantConfig = getTenantConfig(tenantSlug);
  const { limit } = options;
  const productDtos = env.apiMocksEnabled
    ? createMockCatalogProductsDto(tenantSlug).slice(
        0,
        limit ?? DEFAULT_MOCK_POPULAR_PRODUCTS_LIMIT,
      )
    : await apiRequest<CatalogPopularProductDto[]>(
        "/v1/catalog/products/popular",
        {
          ...PUBLIC_CATALOG_REQUEST_CONTEXT,
          cache: "no-store",
          query: { limit } satisfies CatalogPopularProductsQuery,
        },
      );

  return productDtos.map((product) =>
    mapCatalogProductDtoToProduct(product, tenantConfig?.currency ?? "RUB"),
  );
}
