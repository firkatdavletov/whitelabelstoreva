"use client";

import { CartSummaryCard } from "@/features/cart-summary";
import { useUiStore } from "@/store/ui-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";

export function CartSidebar() {
  const isOpen = useUiStore((state) => state.isCartSidebarOpen);
  const closeCartSidebar = useUiStore((state) => state.closeCartSidebar);

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          closeCartSidebar();
        }
      }}
      open={isOpen}
    >
      <SheetContent className="overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Basket</SheetTitle>
          <SheetDescription>
            Client-side cart shell ready to hand over a payload to checkout.
          </SheetDescription>
        </SheetHeader>
        <CartSummaryCard />
      </SheetContent>
    </Sheet>
  );
}
