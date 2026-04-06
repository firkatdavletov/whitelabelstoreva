"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Minus, Plus, RefreshCw, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { createCartConfigurationKey } from "@/entities/cart";
import type { Product, ProductModifierGroup } from "@/entities/product";
import { getProductCardImageSrc } from "@/entities/product/lib/product-card";
import {
  useAddStorefrontCartItemMutation,
  useChangeStorefrontCartItemQuantityMutation,
  useRemoveStorefrontCartItemMutation,
} from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useMenuProductDetailsQuery } from "@/features/menu-catalog/hooks/use-menu-product-details-query";
import {
  createInitialModifierSelection,
  getActiveVariants,
  getDefaultVariantId,
  getMaxSelections,
  getNextSelectedModifierIds,
  getRenderableModifierGroups,
  getRequiredSelections,
  resolveVariantLabel,
  type SelectedModifiersState,
} from "@/features/menu-catalog/lib/product-configurator";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import { formatProductQuantity } from "@/shared/lib/product-quantity";
import { cn } from "@/shared/lib/styles";
import type { Locale } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  SelectableCard,
  SelectableCardIndicator,
} from "@/shared/ui/selectable-card";
import { Skeleton } from "@/shared/ui/skeleton";

type ProductDetailsPageProps = {
  backHref: string;
  locale: Locale;
  product: Product;
};

function describeModifierGroup(
  group: ProductModifierGroup,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const maxSelections = getMaxSelections(group);
  const requiredSelections = getRequiredSelections(group);

  if (maxSelections === 1) {
    return t("product.selectOne");
  }

  if (requiredSelections > 0) {
    return t("product.chooseAtLeast", { count: requiredSelections });
  }

  return t("product.chooseUpTo", { count: maxSelections });
}

