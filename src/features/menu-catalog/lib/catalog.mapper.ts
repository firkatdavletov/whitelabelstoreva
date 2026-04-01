import type { Category } from "@/entities/category";
import type { Product } from "@/entities/product";
import type { CurrencyCode } from "@/shared/types/common";

import type {
  CatalogCategoryDto,
  CatalogProductDto,
} from "@/features/menu-catalog/api/catalog.types";

export function mapCatalogCategoryDtoToCategory(
  dto: CatalogCategoryDto,
): Category {
  return {
    description: "",
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
  };
}

export function mapCatalogProductDtoToProduct(
  dto: CatalogProductDto,
  currency: CurrencyCode,
): Product {
  return {
    categoryId: dto.categoryId,
    currency,
    description: dto.description ?? "",
    id: dto.id,
    isAvailable: dto.isActive,
    name: dto.title,
    price: dto.priceMinor / 100,
    slug: dto.slug,
    tags: dto.brand ? [dto.brand] : [],
    visual: dto.title.trim().charAt(0).toUpperCase() || "?",
  };
}
