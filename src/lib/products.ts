export type Product = {
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  colors: string[];
};

export const products: Record<string, Product> = {
  "business-card": {
    slug: "business-card",
    title: "HERNEROS Business Card",
    description:
      "Your entire professional profile, behind a single tap. Hold the card up to any smartphone to instantly share your name, title, contact details, and links — no app, no typing, no lost paper cards. Flip it over to reveal a QR code as a backup for anyone who'd rather scan.",
    price: 599,
    compareAtPrice: 2500,
    currency: "PHP",
    colors: ["Jet Black"],
  },
  "review-card": {
    slug: "review-card",
    title: "HERNEROS Review Card",
    description:
      "Turn happy customers into 5-star reviews. One tap sends them straight to your Facebook, Instagram, TikTok, or Google Review page — no searching, no typing your business name. Add a QR code to the design so anyone without NFC can still scan their way there.",
    price: 40,
    compareAtPrice: 150,
    currency: "USD",
    colors: ["Facebook", "Instagram", "TikTok", "Google Review"],
  },
};
