"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useOptimistic, useRef } from "react";
import { useTranslation } from "react-i18next";

import { AddToCartButton } from "@/features/add-to-cart";
import {
  buildMenuCategoryHref,
  getMenuCategoryProducts,
  resolveMenuCategory,
} from "@/features/menu-catalog/lib/catalog-navigation";
import type { Category } from "@/entities/category";
import type { Product } from "@/entities/product";
import { getProductCardImageSrc } from "@/entities/product/lib/product-card";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { formatCurrency } from "@/shared/lib/currency";
import type { Locale } from "@/shared/types/common";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type MenuGridProps = {
  activeCategorySlug: string | null;
  categories: Category[];
  emptyLabel: string;
  locale: Locale;
  products: Product[];
};

type MenuProductCardProps = {
  activeCategorySlug: string | null;
  locale: Locale;
  product: Product;
};

function MenuProductCard({
  activeCategorySlug,
  locale,
  product,
}: MenuProductCardProps) {
  const { href } = useStorefrontRoute();
  const { t } = useTranslation();
  const productHref = `${href(`/menu/${product.slug}`)}${
    activeCategorySlug
      ? `?category=${encodeURIComponent(activeCategorySlug)}`
      : ""
  }`;

  return (
    <Card className="group border-border/75 bg-card relative flex min-h-[244px] w-full max-w-[164px] flex-col overflow-hidden rounded-lg shadow-[0_18px_38px_-26px_rgba(31,26,23,0.42)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_54px_-28px_rgba(31,26,23,0.38)] md:min-h-[348px] md:max-w-[280px]">
      <Link
        aria-label={`${t("product.preview")} ${product.name}`}
        className="focus-visible:ring-ring absolute inset-0 z-10 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        href={productHref}
      >
        <span className="sr-only">{`${t("product.preview")} ${product.name}`}</span>
      </Link>

      <div className="bg-muted/38 relative aspect-[4/3] w-full overflow-hidden">
        <Image
          alt={product.name}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          sizes="(max-width: 767px) 164px, 280px"
          src={getProductCardImageSrc(product)}
          unoptimized
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(20,13,10,0.12))]" />
      </div>

      <div className="flex min-h-[121px] flex-1 flex-col px-3 pt-2.5 pb-3 md:min-h-[138px] md:px-4 md:pt-3.5 md:pb-4">
        <div className="space-y-1.5 md:space-y-2">
          <h3 className="font-heading [display:-webkit-box] overflow-hidden text-[0.95rem] leading-5 font-semibold tracking-tight [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:text-[1.22rem] md:leading-6">
            {product.name}
          </h3>

          <p className="font-heading text-[1.05rem] leading-none font-semibold md:text-[1.45rem]">
            {product.isConfigured
              ? t("product.priceFrom", {
                  price: formatCurrency(
                    product.price,
                    product.currency,
                    locale,
                  ),
                })
              : formatCurrency(product.price, product.currency, locale)}
          </p>

          <p className="text-muted-foreground [display:-webkit-box] h-8 overflow-hidden text-[0.72rem] leading-4 [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:h-10 md:text-xs md:leading-5">
            {product.description || " "}
          </p>
        </div>

        <AddToCartButton
          className="text-[0.78rem] md:text-sm"
          product={product}
          productHref={productHref}
        />
      </div>
    </Card>
  );
}

export function MenuGrid({
  activeCategorySlug,
  categories,
  emptyLabel,
  locale,
  products,
}: MenuGridProps) {
  const router = useRouter();
  const categoryButtonRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );
  const resolvedActiveCategory = resolveMenuCategory(
    categories,
    activeCategorySlug,
  );
  const [selectedCategorySlug, setSelectedCategorySlug] = useOptimistic<
    string | null,
    string | null
  >(
    resolvedActiveCategory?.slug ?? null,
    (_currentCategorySlug, nextCategorySlug) => nextCategorySlug,
  );
  const selectedCategory = resolveMenuCategory(
    categories,
    selectedCategorySlug,
  );
  const visibleProducts = getMenuCategoryProducts(
    products,
    selectedCategory?.id,
  );

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    categoryButtonRefs.current[selectedCategory.id]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [selectedCategory]);

  if (!products.length) {
    return (
      <div className="text-muted-foreground rounded-2xl border border-dashed px-4 py-8 text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      {categories.length ? (
        <div>
          <div
            aria-label="Catalog categories"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {categories.map((category) => {
              const isActive = category.id === selectedCategory?.id;

              return (
                <Button
                  aria-controls="menu-products-panel"
                  aria-pressed={isActive}
                  className="shrink-0 rounded-full"
                  key={category.id}
                  onClick={() => {
                    if (
                      category.slug === selectedCategory?.slug ||
                      typeof window === "undefined"
                    ) {
                      return;
                    }

                    const nextHref = buildMenuCategoryHref(
                      `${window.location.pathname}${window.location.search}${window.location.hash}`,
                      category.slug,
                    );

                    startTransition(() => {
                      setSelectedCategorySlug(category.slug);
                      router.replace(nextHref, { scroll: false });
                    });
                  }}
                  ref={(node) => {
                    categoryButtonRefs.current[category.id] = node;
                  }}
                  size="sm"
                  type="button"
                  variant={isActive ? "secondary" : "outline"}
                >
                  <span className="truncate">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      <section className="min-w-0 space-y-6" id="menu-products-panel">
        {visibleProducts.length ? (
          <div className="grid min-w-0 grid-cols-2 justify-between gap-x-2 gap-y-4 sm:gap-x-3 md:grid-cols-[repeat(auto-fit,minmax(280px,280px))] md:justify-start md:gap-5">
            {visibleProducts.map((product) => (
              <MenuProductCard
                activeCategorySlug={selectedCategory?.slug ?? null}
                key={product.id}
                locale={locale}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-sm">{emptyLabel}</div>
        )}
      </section>
    </div>
  );
}
