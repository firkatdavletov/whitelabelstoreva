import type { CurrencyCode } from "@/shared/types/common";

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
  currency: CurrencyCode;
  description: string;
  heroCopy: string;
  logoText: string;
  restaurantId: string;
  slug: string;
  supportEmail: string;
  tagline: string;
  theme: TenantTheme;
  title: string;
};
