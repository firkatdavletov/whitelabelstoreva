import type {
  Product,
  ProductVariant,
} from "@/entities/product/model/product.types";

function createProductPlaceholder(visual: string) {
  const glyph = visual.trim().charAt(0).toUpperCase() || "?";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 420" fill="none">
      <rect width="560" height="420" fill="#f3e3d3" />
      <circle cx="446" cy="122" r="110" fill="#ffffff" fill-opacity="0.7" />
      <circle cx="116" cy="354" r="106" fill="#d85a1e" fill-opacity="0.12" />
      <rect x="36" y="36" width="488" height="348" rx="36" fill="#fff9f2" />
      <rect x="58" y="58" width="444" height="304" rx="28" fill="#ead7c2" />
      <text
        x="50%"
        y="53%"
        fill="#6b4431"
        font-family="Avenir Next, Segoe UI, Arial, sans-serif"
        font-size="148"
        font-weight="700"
        text-anchor="middle"
      >
        ${glyph}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getProductCardImageSrc(
  product: Pick<Product, "imageUrl" | "visual">,
) {
  return product.imageUrl ?? createProductPlaceholder(product.visual);
}

function normalizeImageSources(
  imageUrls: string[] | undefined,
  fallback: string | null | undefined,
) {
  const uniqueSources = new Set<string>();

  imageUrls?.forEach((imageUrl) => {
    const normalizedImageUrl = imageUrl.trim();

    if (normalizedImageUrl) {
      uniqueSources.add(normalizedImageUrl);
    }
  });

  const normalizedFallback = fallback?.trim();

  if (normalizedFallback) {
    uniqueSources.add(normalizedFallback);
  }

  return Array.from(uniqueSources);
}

export function getProductImageSources(
  product: Pick<Product, "imageUrl" | "imageUrls" | "visual">,
) {
  const productImageSources = normalizeImageSources(
    product.imageUrls,
    product.imageUrl,
  );

  return productImageSources.length
    ? productImageSources
    : [createProductPlaceholder(product.visual)];
}

export function getProductVariantImageSources(
  variant: Pick<ProductVariant, "imageUrl" | "imageUrls">,
) {
  return normalizeImageSources(variant.imageUrls, variant.imageUrl);
}

export function getProductThumbnailImageSrc(imageUrl: string) {
  return imageUrl.replace(/_card(?=\.webp(?:$|[?#]))/, "_thumb");
}

export function getProductCardMeta(
  product: Pick<Product, "description" | "tags">,
) {
  const primaryTag = product.tags.find((tag) => tag.trim().length > 0)?.trim();

  if (primaryTag) {
    return primaryTag;
  }

  const shortDescription = product.description
    .split(/[,.]/)
    .map((chunk) => chunk.trim())
    .find(Boolean);

  return shortDescription ?? null;
}
