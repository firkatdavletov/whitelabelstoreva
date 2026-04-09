import type { CategoryDto } from "@/entities/category/api/category.dto";
import type { Category } from "@/entities/category/model/category.types";

export function mapCategoryDtoToCategory(dto: CategoryDto): Category {
  return {
    description: dto.description,
    id: dto.id,
    imageUrl: dto.imageUrl ?? null,
    name: dto.name,
    slug: dto.slug,
  };
}