export function ProductDetailsPage({
  backHref,
  locale,
  product,
}: ProductDetailsPageProps) {
  const { tenantSlug } = useStorefrontRoute();
  const { data: storefrontCart } = useStorefrontCartQuery(tenantSlug);
  const addCartItemMutation = useAddStorefrontCartItemMutation(tenantSlug);
  const changeCartItemQuantityMutation =
    useChangeStorefrontCartItemQuantityMutation(tenantSlug);
  const removeCartItemMutation =
    useRemoveStorefrontCartItemMutation(tenantSlug);
  const productDetailsQuery = useMenuProductDetailsQuery(
    product,
    tenantSlug,
    true,
  );
  const { t } = useTranslation();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    getDefaultVariantId(product),
  );
  const [selectedModifierIdsByGroup, setSelectedModifierIdsByGroup] =
    useState<SelectedModifiersState>(() =>
      createInitialModifierSelection(product),
    );

  const resolvedProduct = productDetailsQuery.data ?? product;
  const isDetailsLoading =
    productDetailsQuery.isPending && !productDetailsQuery.data;
  const isDetailsError =
    productDetailsQuery.isError && !productDetailsQuery.data;

  useEffect(() => {
    setSelectedVariantId(getDefaultVariantId(resolvedProduct));
    setSelectedModifierIdsByGroup(
      createInitialModifierSelection(resolvedProduct),
    );
  }, [resolvedProduct]);

  const activeVariants = getActiveVariants(resolvedProduct);
  const modifierGroups = getRenderableModifierGroups(resolvedProduct);
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ?? null;
  const selectedUnitPrice = selectedVariant?.price ?? resolvedProduct.price;
  const selectedModifierOptions = modifierGroups.flatMap((group) => {
    const selectedIds = selectedModifierIdsByGroup[group.id] ?? [];

    return selectedIds.flatMap((selectedId) => {
      const option = group.options.find(
        (candidate) => candidate.id === selectedId,
      );

      if (!option) {
        return [];
      }

      return [
        {
          groupName: group.name,
          modifierGroupId: group.id,
          modifierOptionId: option.id,
          optionName: option.name,
          price: option.price,
          quantity: 1,
        },
      ];
    });
  });
  const modifiersTotal = selectedModifierOptions.reduce(
    (total, option) => total + option.price * option.quantity,
    0,
  );
  const totalPrice = selectedUnitPrice + modifiersTotal;
  const missingRequiredGroups = modifierGroups.filter(
    (group) =>
      (selectedModifierIdsByGroup[group.id] ?? []).length <
      getRequiredSelections(group),
  );
  const selectedSummary = selectedModifierOptions.map(
    (option) => option.optionName,
  );
  const imageSrc =
    selectedVariant?.imageUrl ??
    resolvedProduct.imageUrl ??
    getProductCardImageSrc(resolvedProduct);
  const configuredTitle = selectedVariant
    ? `${resolvedProduct.name} · ${resolveVariantLabel(
        resolvedProduct,
        selectedVariant,
      )}`
    : resolvedProduct.name;
  const selectedConfigurationKey = createCartConfigurationKey({
    modifiers: selectedModifierOptions,
    productId: resolvedProduct.id,
    variantId: selectedVariant?.id ?? resolvedProduct.defaultVariantId ?? null,
  });
  const matchingCartItems =
    storefrontCart?.items.filter(
      (item) =>
        createCartConfigurationKey({
          modifiers: item.modifiers,
          productId: item.productId,
          variantId: item.variantId,
        }) === selectedConfigurationKey,
    ) ?? [];
  const primaryCartItem = matchingCartItems[0] ?? null;
  const quantityInCart = matchingCartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const quantityLabel =
    quantityInCart > 0
      ? formatProductQuantity(
          quantityInCart,
          primaryCartItem?.unit ?? resolvedProduct.unit,
          locale,
        )
      : null;
  const quantityStep = Math.max(
    primaryCartItem?.countStep ?? resolvedProduct.countStep,
    1,
  );
  const isActionPending =
    addCartItemMutation.isPending ||
    changeCartItemQuantityMutation.isPending ||
    removeCartItemMutation.isPending;
  const isSubmitDisabled =
    !resolvedProduct.isAvailable ||
    missingRequiredGroups.length > 0 ||
    addCartItemMutation.isPending;

  function addConfiguredProduct({ showToast }: { showToast: boolean }) {
    addCartItemMutation.mutate(
      {
        countStep: resolvedProduct.countStep,
        modifiers: selectedModifierOptions,
        productId: resolvedProduct.id,
        title: configuredTitle,
        unit: resolvedProduct.unit,
        unitPrice: selectedUnitPrice,
        variantId: selectedVariant?.id ?? resolvedProduct.defaultVariantId,
      },
      {
        onSuccess: () => {
          if (showToast) {
            toast.success(t("toast.itemAddedTitle"), {
              description: t("toast.itemAddedDescription", {
                name: configuredTitle,
              }),
            });
          }
        },
      },
    );
  }

  function decrementConfiguredProduct() {
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

  return (
    <section className="relative grid items-start gap-6 pb-32 xl:grid-cols-[minmax(0,1.04fr)_minmax(21rem,0.96fr)] xl:gap-8 xl:pb-10">
      <div className="space-y-4">
        <Button
          asChild
          className="w-fit rounded-full px-4"
          size="sm"
          variant="outline"
        >
          <Link href={backHref}>
            <ChevronLeft className="h-4 w-4" />
            {t("navigation.menu")}
          </Link>
        </Button>

        <Card className="overflow-hidden rounded-[32px] border-white/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_90%,white),color-mix(in_srgb,var(--secondary)_58%,white))]">
          <div className="relative aspect-[4/3] min-h-[280px] overflow-hidden sm:aspect-[16/11]">
            <Image
              alt={resolvedProduct.name}
              className="object-cover"
              fill
              sizes="(max-width: 1279px) 100vw, 720px"
              src={imageSrc}
              unoptimized
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,17,11,0.04),rgba(28,17,11,0.2))]" />
          </div>
        </Card>

        <Card className="rounded-[32px] border-white/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,white),color-mix(in_srgb,var(--secondary)_48%,white))]">
          <CardContent className="space-y-4 p-5 sm:p-7">
            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
                {resolvedProduct.name}
              </h1>

              <div className="flex flex-wrap items-end gap-3">
                <p className="font-heading text-foreground text-3xl leading-none font-semibold sm:text-[2.35rem]">
                  {formatCurrency(totalPrice, resolvedProduct.currency, locale)}
                </p>

                {selectedVariant ? (
                  <p className="text-muted-foreground text-sm leading-5">
                    {resolveVariantLabel(resolvedProduct, selectedVariant)}
                  </p>
                ) : null}
              </div>

              {modifiersTotal > 0 ? (
                <p className="text-muted-foreground text-sm leading-5">
                  {t("product.modifiersTotal")}:{" "}
                  {formatCurrency(
                    modifiersTotal,
                    resolvedProduct.currency,
                    locale,
                  )}
                </p>
              ) : null}
            </div>

            {resolvedProduct.description ? (
              <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">
                {resolvedProduct.description}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isDetailsLoading ? (
          <>
            <Card className="rounded-[30px]">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <Skeleton className="h-6 w-40 rounded-full" />
                <Skeleton className="h-16 rounded-[22px]" />
                <Skeleton className="h-16 rounded-[22px]" />
              </CardContent>
            </Card>

            <Card className="rounded-[30px]">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <Skeleton className="h-6 w-36 rounded-full" />
                <Skeleton className="h-14 rounded-[22px]" />
                <Skeleton className="h-14 rounded-[22px]" />
                <Skeleton className="h-14 rounded-[22px]" />
              </CardContent>
            </Card>
          </>
        ) : isDetailsError ? (
          <Card className="rounded-[30px]">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <p className="font-heading text-foreground text-2xl font-semibold">
                  {resolvedProduct.name}
                </p>
                <p className="text-muted-foreground text-sm leading-6">
                  {productDetailsQuery.error instanceof Error
                    ? productDetailsQuery.error.message
                    : t("product.loadError")}
                </p>
              </div>

              <Button
                className="rounded-2xl"
                onClick={() => productDetailsQuery.refetch()}
                size="lg"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                {t("shared.retry")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeVariants.length ? (
              <Card className="rounded-[30px]">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="space-y-1">
                    <h2 className="font-heading text-foreground text-2xl font-semibold">
                      {t("product.variantTitle")}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {t("product.selectOne")}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    {activeVariants.map((variant) => {
                      const isSelected = variant.id === selectedVariantId;

                      return (
                        <SelectableCard
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          selected={isSelected}
                        >
                          <div className="min-w-0">
                            <p className="text-foreground font-medium">
                              {resolveVariantLabel(resolvedProduct, variant)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-foreground text-sm font-semibold">
                              {formatCurrency(
                                variant.price ?? resolvedProduct.price,
                                resolvedProduct.currency,
                                locale,
                              )}
                            </span>
                            <SelectableCardIndicator
                              selected={isSelected}
                              size="md"
                            />
                          </div>
                        </SelectableCard>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {modifierGroups.map((group) => {
              const selectedIds = selectedModifierIdsByGroup[group.id] ?? [];
              const requiredSelections = getRequiredSelections(group);
              const isGroupInvalid = missingRequiredGroups.some(
                (candidate) => candidate.id === group.id,
              );

              return (
                <Card className="rounded-[30px]" key={group.id}>
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="font-heading text-foreground text-2xl font-semibold">
                          {group.name}
                        </h2>
                        <p
                          className={cn(
                            "text-sm",
                            isGroupInvalid
                              ? "text-destructive"
                              : "text-muted-foreground",
                          )}
                        >
                          {describeModifierGroup(group, t)}
                        </p>
                      </div>

                      <Badge
                        variant={requiredSelections > 0 ? "default" : "outline"}
                      >
                        {requiredSelections > 0
                          ? t("product.required")
                          : t("product.optional")}
                      </Badge>
                    </div>

                    <div className="grid gap-2">
                      {group.options.map((option) => {
                        const isSelected = selectedIds.includes(option.id);

                        return (
                          <SelectableCard
                            key={option.id}
                            onClick={() =>
                              setSelectedModifierIdsByGroup((currentState) => ({
                                ...currentState,
                                [group.id]: getNextSelectedModifierIds(
                                  group,
                                  currentState[group.id] ?? [],
                                  option.id,
                                ),
                              }))
                            }
                            selected={isSelected}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-foreground font-medium">
                                  {option.name}
                                </span>
                                <SelectableCardIndicator
                                  selected={isSelected}
                                />
                              </div>

                              {option.description ? (
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {option.description}
                                </p>
                              ) : null}
                            </div>

                            <span className="text-foreground shrink-0 text-sm font-semibold">
                              {option.price > 0
                                ? `+${formatCurrency(
                                    option.price,
                                    resolvedProduct.currency,
                                    locale,
                                  )}`
                                : t("product.included")}
                            </span>
                          </SelectableCard>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      <div className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:w-[min(26rem,calc(100vw-3rem))]">
        <div className="bg-background/92 flex items-center justify-between gap-3 rounded-[30px] border border-white/70 p-3 shadow-[0_28px_80px_-30px_rgba(22,15,11,0.6)] backdrop-blur-xl sm:p-3.5">
          <div className="min-w-0 flex-1 px-1">
            <p className="text-muted-foreground text-[0.68rem] font-medium tracking-[0.24em] uppercase">
              {t("shared.total")}
            </p>
            <p className="font-heading text-foreground mt-1 text-2xl leading-none font-semibold">
              {formatCurrency(totalPrice, resolvedProduct.currency, locale)}
            </p>

            {selectedVariant ? (
              <p className="text-muted-foreground mt-1 truncate text-xs leading-5 sm:text-sm">
                {resolveVariantLabel(resolvedProduct, selectedVariant)}
              </p>
            ) : selectedSummary.length ? (
              <p className="text-muted-foreground mt-1 truncate text-xs leading-5 sm:text-sm">
                {selectedSummary.join(" · ")}
              </p>
            ) : null}
          </div>

          {primaryCartItem && quantityLabel ? (
            <div className="bg-secondary/70 flex shrink-0 items-center gap-2 rounded-[24px] p-1">
              <Button
                aria-label={t("product.decreaseQuantity")}
                className="h-10 w-10 shrink-0 rounded-[18px]"
                disabled={isActionPending}
                onClick={decrementConfiguredProduct}
                size="icon"
                type="button"
                variant="secondary"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="text-foreground min-w-[4.5rem] text-center text-sm font-semibold sm:min-w-[5rem]">
                {quantityLabel}
              </div>

              <Button
                aria-label={t("product.increaseQuantity")}
                className="h-10 w-10 shrink-0 rounded-[18px]"
                disabled={isActionPending || isSubmitDisabled}
                onClick={() => addConfiguredProduct({ showToast: false })}
                size="icon"
                type="button"
                variant="secondary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              className="h-12 shrink-0 rounded-[22px] px-4 text-sm sm:px-5"
              disabled={isSubmitDisabled}
              onClick={() => addConfiguredProduct({ showToast: true })}
              size="lg"
              type="button"
            >
              <ShoppingBag className="h-4 w-4" />
              {resolvedProduct.isAvailable
                ? t("product.addToCart")
                : t("product.unavailable")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
