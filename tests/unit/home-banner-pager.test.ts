import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HomeBannerPager } from "@/widgets/home/ui/home-banner-pager";

vi.mock("next/image", () => ({
  default: (props: {
    alt?: string;
    className?: string;
    src?: string;
  }) => {
    return React.createElement("img", {
      alt: props.alt ?? "",
      className: props.className,
      src: props.src ?? "",
    });
  },
}));

const banners = [
  {
    description: "Первый баннер",
    eyebrow: "Хиты недели",
    id: "banner-1",
    imageSrc: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' />",
    title: "Первый слайд",
  },
  {
    description: "Второй баннер",
    eyebrow: "Новинки",
    id: "banner-2",
    imageSrc: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' />",
    title: "Второй слайд",
  },
] as const;

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

    await user.click(
      screen.getByRole("button", { name: "Следующий баннер" }),
    );

    expect(
      screen.getByRole("heading", { name: "Второй слайд" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Первый слайд" }));

    expect(
      screen.getByRole("heading", { name: "Первый слайд" }),
    ).toBeInTheDocument();
  });
});
