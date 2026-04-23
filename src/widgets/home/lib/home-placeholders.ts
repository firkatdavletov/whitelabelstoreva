import type { Category } from "@/entities/category";
import type { Locale } from "@/shared/types/common";

export type HomeBanner = {
  description: string;
  eyebrow: string;
  id: string;
  imageSrc: string;
  title: string;
};

export type HomeCategoryCard = {
  id: string;
  imageSrc: string;
  name: string;
  slug: string;
};

const defaultBannerContent = {
  en: [
    {
      description:
        "Placeholder banner for hero promotions, bestseller categories, and high-margin combos on the first screen.",
      eyebrow: "Weekly highlights",
      title: "Use this slot for burgers, rolls, and combo offers",
    },
    {
      description:
        "Second placeholder for seasonal drops, local offers, or limited items without overloading the storefront.",
      eyebrow: "Seasonal promo",
      title: "A clean slide for launches, coupons, and new menu drops",
    },
  ],
  ru: [
    {
      description:
        "Заглушка для главной промо-полосы: сюда можно вывести хиты, категории с высокой конверсией и комбо-наборы.",
      eyebrow: "Хиты недели",
      title: "Бургеры, роллы и комбо можно продвигать прямо с первого экрана",
    },
    {
      description:
        "Вторая заглушка под сезонные офферы, локальные акции и новые позиции без перегруза white label витрины.",
      eyebrow: "Сезонное предложение",
      title: "Спокойный баннер для новинок, промокодов и временных акций",
    },
  ],
} satisfies Record<Locale, Array<Omit<HomeBanner, "id" | "imageSrc">>>;

const fashionBannerContent = {
  en: [
    {
      description:
        "Clean compositions, warm metallic accents, and statement pieces for layered looks that still feel restrained.",
      eyebrow: "New collection",
      title: "Ethnic jewelry framed in a modern, minimalist silhouette",
    },
    {
      description:
        "A calm first screen for premium drops, capsule styling, and accessories that complete a daily wardrobe.",
      eyebrow: "Premium edit",
      title: "Accent details for everyday outfits and occasion styling",
    },
  ],
  ru: [
    {
      description:
        "Лаконичные силуэты, тёплый металлический акцент и выразительные украшения для образов, которые остаются собранными и спокойными.",
      eyebrow: "Новая коллекция",
      title: "Этно украшения в современном минималистичном силуэте",
    },
    {
      description:
        "Спокойный первый экран для премиальных дропов, капсульных сочетаний и аксессуаров, которые завершают образ.",
      eyebrow: "Премиальная подборка",
      title: "Акцентные детали для повседневных и вечерних образов",
    },
  ],
} satisfies Record<Locale, Array<Omit<HomeBanner, "id" | "imageSrc">>>;

const bannerPalettes = [
  {
    accent: "#E64A19",
    background: "#F7ECE2",
    dark: "#2B2019",
    panel: "#FFF8F2",
    soft: "#F3C4AE",
  },
  {
    accent: "#1C7C72",
    background: "#EDF5F1",
    dark: "#22302B",
    panel: "#FAFCFB",
    soft: "#CDE6E0",
  },
] as const;

const fashionBannerPalettes = [
  {
    accent: "#CFA74E",
    background: "#FDF8EF",
    dark: "#201811",
    panel: "#FFFCF5",
    soft: "#EAD9B0",
  },
  {
    accent: "#8D7242",
    background: "#FBF5EA",
    dark: "#211A12",
    panel: "#FFFDF7",
    soft: "#E6D5B3",
  },
] as const;

