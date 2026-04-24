import type { Product } from "@/entities/product";
import type { ProductCardVariant } from "@/entities/tenant";
import type { Locale } from "@/shared/types/common";
import {
  ClassicProductCard,
  FashionProductCard,
} from "@/widgets/menu-grid/ui/product-card";

type HomePopularProductsGridProps = {
  getProductHref: (product: Product) => string;
  locale: Locale;
  productCardVariant?: ProductCardVariant;
  products: Product[];
  title: string;
};

const gridClassByVariant: Record<ProductCardVariant, string> = {
  "clothes-fashion":
    "grid min-w-0 grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-x-4 md:gap-y-8",
  "food-classic":
    "grid min-w-0 grid-cols-2 justify-between gap-x-2 gap-y-4 sm:gap-x-3 md:grid-cols-[repeat(auto-fit,minmax(280px,280px))] md:justify-start md:gap-5",
};

export function HomePopularProductsGrid({
  getProductHref,
  locale,
  productCardVariant = "food-classic",
  products,
  title,
}: HomePopularProductsGridProps) {
  if (!products.length) {
    return null;
  }

  const CardComponent =
    productCardVariant === "clothes-fashion"
      ? FashionProductCard
      : ClassicProductCard;

  return (
    <section
      aria-labelledby="home-popular-products-title"
      className="min-w-0 space-y-4 md:space-y-6"
    >
      <h2
        className="font-heading text-foreground text-2xl font-semibold tracking-tight md:text-3xl"
        id="home-popular-products-title"
      >
        {title}
      </h2>

      <div className={gridClassByVariant[productCardVariant]}>
        {products.map((product) => (
          <CardComponent
            key={product.id}
            locale={locale}
            product={product}
            productHref={getProductHref(product)}
          />
        ))}
      </div>
    </section>
  );
}
