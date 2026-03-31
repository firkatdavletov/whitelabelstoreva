"use client";

import { useQuery } from "@tanstack/react-query";

import { getStorefrontCart } from "@/features/cart-summary/api/get-storefront-cart";

export function getStorefrontCartQueryKey(tenantSlug: string) {
  return ["storefront-cart", tenantSlug] as const;
}

export function useStorefrontCartQuery(tenantSlug: string) {
  return useQuery({
    queryFn: () => getStorefrontCart(tenantSlug),
    queryKey: getStorefrontCartQueryKey(tenantSlug),
  });
}
