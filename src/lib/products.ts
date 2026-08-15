import { supabase } from "@/lib/supabase";

export type Product = {
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  colors: string[];
};

export async function getProducts(): Promise<Record<string, Product>> {
  const { data, error } = await supabase
    .from("products")
    .select("slug, title, description, price, compare_at_price, currency, colors")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const products: Record<string, Product> = {};
  for (const row of data ?? []) {
    products[row.slug] = {
      slug: row.slug,
      title: row.title,
      description: row.description,
      price: Number(row.price),
      compareAtPrice:
        row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
      currency: row.currency,
      colors: row.colors ?? [],
    };
  }
  return products;
}
