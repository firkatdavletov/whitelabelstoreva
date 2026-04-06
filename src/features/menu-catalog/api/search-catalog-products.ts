import type { Product } from "@/entities/product";
import { getTenantConfig } from "@/entities/tenant";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type { CatalogProductDto } from "@/features/menu-catalog/api/catalog.types";
import { createMockCatalogProductsDto } from "@/features/menu-catalog/api/menu-catalog.mock";
import { mapCatalogProductDtoToProduct } from "@/features/menu-catalog/lib/catalog.mapper";

export function normalizeCatalogSearchQuery(
  query: string | string[] | null | undefined,
) {
  const candidate = Array.isArray(query) ? query[0] : query;
  const normalized = candidate?.trim();

  return normalized ? normalized : null;
}

function filterMockCatalogProducts(
  products: CatalogProductDto[],
  query: string,
) {
  const normalizedQuery = query.toLocaleLowerCase();

  return products.filter((product) =>
    product.title.toLocaleLowerCase().includes(normalizedQuery),
  );
}

export async function searchCatalogProducts(
  tenantSlug: string,
  query: string,
): Promise<Product[]> {
  const normalizedQuery = normalizeCatalogSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const tenantConfig = getTenantConfig(tenantSlug);
  const productDtos = env.apiMocksEnabled
    ? filterMockCatalogProducts(
        createMockCatalogProductsDto(tenantSlug),
        normalizedQuery,
      )
    : await apiRequest<CatalogProductDto[]>("/v1/catalog/products", {
        cache: "no-store",
        query: {
          query: normalizedQuery,
        },
      });

  return productDtos.map((productDto) =>
    mapCatalogProductDtoToProduct(productDto, tenantConfig?.currency ?? "RUB"),
  );
}
