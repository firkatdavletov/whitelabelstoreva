export type OrderStatus =
  | "CONFIRMED"
  | "COURIER_ASSIGNED"
  | "DELIVERED"
  | "DELIVERING"
  | "PENDING"
  | "PREPARING";

export type OrderStep = {
  isCurrent: boolean;
  label: string;
  status: OrderStatus;
  timestamp: string;
};

export type Order = {
  etaMinutes: number;
  id: string;
  itemsCount: number;
  restaurantName: string;
  status: OrderStatus;
  statusLabel: string;
  tenantSlug: string;
  timeline: OrderStep[];
};
