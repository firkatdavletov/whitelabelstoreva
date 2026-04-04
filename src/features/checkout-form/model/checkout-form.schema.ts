import { z } from "zod";

export type CheckoutFormValues = {
  comment: string;
  fullName: string;
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

export function createCheckoutFormSchema({
  requiresContactDetails,
}: {
  requiresContactDetails: boolean;
}) {
  return z.object({
    comment: z
      .string()
      .trim()
      .max(120, "Keep the courier note under 120 characters."),
    fullName: requiresContactDetails
      ? z.string().trim().min(2, "Enter your full name.")
      : createOptionalContactFieldSchema("Enter your full name."),
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
