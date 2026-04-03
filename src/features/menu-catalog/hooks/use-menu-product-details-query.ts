"use client";

import { useQuery } from "@tanstack/react-query";

import type { Product } from "@/entities/product";

import { getMenuProductDetails } from "@/features/menu-catalog/api/get-menu-product-details";

export function getMenuProductDetailsQueryKey(
  tenantSlug: string,
  productId: string,
) {
  return ["menu-product-details", tenantSlug, productId] as const;
}

export function useMenuProductDetailsQuery(
  product: Product,
  tenantSlug: string,
  enabled: boolean,
) {
  return useQuery({
    enabled,
    queryFn: () => getMenuProductDetails(product, tenantSlug),
    queryKey: getMenuProductDetailsQueryKey(tenantSlug, product.id),
  });
}
