export type HowItWorksStep = {
  title: string;
  description: string;
};

export type HowItWorksProduct = {
  slug: string;
  label: string;
  steps: HowItWorksStep[];
};

export const HOW_IT_WORKS: HowItWorksProduct[] = [
  {
    slug: "business-card",
    label: "Business Card",
    steps: [
      {
        title: "Tap or scan",
        description:
          "Hold your HERNEROS card up to any phone, or scan the QR code on the back — no app required.",
      },
      {
        title: "Create your profile",
        description:
          "First tap takes you to a quick sign-up. Add your name, photo, links, and contact details.",
      },
      {
        title: "Share instantly",
        description:
          "Every future tap or scan shares your live profile. Update it anytime — the card never needs to be reprogrammed.",
      },
    ],
  },
  {
    slug: "review-card",
    label: "Review Card",
    steps: [
      {
        title: "Tap or scan",
        description:
          "Customers hold their phone to your card, or scan the QR code — no app required.",
      },
      {
        title: "Straight to your review page",
        description:
          "The tap opens your Facebook, Instagram, TikTok, or Google Review page directly — no searching, no typing your business name.",
      },
      {
        title: "More reviews, less friction",
        description:
          "Removing every extra step means more customers actually follow through and leave a review.",
      },
    ],
  },
  {
    slug: "wifi-card",
    label: "Wifi Card",
    steps: [
      {
        title: "Tap or scan",
        description:
          "Guests hold their phone to your card to trigger the connection — no typing a password.",
      },
      {
        title: "Instant Wi-Fi join",
        description:
          "Phones read the network details straight off the card and prompt guests to join.",
      },
      {
        title: "No password sharing",
        description:
          "Nobody has to ask staff for the Wi-Fi password or hunt for it on a sticky note behind the counter.",
      },
    ],
  },
  {
    slug: "order-card",
    label: "Order Card",
    steps: [
      {
        title: "Tap or scan",
        description:
          "Guests tap or scan the card right at their table — no app to download.",
      },
      {
        title: "Menu opens instantly",
        description:
          "It opens your ordering page with photos, prices, and availability, ready to browse.",
      },
      {
        title: "Orders go straight to you",
        description:
          "Orders land directly in your dashboard so your team can start preparing right away.",
      },
    ],
  },
];
