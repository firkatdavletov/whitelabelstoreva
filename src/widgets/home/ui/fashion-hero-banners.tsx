"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  FashionActionButton,
  FashionIconButton,
  FashionKicker,
  FashionMediaFrame,
  FashionPagerDots,
  FashionSurface,
  FashionText,
  FashionTitle,
} from "@/shared/ui/fashion-storefront";
import type { HeroBanner } from "@/widgets/home/api/get-hero-banners";

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
        <div className="relative grid min-h-[36rem] grid-cols-1 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)]">
          <FashionMediaFrame
            className="border-border/60 order-1 border-b lg:order-2 lg:border-b-0 lg:border-l"
            overlay="editorial"
            ratio="hero"
          >
            <Image
              alt={
                currentBanner.desktopImageAlt ||
                currentBanner.mobileImageAlt ||
                currentBanner.title
              }
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 56vw"
              src={currentBanner.desktopImageUrl}
              unoptimized
            />
          </FashionMediaFrame>

          <div className="relative order-2 flex min-h-0 items-center lg:order-1">
            <div className="from-background via-background/94 to-background/72 absolute inset-0 bg-gradient-to-r lg:to-transparent" />

            <div className="relative z-10 flex w-full flex-col gap-7 px-6 py-8 pb-20 sm:px-8 sm:py-10 sm:pb-24 lg:px-10 lg:py-12 lg:pb-16">
              <div className="space-y-4">
                {currentBanner.subtitle ? (
                  <FashionKicker>{currentBanner.subtitle}</FashionKicker>
                ) : null}

                <FashionTitle as="h1" size="hero">
                  {currentBanner.title}
                </FashionTitle>

                {currentBanner.description ? (
                  <FashionText className="max-w-md">
                    {currentBanner.description}
                  </FashionText>
                ) : null}
              </div>

              {(currentBanner.primaryActionLabel &&
                currentBanner.primaryActionUrl) ||
              (currentBanner.secondaryActionLabel &&
                currentBanner.secondaryActionUrl) ? (
                <div className="flex flex-wrap gap-3">
                  {currentBanner.primaryActionLabel &&
                  currentBanner.primaryActionUrl ? (
                    <FashionActionButton asChild>
                      <Link href={currentBanner.primaryActionUrl}>
                        {currentBanner.primaryActionLabel}
                      </Link>
                    </FashionActionButton>
                  ) : null}

                  {currentBanner.secondaryActionLabel &&
                  currentBanner.secondaryActionUrl ? (
                    <FashionActionButton asChild variant="outline">
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
                className="border-primary/26 text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground pointer-events-auto backdrop-blur-sm"
                onClick={() => showSlide(activeIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </FashionIconButton>
              <FashionIconButton
                aria-label={nextLabel}
                className="border-primary/26 text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground pointer-events-auto backdrop-blur-sm"
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
