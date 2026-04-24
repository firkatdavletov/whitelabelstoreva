import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { HeroBanner } from "@/widgets/home/api/get-hero-banners";
import { HomeBannerPager } from "@/widgets/home/ui/home-banner-pager";

vi.mock("next/image", () => ({
  default: (props: { alt?: string; className?: string; src?: string }) => {
    return React.createElement("img", {
      alt: props.alt ?? "",
      className: props.className,
      src: props.src ?? "",
    });
  },
}));

const banners: HeroBanner[] = [
  {
    code: "banner-1",
    description: "Первый баннер",
    desktopImageAlt: "",
    desktopImageUrl:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' />",
    id: "banner-1",
    mobileImageAlt: "",
    mobileImageUrl:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' />",
    placement: "HOME_HERO",
    primaryActionLabel: null,
    primaryActionUrl: null,
    secondaryActionLabel: null,
    secondaryActionUrl: null,
    sortOrder: 0,
    subtitle: "Хиты недели",
    textAlignment: "LEFT",
    themeVariant: "LIGHT",
    title: "Первый слайд",
  },
  {
    code: "banner-2",
    description: "Второй баннер",
    desktopImageAlt: "",
    desktopImageUrl:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' />",
    id: "banner-2",
    mobileImageAlt: "",
    mobileImageUrl:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' />",
    placement: "HOME_HERO",
    primaryActionLabel: null,
    primaryActionUrl: null,
    secondaryActionLabel: null,
    secondaryActionUrl: null,
    sortOrder: 1,
    subtitle: "Новинки",
    textAlignment: "LEFT",
    themeVariant: "LIGHT",
    title: "Второй слайд",
  },
];

describe("HomeBannerPager", () => {
  it("switches slides from arrow buttons and pager dots", async () => {
    const user = userEvent.setup();

    render(
      React.createElement(HomeBannerPager, {
        banners: [...banners],
        nextLabel: "Следующий баннер",
        previousLabel: "Предыдущий баннер",
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Первый слайд" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Следующий баннер" }));

    expect(
      screen.getByRole("heading", { name: "Второй слайд" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Первый слайд" }));

    expect(
      screen.getByRole("heading", { name: "Первый слайд" }),
    ).toBeInTheDocument();
  });

  it("places copy using the banner text alignment", () => {
    const rightAlignedBanner: HeroBanner = {
      ...banners[0]!,
      id: "right-aligned-banner",
      textAlignment: "RIGHT",
      title: "Слайд справа",
    };

    render(
      React.createElement(HomeBannerPager, {
        banners: [rightAlignedBanner],
        nextLabel: "Следующий баннер",
        previousLabel: "Предыдущий баннер",
      }),
    );

    const copy = screen
      .getByRole("heading", { name: "Слайд справа" })
      .closest("[data-banner-alignment]");

    if (!copy) {
      throw new Error("Banner copy container was not rendered");
    }

    expect(copy).toHaveAttribute("data-banner-alignment", "right");
    expect(copy).toHaveClass("items-end", "text-right");
    expect(screen.getByRole("img", { name: "Слайд справа" })).toHaveClass(
      "object-cover",
    );
  });
});
