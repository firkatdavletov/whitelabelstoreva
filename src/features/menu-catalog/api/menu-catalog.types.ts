import type { CategoryDto } from "@/entities/category";
import type { ProductDto } from "@/entities/product";
import type { RestaurantDto } from "@/entities/restaurant";

export type MenuCatalogDto = {
  categories: CategoryDto[];
  products: ProductDto[];
  restaurant: RestaurantDto;
};
