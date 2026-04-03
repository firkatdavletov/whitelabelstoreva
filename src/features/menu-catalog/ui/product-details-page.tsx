"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronLeft, RefreshCw, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { Product, ProductModifierGroup } from "@/entities/product";
import { getProductCardImageSrc } from "@/entities/product/lib/product-card";
import { useAddStorefrontCartItemMutation } from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
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
import { cn } from "@/shared/lib/styles";
import type { Locale } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useUiStore } from "@/store/ui-store";

type ProductDetailsPageProps = {
  backHref: string;
  categoryName: string | null;
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
  categoryName,
  locale,
  product,
}: ProductDetailsPageProps) {
  const { tenantSlug } = useStorefrontRoute();
  const { data: storefrontCart } = useStorefrontCartQuery(tenantSlug);
  const addCartItemMutation = useAddStorefrontCartItemMutation(tenantSlug);
  const productDetailsQuery = useMenuProductDetailsQuery(
    product,
    tenantSlug,
    true,
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
  const isSubmitDisabled =
    !resolvedProduct.isAvailable ||
    missingRequiredGroups.length > 0 ||
    addCartItemMutation.isPending;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
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

        <div className="flex flex-wrap gap-2">
          {categoryName ? (
            <Badge variant="outline">{categoryName}</Badge>
          ) : null}
          <Badge
            className={cn(
              resolvedProduct.isAvailable
                ? "bg-accent/12 text-accent border-transparent"
                : "bg-destructive/12 text-destructive border-transparent",
            )}
          >
            {resolvedProduct.isAvailable
              ? t("product.available")
              : t("product.unavailable")}
          </Badge>
        </div>

        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
            {resolvedProduct.name}
          </h1>
          {resolvedProduct.description ? (
            <p className="text-muted-foreground max-w-xl text-sm leading-6 sm:text-base">
              {resolvedProduct.description}
            </p>
          ) : null}
        </div>

        <Card className="overflow-hidden rounded-[32px] border-white/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_90%,white),color-mix(in_srgb,var(--secondary)_58%,white))]">
          <div className="relative aspect-[4/3] min-h-[280px] overflow-hidden">
            <Image
              alt={resolvedProduct.name}
              className="object-cover"
              fill
              sizes="(max-width: 1279px) 100vw, 720px"
              src={imageSrc}
              unoptimized
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,17,11,0.08),rgba(28,17,11,0.32))]" />
            <div className="bg-background/84 absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-[24px] border border-white/60 p-4 shadow-[0_24px_60px_-32px_rgba(24,16,11,0.6)] backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-5">
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
                  {activeVariants.length
                    ? t("product.variantTitle")
                    : t("shared.total")}
                </p>
                <p className="font-heading text-foreground mt-2 text-3xl leading-none font-semibold sm:text-[2.15rem]">
                  {formatCurrency(
                    selectedUnitPrice,
                    resolvedProduct.currency,
                    locale,
                  )}
                </p>
              </div>

              {selectedVariant ? (
                <p className="text-foreground max-w-[14rem] text-right text-sm leading-5">
                  {resolveVariantLabel(resolvedProduct, selectedVariant)}
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {isDetailsLoading ? (
          <>
            <Card className="rounded-[30px]">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-10 w-40 rounded-2xl" />
                <Skeleton className="h-20 rounded-[24px]" />
              </CardContent>
            </Card>

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
            <Card className="rounded-[30px] border-white/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_52%,white),color-mix(in_srgb,var(--card)_92%,white))]">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
                      {t("shared.total")}
                    </p>
                    <p className="font-heading text-foreground mt-2 text-3xl leading-none font-semibold">
                      {formatCurrency(
                        totalPrice,
                        resolvedProduct.currency,
                        locale,
                      )}
                    </p>
                  </div>

                  {modifiersTotal > 0 ? (
                    <Badge variant="secondary">
                      {t("product.modifiersTotal")}:{" "}
                      {formatCurrency(
                        modifiersTotal,
                        resolvedProduct.currency,
                        locale,
                      )}
                    </Badge>
                  ) : null}
                </div>

                <p className="text-muted-foreground text-sm leading-6">
                  {selectedSummary.length
                    ? selectedSummary.join(" · ")
                    : selectedVariant
                      ? resolveVariantLabel(resolvedProduct, selectedVariant)
                      : resolvedProduct.description}
                </p>
              </CardContent>
            </Card>

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
                        <button
                          aria-pressed={isSelected}
                          className={cn(
                            "focus-visible:ring-ring flex items-center justify-between gap-3 rounded-[22px] border px-4 py-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
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
                          <button
                            aria-pressed={isSelected}
                            className={cn(
                              "focus-visible:ring-ring flex items-center justify-between gap-3 rounded-[22px] border px-4 py-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                              isSelected
                                ? "border-primary bg-primary/6 shadow-[0_18px_30px_-24px_rgba(214,92,38,0.55)]"
                                : "border-border/70 bg-card hover:border-foreground/20 hover:bg-background",
                            )}
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
                  </CardContent>
                </Card>
              );
            })}

            <Card className="rounded-[30px]">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {t("shared.total")}
                    </p>
                    <p className="font-heading text-foreground mt-1 text-3xl leading-none font-semibold">
                      {formatCurrency(
                        totalPrice,
                        resolvedProduct.currency,
                        locale,
                      )}
                    </p>
                  </div>

                  {selectedSummary.length ? (
                    <p className="text-muted-foreground max-w-[13rem] text-right text-sm leading-5">
                      {selectedSummary.join(" · ")}
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
                        countStep: resolvedProduct.countStep,
                        modifiers: selectedModifierOptions,
                        productId: resolvedProduct.id,
                        title: configuredTitle,
                        unit: resolvedProduct.unit,
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
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
