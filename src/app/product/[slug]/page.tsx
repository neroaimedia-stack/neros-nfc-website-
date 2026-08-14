import { getProducts } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products[slug] ?? null;
  const otherProducts = Object.values(products).filter((p) => p.slug !== slug);

  return (
    <ProductPageClient product={product} otherProducts={otherProducts} />
  );
}
