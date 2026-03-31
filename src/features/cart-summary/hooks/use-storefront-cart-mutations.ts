"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Product } from "@/entities/product";
import {
  addStorefrontCartItem,
  changeStorefrontCartItemQuantity,
  clearStorefrontCart,
  removeStorefrontCartItem,
} from "@/features/cart-summary/api/get-storefront-cart";
import { getStorefrontCartQueryKey } from "@/features/cart-summary/hooks/use-storefront-cart-query";

export function useAddStorefrontCartItemMutation(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Product) =>
      addStorefrontCartItem(
        {
          productId: product.id,
          title: product.name,
          unitPrice: product.price,
        },
        tenantSlug,
      ),
    onSuccess: (cart) => {
      queryClient.setQueryData(getStorefrontCartQueryKey(tenantSlug), cart);
    },
  });
}

export function useChangeStorefrontCartItemQuantityMutation(
  tenantSlug: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      changeStorefrontCartItemQuantity(
        {
          itemId,
          quantity,
        },
        tenantSlug,
      ),
    onSuccess: (cart) => {
      queryClient.setQueryData(getStorefrontCartQueryKey(tenantSlug), cart);
    },
  });
}

export function useRemoveStorefrontCartItemMutation(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      removeStorefrontCartItem(itemId, tenantSlug),
    onSuccess: (cart) => {
      queryClient.setQueryData(getStorefrontCartQueryKey(tenantSlug), cart);
    },
  });
}

export function useClearStorefrontCartMutation(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearStorefrontCart(tenantSlug),
    onSuccess: (cart) => {
      queryClient.setQueryData(getStorefrontCartQueryKey(tenantSlug), cart);
    },
  });
}
