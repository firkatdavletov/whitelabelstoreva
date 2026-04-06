import type {
  CartDeliveryDraftResponseDto,
  CartItemResponseDto,
  CartResponseDto,
  DeliveryAddressResponseDto,
  DeliveryQuoteResponseDto,
} from "@/entities/cart/api/cart.dto";
import type {
  StorefrontCart,
  StorefrontCartDelivery,
  StorefrontCartDeliveryAddress,
  StorefrontCartItem,
  StorefrontCartDeliveryQuote,
} from "@/entities/cart/model/cart.types";

function mapDeliveryAddressDto(
  dto: DeliveryAddressResponseDto | null | undefined,
): StorefrontCartDeliveryAddress | null {
  if (!dto) {
    return null;
  }

  return {
    apartment: dto.apartment ?? null,
    city: dto.city ?? null,
    comment: dto.comment ?? null,
    country: dto.country ?? null,
    entrance: dto.entrance ?? null,
    floor: dto.floor ?? null,
    house: dto.house ?? null,
    intercom: dto.intercom ?? null,
    postalCode: dto.postalCode ?? null,
    region: dto.region ?? null,
    street: dto.street ?? null,
  };
}

function mapDeliveryQuoteDto(
  dto: DeliveryQuoteResponseDto | null | undefined,
): StorefrontCartDeliveryQuote | null {
  if (!dto) {
    return null;
  }

  return {
    available: dto.available,
    currency: dto.currency,
    estimatedDays: dto.estimatedDays ?? null,
    estimatedMinutes: dto.estimatesMinutes ?? null,
    message: dto.message ?? null,
    pickupPointAddress: dto.pickupPointAddress ?? null,
    pickupPointName: dto.pickupPointName ?? null,
    priceMinor: dto.priceMinor ?? null,
    zoneName: dto.zoneName ?? null,
  };
}

function mapCartDeliveryDto(
  dto: CartDeliveryDraftResponseDto | null | undefined,
): StorefrontCartDelivery | null {
  if (!dto) {
    return null;
  }

  return {
    address: mapDeliveryAddressDto(dto.address),
    deliveryMethod: dto.deliveryMethod ?? null,
    pickupPointAddress: dto.pickupPointAddress ?? null,
    pickupPointExternalId: dto.pickupPointExternalId ?? null,
    pickupPointId: dto.pickupPointId ?? null,
    pickupPointName: dto.pickupPointName ?? null,
    quote: mapDeliveryQuoteDto(dto.quote),
    quoteExpired: dto.quoteExpired,
  };
}

function mapCartItemDto(dto: CartItemResponseDto): StorefrontCartItem {
  return {
    countStep: dto.countStep,
    id: dto.id,
    lineTotal: dto.lineTotalMinor / 100,
    modifiers: dto.modifiers.map((modifier) => ({
      modifierGroupId: modifier.modifierGroupId,
      modifierOptionId: modifier.modifierOptionId,
      optionName: modifier.optionName,
      quantity: modifier.quantity,
    })),
    modifierNames: dto.modifiers.map((modifier) => modifier.optionName),
    productId: dto.productId,
    quantity: dto.quantity,
    title: dto.title,
    unit: dto.unit,
    variantId: dto.variantId ?? null,
  };
}

export function mapCartDtoToStorefrontCart(
  dto: CartResponseDto,
): StorefrontCart {
  return {
    delivery: mapCartDeliveryDto(dto.delivery),
    id: dto.id,
    items: dto.items.map(mapCartItemDto),
    itemsCount: dto.items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: dto.totalPriceMinor / 100,
  };
}
