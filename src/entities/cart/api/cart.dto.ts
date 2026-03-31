import type { StorefrontCartDeliveryMethod } from "@/entities/cart/model/cart.types";

export type CartResponseDto = {
  delivery: CartDeliveryDraftResponseDto | null;
  id: string;
  items: CartItemResponseDto[];
  totalPriceMinor: number;
};

export type CartItemResponseDto = {
  id: string;
  lineTotalMinor: number;
  productId: string;
  quantity: number;
  title: string;
};

export type CartDeliveryDraftResponseDto = {
  address: DeliveryAddressResponseDto | null;
  deliveryMethod: StorefrontCartDeliveryMethod | null;
  pickupPointAddress: string | null;
  pickupPointName: string | null;
  quote: DeliveryQuoteResponseDto | null;
  quoteExpired: boolean;
};

export type DeliveryAddressResponseDto = {
  apartment: string | null;
  city: string | null;
  house: string | null;
  street: string | null;
};

export type DeliveryQuoteResponseDto = {
  available: boolean;
  estimatedDays: number | null;
  message: string | null;
  pickupPointAddress: string | null;
  pickupPointName: string | null;
  zoneName: string | null;
};

export type AddCartItemRequestDto = {
  modifiers?: never[];
  productId: string;
  quantity: number;
  variantId?: string | null;
};

export type ChangeCartItemQuantityRequestDto = {
  quantity: number;
};
