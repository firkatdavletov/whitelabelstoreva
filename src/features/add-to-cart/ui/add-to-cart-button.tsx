"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { Product } from "@/entities/product";
import { useAddStorefrontCartItemMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { cn } from "@/shared/lib/styles";
import { useUiStore } from "@/store/ui-store";
import { Button, type ButtonProps } from "@/shared/ui/button";

type AddToCartButtonProps = {
  className?: string;
  product: Product;
  size?: ButtonProps["size"];
};

export function AddToCartButton({
  className,
  product,
  size = "sm",
}: AddToCartButtonProps) {
  const { tenantSlug } = useStorefrontRoute();
  const { data: storefrontCart } = useStorefrontCartQuery(tenantSlug);
  const addCartItemMutation = useAddStorefrontCartItemMutation(tenantSlug);
  const openCartSidebar = useUiStore((state) => state.openCartSidebar);
  const { t } = useTranslation();

  return (
    <Button
      className={cn("w-full", className)}
      disabled={!product.isAvailable || addCartItemMutation.isPending}
      onClick={() => {
        const hadItems = (storefrontCart?.itemsCount ?? 0) > 0;

        addCartItemMutation.mutate(
          {
            productId: product.id,
            title: product.name,
            unitPrice: product.price,
            variantId: product.defaultVariantId,
          },
          {
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
          },
        );
      }}
      size={size}
    >
      <ShoppingBag className="h-4 w-4" />
      {t("product.addToCart")}
    </Button>
  );
}
