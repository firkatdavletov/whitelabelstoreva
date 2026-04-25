import type { HeroBanner } from "@/widgets/home/api/get-hero-banners";

type HeroBannerTextAlignment = HeroBanner["textAlignment"];
type HeroBannerThemeVariant = HeroBanner["themeVariant"];

type HeroBannerAlignmentClassNames = {
  actions: string;
  copy: string;
  frame: string;
};

type HeroBannerToneClassNames = {
  dotActive: string;
  dotInactive: string;
  kicker: string;
  navButton: string;
  primaryButton: string;
  secondaryButton: string;
  text: string;
  title: string;
};

const primaryCtaButtonClassName =
  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground";

const heroBannerAlignmentClassNames = {
  CENTER: {
    actions: "justify-center",
    copy: "items-center text-center",
    frame: "justify-center",
  },
  LEFT: {
    actions: "justify-start",
    copy: "items-start text-left",
    frame: "justify-start",
  },
  RIGHT: {
    actions: "justify-end",
    copy: "items-end text-right",
    frame: "justify-end",
  },
} satisfies Record<HeroBannerTextAlignment, HeroBannerAlignmentClassNames>;

const heroBannerScrimClassNames = {
  ACCENT: {
    CENTER: "bg-primary/52",
    LEFT: "bg-gradient-to-r from-primary/75 via-primary/45 to-transparent",
    RIGHT: "bg-gradient-to-l from-primary/75 via-primary/45 to-transparent",
  },
  DARK: {
    CENTER:
      "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.66)_0%,rgba(0,0,0,0.46)_38%,rgba(0,0,0,0.14)_76%,rgba(0,0,0,0)_100%)]",
    LEFT: "bg-gradient-to-r from-black/70 via-black/45 to-transparent",
    RIGHT: "bg-gradient-to-l from-black/70 via-black/45 to-transparent",
  },
  LIGHT: {
    CENTER:
      "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.68)_38%,rgba(255,255,255,0.14)_76%,rgba(255,255,255,0)_100%)]",
    LEFT: "bg-gradient-to-r from-background/95 via-background/78 to-transparent",
    RIGHT:
      "bg-gradient-to-l from-background/95 via-background/78 to-transparent",
  },
} satisfies Record<
  HeroBannerThemeVariant,
  Record<HeroBannerTextAlignment, string>
>;

const heroBannerToneClassNames = {
  ACCENT: {
    dotActive: "bg-primary-foreground",
    dotInactive: "bg-primary-foreground/45 hover:bg-primary-foreground/75",
    kicker:
      "border-primary-foreground/30 bg-primary/35 text-primary-foreground/80 backdrop-blur-sm",
    navButton:
      "border-primary-foreground/40 bg-primary/25 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground backdrop-blur-sm",
    primaryButton: primaryCtaButtonClassName,
    secondaryButton:
      "border-primary-foreground/45 bg-primary/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground backdrop-blur-sm",
    text: "text-primary-foreground/84",
    title: "text-primary-foreground",
  },
  DARK: {
    dotActive: "bg-white",
    dotInactive: "bg-white/45 hover:bg-white/75",
    kicker: "border-white/25 bg-black/28 text-white/78 backdrop-blur-sm",
    navButton:
      "border-white/35 bg-black/24 text-white hover:bg-white/15 hover:text-white backdrop-blur-sm",
    primaryButton: primaryCtaButtonClassName,
    secondaryButton:
      "border-white/45 bg-black/20 text-white hover:bg-white/15 hover:text-white backdrop-blur-sm",
    text: "text-white/84",
    title: "text-white",
  },
  LIGHT: {
    dotActive: "bg-foreground",
    dotInactive: "bg-foreground/35 hover:bg-foreground/55",
    kicker:
      "border-border/60 bg-background/76 text-muted-foreground backdrop-blur-sm",
    navButton:
      "border-border/60 bg-background/84 text-foreground hover:bg-secondary hover:text-secondary-foreground backdrop-blur-sm",
    primaryButton: primaryCtaButtonClassName,
    secondaryButton: "bg-background/76 backdrop-blur-sm",
    text: "text-muted-foreground",
    title: "text-foreground",
  },
} satisfies Record<HeroBannerThemeVariant, HeroBannerToneClassNames>;

export function getHeroBannerAlignmentClassNames(
  alignment: HeroBannerTextAlignment,
) {
  return heroBannerAlignmentClassNames[alignment];
}

export function getHeroBannerScrimClassName(
  alignment: HeroBannerTextAlignment,
  themeVariant: HeroBannerThemeVariant,
) {
  return heroBannerScrimClassNames[themeVariant][alignment];
}

export function getHeroBannerToneClassNames(
  themeVariant: HeroBannerThemeVariant,
) {
  return heroBannerToneClassNames[themeVariant];
}
