import type { components, paths } from "@/shared/api/generated/schema";

export type CancelOrderRequestDto = components["schemas"]["CancelOrderRequest"];

export type OrderDto = components["schemas"]["OrderResponse"];

export type CurrentOrderListDto =
  paths["/api/v1/orders/current"]["get"]["responses"][200]["content"]["application/json"];

export type OrderListDto =
  paths["/api/v1/orders/my"]["get"]["responses"][200]["content"]["application/json"];

export type OrderDeliveryMethod = components["schemas"]["DeliveryMethodType"];

export type OrderStateType = components["schemas"]["OrderStateType"];

export type OrderStatusSummaryDto =
  components["schemas"]["OrderStatusSummaryResponse"];
