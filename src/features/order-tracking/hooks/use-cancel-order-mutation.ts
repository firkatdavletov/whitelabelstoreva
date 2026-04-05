"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelOrder } from "@/features/order-tracking/api/cancel-order";
import { syncTrackedOrderId } from "@/features/order-tracking/lib/tracked-order-storage";
import { getCurrentOrderQueryKey } from "@/features/order-tracking/hooks/use-current-order-query";
import { getOrderTrackingQueryKey } from "@/features/order-tracking/hooks/use-order-tracking-query";
import type { CancelOrderRequestDto, Order } from "@/entities/order";

export function useCancelOrderMutation(orderId: string, tenantSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: CancelOrderRequestDto) => cancelOrder(orderId, input),
    onSuccess: (order) => {
      syncTrackedOrderId(tenantSlug, order.id, order.isActive);

      queryClient.setQueryData<Order>(
        getOrderTrackingQueryKey(tenantSlug, orderId),
        order,
      );
      queryClient.setQueryData<Order | null>(
        getCurrentOrderQueryKey(tenantSlug),
        order.isActive ? order : null,
      );

      void queryClient.invalidateQueries({
        queryKey: getOrderTrackingQueryKey(tenantSlug, orderId),
      });
      void queryClient.invalidateQueries({
        queryKey: getCurrentOrderQueryKey(tenantSlug),
      });
    },
  });
}
