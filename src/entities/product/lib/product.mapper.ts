import type {
  ProductDetailsDto,
  ProductDto,
} from "@/entities/product/api/product.dto";
import type { Product } from "@/entities/product/model/product.types";

function normalizeImageUrls(imageUrls: string[] | null | undefined) {
  return imageUrls?.map((imageUrl) => imageUrl.trim()).filter(Boolean) ?? [];
}

// DTO-to-domain mapping is kept close to the entity so feature modules stay focused on use cases.
export function mapProductDtoToProduct(dto: ProductDto): Product {
  return {
    categoryId: dto.category_id,
    countStep: 1,
    currency: dto.currency,
    defaultVariantId: null,
    description: dto.description,
    id: dto.id,
    imageUrl: null,
    imageUrls: [],
    isAvailable: dto.is_available,
    isConfigured: false,
    modifierGroups: [],
    name: dto.name,
    optionGroups: [],
    price: dto.price_minor / 100,
    slug: dto.slug,
    tags: dto.tags,
    unit: "PIECE",
    variants: [],
    visual: dto.visual_hint,
  };
}

export function mapProductDetailsDtoToProduct(
  dto: ProductDetailsDto,
  product: Product,
): Product {
  const productImageUrls = normalizeImageUrls(dto.imageUrls);
  const resolvedProductImageUrls = productImageUrls.length
    ? productImageUrls
    : normalizeImageUrls(product.imageUrls);

  return {
    ...product,
    categoryId: dto.categoryId,
    countStep: dto.countStep,
    defaultVariantId: dto.defaultVariantId ?? null,
    description: dto.description ?? product.description,
    imageUrl: resolvedProductImageUrls[0] ?? product.imageUrl,
    imageUrls: resolvedProductImageUrls,
    isAvailable: dto.isActive,
    isConfigured: dto.isConfigured,
    modifierGroups: dto.modifierGroups
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((group) => ({
        id: group.id,
        isRequired: group.isRequired,
        maxSelected: group.maxSelected,
        minSelected: group.minSelected,
        name: group.name,
        options: group.options
          .slice()
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map((option) => ({
            description: option.description ?? "",
            id: option.id,
            isActive: option.isActive,
            isDefault: option.isDefault,
            name: option.name,
            price: option.price / 100,
            priceType: option.priceType,
          })),
      })),
    name: dto.title,
    optionGroups: dto.optionGroups
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((group) => ({
        id: group.id,
        title: group.title,
        values: group.values
          .slice()
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map((value) => ({
            id: value.id,
            title: value.title,
          })),
      })),
    price: dto.priceMinor / 100,
    slug: dto.slug,
    unit: dto.unit,
    variants: dto.variants
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((variant) => {
        const variantImageUrls = normalizeImageUrls(variant.imageUrls);

        return {
          id: variant.id,
          imageUrl: variantImageUrls[0] ?? null,
          imageUrls: variantImageUrls,
          isActive: variant.isActive,
          optionValueIds: variant.optionValueIds,
          price:
            variant.priceMinor !== undefined && variant.priceMinor !== null
              ? variant.priceMinor / 100
              : null,
          title: variant.title ?? null,
        };
      }),
  };
}
