"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useCheckoutMutation } from "@/features/checkout-form/hooks/use-checkout-mutation";
import { useCheckoutOptionsQuery } from "@/features/checkout-form/hooks/use-checkout-options-query";
import {
  buildCheckoutRequest,
  formatCheckoutDeliveryAddress,
  isPickupCheckoutDelivery,
  resolveCheckoutPaymentMethods,
} from "@/features/checkout-form/lib/checkout-form.utils";
import {
  getRememberedGuestCheckoutContact,
  rememberGuestCheckoutContact,
} from "@/features/checkout-form/lib/guest-checkout-contact-storage";
import type { CheckoutFormValues } from "@/features/checkout-form/model/checkout-form.schema";
import { createCheckoutFormSchema } from "@/features/checkout-form/model/checkout-form.schema";
import { rememberTrackedOrderId } from "@/features/order-tracking/lib/tracked-order-storage";
import { useStorefrontRoute } from "@/shared/hooks/use-storefront-route";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  SelectableCard,
  SelectableCardIndicator,
} from "@/shared/ui/selectable-card";
import { Skeleton } from "@/shared/ui/skeleton";

type CheckoutFormProps = {
  isAuthorized: boolean;
};

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
  const deliveryAddress = delivery?.address;
  const isPickupDelivery = isPickupCheckoutDelivery(delivery?.deliveryMethod);
  const isCourierDelivery = delivery?.deliveryMethod === "COURIER";
  const selectedAddressLabel = formatCheckoutDeliveryAddress(delivery);

  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      apartment: "",
      comment: "",
      entrance: "",
      floor: "",
      fullName: "",
      isPrivateHouse: false,
      intercom: "",
      paymentMethodCode: "",
      phone: "",
    },
    resolver: zodResolver(
      createCheckoutFormSchema({
        requiresApartment: isCourierDelivery,
        requiresContactDetails: !isAuthorized,
      }),
    ),
  });
  const isPrivateHouse = useWatch({
    control: form.control,
    name: "isPrivateHouse",
  });

  const paymentMethods = resolveCheckoutPaymentMethods(
    checkoutOptionsQuery.data?.options,
    delivery?.deliveryMethod,
  );

  useEffect(() => {
    if (isAuthorized) {
      return;
    }

    const rememberedContact = getRememberedGuestCheckoutContact(tenantSlug);

    if (!rememberedContact) {
      return;
    }

    if (!form.getValues("fullName").trim()) {
      form.setValue("fullName", rememberedContact.fullName, {
        shouldDirty: false,
      });
    }

    if (!form.getValues("phone").trim()) {
      form.setValue("phone", rememberedContact.phone, {
        shouldDirty: false,
      });
    }
  }, [form, isAuthorized, tenantSlug]);

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

    if (paymentMethods.some((method) => method.code === currentPaymentMethod)) {
      return;
    }

    form.setValue("paymentMethodCode", paymentMethods[0].code, {
      shouldDirty: false,
    });
  }, [form, paymentMethods]);

  useEffect(() => {
    if (!isCourierDelivery || !deliveryAddress || isPrivateHouse) {
      return;
    }

    const draftFields: Array<
      [
        "apartment" | "comment" | "entrance" | "floor" | "intercom",
        string | null | undefined,
      ]
    > = [
      ["apartment", deliveryAddress.apartment],
      ["entrance", deliveryAddress.entrance],
      ["intercom", deliveryAddress.intercom],
      ["floor", deliveryAddress.floor],
      ["comment", deliveryAddress.comment],
    ];

    draftFields.forEach(([fieldName, value]) => {
      if (!value?.trim() || form.getValues(fieldName)?.trim()) {
        return;
      }

      form.setValue(fieldName, value, {
        shouldDirty: false,
      });
    });
  }, [deliveryAddress, form, isCourierDelivery, isPrivateHouse]);

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
          <p className="text-muted-foreground text-sm">
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
          <p className="text-muted-foreground text-sm">
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
        <div className="border-border/70 rounded-[28px] border bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(246,239,228,0.92))] p-5 shadow-[0_22px_55px_-42px_rgba(31,26,23,0.45)]">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
            {t(
              isPickupDelivery
                ? "checkout.pickupLocation"
                : "checkout.deliveryLocation",
            )}
          </p>
          <p className="mt-3 text-base font-semibold sm:text-lg">
            {selectedAddressLabel ?? "—"}
          </p>
        </div>

        <Form {...form}>
          <form
            className="grid gap-5"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const checkoutRequest = buildCheckoutRequest(values, {
                  deliveryAddress: isCourierDelivery ? deliveryAddress : null,
                });
                const order =
                  await checkoutMutation.mutateAsync(checkoutRequest);

                if (!isAuthorized) {
                  rememberGuestCheckoutContact(tenantSlug, {
                    fullName: checkoutRequest.customerName,
                    phone: checkoutRequest.customerPhone,
                  });
                }

                toast.success(t("toast.checkoutSuccessTitle"), {
                  description: t("toast.checkoutSuccessDescription", {
                    orderNumber: order.orderNumber,
                  }),
                });

                rememberTrackedOrderId(tenantSlug, order.id);
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
                        <Input {...field} value={field.value ?? ""} />
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
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            {isCourierDelivery ? (
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="isPrivateHouse"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <SelectableCard
                          className="bg-background/70"
                          onClick={() => {
                            const nextValue = !Boolean(field.value);

                            field.onChange(nextValue);

                            if (!nextValue) {
                              return;
                            }

                            (
                              [
                                "apartment",
                                "entrance",
                                "floor",
                                "intercom",
                              ] as const
                            ).forEach((fieldName) => {
                              form.setValue(fieldName, "", {
                                shouldDirty: true,
                                shouldValidate: false,
                              });
                              form.clearErrors(fieldName);
                            });
                          }}
                          selected={Boolean(field.value)}
                        >
                          <div className="min-w-0">
                            <p className="text-sm leading-5 font-medium">
                              {t("checkout.privateHouse")}
                            </p>
                          </div>
                          <SelectableCardIndicator
                            selected={Boolean(field.value)}
                          />
                        </SelectableCard>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isPrivateHouse ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="apartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.apartment")}</FormLabel>
                          <FormControl>
                            <Input
                              required={isCourierDelivery}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="entrance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.entrance")}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="intercom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.intercom")}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.floor")}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="paymentMethodCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.paymentMethod")}</FormLabel>
                  <FormControl>
                    <div className="grid gap-3">
                      {checkoutOptionsQuery.isLoading &&
                      !checkoutOptionsQuery.data ? (
                        <>
                          <Skeleton className="h-20 rounded-2xl" />
                          <Skeleton className="h-20 rounded-2xl" />
                        </>
                      ) : checkoutOptionsQuery.isError ? (
                        <div className="border-destructive/20 bg-destructive/5 rounded-2xl border p-4">
                          <p className="text-muted-foreground text-sm">
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
                              aria-pressed={isSelected}
                              className={`rounded-2xl border p-4 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground shadow-[0_20px_38px_-26px_rgba(216,90,30,0.85)]"
                                  : "border-border/70 bg-background/70 hover:border-primary/40 hover:bg-background"
                              }`}
                              key={method.code}
                              onClick={() => field.onChange(method.code)}
                              type="button"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="font-medium">{method.name}</p>
                                  {method.description ? (
                                    <p
                                      className={`text-sm ${
                                        isSelected
                                          ? "text-primary-foreground/82"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {method.description}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={
                                      isSelected
                                        ? "border-primary-foreground/18 bg-primary-foreground/12 text-primary-foreground"
                                        : undefined
                                    }
                                    variant={
                                      isSelected
                                        ? "outline"
                                        : method.isOnline
                                          ? "default"
                                          : "secondary"
                                    }
                                  >
                                    {t(
                                      method.isOnline
                                        ? "checkout.paymentMethodOnline"
                                        : "checkout.paymentMethodOffline",
                                    )}
                                  </Badge>
                                  <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                                      isSelected
                                        ? "border-primary-foreground/40 bg-primary-foreground/14"
                                        : "border-border bg-background/80"
                                    }`}
                                  >
                                    <span
                                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                        isSelected
                                          ? "bg-primary-foreground"
                                          : "bg-transparent"
                                      }`}
                                    />
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="border-border/70 bg-background/70 rounded-2xl border p-4">
                          <p className="text-muted-foreground text-sm">
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
                    <Input {...field} value={field.value ?? ""} />
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
