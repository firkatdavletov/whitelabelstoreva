import type { CurrencyCode } from "@/shared/types/common";

export type CartItem = {
  currency: CurrencyCode;
  name: string;
  price: number;
  productId: string;
  quantity: number;
  visual: string;
};

export type CartItemInput = Omit<CartItem, "quantity">;
