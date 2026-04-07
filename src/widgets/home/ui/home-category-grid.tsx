import Link from "next/link";

import type { CategoryCardVariant } from "@/entities/tenant";
import { buildMenuCategoryHref } from "@/features/menu-catalog/lib/catalog-navigation";
import { Button } from "@/shared/ui/button";
import type { HomeCategoryCard } from "@/widgets/home/lib/home-placeholders";
import {
  ClassicCategoryCard,
  FashionCategoryCard,
} from "@/widgets/home/ui/category-card";

type HomeCategoryGridProps = {
  actionHref: string;
  actionLabel: string;
  categories: HomeCategoryCard[];
  categoryCardVariant?: CategoryCardVariant;
};

const gridClassByVariant: Record<CategoryCardVariant, string> = {
  "category-classic": "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
  "category-fashion": "grid sm:grid-cols-2 xl:grid-cols-2",
};

export function HomeCategoryGrid({
  actionHref,
  actionLabel,
  categories,
  categoryCardVariant = "category-classic",
}: HomeCategoryGridProps) {
  if (!categories.length) {
    return null;
  }

  const CardComponent =
    categoryCardVariant === "category-fashion"
      ? FashionCategoryCard
      : ClassicCategoryCard;

  return (
    <section className="space-y-6">
      <div className={gridClassByVariant[categoryCardVariant]}>
        {categories.map((category) => (
          <CardComponent
            href={buildMenuCategoryHref(actionHref, category.slug)}
            imageSrc={category.imageSrc}
            key={category.id}
            name={category.name}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          asChild
          className="!text-primary-foreground hover:!text-primary-foreground"
          size="lg"
        >
          <Link
            className="!text-primary-foreground"
            href={actionHref}
            style={{ color: "var(--primary-foreground)" }}
          >
            {actionLabel}
          </Link>
        </Button>
      </div>
    </section>
  );
}
