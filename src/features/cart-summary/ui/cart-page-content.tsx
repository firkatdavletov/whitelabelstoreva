"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getProductCardImageSrc } from "@/entities/product/lib/product-card";
import {
  useChangeStorefrontCartItemQuantityMutation,
  useRemoveStorefrontCartItemMutation,
} from "@/features/cart-summary/hooks/use-storefront-cart-mutations";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useTenantTheme } from "@/features/tenant-theme";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import { formatProductQuantity } from "@/shared/lib/product-quantity";
import type { Locale } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

type CartProductPreview = {
  id: string;
  imageUrl: string | null;
  slug: string;
  visual: string;
};

type CartPageContentProps = {
  locale: Locale;
  products: CartProductPreview[];
};

function CartPageSkeleton() {
  return (
    <section className="space-y-6">
      <Skeleton className="h-9 w-28 rounded-full" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-12 w-56 rounded-3xl" />
            <Skeleton className="h-5 w-full max-w-xl rounded-full" />
          </div>

          <Skeleton className="h-32 rounded-[28px]" />
          <Skeleton className="h-32 rounded-[28px]" />
          <Skeleton className="h-32 rounded-[28px]" />
        </div>

        <Skeleton className="h-64 rounded-[30px]" />
      </div>
    </section>
  );
}

