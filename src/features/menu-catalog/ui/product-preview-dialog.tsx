"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, RefreshCw, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type {
  Product,
  ProductModifierGroup,
  ProductVariant,
} from "@/entities/product";
import { getProductCardImageSrc } from "@/entities/product/lib/product-card";
import { useAddStorefrontCartItemMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useMenuProductDetailsQuery } from "@/features/menu-catalog/hooks/use-menu-product-details-query";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/lib/styles";
import type { Locale } from "@/shared/types/common";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { useUiStore } from "@/store/ui-store";

type ProductPreviewDialogProps = {
  locale: Locale;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: Product;
};

type SelectedModifiersState = Record<string, string[]>;

function getActiveVariants(product: Product) {
  return product.variants.filter((variant) => variant.isActive);
}

function getRenderableModifierGroups(product: Product) {
  return product.modifierGroups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => option.isActive),
    }))
    .filter((group) => group.options.length > 0);
}

function getRequiredSelections(group: ProductModifierGroup) {
  return Math.max(group.minSelected, group.isRequired ? 1 : 0);
}

function getMaxSelections(group: ProductModifierGroup) {
  return group.maxSelected > 0 ? group.maxSelected : group.options.length;
}

function getDefaultVariantId(product: Product) {
  const activeVariants = getActiveVariants(product);

  if (!activeVariants.length) {
    return null;
  }

  return (
    activeVariants.find((variant) => variant.id === product.defaultVariantId)
      ?.id ??
    activeVariants[0]?.id ??
    null
  );
}

function createInitialModifierSelection(
  product: Product,
): SelectedModifiersState {
  const selections: SelectedModifiersState = {};

  for (const group of getRenderableModifierGroups(product)) {
    selections[group.id] = group.options
      .filter((option) => option.isDefault)
      .slice(0, getMaxSelections(group))
      .map((option) => option.id);
  }

  return selections;
}

function resolveVariantLabel(product: Product, variant: ProductVariant) {
  if (variant.title?.trim()) {
    return variant.title.trim();
  }

  const optionTitles = product.optionGroups.flatMap((group) =>
    group.values
      .filter((value) => variant.optionValueIds.includes(value.id))
      .map((value) => value.title),
  );

  return optionTitles.join(" · ") || product.name;
}

function getNextSelectedModifierIds(
  group: ProductModifierGroup,
  currentSelection: string[],
  optionId: string,
) {
  const requiredSelections = getRequiredSelections(group);
  const maxSelections = getMaxSelections(group);
  const isSelected = currentSelection.includes(optionId);

  if (maxSelections === 1) {
    if (isSelected) {
      return currentSelection.length > requiredSelections
        ? []
        : currentSelection;
    }

    return [optionId];
  }

  if (isSelected) {
    return currentSelection.length > requiredSelections
      ? currentSelection.filter((selectedId) => selectedId !== optionId)
      : currentSelection;
  }

  if (currentSelection.length >= maxSelections) {
    return currentSelection;
  }

  return [...currentSelection, optionId];
}

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

