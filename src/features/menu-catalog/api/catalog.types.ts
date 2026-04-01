import type { paths } from "@/shared/api/generated/schema";

export type CatalogCategoryDto =
  paths["/api/v1/catalog/categories"]["get"]["responses"][200]["content"]["application/json"][number];

export type CatalogProductDto =
  paths["/api/v1/catalog/products"]["get"]["responses"][200]["content"]["application/json"][number];
