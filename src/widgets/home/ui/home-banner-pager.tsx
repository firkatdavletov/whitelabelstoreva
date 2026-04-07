"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/styles";
import { Button } from "@/shared/ui/button";
import type { HeroBanner } from "@/widgets/home/api/get-hero-banners";

type HomeBannerPagerProps = {
  banners: HeroBanner[];
  nextLabel: string;
  previousLabel: string;
};

const interactiveElementSelector = [
  "a",
  "button",
  "input",
  "select",
  "summary",
  "textarea",
  "[role='button']",
].join(", ");

export function HomeBannerPager({
  banners,
  nextLabel,
  previousLabel,
}: HomeBannerPagerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swipeStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
  });

  if (!banners.length) {
    return null;
  }

  const currentBanner = banners[activeIndex] ?? banners[0];

  function showSlide(nextIndex: number) {
    setActiveIndex((nextIndex + banners.length) % banners.length);
  }

  function resetSwipe() {
    swipeStateRef.current.pointerId = null;
    swipeStateRef.current.startX = 0;
    swipeStateRef.current.startY = 0;
  }

  function isInteractiveTarget(target: EventTarget | null) {
    return (
      target instanceof Element &&
      target.closest(interactiveElementSelector) !== null
    );
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (!event.isPrimary || isInteractiveTarget(event.target)) {
      return;
    }

    swipeStateRef.current.pointerId = event.pointerId;
    swipeStateRef.current.startX = event.clientX;
    swipeStateRef.current.startY = event.clientY;

    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (
      !event.isPrimary ||
      swipeStateRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const deltaX = event.clientX - swipeStateRef.current.startX;
    const deltaY = event.clientY - swipeStateRef.current.startY;

    if (
      typeof event.currentTarget.hasPointerCapture === "function" &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetSwipe();

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      showSlide(activeIndex + 1);
      return;
    }

    showSlide(activeIndex - 1);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLElement>) {
    if (
      swipeStateRef.current.pointerId === event.pointerId &&
      typeof event.currentTarget.hasPointerCapture === "function" &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetSwipe();
  }

  return (
    <section
      aria-label="Promotions"
      className="border-border/60 bg-card/95 relative overflow-hidden rounded-3xl border shadow-[0_32px_72px_-48px_rgba(31,26,23,0.48)]"
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "pan-y" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.88),transparent_34%)]" />

      <div className="relative grid h-[34rem] grid-rows-[minmax(0,1fr)_220px] items-stretch sm:h-[36rem] lg:h-[30rem] lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] lg:grid-rows-1">
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-6 p-6 sm:gap-8 sm:p-8">
          <div>
            {currentBanner.subtitle && (
              <span className="border-border/60 bg-background/80 text-muted-foreground inline-flex w-fit items-center rounded-full border px-3 py-1 text-[0.7rem] font-medium tracking-[0.22em] uppercase">
                {currentBanner.subtitle}
              </span>
            )}
          </div>

          <div className="min-h-0 overflow-hidden">
            <div className="space-y-4">
              <h1 className="font-heading max-w-[12ch] text-4xl leading-none font-semibold sm:text-5xl">
                {currentBanner.title}
              </h1>

              {currentBanner.description && (
                <p className="text-muted-foreground max-w-xl text-sm leading-6 sm:text-base">
                  {currentBanner.description}
                </p>
              )}

              {(currentBanner.primaryActionLabel && currentBanner.primaryActionUrl) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild>
                    <Link href={currentBanner.primaryActionUrl}>
                      {currentBanner.primaryActionLabel}
                    </Link>
                  </Button>

                  {currentBanner.secondaryActionLabel && currentBanner.secondaryActionUrl && (
                    <Button asChild variant="outline">
                      <Link href={currentBanner.secondaryActionUrl}>
                        {currentBanner.secondaryActionLabel}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 self-end sm:flex-row sm:items-center sm:justify-between">
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
            alt={currentBanner.desktopImageAlt}
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 34vw"
            src={currentBanner.desktopImageUrl}
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        </div>
      </div>
    </section>
  );
}
