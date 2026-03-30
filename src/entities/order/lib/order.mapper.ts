import type { OrderDto } from "@/entities/order/api/order.dto";
import type { Order, OrderStatus } from "@/entities/order/model/order.types";

const orderStatusLabels: Record<OrderStatus, string> = {
  CONFIRMED: "Order confirmed",
  COURIER_ASSIGNED: "Courier assigned",
  DELIVERED: "Delivered",
  DELIVERING: "Out for delivery",
  PENDING: "Waiting for confirmation",
  PREPARING: "Kitchen is preparing the order",
};

export function mapOrderDtoToOrder(dto: OrderDto): Order {
  return {
    etaMinutes: dto.eta_minutes,
    id: dto.id,
    itemsCount: dto.items_count,
    restaurantName: dto.restaurant_name,
    status: dto.status,
    statusLabel: orderStatusLabels[dto.status],
    tenantSlug: dto.tenant_slug,
    timeline: dto.timeline.map((step) => ({
      isCurrent: step.status === dto.status,
      label: orderStatusLabels[step.status],
      status: step.status,
      timestamp: step.timestamp,
    })),
  };
}