export function CartPageContent({ locale, products }: CartPageContentProps) {
  const { href, tenantSlug } = useStorefrontRoute();
  const tenantConfig = useTenantTheme();
  const { data: storefrontCart, isLoading } =
    useStorefrontCartQuery(tenantSlug);
  const changeCartItemQuantityMutation =
    useChangeStorefrontCartItemQuantityMutation(tenantSlug);
  const removeCartItemMutation =
    useRemoveStorefrontCartItemMutation(tenantSlug);
  const { t } = useTranslation();

  const productPreviewById = new Map(
    products.map((product) => [product.id, product]),
  );
  const isActionPending =
    changeCartItemQuantityMutation.isPending ||
    removeCartItemMutation.isPending;

  if (isLoading && !storefrontCart) {
    return <CartPageSkeleton />;
  }

  if (!storefrontCart || !storefrontCart.items.length) {
    return (
      <section className="space-y-6">
        <Button
          asChild
          className="w-fit rounded-full px-4"
          size="sm"
          variant="outline"
        >
          <Link href={href("/menu")}>
            <ChevronLeft className="h-4 w-4" />
            {t("cart.back")}
          </Link>
        </Button>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
          <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_95%,white),color-mix(in_srgb,var(--secondary)_52%,white))] p-6 shadow-[0_24px_70px_-36px_rgba(31,26,23,0.45)] sm:p-8">
            <div className="bg-primary/10 text-primary mb-5 flex h-14 w-14 items-center justify-center rounded-[22px]">
              <ShoppingBag className="h-6 w-6" />
            </div>

            <div className="space-y-3">
              <p className="text-muted-foreground text-[0.7rem] font-medium tracking-[0.22em] uppercase">
                {t("cart.summary")}
              </p>
              <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                {t("cart.title")}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">
                {t("cart.empty")}
              </p>
            </div>

            <Button asChild className="mt-8 rounded-full px-5" size="lg">
              <Link href={href("/menu")}>{t("cart.continue")}</Link>
            </Button>
          </div>

          <aside className="xl:sticky xl:top-24">
            <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_93%,white),color-mix(in_srgb,var(--background)_72%,white))] p-5 shadow-[0_22px_60px_-38px_rgba(24,19,15,0.4)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-[0.7rem] font-medium tracking-[0.22em] uppercase">
                    {t("shared.total")}
                  </p>
                  <p className="font-heading text-3xl font-semibold tracking-tight">
                    {formatCurrency(0, tenantConfig.currency, locale)}
                  </p>
                </div>
                <Badge className="min-w-10 justify-center rounded-full px-3 py-1.5">
                  0
                </Badge>
              </div>

              <p className="text-muted-foreground mt-4 text-sm leading-6">
                {t("cart.subtitle")}
              </p>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          asChild
          className="w-fit rounded-full px-4"
          size="sm"
          variant="outline"
        >
          <Link href={href("/menu")}>
            <ChevronLeft className="h-4 w-4" />
            {t("cart.back")}
          </Link>
        </Button>

        <Badge className="min-w-10 justify-center rounded-full px-3 py-1.5">
          {storefrontCart.itemsCount}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-muted-foreground text-[0.7rem] font-medium tracking-[0.22em] uppercase">
              {t("cart.summary")}
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("cart.title")}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">
              {t("cart.subtitle")}
            </p>
          </div>

          <div className="space-y-3">
            {storefrontCart.items.map((item) => {
              const productPreview = productPreviewById.get(item.productId);
              const productHref = productPreview
                ? href(`/menu/${productPreview.slug}`)
                : href("/menu");
              const quantityStep = Math.max(item.countStep, 1);

              return (
                <article
                  className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_94%,white),color-mix(in_srgb,var(--background)_78%,white))] p-4 shadow-[0_22px_60px_-40px_rgba(31,26,23,0.4)] sm:p-5"
                  key={item.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      className="group flex min-w-0 items-center gap-4"
                      href={productHref}
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] bg-[color-mix(in_srgb,var(--secondary)_74%,white)]">
                        <Image
                          alt={item.title}
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                          fill
                          sizes="80px"
                          src={getProductCardImageSrc(
                            productPreview ?? {
                              imageUrl: null,
                              visual: item.title,
                            },
                          )}
                          unoptimized
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <p className="font-heading text-lg leading-5 font-semibold tracking-tight sm:text-[1.35rem] sm:leading-6">
                          {item.title}
                        </p>
                        {item.modifierNames.length ? (
                          <p className="text-muted-foreground truncate text-sm">
                            {item.modifierNames.join(" · ")}
                          </p>
                        ) : null}
                        <p className="text-muted-foreground text-sm">
                          {formatCurrency(
                            item.lineTotal,
                            tenantConfig.currency,
                            locale,
                          )}
                        </p>
                      </div>
                    </Link>

                    <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <p className="font-heading text-xl font-semibold tracking-tight">
                        {formatCurrency(
                          item.lineTotal,
                          tenantConfig.currency,
                          locale,
                        )}
                      </p>

                      <div className="bg-secondary/72 flex items-center gap-1 rounded-full p-1">
                        <Button
                          aria-label={t("product.decreaseQuantity")}
                          className="h-9 w-9 rounded-full"
                          disabled={isActionPending}
                          onClick={() => {
                            const nextQuantity = item.quantity - quantityStep;

                            if (nextQuantity <= 0) {
                              removeCartItemMutation.mutate(item.id);
                              return;
                            }

                            changeCartItemQuantityMutation.mutate({
                              itemId: item.id,
                              quantity: nextQuantity,
                            });
                          }}
                          size="icon"
                          type="button"
                          variant="secondary"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="min-w-[5rem] text-center text-sm font-semibold">
                          {formatProductQuantity(
                            item.quantity,
                            item.unit,
                            locale,
                          )}
                        </span>

                        <Button
                          aria-label={t("product.increaseQuantity")}
                          className="h-9 w-9 rounded-full"
                          disabled={isActionPending}
                          onClick={() =>
                            changeCartItemQuantityMutation.mutate({
                              itemId: item.id,
                              quantity: item.quantity + quantityStep,
                            })
                          }
                          size="icon"
                          type="button"
                          variant="secondary"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="xl:sticky xl:top-24">
          <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_93%,white),color-mix(in_srgb,var(--secondary)_48%,white))] p-5 shadow-[0_24px_70px_-40px_rgba(24,19,15,0.42)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-[0.7rem] font-medium tracking-[0.22em] uppercase">
                  {t("shared.total")}
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {formatCurrency(
                    storefrontCart.totalPrice,
                    tenantConfig.currency,
                    locale,
                  )}
                </p>
              </div>
              <Badge
                className="min-w-10 justify-center rounded-full px-3 py-1.5"
                variant="outline"
              >
                {storefrontCart.itemsCount}
              </Badge>
            </div>

            <p className="text-muted-foreground mt-4 text-sm leading-6">
              {t("cart.subtitle")}
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-dashed border-black/10 pt-4 text-sm">
              <span className="text-muted-foreground">{t("shared.total")}</span>
              <span className="font-semibold">
                {formatCurrency(
                  storefrontCart.totalPrice,
                  tenantConfig.currency,
                  locale,
                )}
              </span>
            </div>

            <Button asChild className="mt-6 w-full rounded-2xl" size="lg">
              <Link href={href("/checkout")}>{t("cart.checkout")}</Link>
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
