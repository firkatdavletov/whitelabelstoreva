export type CatalogCategoryDto = {
  id: string;
  imageUrls: string[];
  isActive: boolean;
  name: string;
  slug: string;
};

export type CatalogProductDto = {
  brand: string | null;
  categoryId: string;
  countStep: number;
  description: string | null;
  id: string;
  imageUrls: string[];
  isActive: boolean;
  oldPriceMinor: number | null;
  priceMinor: number;
  sku: string | null;
  slug: string;
  title: string;
  unit: string;
};
