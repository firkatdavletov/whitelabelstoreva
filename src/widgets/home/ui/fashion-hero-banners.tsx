"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/styles";
import {
  FashionActionButton,
  FashionIconButton,
  FashionKicker,
  FashionPagerDots,
  FashionSurface,
  FashionText,
  FashionTitle,
} from "@/shared/ui/fashion-storefront";
import type { HeroBanner } from "@/widgets/home/api/get-hero-banners";
import {
  getHeroBannerAlignmentClassNames,
  getHeroBannerScrimClassName,
  getHeroBannerToneClassNames,
} from "@/widgets/home/ui/hero-banner-layout";

type FashionHeroBannersProps = {
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

export function FashionHeroBanners({
  banners,
  nextLabel,
  previousLabel,
}: FashionHeroBannersProps) {
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
  const hasMultipleBanners = banners.length > 1;
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
    <FashionSurface asChild>
      <section
        aria-label="Promotions"
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <Image
          alt={
            currentBanner.desktopImageAlt ||
            currentBanner.mobileImageAlt ||
            currentBanner.title
          }
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

        <div className="relative z-10 flex min-h-[36rem] flex-col px-6 py-8 pb-20 sm:px-8 sm:py-10 sm:pb-24 lg:px-10 lg:py-12 lg:pb-16">
          <div
            className={cn(
              "flex flex-1 items-center",
              alignmentClassNames.frame,
            )}
          >
            <div
              className={cn(
                "flex w-full max-w-xl flex-col gap-7",
                alignmentClassNames.copy,
              )}
              data-banner-alignment={currentBanner.textAlignment.toLowerCase()}
            >
              <div className="space-y-4">
                {currentBanner.subtitle ? (
                  <FashionKicker className={toneClassNames.kicker}>
                    {currentBanner.subtitle}
                  </FashionKicker>
                ) : null}

                <FashionTitle
                  as="h1"
                  className={cn("tracking-normal", toneClassNames.title)}
                  size="hero"
                >
                  {currentBanner.title}
                </FashionTitle>

                {currentBanner.description ? (
                  <FashionText className={cn("max-w-md", toneClassNames.text)}>
                    {currentBanner.description}
                  </FashionText>
                ) : null}
              </div>

              {(currentBanner.primaryActionLabel &&
                currentBanner.primaryActionUrl) ||
              (currentBanner.secondaryActionLabel &&
                currentBanner.secondaryActionUrl) ? (
                <div
                  className={cn(
                    "flex flex-wrap gap-3",
                    alignmentClassNames.actions,
                  )}
                >
                  {currentBanner.primaryActionLabel &&
                  currentBanner.primaryActionUrl ? (
                    <FashionActionButton
                      asChild
                      className={toneClassNames.primaryButton}
                    >
                      <Link href={currentBanner.primaryActionUrl}>
                        {currentBanner.primaryActionLabel}
                      </Link>
                    </FashionActionButton>
                  ) : null}

                  {currentBanner.secondaryActionLabel &&
                  currentBanner.secondaryActionUrl ? (
                    <FashionActionButton
                      asChild
                      className={toneClassNames.secondaryButton}
                      variant="outline"
                    >
                      <Link href={currentBanner.secondaryActionUrl}>
                        {currentBanner.secondaryActionLabel}
                      </Link>
                    </FashionActionButton>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {hasMultipleBanners ? (
          <>
            <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-5">
              <FashionPagerDots
                activeIndex={activeIndex}
                getLabel={(banner) => banner.title}
                items={banners}
                onSelect={showSlide}
              />
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 left-0 z-10 flex items-center justify-between px-3 sm:px-4 lg:px-5">
              <FashionIconButton
                aria-label={previousLabel}
                className={cn("pointer-events-auto", toneClassNames.navButton)}
                onClick={() => showSlide(activeIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </FashionIconButton>
              <FashionIconButton
                aria-label={nextLabel}
                className={cn("pointer-events-auto", toneClassNames.navButton)}
                onClick={() => showSlide(activeIndex + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </FashionIconButton>
            </div>
          </>
        ) : null}
      </section>
    </FashionSurface>
  );
}
