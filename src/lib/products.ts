import { supabase } from "@/lib/supabase";

export type VariantDetail = {
  description?: string;
  price?: number;
  imageUrl?: string;
};

export type Product = {
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  colors: string[];
  trackStock: boolean;
  stockQuantity: number;
  allowPreorder: boolean;
  soldOffset: number;
  variantDetails: Record<string, VariantDetail>;
};

export function isOutOfStock(product: Pick<Product, "trackStock" | "stockQuantity">): boolean {
  return product.trackStock && product.stockQuantity <= 0;
}

export async function getProducts(): Promise<Record<string, Product>> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug, title, description, price, compare_at_price, currency, colors, track_stock, stock_quantity, allow_preorder, sold_offset, variant_details"
    )
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const products: Record<string, Product> = {};
  for (const row of data ?? []) {
    const rawVariants = (row.variant_details ?? {}) as Record<
      string,
      { description?: string; price?: number; image_url?: string }
    >;
    const variantDetails: Record<string, VariantDetail> = {};
    for (const [name, detail] of Object.entries(rawVariants)) {
      variantDetails[name] = {
        description: detail.description || undefined,
        price: detail.price != null ? Number(detail.price) : undefined,
        imageUrl: detail.image_url || undefined,
      };
    }

    products[row.slug] = {
      slug: row.slug,
      title: row.title,
      description: row.description,
      price: Number(row.price),
      compareAtPrice:
        row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
      currency: row.currency,
      colors: row.colors ?? [],
      trackStock: row.track_stock ?? false,
      stockQuantity: row.stock_quantity ?? 0,
      allowPreorder: row.allow_preorder ?? true,
      soldOffset: row.sold_offset ?? 0,
      variantDetails,
    };
  }
  return products;
}
