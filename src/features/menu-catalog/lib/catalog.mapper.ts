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
    imageUrl: dto.imageUrls[0] ?? null,
    imageUrls: dto.imageUrls,
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
    countStep: dto.countStep,
    currency,
    defaultVariantId: null,
    description: dto.description ?? "",
    id: dto.id,
    imageUrl: dto.imageUrls[0] ?? null,
    imageUrls: dto.imageUrls,
    isAvailable: dto.isActive,
    isConfigured: dto.isConfigured,
    modifierGroups: [],
    name: dto.title,
    optionGroups: [],
    price: dto.priceMinor / 100,
    slug: dto.slug,
    tags: dto.brand ? [dto.brand] : [],
    unit: dto.unit,
    variants: [],
    visual: dto.title.trim().charAt(0).toUpperCase() || "?",
  };
}
