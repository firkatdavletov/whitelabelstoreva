"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  type StorefrontCartItem,
  isAddressDeliveryMethod,
} from "@/entities/cart";
import { getTenantConfig } from "@/entities/tenant";
import { useStorefrontCartQuery } from "@/features/cart-summary/hooks/use-storefront-cart-query";
import { useCheckoutMutation } from "@/features/checkout-form/hooks/use-checkout-mutation";
import { useCheckoutOptionsQuery } from "@/features/checkout-form/hooks/use-checkout-options-query";
import {
  buildCheckoutRequest,
  findCheckoutDeliveryOption,
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
import { trackCommerceEvent } from "@/shared/analytics/analytics";
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

function createAnalyticsItems(items: StorefrontCartItem[], currency: string) {
  return items.map((item) => ({
    currency,
    itemId: item.productId,
    itemName: item.title,
    price: item.quantity > 0 ? item.lineTotal / item.quantity : item.lineTotal,
    quantity: item.quantity,
  }));
}

export function CheckoutForm({ isAuthorized }: CheckoutFormProps) {
  const { href, tenantSlug } = useStorefrontRoute();
  const router = useRouter();
  const { t } = useTranslation();
  const tenantConfig = getTenantConfig(tenantSlug);
  const currency = tenantConfig?.currency ?? "RUB";
  const legalConsentId = useId();
  const beginCheckoutSignatureRef = useRef<string | null>(null);
  const [hasAcceptedLegalDocuments, setHasAcceptedLegalDocuments] =
    useState(true);
  const { data: storefrontCart, isLoading } =
    useStorefrontCartQuery(tenantSlug);

  const delivery = storefrontCart?.delivery;
  const checkoutPickupPointId =
    delivery?.pickupPointId ?? delivery?.pickupPointExternalId ?? undefined;
  const checkoutOptionsQuery = useCheckoutOptionsQuery(
    tenantSlug,
    checkoutPickupPointId,
  );
  const checkoutMutation = useCheckoutMutation(tenantSlug);
  const deliveryAddress = delivery?.address;
  const selectedDeliveryOption = findCheckoutDeliveryOption(
    checkoutOptionsQuery.data?.options,
    delivery?.deliveryMethod,
  );
  const isPickupDelivery =
    selectedDeliveryOption?.requiresPickupPoint ??
    isPickupCheckoutDelivery(delivery?.deliveryMethod);
  const isAddressDelivery =
    selectedDeliveryOption?.requiresAddress ??
    isAddressDeliveryMethod(delivery?.deliveryMethod);
  const showsAddressMetaFields = delivery?.deliveryMethod === "COURIER";
  const selectedAddressLabel = formatCheckoutDeliveryAddress(delivery);
  const legalDocumentLinks = [
    {
      href: href("/legal/public-offer"),
      label: t("footer.publicOffer"),
    },
    {
      href: href("/legal/personal-data-policy"),
      label: t("footer.personalDataPolicy"),
    },
    {
      href: href("/legal/personal-data-consent"),
      label: t("footer.personalDataConsent"),
    },
  ];

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
        requiresApartment: showsAddressMetaFields,
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
    if (!isAddressDelivery || !deliveryAddress) {
      return;
    }

    const draftFields: Array<
      [
        "apartment" | "comment" | "entrance" | "floor" | "intercom",
        string | null | undefined,
      ]
    > = [["comment", deliveryAddress.comment]];

    if (showsAddressMetaFields && !isPrivateHouse) {
      draftFields.unshift(
        ["apartment", deliveryAddress.apartment],
        ["entrance", deliveryAddress.entrance],
        ["intercom", deliveryAddress.intercom],
        ["floor", deliveryAddress.floor],
      );
    }

    draftFields.forEach(([fieldName, value]) => {
      if (!value?.trim() || form.getValues(fieldName)?.trim()) {
        return;
      }

      form.setValue(fieldName, value, {
        shouldDirty: false,
      });
    });
  }, [
    deliveryAddress,
    form,
    isAddressDelivery,
    isPrivateHouse,
    showsAddressMetaFields,
  ]);

  useEffect(() => {
    if (showsAddressMetaFields) {
      return;
    }

    (["apartment", "entrance", "floor", "intercom"] as const).forEach(
      (fieldName) => {
        if (form.getValues(fieldName) !== "") {
          form.setValue(fieldName, "", {
            shouldDirty: false,
            shouldValidate: false,
          });
        }

        form.clearErrors(fieldName);
      },
    );

    if (form.getValues("isPrivateHouse")) {
      form.setValue("isPrivateHouse", false, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }

    form.clearErrors("isPrivateHouse");
  }, [form, showsAddressMetaFields]);

  useEffect(() => {
    if (!storefrontCart?.items.length) {
      return;
    }

    const signature = storefrontCart.items
      .map((item) => `${item.id}:${item.quantity}:${item.lineTotal}`)
      .join("|");

    if (beginCheckoutSignatureRef.current === signature) {
      return;
    }

    beginCheckoutSignatureRef.current = signature;

    trackCommerceEvent({
      currency,
      event: "begin_checkout",
      items: createAnalyticsItems(storefrontCart.items, currency),
      value: storefrontCart.totalPrice,
    });
  }, [currency, storefrontCart]);

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
        <div className="rounded-3xl border border-white/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_93%,white),color-mix(in_srgb,var(--secondary)_48%,white))] p-5 shadow-[0_24px_70px_-40px_rgba(24,19,15,0.42)] sm:p-6">
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
                const cartSnapshot = storefrontCart;
                const checkoutRequest = buildCheckoutRequest(values, {
                  deliveryAddress: isAddressDelivery ? deliveryAddress : null,
                  includeAddressMetaFields: showsAddressMetaFields,
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

                if (cartSnapshot?.items.length) {
                  trackCommerceEvent({
                    currency,
                    event: "purchase",
                    items: createAnalyticsItems(cartSnapshot.items, currency),
                    orderId: order.orderNumber,
                    value: cartSnapshot.totalPrice,
                  });
                }

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

            {showsAddressMetaFields ? (
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
                              required={isAddressDelivery}
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

            <div
              className={`rounded-2xl border p-4 transition-colors ${
                hasAcceptedLegalDocuments
                  ? "border-border/70 bg-background/65"
                  : "border-destructive/25 bg-destructive/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  checked={hasAcceptedLegalDocuments}
                  className="border-border accent-primary mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded"
                  id={legalConsentId}
                  onChange={(event) =>
                    setHasAcceptedLegalDocuments(event.target.checked)
                  }
                  type="checkbox"
                />
                <div className="min-w-0">
                  <label
                    className="cursor-pointer text-sm font-medium"
                    htmlFor={legalConsentId}
                  >
                    {t("checkout.legalAgreementLabel")}
                  </label>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    <Link
                      className="decoration-border hover:text-foreground underline underline-offset-4 transition"
                      href={legalDocumentLinks[0].href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {legalDocumentLinks[0].label}
                    </Link>
                    {", "}
                    <Link
                      className="decoration-border hover:text-foreground underline underline-offset-4 transition"
                      href={legalDocumentLinks[1].href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {legalDocumentLinks[1].label}
                    </Link>{" "}
                    {t("checkout.and").toLowerCase()}{" "}
                    <Link
                      className="decoration-border hover:text-foreground underline underline-offset-4 transition"
                      href={legalDocumentLinks[2].href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {legalDocumentLinks[2].label}
                    </Link>
                    .
                  </p>
                </div>
              </div>
              {!hasAcceptedLegalDocuments ? (
                <p className="text-destructive mt-3 text-sm">
                  {t("checkout.legalAgreementRequired")}
                </p>
              ) : null}
            </div>

            <Button
              className="mt-1 w-full sm:w-fit"
              disabled={
                !hasAcceptedLegalDocuments ||
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