export function ProductPreviewDialog({
  locale,
  onOpenChange,
  open,
  product,
}: ProductPreviewDialogProps) {
  const { tenantSlug } = useStorefrontRoute();
  const { data: storefrontCart } = useStorefrontCartQuery(tenantSlug);
  const addCartItemMutation = useAddStorefrontCartItemMutation(tenantSlug);
  const productDetailsQuery = useMenuProductDetailsQuery(
    product,
    tenantSlug,
    open,
  );
  const openCartSidebar = useUiStore((state) => state.openCartSidebar);
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
    open && !productDetailsQuery.data && productDetailsQuery.isPending;
  const isDetailsError =
    open && !productDetailsQuery.data && productDetailsQuery.isError;

  useEffect(() => {
    if (!open || isDetailsLoading || isDetailsError) {
      return;
    }

    setSelectedVariantId(getDefaultVariantId(resolvedProduct));
    setSelectedModifierIdsByGroup(
      createInitialModifierSelection(resolvedProduct),
    );
  }, [isDetailsError, isDetailsLoading, open, resolvedProduct]);

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
  const isSubmitDisabled =
    !resolvedProduct.isAvailable ||
    missingRequiredGroups.length > 0 ||
    addCartItemMutation.isPending;

  if (isDetailsLoading) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="border-border/70 bg-card overflow-hidden rounded-[30px] p-0 sm:max-w-[960px]">
          <div className="grid max-h-[calc(100vh-2rem)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative min-h-[280px] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.82),transparent_32%),linear-gradient(180deg,#f8ecdf_0%,#ead6c0_100%)]">
              <Image
                alt={product.name}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                src={getProductCardImageSrc(product)}
                unoptimized
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,17,11,0.08),rgba(28,17,11,0.4))]" />
            </div>

            <div className="bg-card flex min-h-0 flex-col">
              <div className="overflow-y-auto px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
                <DialogHeader className="gap-3">
                  <DialogTitle className="text-2xl leading-tight sm:text-[2rem]">
                    {product.name}
                  </DialogTitle>
                  <DialogDescription className="max-w-[42ch] text-sm leading-6 sm:text-[0.95rem]">
                    {t("product.loading")}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                  <Skeleton className="h-32 rounded-[28px]" />
                  <Skeleton className="h-40 rounded-[28px]" />
                  <Skeleton className="h-28 rounded-[28px]" />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isDetailsError) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="border-border/70 bg-card overflow-hidden rounded-[30px] p-0 sm:max-w-[960px]">
          <div className="grid max-h-[calc(100vh-2rem)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative min-h-[280px] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.82),transparent_32%),linear-gradient(180deg,#f8ecdf_0%,#ead6c0_100%)]">
              <Image
                alt={product.name}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                src={getProductCardImageSrc(product)}
                unoptimized
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,17,11,0.08),rgba(28,17,11,0.4))]" />
            </div>

            <div className="bg-card flex min-h-0 flex-col">
              <div className="flex flex-1 flex-col justify-center px-5 py-5 sm:px-6 sm:py-6">
                <DialogHeader className="gap-3">
                  <DialogTitle className="text-2xl leading-tight sm:text-[2rem]">
                    {product.name}
                  </DialogTitle>
                  <DialogDescription className="max-w-[42ch] text-sm leading-6 sm:text-[0.95rem]">
                    {productDetailsQuery.error instanceof Error
                      ? productDetailsQuery.error.message
                      : t("product.loadError")}
                  </DialogDescription>
                </DialogHeader>

                <Button
                  className="mt-6 w-full rounded-2xl sm:w-auto"
                  onClick={() => productDetailsQuery.refetch()}
                  size="lg"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("shared.retry")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="border-border/70 bg-card overflow-hidden rounded-[30px] p-0 sm:max-w-[960px]">
        <div className="grid max-h-[calc(100vh-2rem)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="relative min-h-[280px] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.82),transparent_32%),linear-gradient(180deg,#f8ecdf_0%,#ead6c0_100%)]">
            <Image
              alt={resolvedProduct.name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              src={imageSrc}
              unoptimized
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,17,11,0.08),rgba(28,17,11,0.4))]" />

            <div className="bg-background/84 absolute inset-x-5 bottom-5 rounded-[28px] border border-white/60 p-4 shadow-[0_24px_60px_-32px_rgba(24,16,11,0.6)] backdrop-blur-md">
              <p className="text-muted-foreground text-xs font-medium tracking-[0.26em] uppercase">
                {activeVariants.length
                  ? t("product.variantTitle")
                  : t("shared.total")}
              </p>
              <p className="font-heading text-foreground mt-2 text-3xl leading-none font-semibold">
                {formatCurrency(
                  selectedUnitPrice,
                  resolvedProduct.currency,
                  locale,
                )}
              </p>
              {selectedVariant ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {resolveVariantLabel(resolvedProduct, selectedVariant)}
                </p>
              ) : resolvedProduct.isAvailable ? null : (
                <p className="text-muted-foreground mt-2 text-sm">
                  {t("product.unavailable")}
                </p>
              )}
            </div>
          </div>

          <div className="bg-card flex min-h-0 flex-col">
            <div className="overflow-y-auto px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
              <DialogHeader className="gap-3">
                <DialogTitle className="text-2xl leading-tight sm:text-[2rem]">
                  {resolvedProduct.name}
                </DialogTitle>
                {resolvedProduct.description ? (
                  <DialogDescription className="max-w-[42ch] text-sm leading-6 sm:text-[0.95rem]">
                    {resolvedProduct.description}
                  </DialogDescription>
                ) : null}
              </DialogHeader>

              <div className="mt-6 space-y-4">
                {activeVariants.length ? (
                  <section className="border-border/70 bg-background/70 rounded-[28px] border p-4 shadow-[0_20px_40px_-36px_rgba(31,26,23,0.55)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading text-foreground text-lg font-semibold">
                          {t("product.variantTitle")}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {t("product.selectOne")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {activeVariants.map((variant) => {
                        const isSelected = variant.id === selectedVariantId;

                        return (
                          <button
                            aria-pressed={isSelected}
                            className={cn(
                              "focus-visible:ring-ring flex items-center justify-between gap-3 rounded-[22px] border px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                              isSelected
                                ? "border-primary bg-primary/6 shadow-[0_18px_30px_-24px_rgba(214,92,38,0.55)]"
                                : "border-border/70 bg-card hover:border-foreground/20 hover:bg-background",
                            )}
                            key={variant.id}
                            onClick={() => setSelectedVariantId(variant.id)}
                            type="button"
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
                              <span
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full border",
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border/80 bg-background text-transparent",
                                )}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {modifierGroups.map((group) => {
                  const selectedIds =
                    selectedModifierIdsByGroup[group.id] ?? [];
                  const maxSelections = getMaxSelections(group);
                  const requiredSelections = getRequiredSelections(group);
                  const isGroupInvalid = missingRequiredGroups.some(
                    (candidate) => candidate.id === group.id,
                  );

                  return (
                    <section
                      className="border-border/70 bg-background/70 rounded-[28px] border p-4 shadow-[0_20px_40px_-36px_rgba(31,26,23,0.55)]"
                      key={group.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading text-foreground text-lg font-semibold">
                            {group.name}
                          </h3>
                          <p
                            className={cn(
                              "mt-1 text-sm",
                              isGroupInvalid
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            {describeModifierGroup(group, t)}
                          </p>
                        </div>

                        <span className="border-border/70 bg-card text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium">
                          {requiredSelections > 0
                            ? t("product.required")
                            : t("product.optional")}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2">
                        {group.options.map((option) => {
                          const isSelected = selectedIds.includes(option.id);
                          const isDisabled =
                            !isSelected && selectedIds.length >= maxSelections;

                          return (
                            <button
                              aria-pressed={isSelected}
                              className={cn(
                                "focus-visible:ring-ring flex items-center justify-between gap-3 rounded-[22px] border px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55",
                                isSelected
                                  ? "border-primary bg-primary/6 shadow-[0_18px_30px_-24px_rgba(214,92,38,0.55)]"
                                  : "border-border/70 bg-card hover:border-foreground/20 hover:bg-background",
                              )}
                              disabled={isDisabled}
                              key={option.id}
                              onClick={() =>
                                setSelectedModifierIdsByGroup(
                                  (currentState) => ({
                                    ...currentState,
                                    [group.id]: getNextSelectedModifierIds(
                                      group,
                                      currentState[group.id] ?? [],
                                      option.id,
                                    ),
                                  }),
                                )
                              }
                              type="button"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-foreground font-medium">
                                    {option.name}
                                  </span>
                                  <span
                                    className={cn(
                                      "flex h-5 w-5 items-center justify-center rounded-full border",
                                      isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border/80 bg-background text-transparent",
                                    )}
                                  >
                                    <Check className="h-3 w-3" />
                                  </span>
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
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            <div className="border-border/70 bg-card border-t px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
              {selectedSummary.length ? (
                <p className="text-muted-foreground mb-3 truncate text-sm">
                  {selectedSummary.join(" · ")}
                </p>
              ) : null}

              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("shared.total")}
                  </p>
                  <p className="font-heading text-foreground mt-1 text-2xl leading-none font-semibold">
                    {formatCurrency(
                      totalPrice,
                      resolvedProduct.currency,
                      locale,
                    )}
                  </p>
                </div>

                {modifiersTotal > 0 ? (
                  <p className="text-muted-foreground text-right text-sm">
                    {t("product.modifiersTotal")}:{" "}
                    {formatCurrency(
                      modifiersTotal,
                      resolvedProduct.currency,
                      locale,
                    )}
                  </p>
                ) : null}
              </div>

              <Button
                className="h-12 w-full rounded-2xl text-base"
                disabled={isSubmitDisabled}
                onClick={() => {
                  const hadItems = (storefrontCart?.itemsCount ?? 0) > 0;

                  addCartItemMutation.mutate(
                    {
                      modifiers: selectedModifierOptions,
                      productId: resolvedProduct.id,
                      title: configuredTitle,
                      unitPrice: selectedUnitPrice,
                      variantId:
                        selectedVariant?.id ??
                        resolvedProduct.defaultVariantId ??
                        null,
                    },
                    {
                      onSuccess: () => {
                        toast.success(t("toast.itemAddedTitle"), {
                          description: t("toast.itemAddedDescription", {
                            name: configuredTitle,
                          }),
                        });
                        onOpenChange(false);

                        if (!hadItems) {
                          openCartSidebar();
                        }
                      },
                    },
                  );
                }}
                size="lg"
              >
                <ShoppingBag className="h-4 w-4" />
                {resolvedProduct.isAvailable
                  ? t("product.addToCart")
                  : t("product.unavailable")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
