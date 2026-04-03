import type { components } from "@/shared/api/generated/schema";

export type StorefrontCartItem = {
  countStep: number;
  id: string;
  lineTotal: number;
  modifierNames: string[];
  productId: string;
  quantity: number;
  title: string;
  unit: components["schemas"]["ProductUnit"];
};

export type StorefrontCartDeliveryMethod =
  components["schemas"]["DeliveryMethodType"];

export type StorefrontCartDeliveryAddress = {
  apartment: string | null;
  city: string | null;
  house: string | null;
  street: string | null;
};

export type StorefrontCartDeliveryQuote = {
  available: boolean;
  estimatedDays: number | null;
  estimatedMinutes: number | null;
  message: string | null;
  pickupPointAddress: string | null;
  pickupPointName: string | null;
  zoneName: string | null;
};

export type StorefrontCartDelivery = {
  address: StorefrontCartDeliveryAddress | null;
  deliveryMethod: StorefrontCartDeliveryMethod | null;
  pickupPointAddress: string | null;
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
