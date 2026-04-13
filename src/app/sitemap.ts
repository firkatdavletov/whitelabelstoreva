import type { MetadataRoute } from "next";

import { LEGAL_DOCUMENT_TYPES } from "@/entities/legal-document";
import { tenantConfigs } from "@/entities/tenant";
import { getMenuCatalog } from "@/features/menu-catalog";
import {
  buildStorefrontPath,
  getTenantPrimaryHostname,
  SUPPORTED_LOCALES,
} from "@/shared/config/routing";
import {
  toAbsoluteUrl,
  toAbsoluteUrlForHostname,
} from "@/shared/lib/storefront-metadata";

export const dynamic = "force-dynamic";

function toTenantUrl(pathname: string, tenantSlug: string) {
  const primaryHostname = getTenantPrimaryHostname(tenantSlug);

  return primaryHostname
    ? toAbsoluteUrlForHostname(pathname, primaryHostname)
    : toAbsoluteUrl(pathname);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const baseEntries = tenantConfigs.flatMap((tenantConfig) =>
    SUPPORTED_LOCALES.flatMap((locale) => [
      {
        changeFrequency: "daily" as const,
        lastModified,
        priority: 1,
        url: toTenantUrl(
          buildStorefrontPath({
            hostname: getTenantPrimaryHostname(tenantConfig.slug),
            locale,
            tenantSlug: tenantConfig.slug,
          }),
          tenantConfig.slug,
        ),
      },
      {
        changeFrequency: "daily" as const,
        lastModified,
        priority: 0.9,
        url: toTenantUrl(
          buildStorefrontPath({
            hostname: getTenantPrimaryHostname(tenantConfig.slug),
            locale,
            pathname: "/menu",
            tenantSlug: tenantConfig.slug,
          }),
          tenantConfig.slug,
        ),
      },
      ...LEGAL_DOCUMENT_TYPES.map((legalType) => ({
        changeFrequency: "monthly" as const,
        lastModified,
        priority: 0.4,
        url: toTenantUrl(
          buildStorefrontPath({
            hostname: getTenantPrimaryHostname(tenantConfig.slug),
            locale,
            pathname: `/legal/${legalType}`,
            tenantSlug: tenantConfig.slug,
          }),
          tenantConfig.slug,
        ),
      })),
    ]),
  );
  const productEntries = (
    await Promise.all(
      tenantConfigs.map(async (tenantConfig) => {
        const menuCatalog = await getMenuCatalog(tenantConfig.slug).catch(
          () => null,
        );

        if (!menuCatalog) {
          return [];
        }

        return SUPPORTED_LOCALES.flatMap((locale) =>
          menuCatalog.products.map((product) => ({
            changeFrequency: "weekly" as const,
            lastModified,
            priority: 0.8,
            url: toTenantUrl(
              buildStorefrontPath({
                hostname: getTenantPrimaryHostname(tenantConfig.slug),
                locale,
                pathname: `/menu/${product.slug}`,
                tenantSlug: tenantConfig.slug,
              }),
              tenantConfig.slug,
            ),
          })),
        );
      }),
    )
  ).flat();

  return [...baseEntries, ...productEntries];
}
