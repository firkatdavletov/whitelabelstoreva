import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { HeroBanner } from "@/widgets/home/api/get-hero-banners";
import { FashionHeroBanners } from "@/widgets/home/ui/fashion-hero-banners";

vi.mock("next/image", () => ({
  default: (props: { alt?: string; className?: string; src?: string }) => {
    return React.createElement("img", {
      alt: props.alt ?? "",
      className: props.className,
      src: props.src ?? "",
    });
  },
}));

vi.mock("next/link", () => ({
  default: (props: {
    children: React.ReactNode;
    className?: string;
    href: string;
  }) =>
    React.createElement(
      "a",
      {
        className: props.className,
        href: props.href,
      },
      props.children,
    ),
}));

const banners: HeroBanner[] = [
  {
    code: "banner-1",
    description: "Первый fashion баннер",
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
    subtitle: "Новая коллекция",
    textAlignment: "LEFT",
    themeVariant: "LIGHT",
    title: "Первый fashion слайд",
  },
  {
    code: "banner-2",
    description: "Второй fashion баннер",
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
    subtitle: "Премиальная подборка",
    textAlignment: "LEFT",
    themeVariant: "LIGHT",
    title: "Второй fashion слайд",
  },
];

describe("FashionHeroBanners", () => {
  it("switches slides from arrow buttons and pager dots", async () => {
    const user = userEvent.setup();

    render(
      React.createElement(FashionHeroBanners, {
        banners: [...banners],
        nextLabel: "Следующий баннер",
        previousLabel: "Предыдущий баннер",
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Первый fashion слайд" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Следующий баннер" }));

    expect(
      screen.getByRole("heading", { name: "Второй fashion слайд" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole("button", { name: "Первый fashion слайд" })[0]!,
    );

    expect(
      screen.getByRole("heading", { name: "Первый fashion слайд" }),
    ).toBeInTheDocument();
  });
});
