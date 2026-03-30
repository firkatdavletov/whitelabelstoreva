import type { CSSProperties } from "react";

import type { TenantTheme } from "@/entities/tenant";

export function createTenantCssVariables(theme: TenantTheme) {
  return {
    "--accent": theme.accent,
    "--accent-foreground": theme.accentForeground,
    "--background": theme.background,
    "--border": theme.border,
    "--card": theme.card,
    "--card-foreground": theme.cardForeground,
    "--foreground": theme.foreground,
    "--input": theme.input,
    "--muted": theme.muted,
    "--muted-foreground": theme.mutedForeground,
    "--popover": theme.popover,
    "--popover-foreground": theme.popoverForeground,
    "--primary": theme.primary,
    "--primary-foreground": theme.primaryForeground,
    "--radius": theme.radius,
    "--ring": theme.ring,
    "--secondary": theme.secondary,
    "--secondary-foreground": theme.secondaryForeground,
  } as CSSProperties;
}
