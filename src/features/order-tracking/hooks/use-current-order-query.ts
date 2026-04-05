"use client";

import { useQuery } from "@tanstack/react-query";

import type { Order } from "@/entities/order";
import { getCurrentOrder } from "@/features/order-tracking/api/get-current-order";

export function getCurrentOrderQueryKey(tenantSlug: string) {
  return ["current-order", tenantSlug] as const;
}

export function useCurrentOrderQuery(
  tenantSlug: string,
  initialData?: Order | null,
) {
  return useQuery({
    initialData: initialData ?? undefined,
    queryFn: () => getCurrentOrder(tenantSlug),
    queryKey: getCurrentOrderQueryKey(tenantSlug),
    refetchInterval: (query) => (query.state.data?.isActive ? 15_000 : 30_000),
  });
}
