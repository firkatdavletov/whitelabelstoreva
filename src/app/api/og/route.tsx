import { ImageResponse } from "next/og";

import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";

export const runtime = "edge";

const imageSize = {
  height: 630,
  width: 1200,
} as const;

function normalizeHexColor(value: string) {
  const normalizedValue = value.trim();

  if (/^#[0-9a-f]{6}$/i.test(normalizedValue)) {
    return normalizedValue;
  }

  if (/^#[0-9a-f]{3}$/i.test(normalizedValue)) {
    const [red, green, blue] = normalizedValue.slice(1).split("");
    return `#${red}${red}${green}${green}${blue}${blue}`;
  }

  return "#111827";
}

function withAlpha(value: string, alpha: number) {
  const normalizedValue = normalizeHexColor(value).slice(1);
  const red = Number.parseInt(normalizedValue.slice(0, 2), 16);
  const green = Number.parseInt(normalizedValue.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedValue.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getBrandSnapshot(tenantSlug: string | null) {
  const tenantConfig = tenantSlug ? resolveTenant(tenantSlug) : null;

  if (!tenantConfig) {
    return {
      accent: "#248A57",
      background: "#FFF8F1",
      description: "Food ordering storefront ready for social sharing.",
      foreground: "#2A211C",
      primary: "#F05A28",
      title: "White Label Storefront",
    };
  }

  return {
    accent: tenantConfig.theme.accent,
    background: tenantConfig.theme.background,
    description: tenantConfig.tagline,
    foreground: tenantConfig.theme.foreground,
    primary: tenantConfig.theme.primary,
    title: tenantConfig.title,
  };
}

export async function GET(request: Request) {
  const tenantSlug = new URL(request.url).searchParams.get("tenant");
  const brand = getBrandSnapshot(tenantSlug);

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: `linear-gradient(135deg, ${brand.background} 0%, ${withAlpha(
          brand.primary,
          0.14,
        )} 100%)`,
        color: brand.foreground,
        display: "flex",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "56px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: `radial-gradient(circle at center, ${withAlpha(
            brand.primary,
            0.22,
          )} 0%, transparent 68%)`,
          borderRadius: "999px",
          height: "320px",
          position: "absolute",
          right: "-72px",
          top: "-56px",
          width: "320px",
        }}
      />
      <div
        style={{
          background: `radial-gradient(circle at center, ${withAlpha(
            brand.accent,
            0.18,
          )} 0%, transparent 72%)`,
          borderRadius: "999px",
          bottom: "-112px",
          height: "360px",
          left: "-120px",
          position: "absolute",
          width: "360px",
        }}
      />

      <div
        style={{
          border: `1px solid ${withAlpha(brand.foreground, 0.12)}`,
          borderRadius: "36px",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          padding: "44px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "26px",
            maxWidth: "820px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "78px",
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1,
            }}
          >
            {brand.title}
          </div>
          <div
            style={{
              color: withAlpha(brand.foreground, 0.76),
              display: "flex",
              fontSize: "34px",
              lineHeight: 1.3,
            }}
          >
            {brand.description}
          </div>
        </div>
      </div>
    </div>,
    imageSize,
  );
}
