import type { StorefrontCartDeliveryMethod, StorefrontCart } from "@/entities/cart";
import type {
  CheckoutDeliveryOptionResponseDto,
  CheckoutRequestDto,
} from "@/features/checkout-form/api/checkout.types";
import type { CheckoutFormValues } from "@/features/checkout-form/model/checkout-form.schema";

export function formatCheckoutDeliveryAddress(
  delivery: StorefrontCart["delivery"] | null | undefined,
) {
  if (!delivery) {
    return null;
  }

  if (
    delivery.deliveryMethod === "PICKUP" ||
    delivery.deliveryMethod === "YANDEX_PICKUP_POINT"
  ) {
    return (
      delivery.pickupPointAddress ??
      delivery.quote?.pickupPointAddress ??
      delivery.pickupPointName ??
      delivery.quote?.pickupPointName ??
      null
    );
  }

  const addressParts = [
    delivery.address?.city ?? null,
    delivery.address?.street ?? null,
    delivery.address?.house ?? null,
    delivery.address?.apartment ?? null,
  ].filter(Boolean);

  return addressParts.join(", ") || null;
}

export function findCheckoutDeliveryOption(
  options: CheckoutDeliveryOptionResponseDto[] | undefined,
  deliveryMethod: StorefrontCartDeliveryMethod | null | undefined,
) {
  if (!options?.length || !deliveryMethod) {
    return null;
  }

  return options.find((option) => option.code === deliveryMethod) ?? null;
}

export function resolveCheckoutPaymentMethods(
  options: CheckoutDeliveryOptionResponseDto[] | undefined,
  deliveryMethod: StorefrontCartDeliveryMethod | null | undefined,
) {
  return (
    findCheckoutDeliveryOption(options, deliveryMethod)?.paymentMethods.filter(
      (method) => method.isActive,
    ) ?? []
  );
}

export function buildCheckoutRequest(
  values: CheckoutFormValues,
): CheckoutRequestDto {
  const customerName = values.fullName?.trim();
  const customerPhone = values.phone?.trim();
  const comment = values.comment?.trim();

  return {
    comment: comment || null,
    customerName: customerName || null,
    customerPhone: customerPhone || null,
    paymentMethodCode:
      values.paymentMethodCode as CheckoutRequestDto["paymentMethodCode"],
  };
}

export function resolveDeliveryMethodFallbackLabel(
  deliveryMethod: StorefrontCartDeliveryMethod | null | undefined,
) {
  switch (deliveryMethod) {
    case "COURIER":
      return "Доставка";
    case "PICKUP":
      return "Самовывоз";
    case "YANDEX_PICKUP_POINT":
      return "ПВЗ Яндекс";
    default:
      return null;
  }
}
