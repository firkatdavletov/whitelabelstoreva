import type { CurrencyCode } from "@/shared/types/common";

export type Product = {
  categoryId: string;
  currency: CurrencyCode;
  description: string;
  id: string;
  isAvailable: boolean;
  name: string;
  price: number;
  slug: string;
  tags: string[];
  visual: string;
};
