import { mapOrderDtoToOrder } from "@/entities/order";
import { apiRequest } from "@/shared/api";
import { ApiError } from "@/shared/api/api-error";
import { env } from "@/shared/config/env";

import { createMockOrderDto } from "@/features/order-tracking/lib/order-mocks";
import {
  forgetTrackedOrderId,
  rememberTrackedOrderId,
} from "@/features/order-tracking/lib/tracked-order-storage";
import type { OrderDto } from "@/entities/order";

export type OrderRequestContext = {
  accessToken?: string;
  cookie?: string;
  installId?: string;
};

function syncTrackedOrder(tenantSlug: string, orderId: string, isActive: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  if (isActive) {
    rememberTrackedOrderId(tenantSlug, orderId);
    return;
  }

  forgetTrackedOrderId(tenantSlug, orderId);
}

export async function getOrderTracking(
  orderId: string,
  tenantSlug: string,
  requestContext: OrderRequestContext = {},
) {
  let dto: OrderDto;

  if (env.apiMocksEnabled) {
    dto = createMockOrderDto({ orderId });
  } else {
    dto = await apiRequest<OrderDto>(`/v1/orders/${orderId}`, {
      ...requestContext,
      cache: "no-store",
    });
  }

  const order = mapOrderDtoToOrder(dto);
  syncTrackedOrder(tenantSlug, order.id, order.isActive);

  return order;
}

export function isOrderVisibilityError(error: unknown) {
  return error instanceof ApiError && [401, 403, 404].includes(error.statusCode);
}
