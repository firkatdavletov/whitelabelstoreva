import type {
  StorefrontCartDeliveryMethod,
  StorefrontCart,
} from "@/entities/cart";
import { isPickupDeliveryMethod } from "@/entities/cart";
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
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const houseMatch = /^house[\s.:#-]*(.+)$/i.exec(part);

      if (houseMatch) {
        return `дом ${houseMatch[1].trim()}`;
      }

      return part;
    })
    .filter(
      (part) =>
        !/^(?:postal(?:\s*code)?|zip(?:\s*code)?|индекс)?[\s.:#-]*\d{5,6}$/i.test(
          part,
        ) &&
        !/^(россия|российская федерация|russia|russian federation)$/i.test(
          part,
        ) &&
        !/^(?:.*\s)?(область|обл\.|край|республика|region|oblast|province|district)$/i.test(
          part,
        ),
    );

  return normalizedParts.join(", ") || null;
}

function normalizeCheckoutField(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

export function isPickupCheckoutDelivery(
  deliveryMethod: StorefrontCartDeliveryMethod | null | undefined,
) {
  return isPickupDeliveryMethod(deliveryMethod);
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
    deliveryAddress?: NonNullable<StorefrontCart["delivery"]>["address"] | null;
    includeAddressMetaFields?: boolean;
  },
): CheckoutRequestDto {
  const customerName = normalizeCheckoutField(values.fullName);
  const customerPhone = normalizeCheckoutField(values.phone);
  const comment = normalizeCheckoutField(values.comment);
  const deliveryAddress = options?.deliveryAddress;
  const includeAddressMetaFields = options?.includeAddressMetaFields ?? true;
  const address = deliveryAddress
    ? {
        apartment:
          !includeAddressMetaFields || values.isPrivateHouse
            ? null
            : normalizeCheckoutField(values.apartment),
        city: normalizeCheckoutField(deliveryAddress.city),
        comment,
        country: normalizeCheckoutField(deliveryAddress.country),
        entrance:
          !includeAddressMetaFields || values.isPrivateHouse
            ? null
            : normalizeCheckoutField(values.entrance),
        floor:
          !includeAddressMetaFields || values.isPrivateHouse
            ? null
            : normalizeCheckoutField(values.floor),
        house: normalizeCheckoutField(deliveryAddress.house),
        intercom:
          !includeAddressMetaFields || values.isPrivateHouse
            ? null
            : normalizeCheckoutField(values.intercom),
        postalCode: normalizeCheckoutField(deliveryAddress.postalCode),
        region: normalizeCheckoutField(deliveryAddress.region),
        street: normalizeCheckoutField(deliveryAddress.street),
      }
    : null;

  return {
    address,
    comment,
    customerName,
    customerPhone,
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
    case "CUSTOM_DELIVERY_ADDRESS":
      return "Доставка по адресу";
    case "PICKUP":
      return "Самовывоз";
    case "YANDEX_PICKUP_POINT":
      return "ПВЗ Яндекс";
    default:
      return null;
  }
}
