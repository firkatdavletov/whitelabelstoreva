"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useOptimistic, useRef } from "react";

import {
  buildMenuCategoryHref,
  getMenuCategoryProducts,
  resolveMenuCategory,
} from "@/features/menu-catalog/lib/catalog-navigation";
import type { Category } from "@/entities/category";
import type { Product } from "@/entities/product";
import type { ProductCardVariant } from "@/entities/tenant";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import type { Locale } from "@/shared/types/common";
import { Button } from "@/shared/ui/button";

import {
  ClassicProductCard,
  FashionProductCard,
} from "@/widgets/menu-grid/ui/product-card";

type MenuGridProps = {
  activeCategorySlug: string | null;
  categories: Category[];
  emptyLabel: string;
  locale: Locale;
  productCardVariant?: ProductCardVariant;
  products: Product[];
};

const gridClassByVariant: Record<ProductCardVariant, string> = {
  "clothes-fashion":
    "grid min-w-0 grid-cols-1 gap-x-1 gap-y-6 sm:gap-x-2 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] md:gap-x-4 md:gap-y-8",
  "food-classic":
    "grid min-w-0 grid-cols-2 justify-between gap-x-2 gap-y-4 sm:gap-x-3 md:grid-cols-[repeat(auto-fit,minmax(280px,280px))] md:justify-start md:gap-5",
};

export function MenuGrid({
  activeCategorySlug,
  categories,
  emptyLabel,
  locale,
  productCardVariant = "food-classic",
  products,
}: MenuGridProps) {
  const router = useRouter();
  const { href } = useStorefrontRoute();
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

  const CardComponent =
    productCardVariant === "clothes-fashion"
      ? FashionProductCard
      : ClassicProductCard;

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
          <div className={gridClassByVariant[productCardVariant]}>
            {visibleProducts.map((product) => {
              const productHref = `${href(`/menu/${product.slug}`)}${
                selectedCategory?.slug
                  ? `?category=${encodeURIComponent(selectedCategory.slug)}`
                  : ""
              }`;

              return (
                <CardComponent
                  key={product.id}
                  locale={locale}
                  product={product}
                  productHref={productHref}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-sm">{emptyLabel}</div>
        )}
      </section>
    </div>
  );
}
