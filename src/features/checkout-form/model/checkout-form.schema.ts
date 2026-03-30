import { z } from "zod";

export const checkoutFormSchema = z.object({
  address: z.string().min(8, "Enter a full delivery address."),
  comment: z.string().max(120, "Keep the courier note under 120 characters.").optional(),
  fullName: z.string().min(2, "Enter your full name."),
  paymentMethod: z.string().min(2, "Choose a payment method."),
  phone: z
    .string()
    .min(8, "Enter a valid phone number.")
    .regex(/^[\d+\-()\s]+$/, "Phone number can contain digits, spaces, and + - ( )."),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
