import type { OrderStatus } from "@/entities/order/model/order.types";

export type OrderTimelineDto = {
  status: OrderStatus;
  timestamp: string;
};

export type OrderDto = {
  eta_minutes: number;
  id: string;
  items_count: number;
  restaurant_name: string;
  status: OrderStatus;
  tenant_slug: string;
  timeline: OrderTimelineDto[];
};
