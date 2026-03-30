import type { ProductDto } from "@/entities/product/api/product.dto";
import type { Product } from "@/entities/product/model/product.types";

// DTO-to-domain mapping is kept close to the entity so feature modules stay focused on use cases.
export function mapProductDtoToProduct(dto: ProductDto): Product {
  return {
    categoryId: dto.category_id,
    currency: dto.currency,
    description: dto.description,
    id: dto.id,
    isAvailable: dto.is_available,
    name: dto.name,
    price: dto.price_minor / 100,
    slug: dto.slug,
    tags: dto.tags,
    visual: dto.visual_hint,
  };
}
