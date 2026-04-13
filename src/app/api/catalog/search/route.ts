import type { NextRequest } from "next/server";

import { searchCatalogProducts } from "@/features/menu-catalog/api/search-catalog-products";
import {
  isCatalogSearchQueryEligible,
  normalizeCatalogSearchQuery,
} from "@/features/menu-catalog/lib/catalog-search";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";

export const dynamic = "force-dynamic";

const SEARCH_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  Expires: "0",
  Pragma: "no-cache",
} as const;

export async function GET(request: NextRequest) {
  const tenantSlug = request.nextUrl.searchParams.get("tenant");
  const normalizedQuery = normalizeCatalogSearchQuery(
    request.nextUrl.searchParams.get("query"),
  );

  if (!tenantSlug || !resolveTenant(tenantSlug)) {
    return Response.json(
      { message: "Invalid tenant." },
      { headers: SEARCH_RESPONSE_HEADERS, status: 400 },
    );
  }

  if (!normalizedQuery || !isCatalogSearchQueryEligible(normalizedQuery)) {
    return Response.json(
      { products: [] },
      { headers: SEARCH_RESPONSE_HEADERS },
    );
  }

  try {
    const products = await searchCatalogProducts(tenantSlug, normalizedQuery);

    return Response.json({ products }, { headers: SEARCH_RESPONSE_HEADERS });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load search results.",
      },
      { headers: SEARCH_RESPONSE_HEADERS, status: 500 },
    );
  }
}
