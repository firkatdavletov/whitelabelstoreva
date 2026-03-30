"use client";

import { useTranslation } from "react-i18next";

import type { Product } from "@/entities/product";
import { formatCurrency } from "@/shared/lib/currency";
import type { Locale } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

type ProductPreviewDialogProps = {
  locale: Locale;
  product: Product;
};

export function ProductPreviewDialog({
  locale,
  product,
}: ProductPreviewDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {t("product.preview")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold text-secondary-foreground">
            {product.visual}
          </div>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-lg font-semibold text-foreground">
          {formatCurrency(product.price, product.currency, locale)}
        </p>
      </DialogContent>
    </Dialog>
  );
}
