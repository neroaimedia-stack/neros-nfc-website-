export type Product = {
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  colors: string[];
};

export const products: Record<string, Product> = {
  "business-card": {
    slug: "business-card",
    title: "HERNEROS Business Card",
    price: 599,
    compareAtPrice: 2500,
    currency: "PHP",
    colors: ["Jet Black"],
  },
  "review-card": {
    slug: "review-card",
    title: "HERNEROS Review Card",
    price: 40,
    compareAtPrice: 150,
    currency: "USD",
    colors: [
      "Facebook",
      "Instagram",
      "TikTok",
      "Google Review",
      "Facebook (QR Code)",
      "Instagram (QR Code)",
      "TikTok (QR Code)",
      "Google Review (QR Code)",
    ],
  },
};
