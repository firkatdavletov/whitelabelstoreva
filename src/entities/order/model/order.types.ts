import type {
  OrderDeliveryMethod,
  OrderStateType,
} from "@/entities/order/api/order.dto";

export type OrderTimelineStep = {
  code: string;
  id: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isIssue: boolean;
  label: string | null;
  timestamp: string | null;
};

export type OrderItem = {
  id: string;
  modifiers: string[];
  quantity: number;
  title: string;
  totalPrice: number;
};

export type Order = {
  createdAt: string;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  deliveryFeePrice: number;
  deliveryMethod: OrderDeliveryMethod;
  deliveryMethodName: string;
  etaMinutes: number | null;
  id: string;
  isActive: boolean;
  isCancellable: boolean;
  isFinal: boolean;
  isVisibleToCustomer: boolean;
  items: OrderItem[];
  itemsCount: number;
  orderNumber: string;
  paymentMethodName: string | null;
  pickupPointAddress: string | null;
  pickupPointName: string | null;
  stateColor: string | null;
  stateIcon: string | null;
  stateType: OrderStateType;
  statusChangedAt: string;
  statusCode: string;
  statusLabel: string;
  subtotalPrice: number;
  timeline: OrderTimelineStep[];
  totalPrice: number;
  trackingMeta: {
    courierTrackingAvailable: boolean;
    etaSource: "backend" | "missing";
    timelineSource: "backend" | "derived";
  };
  updatedAt: string;
};
