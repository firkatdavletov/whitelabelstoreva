"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { Product } from "@/entities/product";
import { cartSelectors, useCartStore } from "@/entities/cart";
import { useUiStore } from "@/store/ui-store";
import { Button } from "@/shared/ui/button";

type AddToCartButtonProps = {
  product: Product;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItemsCount = useCartStore((state) => cartSelectors.itemsCount(state.items));
  const openCartSidebar = useUiStore((state) => state.openCartSidebar);
  const { t } = useTranslation();

  return (
    <Button
      className="w-full"
      disabled={!product.isAvailable}
      onClick={() => {
        addItem({
          currency: product.currency,
          name: product.name,
          price: product.price,
          productId: product.id,
          visual: product.visual,
        });

        toast.success(t("toast.itemAddedTitle"), {
          description: t("toast.itemAddedDescription", {
            name: product.name,
          }),
        });

        if (cartItemsCount === 0) {
          openCartSidebar();
        }
      }}
      size="sm"
    >
      <ShoppingBag className="h-4 w-4" />
      {t("product.addToCart")}
    </Button>
  );
}
