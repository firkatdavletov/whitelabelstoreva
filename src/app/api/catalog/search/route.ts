import type { NextRequest } from "next/server";

import { searchCatalogProducts } from "@/features/menu-catalog/api/search-catalog-products";
import {
  isCatalogSearchQueryEligible,
  normalizeCatalogSearchQuery,
} from "@/features/menu-catalog/lib/catalog-search";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";

export async function GET(request: NextRequest) {
  const tenantSlug = request.nextUrl.searchParams.get("tenant");
  const normalizedQuery = normalizeCatalogSearchQuery(
    request.nextUrl.searchParams.get("query"),
  );

  if (!tenantSlug || !resolveTenant(tenantSlug)) {
    return Response.json({ message: "Invalid tenant." }, { status: 400 });
  }

  if (!normalizedQuery || !isCatalogSearchQueryEligible(normalizedQuery)) {
    return Response.json({ products: [] });
  }

  try {
    const products = await searchCatalogProducts(tenantSlug, normalizedQuery);

    return Response.json({ products });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load search results.",
      },
      { status: 500 },
    );
  }
}
