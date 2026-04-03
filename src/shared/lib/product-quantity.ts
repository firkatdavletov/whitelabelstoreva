import type { components } from "@/shared/api/generated/schema";
import type { Locale } from "@/shared/types/common";

export type ProductUnit = components["schemas"]["ProductUnit"];

const unitLabels: Record<Locale, Record<ProductUnit, string>> = {
  en: {
    GRAM: "g",
    KILOGRAM: "kg",
    LITER: "l",
    MILLILITER: "ml",
    PIECE: "pcs",
  },
  ru: {
    GRAM: "г",
    KILOGRAM: "кг",
    LITER: "л",
    MILLILITER: "мл",
    PIECE: "шт",
  },
};

export function formatProductQuantity(
  quantity: number,
  unit: ProductUnit,
  locale: Locale,
) {
  const formatOptions: Intl.NumberFormatOptions =
    unit === "PIECE"
      ? {
          maximumFractionDigits: 0,
        }
      : {
          maximumFractionDigits: 3,
        };

  const formattedQuantity = new Intl.NumberFormat(locale, formatOptions).format(
    quantity,
  );

  return `${formattedQuantity} ${unitLabels[locale][unit]}`;
}
