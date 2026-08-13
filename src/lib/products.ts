export type Product = {
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  colors: string[];
};

export const products: Record<string, Product> = {
  "business-card": {
    slug: "business-card",
    title: "HERNEROS Business Card",
    price: 599,
    compareAtPrice: 2500,
    colors: ["Jet Black"],
  },
  "review-card": {
    slug: "review-card",
    title: "HERNEROS Review Card",
    price: 599,
    compareAtPrice: 2500,
    colors: ["Facebook", "Instagram", "TikTok", "Google Review"],
  },
};
