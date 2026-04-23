import type { components, paths } from "@/shared/api/generated/schema";

export type CartResponseDto =
  paths["/api/v1/cart"]["get"]["responses"][200]["content"]["application/json"];

export type CartItemResponseDto = components["schemas"]["CartItemResponse"];

export type CartDeliveryDraftResponseDto =
  components["schemas"]["CartDeliveryDraftResponse"];

export type DeliveryAddressResponseDto =
  components["schemas"]["DeliveryAddressResponse"];

export type DeliveryQuoteResponseDto =
  components["schemas"]["DeliveryQuoteResponse"];

export type AddCartItemRequestDto =
  paths["/api/v1/cart/items"]["post"]["requestBody"]["content"]["application/json"];

export type ChangeCartItemQuantityRequestDto =
  paths["/api/v1/cart/items/{itemId}"]["patch"]["requestBody"]["content"]["application/json"];

export type PutCartDeliveryRequestDto =
  paths["/api/v1/cart/delivery"]["put"]["requestBody"]["content"]["application/json"];
