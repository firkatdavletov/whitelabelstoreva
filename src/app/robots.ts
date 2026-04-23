import type { MetadataRoute } from "next";

import {
  getMetadataBase,
  toAbsoluteUrl,
} from "@/shared/lib/storefront-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    host: getMetadataBase().host,
    rules: {
      allow: "/",
      disallow: ["/api/"],
      userAgent: "*",
    },
    sitemap: toAbsoluteUrl("/sitemap.xml"),
  };
}
