import type { CurrencyCode } from "@/shared/types/common";

export type RestaurantDto = {
  city: string;
  currency: CurrencyCode;
  delivery_eta_minutes: number;
  id: string;
  kitchen_note: string;
  min_order_amount_minor: number;
  name: string;
  tenant_slug: string;
};
