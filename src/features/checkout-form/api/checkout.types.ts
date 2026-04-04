import type { components, paths } from "@/shared/api/generated/schema";

export type CheckoutOptionsResponseDto =
  paths["/api/v1/checkout/options"]["get"]["responses"][200]["content"]["application/json"];

export type CheckoutDeliveryOptionResponseDto =
  components["schemas"]["CheckoutDeliveryOptionResponse"];

export type CheckoutPaymentMethodResponseDto =
  components["schemas"]["CheckoutPaymentMethodResponse"];

export type CheckoutRequestDto =
  paths["/api/v1/orders/checkout"]["post"]["requestBody"]["content"]["application/json"];

export type CheckoutOrderResponseDto =
  paths["/api/v1/orders/checkout"]["post"]["responses"][200]["content"]["application/json"];
