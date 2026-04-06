import { z } from "zod";

export type CheckoutFormValues = {
  apartment: string;
  comment: string;
  entrance: string;
  floor: string;
  fullName: string;
  intercom: string;
  paymentMethodCode: string;
  phone: string;
};

const phonePattern = /^[\d+\-()\s]+$/;

function createOptionalContactFieldSchema(message: string) {
  return z
    .string()
    .trim()
    .refine((value) => value === "" || value.length >= 2, message);
}

function createOptionalPhoneSchema() {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || (value.length >= 8 && phonePattern.test(value)),
      "Enter a valid phone number.",
    )
    .refine(
      (value) => value === "" || phonePattern.test(value),
      "Phone number can contain digits, spaces, and + - ( ).",
    );
}

function createMetaFieldSchema(requiredMessage?: string) {
  const schema = z
    .string()
    .trim()
    .max(40, "Keep this field under 40 characters.");

  return requiredMessage ? schema.min(1, requiredMessage) : schema;
}

export function createCheckoutFormSchema({
  requiresContactDetails,
  requiresApartment = false,
}: {
  requiresContactDetails: boolean;
  requiresApartment?: boolean;
}) {
  return z.object({
    apartment: createMetaFieldSchema(
      requiresApartment ? "Enter apartment number." : undefined,
    ),
    comment: z
      .string()
      .trim()
      .max(200, "Keep the courier note under 200 characters."),
    entrance: createMetaFieldSchema(),
    floor: createMetaFieldSchema(),
    fullName: requiresContactDetails
      ? z.string().trim().min(2, "Enter your full name.")
      : createOptionalContactFieldSchema("Enter your full name."),
    intercom: createMetaFieldSchema(),
    paymentMethodCode: z.string().min(1, "Choose a payment method."),
    phone: requiresContactDetails
      ? z
          .string()
          .trim()
          .min(8, "Enter a valid phone number.")
          .regex(
            phonePattern,
            "Phone number can contain digits, spaces, and + - ( ).",
          )
      : createOptionalPhoneSchema(),
  });
}
