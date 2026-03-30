import { AddToCartButton } from "@/features/add-to-cart";
import { ProductPreviewDialog } from "@/features/menu-catalog";
import type { Category } from "@/entities/category";
import type { Product } from "@/entities/product";
import { formatCurrency } from "@/shared/lib/currency";
import type { Locale } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type MenuGridProps = {
  categories: Category[];
  emptyLabel: string;
  locale: Locale;
  products: Product[];
};

export function MenuGrid({
  categories,
  emptyLabel,
  locale,
  products,
}: MenuGridProps) {
  if (!products.length) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          {emptyLabel}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <Badge key={category.id} variant="outline">
            {category.name}
          </Badge>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="mb-4 flex h-24 items-center justify-center rounded-2xl bg-secondary text-4xl font-bold text-secondary-foreground">
                {product.visual}
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription className="mt-2">{product.description}</CardDescription>
                </div>
                <Badge variant={product.isAvailable ? "secondary" : "outline"}>
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
    </div>
  );
}
