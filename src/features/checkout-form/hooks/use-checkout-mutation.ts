"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { StorefrontCart } from "@/entities/cart";
import { checkoutCurrentCart } from "@/features/checkout-form/api/checkout.api";
import type { CheckoutRequestDto } from "@/features/checkout-form/api/checkout.types";
import { getStorefrontCartQueryKey } from "@/features/cart-summary/hooks/use-storefront-cart-query";

export function useCheckoutMutation(tenantSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CheckoutRequestDto) => checkoutCurrentCart(input),
    onSuccess: () => {
      queryClient.setQueryData(
        getStorefrontCartQueryKey(tenantSlug),
        (current: StorefrontCart | undefined) =>
          current
            ? {
                ...current,
                items: [],
                itemsCount: 0,
                totalPrice: 0,
              }
            : current,
      );

      void queryClient.invalidateQueries({
        queryKey: getStorefrontCartQueryKey(tenantSlug),
      });
    },
  });
}
