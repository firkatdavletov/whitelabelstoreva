"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { AddToCartButton } from "@/features/add-to-cart";
import type { Product } from "@/entities/product";
import { getProductCardImageSrc } from "@/entities/product/lib/product-card";
import { formatCurrency } from "@/shared/lib/currency";
import type { Locale } from "@/shared/types/common";
import { Card } from "@/shared/ui/card";

export type ProductCardProps = {
  locale: Locale;
  product: Product;
  productHref: string;
};

export function ClassicProductCard({
  locale,
  product,
  productHref,
}: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="group border-border/75 bg-card relative flex min-h-[244px] w-full max-w-[164px] flex-col overflow-hidden rounded-lg shadow-[0_18px_38px_-26px_rgba(31,26,23,0.42)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_54px_-28px_rgba(31,26,23,0.38)] md:min-h-[348px] md:max-w-[280px]">
      <Link
        aria-label={`${t("product.preview")} ${product.name}`}
        className="focus-visible:ring-ring absolute inset-0 z-10 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        href={productHref}
      >
        <span className="sr-only">{`${t("product.preview")} ${product.name}`}</span>
      </Link>

      <div className="bg-muted/38 relative aspect-[4/3] w-full overflow-hidden">
        <Image
          alt={product.name}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          sizes="(max-width: 767px) 164px, 280px"
          src={getProductCardImageSrc(product)}
          unoptimized
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(20,13,10,0.12))]" />
      </div>

      <div className="flex min-h-[121px] flex-1 flex-col px-3 pt-2.5 pb-3 md:min-h-[138px] md:px-4 md:pt-3.5 md:pb-4">
        <div className="space-y-1.5 md:space-y-2">
          <h3 className="font-heading [display:-webkit-box] overflow-hidden text-[0.95rem] leading-5 font-semibold tracking-tight [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:text-[1.22rem] md:leading-6">
            {product.name}
          </h3>

          <p className="font-heading text-[1.05rem] leading-none font-semibold md:text-[1.45rem]">
            {product.isConfigured
              ? t("product.priceFrom", {
                  price: formatCurrency(
                    product.price,
                    product.currency,
                    locale,
                  ),
                })
              : formatCurrency(product.price, product.currency, locale)}
          </p>

          <p className="text-muted-foreground [display:-webkit-box] h-8 overflow-hidden text-[0.72rem] leading-4 [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:h-10 md:text-xs md:leading-5">
            {product.description || " "}
          </p>
        </div>

        <AddToCartButton
          className="text-[0.78rem] md:text-sm"
          product={product}
          productHref={productHref}
        />
      </div>
    </Card>
  );
}

export function FashionProductCard({
  locale,
  product,
  productHref,
}: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <div className="group relative flex w-full flex-col">
      <Link
        aria-label={`${t("product.preview")} ${product.name}`}
        className="focus-visible:ring-ring absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        href={productHref}
      >
        <span className="sr-only">{`${t("product.preview")} ${product.name}`}</span>
      </Link>

      <div className="bg-muted/38 relative aspect-[3/4] w-full overflow-hidden">
        <Image
          alt={product.name}
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
          fill
          sizes="(max-width: 767px) 50vw, 280px"
          src={getProductCardImageSrc(product)}
          unoptimized
        />
      </div>

      <div className="space-y-1.5 px-1 pt-3 pb-2 md:space-y-2 md:px-0">
        <h3 className="font-heading [display:-webkit-box] overflow-hidden text-sm leading-5 font-medium tracking-tight [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:text-base md:leading-5">
          {product.name}
        </h3>

        <p className="font-heading text-sm leading-none font-semibold md:text-base">
          {product.isConfigured
            ? t("product.priceFrom", {
                price: formatCurrency(
                  product.price,
                  product.currency,
                  locale,
                ),
              })
            : formatCurrency(product.price, product.currency, locale)}
        </p>
      </div>

      <div className="relative z-20 px-1 md:px-0">
        <AddToCartButton
          className="w-full text-xs md:text-sm"
          product={product}
          productHref={productHref}
        />
      </div>
    </div>
  );
}
