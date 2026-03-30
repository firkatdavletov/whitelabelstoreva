import type { CurrencyCode } from "@/shared/types/common";

export type ProductDto = {
  category_id: string;
  currency: CurrencyCode;
  description: string;
  id: string;
  is_available: boolean;
  name: string;
  price_minor: number;
  slug: string;
  tags: string[];
  visual_hint: string;
};
