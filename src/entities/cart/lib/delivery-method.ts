import type { StorefrontCartDeliveryMethod } from "@/entities/cart/model/cart.types";

export function isPickupDeliveryMethod(
  deliveryMethod: StorefrontCartDeliveryMethod | null | undefined,
): boolean {
  return (
    deliveryMethod === "PICKUP" || deliveryMethod === "YANDEX_PICKUP_POINT"
  );
}

export function isAddressDeliveryMethod(
  deliveryMethod: StorefrontCartDeliveryMethod | null | undefined,
): boolean {
  return (
    deliveryMethod === "COURIER" || deliveryMethod === "CUSTOM_DELIVERY_ADDRESS"
  );
}
