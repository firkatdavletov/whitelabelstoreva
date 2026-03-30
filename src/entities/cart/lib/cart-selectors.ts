import type { CartItem } from "@/entities/cart/model/cart.types";

export function getCartItemsCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
}
