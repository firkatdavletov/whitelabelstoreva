"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import type { CheckoutFormValues } from "@/features/checkout-form/model/checkout-form.schema";
import { checkoutFormSchema } from "@/features/checkout-form/model/checkout-form.schema";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

export function CheckoutForm() {
  const { t } = useTranslation();
  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      address: "",
      comment: "",
      fullName: "",
      paymentMethod: "Card on delivery",
      phone: "",
    },
    resolver: zodResolver(checkoutFormSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("checkout.title")}</CardTitle>
        <CardDescription>{t("checkout.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(() => {
              toast.success(t("toast.checkoutReadyTitle"), {
                description: t("toast.checkoutReadyDescription"),
              });
            })}
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.fullName")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Alex Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-45-67" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.address")}</FormLabel>
                  <FormControl>
                    <Input placeholder="221B Baker Street, Apt 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.paymentMethod")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Card on delivery" {...field} />
                  </FormControl>
                  <FormDescription>
                    This field becomes a backend enum once checkout is integrated.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.comment")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Please call on arrival" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-2 w-full sm:w-fit" size="lg" type="submit">
              {t("checkout.submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
