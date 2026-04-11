import type { CurrencyCode } from "@/shared/types/common";

export type ProductCardVariant = "clothes-fashion" | "food-classic";

export type CategoryCardVariant = "category-classic" | "category-fashion";

export type TenantCatalogConfig = {
  categoryCard: CategoryCardVariant;
  productCard: ProductCardVariant;
};

export type TenantSocialLinks = {
  instagram: string | null;
  max: string | null;
  telegram: string | null;
};

export type TenantTheme = {
  accent: string;
  accentForeground: string;
  background: string;
  border: string;
  card: string;
  cardForeground: string;
  foreground: string;
  input: string;
  muted: string;
  mutedForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  radius: string;
  ring: string;
  secondary: string;
  secondaryForeground: string;
};

export type TenantConfig = {
  allowGuestCheckout: boolean;
  catalog: TenantCatalogConfig;
  currency: CurrencyCode;
  description: string;
  faviconUrl?: string;
  heroCopy: string;
  logoText: string;
  logoUrl?: string;
  restaurantId: string;
  socialLinks: TenantSocialLinks;
  slug: string;
  supportEmail: string;
  tagline: string;
  theme: TenantTheme;
  title: string;
};
