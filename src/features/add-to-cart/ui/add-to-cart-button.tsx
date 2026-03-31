"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { Product } from "@/entities/product";
import { useAddStorefrontCartItemMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { useUiStore } from "@/store/ui-store";
import { Button } from "@/shared/ui/button";

type AddToCartButtonProps = {
  product: Product;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { tenantSlug } = useStorefrontRoute();
  const { data: storefrontCart } = useStorefrontCartQuery(tenantSlug);
  const addCartItemMutation = useAddStorefrontCartItemMutation(tenantSlug);
  const openCartSidebar = useUiStore((state) => state.openCartSidebar);
  const { t } = useTranslation();

  return (
    <Button
      className="w-full"
      disabled={!product.isAvailable || addCartItemMutation.isPending}
      onClick={() => {
        const hadItems = (storefrontCart?.itemsCount ?? 0) > 0;

        addCartItemMutation.mutate(product, {
          onSuccess: () => {
            toast.success(t("toast.itemAddedTitle"), {
              description: t("toast.itemAddedDescription", {
                name: product.name,
              }),
            });

            if (!hadItems) {
              openCartSidebar();
            }
          },
        });
      }}
      size="sm"
    >
      <ShoppingBag className="h-4 w-4" />
      {t("product.addToCart")}
    </Button>
  );
}
