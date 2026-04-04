"use client";

import { useQuery } from "@tanstack/react-query";

import { getCheckoutOptions } from "@/features/checkout-form/api/checkout.api";

export function getCheckoutOptionsQueryKey(
  tenantSlug: string,
  pickupPointId?: string | null,
) {
  return ["checkout-options", tenantSlug, pickupPointId ?? null] as const;
}

export function useCheckoutOptionsQuery(
  tenantSlug: string,
  pickupPointId?: string | null,
) {
  return useQuery({
    queryFn: () => getCheckoutOptions({ pickupPointId }),
    queryKey: getCheckoutOptionsQueryKey(tenantSlug, pickupPointId),
    staleTime: 60_000,
  });
}
