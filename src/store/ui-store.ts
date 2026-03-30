"use client";

import { create } from "zustand";

type UiStore = {
  closeCartSidebar: () => void;
  isCartSidebarOpen: boolean;
  openCartSidebar: () => void;
  toggleCartSidebar: () => void;
};

export const useUiStore = create<UiStore>((set) => ({
  closeCartSidebar: () => set({ isCartSidebarOpen: false }),
  isCartSidebarOpen: false,
  openCartSidebar: () => set({ isCartSidebarOpen: true }),
  toggleCartSidebar: () =>
    set((state) => ({ isCartSidebarOpen: !state.isCartSidebarOpen })),
}));
