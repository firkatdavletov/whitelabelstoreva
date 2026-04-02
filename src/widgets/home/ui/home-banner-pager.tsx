"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/styles";
import { Button } from "@/shared/ui/button";
import type { HomeBanner } from "@/widgets/home/lib/home-placeholders";

type HomeBannerPagerProps = {
  banners: HomeBanner[];
  nextLabel: string;
  previousLabel: string;
};

export function HomeBannerPager({
  banners,
  nextLabel,
  previousLabel,
}: HomeBannerPagerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banners.length) {
    return null;
  }

  const currentBanner = banners[activeIndex] ?? banners[0];

  function showSlide(nextIndex: number) {
    setActiveIndex((nextIndex + banners.length) % banners.length);
  }

  return (
    <section
      aria-label="Promotions"
      className="border-border/60 bg-card/95 relative overflow-hidden rounded-[calc(var(--radius)+0.75rem)] border shadow-[0_32px_72px_-48px_rgba(31,26,23,0.48)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.88),transparent_34%)]" />

      <div className="relative grid h-[34rem] grid-rows-[minmax(0,1fr)_220px] items-stretch sm:h-[36rem] lg:h-[30rem] lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] lg:grid-rows-1">
        <div className="flex min-h-0 flex-col justify-between gap-8 p-6 sm:p-8">
          <div className="space-y-6">
            <span className="border-border/60 bg-background/80 text-muted-foreground inline-flex w-fit items-center rounded-full border px-3 py-1 text-[0.7rem] font-medium tracking-[0.22em] uppercase">
              {currentBanner.eyebrow}
            </span>

            <div className="space-y-4">
              <h1 className="font-heading max-w-[12ch] text-4xl leading-none font-semibold sm:text-5xl">
                {currentBanner.title}
              </h1>

              <p className="text-muted-foreground max-w-xl text-sm leading-6 sm:text-base">
                {currentBanner.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {banners.map((banner, index) => (
                <button
                  aria-label={banner.title}
                  className={cn(
                    "cursor-pointer rounded-full transition-all",
                    index === activeIndex
                      ? "bg-foreground h-2.5 w-8"
                      : "bg-border hover:bg-muted-foreground/40 h-2.5 w-2.5",
                  )}
                  key={banner.id}
                  onClick={() => showSlide(index)}
                  type="button"
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                aria-label={previousLabel}
                className="border-border/60 bg-background/84 h-10 w-10 rounded-full px-0 shadow-none"
                onClick={() => showSlide(activeIndex - 1)}
                size="icon"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                aria-label={nextLabel}
                className="border-border/60 bg-background/84 h-10 w-10 rounded-full px-0 shadow-none"
                onClick={() => showSlide(activeIndex + 1)}
                size="icon"
                variant="outline"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-border/60 bg-muted/40 relative min-h-0 overflow-hidden border-t lg:border-t-0 lg:border-l">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 34vw"
            src={currentBanner.imageSrc}
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        </div>
      </div>
    </section>
  );
}
