"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useOptimistic, useRef } from "react";

import { AddToCartButton } from "@/features/add-to-cart";
import { ProductPreviewDialog } from "@/features/menu-catalog";
import {
  buildMenuCategoryHref,
  getMenuCategoryProducts,
  resolveMenuCategory,
} from "@/features/menu-catalog/lib/catalog-navigation";
import type { Category } from "@/entities/category";
import type { Product } from "@/entities/product";
import { formatCurrency } from "@/shared/lib/currency";
import type { Locale } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type MenuGridProps = {
  activeCategorySlug: string | null;
  categories: Category[];
  emptyLabel: string;
  locale: Locale;
  products: Product[];
};

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
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <Card className="min-w-0" key={product.id}>
                <CardHeader>
                  <div className="bg-muted text-foreground mb-4 flex h-24 items-center justify-center rounded-2xl text-4xl font-bold">
                    {product.visual}
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {product.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={product.isAvailable ? "secondary" : "outline"}
                    >
                      {product.isAvailable ? "Live" : "Soon"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold">
                      {formatCurrency(product.price, product.currency, locale)}
                    </p>
                    <ProductPreviewDialog locale={locale} product={product} />
                  </div>
                  <AddToCartButton product={product} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-sm">{emptyLabel}</div>
        )}
      </section>
    </div>
  );
}
