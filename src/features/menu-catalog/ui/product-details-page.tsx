"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
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
  createInitialOptionSelection,
  getActiveVariants,
  getMaxSelections,
  getNextSelectedModifierIds,
  getRenderableModifierGroups,
  getRequiredSelections,
  resolveVariantForSelectedOptions,
  resolveVariantLabel,
  type SelectedModifiersState,
  type SelectedOptionsState,
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

type ProductGalleryImage = {
  id: string;
  src: string;
  thumbnailLabel: string;
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
  const [selectedOptionIdByGroup, setSelectedOptionIdByGroup] =
    useState<SelectedOptionsState>(() =>
      createInitialOptionSelection(product),
    );
  const [selectedModifierIdsByGroup, setSelectedModifierIdsByGroup] =
    useState<SelectedModifiersState>(() =>
      createInitialModifierSelection(product),
    );
  const [selectedGalleryImageId, setSelectedGalleryImageId] = useState(
    `product:${product.id}`,
  );
  const [imageSizeBySrc, setImageSizeBySrc] = useState<
    Record<string, { height: number; width: number }>
  >({});
  const resolvedProduct = productDetailsQuery.data ?? product;
  const isDetailsLoading =
    productDetailsQuery.isPending && !productDetailsQuery.data;
  const isDetailsError =
    productDetailsQuery.isError && !productDetailsQuery.data;

  useEffect(() => {
    setSelectedOptionIdByGroup(createInitialOptionSelection(resolvedProduct));
    setSelectedModifierIdsByGroup(
      createInitialModifierSelection(resolvedProduct),
    );
  }, [resolvedProduct]);

  const activeVariants = getActiveVariants(resolvedProduct);
  const modifierGroups = getRenderableModifierGroups(resolvedProduct);
  const selectedVariant = resolveVariantForSelectedOptions(
    resolvedProduct,
    selectedOptionIdByGroup,
  );
  const selectedOptionSummary = resolvedProduct.optionGroups
    .map((group) =>
      group.values.find((value) => value.id === selectedOptionIdByGroup[group.id]),
    )
    .filter((value): value is { id: string; title: string } => Boolean(value))
    .map((value) => value.title);
  const isVariantSelectionUnavailable =
    activeVariants.length > 0 &&
    resolvedProduct.optionGroups.length > 0 &&
    selectedVariant === null;
  const selectedVariantIdForCart =
    activeVariants.length > 0 ? selectedVariant?.id ?? null : null;
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
  const productImageSrc = getProductCardImageSrc(resolvedProduct);
  const selectedVariantLabel = selectedVariant
    ? resolveVariantLabel(resolvedProduct, selectedVariant)
    : null;
  const selectedHeaderSummary =
    selectedVariantLabel ??
    (selectedOptionSummary.length ? selectedOptionSummary.join(" · ") : null);
  const galleryImages: ProductGalleryImage[] = [
    {
      id: `product:${resolvedProduct.id}`,
      src: productImageSrc,
      thumbnailLabel: t("product.mainImage"),
    },
  ];
  const activeVariantGalleryImageId =
    selectedVariant?.id &&
    selectedVariant.imageUrl &&
    selectedVariant.imageUrl !== productImageSrc
      ? `variant:${selectedVariant.id}`
      : null;

  if (activeVariantGalleryImageId && selectedVariant?.imageUrl) {
    galleryImages.push({
      id: activeVariantGalleryImageId,
      src: selectedVariant.imageUrl,
      thumbnailLabel: selectedVariantLabel
        ? `${t("product.variantImage")}: ${selectedVariantLabel}`
        : t("product.variantImage"),
    });
  }

  const activeGalleryIndex = Math.max(
    galleryImages.findIndex((image) => image.id === selectedGalleryImageId),
    0,
  );
  const activeGalleryImage = galleryImages[activeGalleryIndex] ?? galleryImages[0];
  const activeImageSize = imageSizeBySrc[activeGalleryImage.src] ?? {
    height: 1200,
    width: 1200,
  };
  const configuredTitle = selectedVariant
    ? `${resolvedProduct.name} · ${selectedVariantLabel}`
    : resolvedProduct.name;
  const selectedConfigurationKey = createCartConfigurationKey({
    modifiers: selectedModifierOptions,
    productId: resolvedProduct.id,
    variantId: selectedVariantIdForCart,
  });
  const matchingCartItems =
    selectedVariantIdForCart === null && activeVariants.length > 0
      ? []
      : (storefrontCart?.items.filter(
          (item) =>
            createCartConfigurationKey({
              modifiers: item.modifiers,
              productId: item.productId,
              variantId: item.variantId,
            }) === selectedConfigurationKey,
        ) ?? []);
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
    isVariantSelectionUnavailable ||
    missingRequiredGroups.length > 0 ||
    addCartItemMutation.isPending;

  useEffect(() => {
    if (activeVariantGalleryImageId) {
      setSelectedGalleryImageId(activeVariantGalleryImageId);
      return;
    }

    setSelectedGalleryImageId(`product:${resolvedProduct.id}`);
  }, [activeVariantGalleryImageId, resolvedProduct.id]);

  function addConfiguredProduct({ showToast }: { showToast: boolean }) {
    addCartItemMutation.mutate(
      {
        countStep: resolvedProduct.countStep,
        modifiers: selectedModifierOptions,
        productId: resolvedProduct.id,
        title: configuredTitle,
        unit: resolvedProduct.unit,
        unitPrice: selectedUnitPrice,
        variantId: selectedVariantIdForCart,
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

  function showGalleryImage(imageId: string) {
    setSelectedGalleryImageId(imageId);
  }

  function stepGallery(direction: -1 | 1) {
    const nextIndex =
      (activeGalleryIndex + direction + galleryImages.length) %
      galleryImages.length;

    setSelectedGalleryImageId(galleryImages[nextIndex]?.id ?? selectedGalleryImageId);
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
            {t("cart.back")}
          </Link>
        </Button>

        <Card className="overflow-hidden rounded-3xl border-white/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_90%,white),color-mix(in_srgb,var(--secondary)_58%,white))]">
          <div className="relative">
            {galleryImages.length > 1 ? (
              <>
                <button
                  aria-label={t("product.previousImage")}
                  className="bg-background/84 text-foreground hover:bg-background absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full border border-white/70 p-2 shadow-[0_12px_30px_-18px_rgba(22,15,11,0.45)] backdrop-blur-sm transition"
                  onClick={() => stepGallery(-1)}
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  aria-label={t("product.nextImage")}
                  className="bg-background/84 text-foreground hover:bg-background absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full border border-white/70 p-2 shadow-[0_12px_30px_-18px_rgba(22,15,11,0.45)] backdrop-blur-sm transition"
                  onClick={() => stepGallery(1)}
                  type="button"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}

            <div className="w-full">
              <Image
                alt={resolvedProduct.name}
                className="block h-auto w-full object-contain"
                height={activeImageSize.height}
                onLoad={(event) => {
                  const nextHeight = event.currentTarget.naturalHeight;
                  const nextWidth = event.currentTarget.naturalWidth;

                  if (!nextHeight || !nextWidth) {
                    return;
                  }

                  setImageSizeBySrc((currentState) => {
                    const currentSize = currentState[activeGalleryImage.src];

                    if (
                      currentSize?.height === nextHeight &&
                      currentSize.width === nextWidth
                    ) {
                      return currentState;
                    }

                    return {
                      ...currentState,
                      [activeGalleryImage.src]: {
                        height: nextHeight,
                        width: nextWidth,
                      },
                    };
                  });
                }}
                sizes="(max-width: 1279px) 100vw, 50vw"
                src={activeGalleryImage.src}
                unoptimized
                width={activeImageSize.width}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((image) => {
            const isSelected = image.id === activeGalleryImage.id;

            return (
              <button
                aria-label={image.thumbnailLabel}
                aria-pressed={isSelected}
                className={cn(
                  "bg-card hover:border-foreground/20 overflow-hidden rounded-2xl border transition",
                  isSelected
                    ? "border-primary shadow-[0_12px_28px_-18px_rgba(214,92,38,0.5)]"
                    : "border-border/70",
                )}
                key={image.id}
                onClick={() => showGalleryImage(image.id)}
                type="button"
              >
                <Image
                  alt=""
                  className="block h-16 w-16 object-contain sm:h-20 sm:w-20"
                  height={96}
                  src={image.src}
                  unoptimized
                  width={96}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Card className="rounded-3xl border-white/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,white),color-mix(in_srgb,var(--secondary)_48%,white))]">
          <CardContent className="space-y-4 p-5 sm:p-7">
            <div className="space-y-3">
              <h1 className="font-heading text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
                {resolvedProduct.name}
              </h1>

              <div className="flex flex-wrap items-end gap-3">
                <p className="font-heading text-foreground text-3xl leading-none font-semibold sm:text-[2.35rem]">
                  {formatCurrency(totalPrice, resolvedProduct.currency, locale)}
                </p>

                {selectedHeaderSummary ? (
                  <p className="text-muted-foreground text-sm leading-5">
                    {selectedHeaderSummary}
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

        {isDetailsLoading ? (
          <>
            <Card className="rounded-3xl">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <Skeleton className="h-6 w-40 rounded-full" />
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <Skeleton className="h-6 w-36 rounded-full" />
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
              </CardContent>
            </Card>
          </>
        ) : isDetailsError ? (
          <Card className="rounded-3xl">
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
            {resolvedProduct.optionGroups.map((group) => {
              const selectedValueId = selectedOptionIdByGroup[group.id] ?? null;

              return (
                <Card className="rounded-3xl" key={group.id}>
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="space-y-1">
                      <h2 className="font-heading text-foreground text-2xl font-semibold">
                        {group.title}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {t("product.selectOne")}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      {group.values.map((value) => {
                        const isSelected = value.id === selectedValueId;

                        return (
                          <SelectableCard
                            key={value.id}
                            onClick={() =>
                              setSelectedOptionIdByGroup((currentState) => ({
                                ...currentState,
                                [group.id]: value.id,
                              }))
                            }
                            selected={isSelected}
                          >
                            <div className="min-w-0">
                              <p className="text-foreground font-medium">
                                {value.title}
                              </p>
                            </div>

                            <SelectableCardIndicator
                              selected={isSelected}
                              size="md"
                            />
                          </SelectableCard>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {modifierGroups.map((group) => {
              const selectedIds = selectedModifierIdsByGroup[group.id] ?? [];
              const requiredSelections = getRequiredSelections(group);
              const isGroupInvalid = missingRequiredGroups.some(
                (candidate) => candidate.id === group.id,
              );

              return (
                <Card className="rounded-3xl" key={group.id}>
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
        <div className="bg-background/92 flex items-center justify-between gap-3 rounded-3xl border border-white/70 p-3 shadow-[0_28px_80px_-30px_rgba(22,15,11,0.6)] backdrop-blur-xl sm:p-3.5">
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
            ) : selectedOptionSummary.length ? (
              <p className="text-muted-foreground mt-1 truncate text-xs leading-5 sm:text-sm">
                {selectedOptionSummary.join(" · ")}
              </p>
            ) : selectedSummary.length ? (
              <p className="text-muted-foreground mt-1 truncate text-xs leading-5 sm:text-sm">
                {selectedSummary.join(" · ")}
              </p>
            ) : null}
          </div>

          {primaryCartItem && quantityLabel ? (
            <div className="bg-secondary/70 flex shrink-0 items-center gap-2 rounded-xl p-1">
              <Button
                aria-label={t("product.decreaseQuantity")}
                className="h-10 w-10 shrink-0 rounded-md"
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
                className="h-10 w-10 shrink-0 rounded-md"
                disabled={isActionPending || isSubmitDisabled}
                onClick={() => addConfiguredProduct({ showToast: false })}
                size="icon"
                type="button"
                variant="secondary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : isVariantSelectionUnavailable ? (
            <p className="text-foreground shrink-0 px-2 text-sm font-semibold sm:text-base">
              {t("product.unavailable")}
            </p>
          ) : (
            <Button
              className="h-12 shrink-0 rounded-lg px-4 text-sm sm:px-5"
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
