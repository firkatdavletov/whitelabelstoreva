import type { Category } from "@/entities/category";
import type { Product } from "@/entities/product";

export function normalizeMenuCategoryParam(
  value: string | string[] | undefined,
) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate?.trim();

  return normalized ? normalized : null;
}

export function resolveMenuCategory(
  categories: Category[],
  categoryParam: string | null | undefined,
) {
  if (!categories.length) {
    return null;
  }

  if (categoryParam) {
    const matchedCategory = categories.find(
      (category) =>
        category.slug === categoryParam || category.id === categoryParam,
    );

    if (matchedCategory) {
      return matchedCategory;
    }
  }

  return categories[0];
}

export function getMenuCategoryProducts(
  products: Product[],
  categoryId: string | null | undefined,
) {
  if (!categoryId) {
    return products;
  }

  return products.filter((product) => product.categoryId === categoryId);
}

export function buildMenuCategoryHref(href: string, categorySlug: string) {
  const [pathWithQuery, hash = ""] = href.split("#", 2);
  const [pathname, queryString = ""] = pathWithQuery.split("?", 2);
  const searchParams = new URLSearchParams(queryString);

  searchParams.set("category", categorySlug);

  const nextSearch = searchParams.toString();
  const nextHash = hash ? `#${hash}` : "";

  return nextSearch
    ? `${pathname}?${nextSearch}${nextHash}`
    : `${pathname}${nextHash}`;
}
