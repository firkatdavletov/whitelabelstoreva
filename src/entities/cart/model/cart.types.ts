import type { components } from "@/shared/api/generated/schema";

export type StorefrontCartItemModifier = {
  modifierGroupId: string;
  modifierOptionId: string;
  optionName: string;
  quantity: number;
};

export type StorefrontCartItem = {
  countStep: number;
  id: string;
  imageUrl: string | null;
  lineTotal: number;
  modifiers: StorefrontCartItemModifier[];
  modifierNames: string[];
  productId: string;
  quantity: number;
  title: string;
  unit: components["schemas"]["ProductUnit"];
  variantId: string | null;
};

export type StorefrontCartDeliveryMethod =
  components["schemas"]["DeliveryMethodType"];

export type StorefrontCartDeliveryAddress = {
  apartment: string | null;
  city: string | null;
  comment?: string | null;
  country?: string | null;
  entrance?: string | null;
  floor?: string | null;
  house: string | null;
  intercom?: string | null;
  postalCode?: string | null;
  region?: string | null;
  street: string | null;
};

export type StorefrontCartDeliveryQuote = {
  available: boolean;
  currency: string;
  estimatedDays: number | null;
  estimatedMinutes: number | null;
  message: string | null;
  pickupPointAddress: string | null;
  pickupPointName: string | null;
  priceMinor: number | null;
  zoneName: string | null;
};

export type StorefrontCartDelivery = {
  address: StorefrontCartDeliveryAddress | null;
  deliveryMethod: StorefrontCartDeliveryMethod | null;
  pickupPointAddress: string | null;
  pickupPointExternalId?: string | null;
  pickupPointId?: string | null;
  pickupPointName: string | null;
  quote: StorefrontCartDeliveryQuote | null;
  quoteExpired: boolean;
};

export type StorefrontCart = {
  delivery: StorefrontCartDelivery | null;
  id: string;
  items: StorefrontCartItem[];
  itemsCount: number;
  totalPrice: number;
};
