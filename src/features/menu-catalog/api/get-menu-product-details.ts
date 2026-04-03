import {
  mapProductDetailsDtoToProduct,
  type Product,
  type ProductDetailsDto,
} from "@/entities/product";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import { createMockCatalogProductDetailsDto } from "@/features/menu-catalog/api/menu-catalog.mock";

export async function getMenuProductDetails(
  product: Product,
  tenantSlug: string,
): Promise<Product> {
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
