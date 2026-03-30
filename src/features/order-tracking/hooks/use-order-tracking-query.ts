"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrderTracking } from "@/features/order-tracking/api/get-order-tracking";

export function useOrderTrackingQuery(orderId: string, tenantSlug: string) {
  return useQuery({
    queryFn: () => getOrderTracking(orderId, tenantSlug),
    queryKey: ["order-tracking", tenantSlug, orderId],
    refetchInterval: 15_000,
  });
}
