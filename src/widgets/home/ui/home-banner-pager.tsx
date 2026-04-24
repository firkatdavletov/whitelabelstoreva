"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/styles";
import { Button } from "@/shared/ui/button";
import type { HeroBanner } from "@/widgets/home/api/get-hero-banners";
import {
  getHeroBannerAlignmentClassNames,
  getHeroBannerScrimClassName,
  getHeroBannerToneClassNames,
} from "@/widgets/home/ui/hero-banner-layout";

type HomeBannerPagerProps = {
  banners: HeroBanner[];
  nextLabel: string;
  previousLabel: string;
};

export type { HomeBannerPagerProps };

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
  const alignmentClassNames = getHeroBannerAlignmentClassNames(
    currentBanner.textAlignment,
  );
  const toneClassNames = getHeroBannerToneClassNames(
    currentBanner.themeVariant,
  );

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
      className="border-border/60 bg-muted relative min-h-[34rem] overflow-hidden rounded-3xl border shadow-[0_32px_72px_-48px_rgba(31,26,23,0.48)] sm:min-h-[36rem] lg:min-h-[30rem]"
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "pan-y" }}
    >
      <Image
        alt={currentBanner.desktopImageAlt || currentBanner.title}
        className="object-cover"
        fill
        sizes="(max-width: 1280px) 100vw, 1280px"
        src={currentBanner.desktopImageUrl}
        unoptimized
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          getHeroBannerScrimClassName(
            currentBanner.textAlignment,
            currentBanner.themeVariant,
          ),
        )}
      />

      <div className="relative z-10 flex min-h-[34rem] flex-col p-6 sm:min-h-[36rem] sm:p-8 lg:min-h-[30rem] lg:p-10">
        <div
          className={cn("flex flex-1 items-center", alignmentClassNames.frame)}
        >
          <div
            className={cn(
              "flex w-full max-w-xl flex-col gap-6",
              alignmentClassNames.copy,
            )}
            data-banner-alignment={currentBanner.textAlignment.toLowerCase()}
          >
            <div className="space-y-4">
              {currentBanner.subtitle && (
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full border px-3 py-1 text-[0.7rem] font-medium tracking-[0.22em] uppercase",
                    toneClassNames.kicker,
                  )}
                >
                  {currentBanner.subtitle}
                </span>
              )}

              <h1
                className={cn(
                  "font-heading max-w-[12ch] text-4xl leading-none font-semibold sm:text-5xl",
                  toneClassNames.title,
                )}
              >
                {currentBanner.title}
              </h1>

              {currentBanner.description && (
                <p
                  className={cn(
                    "max-w-xl text-sm leading-6 sm:text-base",
                    toneClassNames.text,
                  )}
                >
                  {currentBanner.description}
                </p>
              )}

              {currentBanner.primaryActionLabel &&
                currentBanner.primaryActionUrl && (
                  <div
                    className={cn(
                      "flex flex-wrap gap-2 pt-1",
                      alignmentClassNames.actions,
                    )}
                  >
                    <Button asChild className={toneClassNames.primaryButton}>
                      <Link href={currentBanner.primaryActionUrl}>
                        {currentBanner.primaryActionLabel}
                      </Link>
                    </Button>

                    {currentBanner.secondaryActionLabel &&
                      currentBanner.secondaryActionUrl && (
                        <Button
                          asChild
                          className={toneClassNames.secondaryButton}
                          variant="outline"
                        >
                          <Link href={currentBanner.secondaryActionUrl}>
                            {currentBanner.secondaryActionLabel}
                          </Link>
                        </Button>
                      )}
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {banners.map((banner, index) => (
              <button
                aria-label={banner.title}
                className={cn(
                  "h-2.5 cursor-pointer rounded-full transition-all",
                  index === activeIndex
                    ? cn("w-8", toneClassNames.dotActive)
                    : cn("w-2.5", toneClassNames.dotInactive),
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
              className={cn(
                "h-10 w-10 rounded-full px-0 shadow-none",
                toneClassNames.navButton,
              )}
              onClick={() => showSlide(activeIndex - 1)}
              size="icon"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              aria-label={nextLabel}
              className={cn(
                "h-10 w-10 rounded-full px-0 shadow-none",
                toneClassNames.navButton,
              )}
              onClick={() => showSlide(activeIndex + 1)}
              size="icon"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
