"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getCartItemsCount, getCartTotal } from "@/entities/cart/lib/cart-selectors";
import type { CartItem, CartItemInput } from "@/entities/cart/model/cart.types";

type CartStore = {
  addItem: (item: CartItemInput) => void;
  clear: () => void;
  items: CartItem[];
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (currentItem) => currentItem.productId === item.productId,
          );

          if (existingItem) {
            return {
              items: state.items.map((currentItem) =>
                currentItem.productId === item.productId
                  ? { ...currentItem, quantity: currentItem.quantity + 1 }
                  : currentItem,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),
      clear: () => set({ items: [] }),
      items: [],
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            )
            .filter((item) => item.quantity > 0),
        })),
    }),
    {
      name: "cart-store",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const cartSelectors = {
  itemsCount: (items: CartItem[]) => getCartItemsCount(items),
  total: (items: CartItem[]) => getCartTotal(items),
};
