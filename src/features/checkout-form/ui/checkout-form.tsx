"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useCheckoutMutation } from "@/features/checkout-form/hooks/use-checkout-mutation";
import { useCheckoutOptionsQuery } from "@/features/checkout-form/hooks/use-checkout-options-query";
import {
  buildCheckoutRequest,
  findCheckoutDeliveryOption,
  formatCheckoutDeliveryAddress,
  resolveCheckoutPaymentMethods,
  resolveDeliveryMethodFallbackLabel,
} from "@/features/checkout-form/lib/checkout-form.utils";
import type { CheckoutFormValues } from "@/features/checkout-form/model/checkout-form.schema";
import { createCheckoutFormSchema } from "@/features/checkout-form/model/checkout-form.schema";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";

type CheckoutFormProps = {
  isAuthorized: boolean;
};

type CheckoutInfoRowProps = {
  label: string;
  value: string;
};

function CheckoutInfoRow({ label, value }: CheckoutInfoRowProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium sm:text-base">{value}</p>
    </div>
  );
}

function CheckoutFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-8 w-52 rounded-full" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-48" />
      </CardContent>
    </Card>
  );
}

export function CheckoutForm({ isAuthorized }: CheckoutFormProps) {
  const { href, tenantSlug } = useStorefrontRoute();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: storefrontCart, isLoading } =
    useStorefrontCartQuery(tenantSlug);

  const delivery = storefrontCart?.delivery;
  const checkoutOptionsQuery = useCheckoutOptionsQuery(
    tenantSlug,
    delivery?.pickupPointId,
  );
  const checkoutMutation = useCheckoutMutation(tenantSlug);

  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      comment: "",
      fullName: "",
      paymentMethodCode: "",
      phone: "",
    },
    resolver: zodResolver(
      createCheckoutFormSchema({
        requiresContactDetails: !isAuthorized,
      }),
    ),
  });

  const deliveryOption = findCheckoutDeliveryOption(
    checkoutOptionsQuery.data?.options,
    delivery?.deliveryMethod,
  );
  const paymentMethods = resolveCheckoutPaymentMethods(
    checkoutOptionsQuery.data?.options,
    delivery?.deliveryMethod,
  );
  const selectedAddressLabel = formatCheckoutDeliveryAddress(delivery);
  const selectedDeliveryMethodLabel =
    deliveryOption?.name ??
    resolveDeliveryMethodFallbackLabel(delivery?.deliveryMethod) ??
    "—";

  useEffect(() => {
    const currentPaymentMethod = form.getValues("paymentMethodCode");

    if (!paymentMethods.length) {
      if (currentPaymentMethod !== "") {
        form.setValue("paymentMethodCode", "", {
          shouldDirty: false,
        });
      }
      return;
    }

    if (
      paymentMethods.some((method) => method.code === currentPaymentMethod)
    ) {
      return;
    }

    form.setValue("paymentMethodCode", paymentMethods[0].code, {
      shouldDirty: false,
    });
  }, [form, paymentMethods]);

  if (isLoading && !storefrontCart) {
    return <CheckoutFormSkeleton />;
  }

  if (!storefrontCart || !storefrontCart.items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("checkout.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("checkout.emptyCart")}
          </p>
          <Button asChild className="w-full sm:w-fit">
            <Link href={href("/cart")}>{t("checkout.goToCart")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!delivery?.deliveryMethod) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("checkout.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("checkout.missingDelivery")}
          </p>
          <Button asChild className="w-full sm:w-fit">
            <Link href={href("/delivery")}>{t("checkout.goToDelivery")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("checkout.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <CheckoutInfoRow
            label={t("checkout.deliveryMethod")}
            value={selectedDeliveryMethodLabel}
          />
          <CheckoutInfoRow
            label={t("checkout.address")}
            value={selectedAddressLabel ?? "—"}
          />
        </div>

        <Form {...form}>
          <form
            className="grid gap-5"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const order = await checkoutMutation.mutateAsync(
                  buildCheckoutRequest(values),
                );

                toast.success(t("toast.checkoutSuccessTitle"), {
                  description: t("toast.checkoutSuccessDescription", {
                    orderNumber: order.orderNumber,
                  }),
                });

                router.push(href(`/orders/${order.id}`));
              } catch (error) {
                toast.error(t("toast.checkoutErrorTitle"), {
                  description:
                    error instanceof Error
                      ? error.message
                      : t("checkout.paymentMethodsError"),
                });
              }
            })}
          >
            {!isAuthorized ? (
              <>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("checkout.fullName")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Алексей Иванов" {...field} />
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
                        <Input placeholder="+7 (999) 123-45-67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            <FormField
              control={form.control}
              name="paymentMethodCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.paymentMethod")}</FormLabel>
                  <FormControl>
                    <div className="grid gap-3">
                      {checkoutOptionsQuery.isLoading && !checkoutOptionsQuery.data ? (
                        <>
                          <Skeleton className="h-20 rounded-2xl" />
                          <Skeleton className="h-20 rounded-2xl" />
                        </>
                      ) : checkoutOptionsQuery.isError ? (
                        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                          <p className="text-sm text-muted-foreground">
                            {t("checkout.paymentMethodsError")}
                          </p>
                          <Button
                            className="mt-3"
                            onClick={() => checkoutOptionsQuery.refetch()}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {t("shared.retry")}
                          </Button>
                        </div>
                      ) : paymentMethods.length ? (
                        paymentMethods.map((method) => {
                          const isSelected = field.value === method.code;

                          return (
                            <button
                              className={`rounded-2xl border p-4 text-left transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border/70 bg-background/70 hover:border-primary/40"
                              }`}
                              key={method.code}
                              onClick={() => field.onChange(method.code)}
                              type="button"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="font-medium">{method.name}</p>
                                  {method.description ? (
                                    <p className="text-sm text-muted-foreground">
                                      {method.description}
                                    </p>
                                  ) : null}
                                </div>
                                <Badge
                                  variant={method.isOnline ? "default" : "secondary"}
                                >
                                  {t(
                                    method.isOnline
                                      ? "checkout.paymentMethodOnline"
                                      : "checkout.paymentMethodOffline",
                                  )}
                                </Badge>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                          <p className="text-sm text-muted-foreground">
                            {t("checkout.paymentMethodsEmpty")}
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
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
                    <Input
                      placeholder="Позвоните за 5 минут до приезда"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="mt-1 w-full sm:w-fit"
              disabled={
                checkoutMutation.isPending ||
                checkoutOptionsQuery.isLoading ||
                !paymentMethods.length
              }
              size="lg"
              type="submit"
            >
              {t("checkout.submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
