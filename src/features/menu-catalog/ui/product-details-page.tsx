"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import {
  getProductImageSources,
  getProductThumbnailImageSrc,
  getProductVariantImageSources,
} from "@/entities/product/lib/product-card";
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
import { trackCommerceEvent } from "@/shared/analytics/analytics";
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

type GalleryThumbnailImageProps = {
  alt: string;
  src: string;
};

function createGalleryImageLabel(label: string, index: number) {
  return index === 0 ? label : `${label} ${index + 1}`;
}

function createGalleryImages(
  sources: string[],
  idPrefix: string,
  baseLabel: string,
): ProductGalleryImage[] {
  return sources.map((src, index) => ({
    id: `${idPrefix}:${index}`,
    src,
    thumbnailLabel: createGalleryImageLabel(baseLabel, index),
  }));
}

function mergeGalleryImages(...groups: ProductGalleryImage[][]) {
  const seenSources = new Set<string>();

  return groups.flatMap((group) =>
    group.filter((image) => {
      if (seenSources.has(image.src)) {
        return false;
      }

      seenSources.add(image.src);
      return true;
    }),
  );
}

function GalleryThumbnailImage({ alt, src }: GalleryThumbnailImageProps) {
  const thumbnailSrc = getProductThumbnailImageSrc(src);
  const [resolvedSrc, setResolvedSrc] = useState(thumbnailSrc);

  useEffect(() => {
    setResolvedSrc(thumbnailSrc);
  }, [thumbnailSrc]);

  return (
    <Image
      alt={alt}
      className="block h-full w-full object-contain"
      height={128}
      onError={() => {
        setResolvedSrc((currentSrc) =>
          currentSrc === src ? currentSrc : src,
        );
      }}
      src={resolvedSrc}
      unoptimized
      width={96}
    />
  );
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
    useState<SelectedOptionsState>(() => createInitialOptionSelection(product));
  const [selectedModifierIdsByGroup, setSelectedModifierIdsByGroup] =
    useState<SelectedModifiersState>(() =>
      createInitialModifierSelection(product),
    );
  const [selectedGalleryImageId, setSelectedGalleryImageId] = useState(
    `product:${product.id}:0`,
  );
  const [hasSelectedVariantOption, setHasSelectedVariantOption] =
    useState(false);
  const autoSelectedVariantIdRef = useRef<string | null>(null);
  const trackedProductIdRef = useRef<string | null>(null);
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
    setHasSelectedVariantOption(false);
    autoSelectedVariantIdRef.current = null;
    setSelectedGalleryImageId(`product:${resolvedProduct.id}:0`);
  }, [resolvedProduct]);

  useEffect(() => {
    if (trackedProductIdRef.current === resolvedProduct.id) {
      return;
    }

    trackedProductIdRef.current = resolvedProduct.id;

    trackCommerceEvent({
      currency: resolvedProduct.currency,
      event: "view_item",
      items: [
        {
          currency: resolvedProduct.currency,
          itemId: resolvedProduct.id,
          itemName: resolvedProduct.name,
          price: resolvedProduct.price,
        },
      ],
      value: resolvedProduct.price,
    });
  }, [
    resolvedProduct.currency,
    resolvedProduct.id,
    resolvedProduct.name,
    resolvedProduct.price,
  ]);

  const activeVariants = getActiveVariants(resolvedProduct);
  const modifierGroups = getRenderableModifierGroups(resolvedProduct);
  const selectedVariant = resolveVariantForSelectedOptions(
    resolvedProduct,
    selectedOptionIdByGroup,
  );
  const selectedOptionSummary = resolvedProduct.optionGroups
    .map((group) =>
      group.values.find(
        (value) => value.id === selectedOptionIdByGroup[group.id],
      ),
    )
    .filter((value): value is { id: string; title: string } => Boolean(value))
    .map((value) => value.title);
  const isVariantSelectionUnavailable =
    activeVariants.length > 0 &&
    resolvedProduct.optionGroups.length > 0 &&
    selectedVariant === null;
  const selectedVariantIdForCart =
    activeVariants.length > 0 ? (selectedVariant?.id ?? null) : null;
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
  const productGalleryImages = createGalleryImages(
    getProductImageSources(resolvedProduct),
    `product:${resolvedProduct.id}`,
    t("product.mainImage"),
  );
  const firstProductGalleryImageId =
    productGalleryImages[0]?.id ?? `product:${resolvedProduct.id}:0`;
  const selectedVariantLabel = selectedVariant
    ? resolveVariantLabel(resolvedProduct, selectedVariant)
    : null;
  const selectedHeaderSummary =
    selectedVariantLabel ??
    (selectedOptionSummary.length ? selectedOptionSummary.join(" · ") : null);
  const selectedVariantImageSources = selectedVariant
    ? getProductVariantImageSources(selectedVariant)
    : [];
  const selectedVariantPrimaryGalleryImageId =
    selectedVariant && selectedVariantImageSources.length
      ? `variant:${selectedVariant.id}:0`
      : null;
  const selectedVariantGalleryImages =
    selectedVariant && selectedVariantImageSources.length
      ? createGalleryImages(
          selectedVariantImageSources,
          `variant:${selectedVariant.id}`,
          selectedVariantLabel
            ? `${t("product.variantImage")}: ${selectedVariantLabel}`
            : t("product.variantImage"),
        )
      : [];
  const allGalleryImages = mergeGalleryImages(
    productGalleryImages,
    activeVariants.flatMap((variant) => {
      const variantImageSources = getProductVariantImageSources(variant);

      if (!variantImageSources.length) {
        return [];
      }

      const variantLabel = resolveVariantLabel(resolvedProduct, variant);

      return createGalleryImages(
        variantImageSources,
        `variant:${variant.id}`,
        variantLabel
          ? `${t("product.variantImage")}: ${variantLabel}`
          : t("product.variantImage"),
      );
    }),
  );
  const selectedGalleryImage =
    allGalleryImages.find((image) => image.id === selectedGalleryImageId) ??
    null;
  const galleryImages = mergeGalleryImages(
    productGalleryImages,
    selectedGalleryImage ? [selectedGalleryImage] : [],
    selectedVariantGalleryImages,
  );
  const activeGalleryImage =
    galleryImages.find((image) => image.id === selectedGalleryImageId) ??
    selectedGalleryImage ??
    galleryImages.find((image) => image.id === firstProductGalleryImageId) ??
    galleryImages[0];
  const activeGalleryIndex = Math.max(
    galleryImages.findIndex((image) => image.id === activeGalleryImage.id),
    0,
  );
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
    if (!selectedVariant) {
      autoSelectedVariantIdRef.current = null;
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (!hasSelectedVariantOption || !selectedVariant) {
      return;
    }

    if (autoSelectedVariantIdRef.current === selectedVariant.id) {
      return;
    }

    if (!selectedVariantPrimaryGalleryImageId) {
      autoSelectedVariantIdRef.current = selectedVariant.id;
      return;
    }

    autoSelectedVariantIdRef.current = selectedVariant.id;
    setSelectedGalleryImageId((currentState) =>
      currentState === selectedVariantPrimaryGalleryImageId
        ? currentState
        : selectedVariantPrimaryGalleryImageId,
    );
  }, [
    hasSelectedVariantOption,
    selectedVariant,
    selectedVariantPrimaryGalleryImageId,
  ]);

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
          trackCommerceEvent({
            currency: resolvedProduct.currency,
            event: "add_to_cart",
            items: [
              {
                currency: resolvedProduct.currency,
                itemId: resolvedProduct.id,
                itemName: configuredTitle,
                price: totalPrice,
                quantity: resolvedProduct.countStep,
              },
            ],
            value: totalPrice * resolvedProduct.countStep,
          });

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

    setSelectedGalleryImageId(
      galleryImages[nextIndex]?.id ?? selectedGalleryImageId,
    );
  }

  return (
    <section className="relative space-y-4 pb-32 xl:pb-10">
      <Button
        asChild
        className="w-fit rounded-[var(--radius-pill)] px-4"
        size="sm"
        variant="outline"
      >
        <Link href={backHref}>
          <ChevronLeft className="h-4 w-4" />
          {t("cart.back")}
        </Link>
      </Button>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.04fr)_minmax(21rem,0.96fr)] xl:gap-8">
        <div className="min-w-0 space-y-4">
        <Card className="overflow-hidden rounded-3xl border-white/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_90%,white),color-mix(in_srgb,var(--secondary)_58%,white))]">
          <div className="relative">
            {galleryImages.length > 1 ? (
              <>
                <button
                  aria-label={t("product.previousImage")}
                  className="bg-background/84 text-foreground hover:bg-background absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-[var(--radius-pill)] border border-white/70 p-2 shadow-[0_12px_30px_-18px_rgba(22,15,11,0.45)] backdrop-blur-sm transition"
                  onClick={() => stepGallery(-1)}
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  aria-label={t("product.nextImage")}
                  className="bg-background/84 text-foreground hover:bg-background absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-[var(--radius-pill)] border border-white/70 p-2 shadow-[0_12px_30px_-18px_rgba(22,15,11,0.45)] backdrop-blur-sm transition"
                  onClick={() => stepGallery(1)}
                  type="button"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}

            <div className="aspect-[4/5] w-full overflow-hidden">
              <Image
                alt={resolvedProduct.name}
                className="block h-full w-full object-cover object-center"
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

        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {galleryImages.map((image) => {
            const isSelected = image.id === activeGalleryImage.id;

            return (
              <button
                aria-label={image.thumbnailLabel}
                aria-pressed={isSelected}
                className={cn(
                  "bg-card hover:border-foreground/20 aspect-[3/4] w-16 shrink-0 overflow-hidden border transition sm:w-20",
                  isSelected
                    ? "border-primary shadow-[0_12px_28px_-18px_rgba(214,92,38,0.5)]"
                    : "border-border/70",
                )}
                key={image.id}
                onClick={() => showGalleryImage(image.id)}
                type="button"
              >
                <GalleryThumbnailImage alt="" src={image.src} />
              </button>
            );
          })}
        </div>
        </div>

        <div className="min-w-0 space-y-4">
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
                              onClick={() => {
                                if (value.id === selectedValueId) {
                                  return;
                                }

                                setHasSelectedVariantOption(true);
                                setSelectedOptionIdByGroup((currentState) => ({
                                  ...currentState,
                                  [group.id]: value.id,
                                }));
                              }}
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
