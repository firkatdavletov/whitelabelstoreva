export type CartConfigurationModifier = {
  modifierGroupId: string;
  modifierOptionId: string;
  quantity: number;
};

type CartConfigurationKeyInput = {
  modifiers?: readonly CartConfigurationModifier[] | null;
  productId: string;
  variantId?: string | null;
};

export function createCartConfigurationKey({
  modifiers,
  productId,
  variantId,
}: CartConfigurationKeyInput) {
  const modifierKey = (modifiers ?? [])
    .slice()
    .sort((left, right) =>
      `${left.modifierGroupId}:${left.modifierOptionId}`.localeCompare(
        `${right.modifierGroupId}:${right.modifierOptionId}`,
      ),
    )
    .map(
      (modifier) =>
        `${modifier.modifierGroupId}:${modifier.modifierOptionId}:${modifier.quantity}`,
    )
    .join("|");

  return [productId, variantId ?? "base", modifierKey].join("::");
}
