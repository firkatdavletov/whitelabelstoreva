import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  FashionMediaFrame,
  FashionSurface,
  FashionText,
  FashionTitle,
} from "@/shared/ui/fashion-storefront";

export type CategoryCardProps = {
  href: string;
  imageSrc: string;
  name: string;
  subtitle?: string | null;
};

export function ClassicCategoryCard({
  href,
  imageSrc,
  name,
}: CategoryCardProps) {
  return (
    <Link
      className="group border-border/60 bg-card/96 overflow-hidden rounded-2xl border shadow-[0_24px_60px_-48px_rgba(31,26,23,0.55)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-44px_rgba(31,26,23,0.42)]"
      href={href}
    >
      <div className="bg-muted/50 relative aspect-[4/3] overflow-hidden">
        <Image
          alt=""
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          src={imageSrc}
          unoptimized
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <span className="text-base font-semibold tracking-[0.02em]">
          {name}
        </span>
        <ArrowRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition duration-300 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function FashionCategoryCard({
  href,
  imageSrc,
  name,
  subtitle,
}: CategoryCardProps) {
  return (
    <FashionSurface asChild interactive>
      <Link className="group block" href={href}>
        <FashionMediaFrame ratio="portrait">
          <Image
            alt=""
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            src={imageSrc}
            unoptimized
          />
        </FashionMediaFrame>

        <div className="flex items-end justify-between gap-4 px-4 py-4 sm:px-5">
          <div className="min-w-0 space-y-1">
            <FashionTitle
              as="h3"
              className="truncate"
              size="card"
              weight="medium"
            >
              {name}
            </FashionTitle>
            {subtitle ? (
              <FashionText className="truncate" size="meta">
                {subtitle}
              </FashionText>
            ) : null}
          </div>

          <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition duration-300 group-hover:translate-x-0.5" />
        </div>
      </Link>
    </FashionSurface>
  );
}
