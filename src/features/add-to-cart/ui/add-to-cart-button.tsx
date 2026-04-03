"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { Product } from "@/entities/product";
import { useAddStorefrontCartItemMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import {
  useChangeStorefrontCartItemQuantityMutation,
  useRemoveStorefrontCartItemMutation,
} from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { formatProductQuantity } from "@/shared/lib/product-quantity";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { cn } from "@/shared/lib/styles";
import { useUiStore } from "@/store/ui-store";
import { Button, type ButtonProps } from "@/shared/ui/button";

type AddToCartButtonProps = {
  className?: string;
  product: Product;
  productHref: string;
  size?: ButtonProps["size"];
};

export function AddToCartButton({
  className,
  product,
  productHref,
  size = "sm",
}: AddToCartButtonProps) {
  const { locale, tenantSlug } = useStorefrontRoute();
  const { data: storefrontCart } = useStorefrontCartQuery(tenantSlug);
  const addCartItemMutation = useAddStorefrontCartItemMutation(tenantSlug);
  const changeCartItemQuantityMutation =
    useChangeStorefrontCartItemQuantityMutation(tenantSlug);
  const removeCartItemMutation =
    useRemoveStorefrontCartItemMutation(tenantSlug);
  const openCartSidebar = useUiStore((state) => state.openCartSidebar);
  const { t } = useTranslation();
  const matchingCartItems =
    storefrontCart?.items.filter((item) => item.productId === product.id) ?? [];
  const primaryCartItem =
    matchingCartItems.find((item) => item.modifierNames.length === 0) ??
    matchingCartItems[0] ??
    null;
  const quantityInCart = matchingCartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const quantityLabel =
    quantityInCart > 0
      ? formatProductQuantity(
          quantityInCart,
          primaryCartItem?.unit ?? product.unit,
          locale,
        )
      : null;
  const quantityStep = Math.max(
    primaryCartItem?.countStep ?? product.countStep,
    1,
  );
  const isBusy =
    addCartItemMutation.isPending ||
    changeCartItemQuantityMutation.isPending ||
    removeCartItemMutation.isPending;

  function addProduct({ showToast }: { showToast: boolean }) {
    const hadItems = (storefrontCart?.itemsCount ?? 0) > 0;

    addCartItemMutation.mutate(
      {
        countStep: product.countStep,
        productId: product.id,
        title: product.name,
        unit: product.unit,
        unitPrice: product.price,
        variantId: product.defaultVariantId,
      },
      {
        onSuccess: () => {
          if (showToast) {
            toast.success(t("toast.itemAddedTitle"), {
              description: t("toast.itemAddedDescription", {
                name: product.name,
              }),
            });
          }

          if (!hadItems) {
            openCartSidebar();
          }
        },
      },
    );
  }

  function decrementProduct() {
    if (!primaryCartItem) {
      return;
    }

    const nextQuantity = primaryCartItem.quantity - quantityStep;

    if (nextQuantity <= 0) {
      removeCartItemMutation.mutate(primaryCartItem.id);
      return;
    }

    changeCartItemQuantityMutation.mutate({
      itemId: primaryCartItem.id,
      quantity: nextQuantity,
    });
  }

  if (product.isConfigured) {
    return (
      <div
        className={cn(
          "relative z-20 mt-auto flex items-center gap-2",
          className,
        )}
      >
        {quantityLabel ? (
          <div className="bg-secondary/55 text-foreground flex min-w-[4.5rem] items-center justify-center rounded-xl px-2 text-center text-[0.72rem] font-semibold md:min-w-[5.25rem] md:text-xs">
            {quantityLabel}
          </div>
        ) : null}

        <Button
          asChild
          className={cn("rounded-xl", quantityLabel ? "flex-1" : "w-full")}
          size={size}
          variant="secondary"
        >
          <Link href={productHref}>{t("product.choose")}</Link>
        </Button>
      </div>
    );
  }

  if (primaryCartItem && quantityLabel) {
    return (
      <div
        className={cn(
          "relative z-20 mt-auto flex items-center gap-2",
          className,
        )}
      >
        <Button
          aria-label={t("product.decreaseQuantity")}
          className="h-9 w-9 shrink-0 rounded-xl"
          disabled={isBusy}
          onClick={decrementProduct}
          size="icon"
          type="button"
          variant="secondary"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="bg-secondary/55 text-foreground flex min-w-0 flex-1 items-center justify-center rounded-xl px-3 text-center text-[0.78rem] font-semibold md:text-sm">
          {quantityLabel}
        </div>

        <Button
          aria-label={t("product.increaseQuantity")}
          className="h-9 w-9 shrink-0 rounded-xl"
          disabled={isBusy || !product.isAvailable}
          onClick={() => addProduct({ showToast: false })}
          size="icon"
          type="button"
          variant="secondary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      className={cn("w-full", className)}
      disabled={!product.isAvailable || isBusy}
      onClick={() => addProduct({ showToast: true })}
      size={size}
      type="button"
    >
      <ShoppingBag className="h-4 w-4" />
      {t("product.add")}
    </Button>
  );
}
