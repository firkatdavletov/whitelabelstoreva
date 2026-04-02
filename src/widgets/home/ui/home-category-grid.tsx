import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/ui/button";
import type { HomeCategoryCard } from "@/widgets/home/lib/home-placeholders";

type HomeCategoryGridProps = {
  actionHref: string;
  actionLabel: string;
  categories: HomeCategoryCard[];
};

export function HomeCategoryGrid({
  actionHref,
  actionLabel,
  categories,
}: HomeCategoryGridProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Link
            className="group border-border/60 bg-card/96 overflow-hidden rounded-[calc(var(--radius)+0.35rem)] border shadow-[0_24px_60px_-48px_rgba(31,26,23,0.55)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-44px_rgba(31,26,23,0.42)]"
            href={actionHref}
            key={category.id}
          >
            <div className="bg-muted/50 relative aspect-[4/3] overflow-hidden">
              <Image
                alt=""
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                src={category.imageSrc}
                unoptimized
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="text-base font-semibold tracking-[0.02em]">
                {category.name}
              </span>
              <ArrowRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition duration-300 group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
