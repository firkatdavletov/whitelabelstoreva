import type { MetadataRoute } from "next";

import { LEGAL_DOCUMENT_TYPES } from "@/entities/legal-document";
import { tenantConfigs } from "@/entities/tenant";
import { getMenuCatalog } from "@/features/menu-catalog";
import { buildStorefrontPath, SUPPORTED_LOCALES } from "@/shared/config/routing";
import { toAbsoluteUrl } from "@/shared/lib/storefront-metadata";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const baseEntries = tenantConfigs.flatMap((tenantConfig) =>
    SUPPORTED_LOCALES.flatMap((locale) => [
      {
        changeFrequency: "daily" as const,
        lastModified,
        priority: 1,
        url: toAbsoluteUrl(
          buildStorefrontPath({
            locale,
            tenantSlug: tenantConfig.slug,
          }),
        ),
      },
      {
        changeFrequency: "daily" as const,
        lastModified,
        priority: 0.9,
        url: toAbsoluteUrl(
          buildStorefrontPath({
            locale,
            pathname: "/menu",
            tenantSlug: tenantConfig.slug,
          }),
        ),
      },
      ...LEGAL_DOCUMENT_TYPES.map((legalType) => ({
        changeFrequency: "monthly" as const,
        lastModified,
        priority: 0.4,
        url: toAbsoluteUrl(
          buildStorefrontPath({
            locale,
            pathname: `/legal/${legalType}`,
            tenantSlug: tenantConfig.slug,
          }),
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
            url: toAbsoluteUrl(
              buildStorefrontPath({
                locale,
                pathname: `/menu/${product.slug}`,
                tenantSlug: tenantConfig.slug,
              }),
            ),
          })),
        );
      }),
    )
  ).flat();

  return [...baseEntries, ...productEntries];
}
