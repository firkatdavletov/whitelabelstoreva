"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrderTracking } from "@/features/order-tracking/api/get-order-tracking";
import type { Order } from "@/entities/order";

export function useOrderTrackingQuery(
  orderId: string,
  tenantSlug: string,
  initialData?: Order | null,
) {
  return useQuery({
    initialData: initialData ?? undefined,
    queryFn: () => getOrderTracking(orderId, tenantSlug),
    queryKey: ["order-tracking", tenantSlug, orderId],
    refetchInterval: (query) => (query.state.data?.isActive ? 15_000 : false),
  });
}
