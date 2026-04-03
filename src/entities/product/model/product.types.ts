import type { components } from "@/shared/api/generated/schema";
import type { CurrencyCode } from "@/shared/types/common";

export type ProductOptionValue = {
  id: string;
  title: string;
};

export type ProductOptionGroup = {
  id: string;
  title: string;
  values: ProductOptionValue[];
};

export type ProductModifierOption = {
  description: string;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  name: string;
  price: number;
  priceType: components["schemas"]["ModifierPriceType"];
};

export type ProductModifierGroup = {
  id: string;
  isRequired: boolean;
  maxSelected: number;
  minSelected: number;
  name: string;
  options: ProductModifierOption[];
};

export type ProductVariant = {
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  optionValueIds: string[];
  price: number | null;
  title: string | null;
};

export type Product = {
  categoryId: string;
  currency: CurrencyCode;
  defaultVariantId: string | null;
  description: string;
  id: string;
  imageUrl: string | null;
  isAvailable: boolean;
  modifierGroups: ProductModifierGroup[];
  name: string;
  optionGroups: ProductOptionGroup[];
  price: number;
  slug: string;
  tags: string[];
  variants: ProductVariant[];
  visual: string;
};
