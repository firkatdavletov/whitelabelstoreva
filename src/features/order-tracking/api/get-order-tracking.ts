import { mapOrderDtoToOrder } from "@/entities/order";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import type { OrderDto } from "@/entities/order";

function createMockOrderDto(tenantSlug: string, orderId: string): OrderDto {
  return {
    eta_minutes: 18,
    id: orderId,
    items_count: 3,
    restaurant_name:
      tenantSlug === "cedar-canteen" ? "Cedar Canteen Kitchen" : "Urban Bites Kitchen",
    status: "DELIVERING",
    tenant_slug: tenantSlug,
    timeline: [
      { status: "PENDING", timestamp: "12:04" },
      { status: "CONFIRMED", timestamp: "12:05" },
      { status: "PREPARING", timestamp: "12:09" },
      { status: "COURIER_ASSIGNED", timestamp: "12:18" },
      { status: "DELIVERING", timestamp: "12:23" },
    ],
  };
}

export async function getOrderTracking(orderId: string, tenantSlug: string) {
  if (env.apiMocksEnabled) {
    return mapOrderDtoToOrder(createMockOrderDto(tenantSlug, orderId));
  }

  const dto = await apiRequest<OrderDto>(`/storefront/tenants/${tenantSlug}/orders/${orderId}`, {
    headers: {
      "x-tenant-id": tenantSlug,
    },
  });

  return mapOrderDtoToOrder(dto);
}
