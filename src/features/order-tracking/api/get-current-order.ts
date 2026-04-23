import { mapOrderDtoToOrder, selectCurrentOrderDto } from "@/entities/order";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type { CurrentOrderListDto } from "@/entities/order";
import {
  getOrderTracking,
  isOrderVisibilityError,
} from "@/features/order-tracking/api/get-order-tracking";
import { createMockOrderDto } from "@/features/order-tracking/lib/order-mocks";
import {
  forgetTrackedOrderId,
  listTrackedOrderIds,
  rememberTrackedOrderId,
} from "@/features/order-tracking/lib/tracked-order-storage";
import type { OrderRequestContext } from "@/features/order-tracking/api/get-order-tracking";

async function resolveRememberedCurrentOrder(
  tenantSlug: string,
  requestContext: OrderRequestContext,
) {
  if (typeof window === "undefined") {
    return null;
  }

  for (const orderId of listTrackedOrderIds(tenantSlug)) {
    try {
      const order = await getOrderTracking(orderId, tenantSlug, requestContext);

      if (order.isActive) {
        return order;
      }
    } catch (error) {
      if (isOrderVisibilityError(error)) {
        forgetTrackedOrderId(tenantSlug, orderId);
        continue;
      }

      throw error;
    }
  }

  return null;
}

export async function getCurrentOrder(
  tenantSlug: string,
  requestContext: OrderRequestContext = {},
) {
  if (env.apiMocksEnabled) {
    return mapOrderDtoToOrder(
      createMockOrderDto({
        orderId: `mock-current-order-${tenantSlug}`,
      }),
    );
  }

  try {
    const orders = await apiRequest<CurrentOrderListDto>("/v1/orders/current", {
      ...requestContext,
      cache: "no-store",
    });
    const currentOrderDto = selectCurrentOrderDto(orders);

    if (currentOrderDto) {
      if (typeof window !== "undefined") {
        rememberTrackedOrderId(tenantSlug, currentOrderDto.id);
      }

      return mapOrderDtoToOrder(currentOrderDto);
    }
  } catch (error) {
    if (!isOrderVisibilityError(error)) {
      throw error;
    }
  }

  return resolveRememberedCurrentOrder(tenantSlug, requestContext);
}
