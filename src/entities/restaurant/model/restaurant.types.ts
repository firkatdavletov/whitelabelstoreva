import type { CurrencyCode } from "@/shared/types/common";

export type Restaurant = {
  city: string;
  currency: CurrencyCode;
  deliveryEtaMinutes: number;
  id: string;
  kitchenNote: string;
  minOrderAmount: number;
  name: string;
  tenantSlug: string;
};
