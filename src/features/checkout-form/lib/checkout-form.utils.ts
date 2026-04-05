import type {
  StorefrontCartDeliveryMethod,
  StorefrontCart,
} from "@/entities/cart";
import type {
  CheckoutDeliveryOptionResponseDto,
  CheckoutRequestDto,
} from "@/features/checkout-form/api/checkout.types";
import type { CheckoutFormValues } from "@/features/checkout-form/model/checkout-form.schema";

function buildAddressLine(parts: Array<string | null | undefined>) {
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ");
}

function normalizeAddressString(address: string | null | undefined) {
  if (!address) {
    return null;
  }

  const normalizedParts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter(
      (part) =>
        !/^\d{5,6}$/.test(part) &&
        !/^(россия|russia)$/i.test(part) &&
        !/(область|обл\.|край|республика|region|oblast)/i.test(part),
    );

  return normalizedParts.join(", ") || null;
}

export function isPickupCheckoutDelivery(
  deliveryMethod: StorefrontCartDeliveryMethod | null | undefined,
) {
  return (
    deliveryMethod === "PICKUP" || deliveryMethod === "YANDEX_PICKUP_POINT"
  );
}

export function formatCheckoutDeliveryAddress(
  delivery: StorefrontCart["delivery"] | null | undefined,
) {
  if (!delivery) {
    return null;
  }

  if (isPickupCheckoutDelivery(delivery.deliveryMethod)) {
    return (
      normalizeAddressString(
        delivery.pickupPointAddress ?? delivery.quote?.pickupPointAddress,
      ) ??
      delivery.pickupPointName ??
      delivery.quote?.pickupPointName ??
      null
    );
  }

  return (
    buildAddressLine([
      delivery.address?.city ?? null,
      delivery.address?.street ?? null,
      delivery.address?.house ? `дом ${delivery.address.house}` : null,
    ]) || null
  );
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
  options?: {
    additionalCommentParts?: Array<string | null | undefined>;
  },
): CheckoutRequestDto {
  const customerName = values.fullName?.trim();
  const customerPhone = values.phone?.trim();
  const comment = [
    ...(options?.additionalCommentParts ?? []),
    values.comment?.trim(),
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(". ");

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
