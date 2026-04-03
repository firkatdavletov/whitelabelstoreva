"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type AddStorefrontCartItemInput,
  addStorefrontCartItem,
  changeStorefrontCartItemQuantity,
  clearStorefrontCart,
  removeStorefrontCartItem,
  updateStorefrontCartDelivery,
} from "@/features/cart-summary/api/get-storefront-cart";
import { getStorefrontCartQueryKey } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import type { PutCartDeliveryRequestDto } from "@/entities/cart/api/cart.dto";

export function useAddStorefrontCartItemMutation(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddStorefrontCartItemInput) =>
      addStorefrontCartItem(input, tenantSlug),
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

export function useUpdateStorefrontCartDeliveryMutation(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PutCartDeliveryRequestDto) =>
      updateStorefrontCartDelivery(input, tenantSlug),
    onSuccess: (cart) => {
      queryClient.setQueryData(getStorefrontCartQueryKey(tenantSlug), cart);
    },
  });
}
