import type {
  Product,
  ProductModifierGroup,
  ProductVariant,
} from "@/entities/product";

export type SelectedModifiersState = Record<string, string[]>;
export type SelectedOptionsState = Record<string, string | null>;

export function getActiveVariants(product: Product) {
  return product.variants.filter((variant) => variant.isActive);
}

export function getRenderableModifierGroups(product: Product) {
  return product.modifierGroups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => option.isActive),
    }))
    .filter((group) => group.options.length > 0);
}

export function getRequiredSelections(group: ProductModifierGroup) {
  return Math.max(group.minSelected, group.isRequired ? 1 : 0);
}

export function getMaxSelections(group: ProductModifierGroup) {
  return group.maxSelected > 0 ? group.maxSelected : group.options.length;
}

function getDefaultVariant(product: Product): ProductVariant | null {
  const activeVariants = getActiveVariants(product);

  if (!activeVariants.length) {
    return null;
  }

  return (
    activeVariants.find((variant) => variant.id === product.defaultVariantId) ??
    activeVariants[0] ??
    null
  );
}

export function getDefaultVariantId(product: Product) {
  return getDefaultVariant(product)?.id ?? null;
}

export function createInitialOptionSelection(
  product: Product,
): SelectedOptionsState {
  const defaultVariant = getDefaultVariant(product);
  const selections: SelectedOptionsState = {};

  for (const group of product.optionGroups) {
    const defaultValueId =
      group.values.find((value) =>
        defaultVariant?.optionValueIds.includes(value.id),
      )?.id ??
      group.values[0]?.id ??
      null;

    selections[group.id] = defaultValueId;
  }

  return selections;
}

export function resolveVariantForSelectedOptions(
  product: Product,
  selectedOptionIdsByGroup: SelectedOptionsState,
) {
  const activeVariants = getActiveVariants(product);

  if (!activeVariants.length) {
    return null;
  }

  if (!product.optionGroups.length) {
    return getDefaultVariant(product);
  }

  const selectedOptionValueIds = product.optionGroups
    .map((group) => selectedOptionIdsByGroup[group.id])
    .filter((valueId): valueId is string => Boolean(valueId));

  if (selectedOptionValueIds.length !== product.optionGroups.length) {
    return null;
  }

  return (
    activeVariants.find(
      (variant) =>
        variant.optionValueIds.length === selectedOptionValueIds.length &&
        selectedOptionValueIds.every((valueId) =>
          variant.optionValueIds.includes(valueId),
        ),
    ) ?? null
  );
}

export function createInitialModifierSelection(
  product: Product,
): SelectedModifiersState {
  const selections: SelectedModifiersState = {};

  for (const group of getRenderableModifierGroups(product)) {
    selections[group.id] = group.options
      .filter((option) => option.isDefault)
      .slice(0, getMaxSelections(group))
      .map((option) => option.id);
  }

  return selections;
}

export function resolveVariantLabel(product: Product, variant: ProductVariant) {
  if (variant.title?.trim()) {
    return variant.title.trim();
  }

  const optionTitles = product.optionGroups.flatMap((group) =>
    group.values
      .filter((value) => variant.optionValueIds.includes(value.id))
      .map((value) => value.title),
  );

  return optionTitles.join(" · ") || product.name;
}

export function getNextSelectedModifierIds(
  group: ProductModifierGroup,
  currentSelection: string[],
  optionId: string,
) {
  const requiredSelections = getRequiredSelections(group);
  const maxSelections = getMaxSelections(group);
  const isSelected = currentSelection.includes(optionId);

  if (maxSelections === 1) {
    if (isSelected) {
      return currentSelection.length > requiredSelections
        ? []
        : currentSelection;
    }

    return [optionId];
  }

  if (isSelected) {
    return currentSelection.length > requiredSelections
      ? currentSelection.filter((selectedId) => selectedId !== optionId)
      : currentSelection;
  }

  if (currentSelection.length >= maxSelections) {
    return [...currentSelection.slice(1), optionId];
  }

  return [...currentSelection, optionId];
}
