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
  dto: DeliveryAddressResponseDto | null,
): StorefrontCartDeliveryAddress | null {
  if (!dto) {
    return null;
  }

  return {
    apartment: dto.apartment,
    city: dto.city,
    house: dto.house,
    street: dto.street,
  };
}

function mapDeliveryQuoteDto(
  dto: DeliveryQuoteResponseDto | null,
): StorefrontCartDeliveryQuote | null {
  if (!dto) {
    return null;
  }

  return {
    available: dto.available,
    estimatedDays: dto.estimatedDays,
    message: dto.message,
    pickupPointAddress: dto.pickupPointAddress,
    pickupPointName: dto.pickupPointName,
    zoneName: dto.zoneName,
  };
}

function mapCartDeliveryDto(
  dto: CartDeliveryDraftResponseDto | null,
): StorefrontCartDelivery | null {
  if (!dto) {
    return null;
  }

  return {
    address: mapDeliveryAddressDto(dto.address),
    deliveryMethod: dto.deliveryMethod,
    pickupPointAddress: dto.pickupPointAddress,
    pickupPointName: dto.pickupPointName,
    quote: mapDeliveryQuoteDto(dto.quote),
    quoteExpired: dto.quoteExpired,
  };
}

function mapCartItemDto(dto: CartItemResponseDto): StorefrontCartItem {
  return {
    id: dto.id,
    lineTotal: dto.lineTotalMinor / 100,
    productId: dto.productId,
    quantity: dto.quantity,
    title: dto.title,
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