const categoryPalettes = [
  {
    accent: "#E64A19",
    background: "#FFF3EA",
    dark: "#33241A",
    soft: "#F6D6C7",
  },
  {
    accent: "#1C7C72",
    background: "#F1F6F4",
    dark: "#24322F",
    soft: "#D7ECE7",
  },
  {
    accent: "#C96A3D",
    background: "#FBF2E8",
    dark: "#33261E",
    soft: "#F0DDCC",
  },
] as const;

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createDefaultBannerSvg(index: number) {
  const palette = bannerPalettes[index % bannerPalettes.length];

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720" fill="none">
      <rect width="960" height="720" fill="${palette.background}" />
      <rect x="88" y="84" width="784" height="552" rx="52" fill="${palette.panel}" />
      <circle cx="742" cy="190" r="134" fill="${palette.soft}" />
      <circle cx="798" cy="506" r="174" fill="${palette.accent}" fill-opacity="0.12" />
      <path
        d="M186 548C270 408 391 308 560 256C624 236 697 226 778 232"
        stroke="${palette.dark}"
        stroke-opacity="0.18"
        stroke-linecap="round"
        stroke-width="18"
      />
      <path
        d="M180 590C286 466 429 378 618 350"
        stroke="${palette.accent}"
        stroke-linecap="round"
        stroke-width="30"
      />
      <rect x="194" y="222" width="174" height="20" rx="10" fill="${palette.dark}" fill-opacity="0.14" />
      <rect x="194" y="270" width="334" height="22" rx="11" fill="${palette.dark}" fill-opacity="0.18" />
      <rect x="194" y="312" width="290" height="22" rx="11" fill="${palette.dark}" fill-opacity="0.12" />
      <rect x="194" y="372" width="402" height="18" rx="9" fill="${palette.accent}" fill-opacity="0.22" />
      <rect x="194" y="410" width="362" height="18" rx="9" fill="${palette.dark}" fill-opacity="0.08" />
      <rect x="194" y="448" width="322" height="18" rx="9" fill="${palette.dark}" fill-opacity="0.08" />
    </svg>
  `);
}

function createFashionBannerSvg(index: number) {
  const palette = fashionBannerPalettes[index % fashionBannerPalettes.length];

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720" fill="none">
      <rect width="960" height="720" fill="${palette.background}" />
      <rect x="88" y="72" width="784" height="576" fill="${palette.panel}" />
      <rect x="520" y="104" width="260" height="456" fill="${palette.soft}" fill-opacity="0.34" />
      <rect x="556" y="146" width="188" height="372" fill="${palette.panel}" />
      <path d="M650 186C611 186 580 219 580 258V286C580 354 610 412 650 444C690 412 720 354 720 286V258C720 219 689 186 650 186Z" stroke="${palette.dark}" stroke-width="8" />
      <path d="M606 266C620 308 635 338 650 356C665 338 680 308 694 266" stroke="${palette.accent}" stroke-width="8" stroke-linecap="square" />
      <rect x="162" y="190" width="116" height="8" fill="${palette.accent}" fill-opacity="0.72" />
      <rect x="162" y="238" width="286" height="12" fill="${palette.dark}" fill-opacity="0.14" />
      <rect x="162" y="274" width="250" height="12" fill="${palette.dark}" fill-opacity="0.1" />
      <rect x="162" y="362" width="198" height="2" fill="${palette.dark}" fill-opacity="0.28" />
      <rect x="162" y="398" width="236" height="2" fill="${palette.dark}" fill-opacity="0.14" />
      <rect x="162" y="434" width="214" height="2" fill="${palette.dark}" fill-opacity="0.14" />
      <rect x="142" y="126" width="678" height="468" stroke="${palette.dark}" stroke-opacity="0.08" stroke-width="2" />
    </svg>
  `);
}

function createCategorySvg(name: string, index: number) {
  const palette = categoryPalettes[index % categoryPalettes.length];
  const monogram = name.trim().charAt(0).toUpperCase();

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="none">
      <rect width="800" height="600" fill="${palette.background}" />
      <circle cx="638" cy="184" r="126" fill="${palette.soft}" />
      <circle cx="212" cy="466" r="100" fill="${palette.accent}" fill-opacity="0.14" />
      <path
        d="M172 432C240 334 330 266 458 232C518 216 577 212 642 220"
        stroke="${palette.dark}"
        stroke-opacity="0.16"
        stroke-linecap="round"
        stroke-width="16"
      />
      <path
        d="M164 464C270 356 400 294 566 278"
        stroke="${palette.accent}"
        stroke-linecap="round"
        stroke-width="24"
      />
      <text
        x="108"
        y="284"
        fill="${palette.dark}"
        font-family="Avenir Next, Arial, sans-serif"
        font-size="164"
        font-weight="700"
      >
        ${monogram}
      </text>
      <rect x="112" y="340" width="178" height="14" rx="7" fill="${palette.accent}" fill-opacity="0.32" />
      <rect x="112" y="376" width="262" height="14" rx="7" fill="${palette.dark}" fill-opacity="0.1" />
      <rect x="112" y="410" width="208" height="14" rx="7" fill="${palette.dark}" fill-opacity="0.1" />
    </svg>
  `);
}

export function getHomeBanners(
  locale: Locale,
  tenantSlug?: string,
): HomeBanner[] {
  const bannerContent =
    tenantSlug === "aiymbrand" ? fashionBannerContent : defaultBannerContent;
  const createBannerSvg =
    tenantSlug === "aiymbrand"
      ? createFashionBannerSvg
      : createDefaultBannerSvg;

  return bannerContent[locale].map((banner, index) => ({
    ...banner,
    id: `home-banner-${index + 1}`,
    imageSrc: createBannerSvg(index),
  }));
}

export function getHomeCategoryCards(
  categories: Category[],
): HomeCategoryCard[] {
  return categories.map((category, index) => ({
    id: category.id,
    imageSrc: category.imageUrl ?? createCategorySvg(category.name, index),
    name: category.name,
    slug: category.slug,
  }));
}
