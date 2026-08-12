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
    price: 999,
    compareAtPrice: 2500,
    colors: [
      "Jet Black",
      "Pastel Pink",
      "Evening Blue",
      "Pearl White",
      "Light Mint",
      "Jet Black - Gold",
    ],
  },
  "review-card": {
    slug: "review-card",
    title: "HERNEROS Review Card",
    price: 999,
    compareAtPrice: 2500,
    colors: ["Jet Black", "Pearl White"],
  },
};
