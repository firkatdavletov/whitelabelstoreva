import { describe, expect, it } from "vitest";

import { getHeroBannerToneClassNames } from "@/widgets/home/ui/hero-banner-layout";

describe("hero banner layout", () => {
  it("uses the theme light text token for primary CTA buttons", () => {
    expect(getHeroBannerToneClassNames("ACCENT").primaryButton).toContain(
      "text-primary-foreground",
    );
    expect(getHeroBannerToneClassNames("DARK").primaryButton).toContain(
      "text-primary-foreground",
    );
    expect(getHeroBannerToneClassNames("LIGHT").primaryButton).toContain(
      "text-primary-foreground",
    );
  });
});
