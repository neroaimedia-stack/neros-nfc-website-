export type ReviewPlatformStyle = {
  label: string;
  background: string;
  image: string;
};

export const DEFAULT_REVIEW_PLATFORM = "Facebook";

export const REVIEW_PLATFORM_ORDER = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Google Review",
];

/** Appended to a base platform name to look up its QR-code variant in REVIEW_PLATFORMS. */
export const QR_VARIANT_SUFFIX = " (QR Code)";

export const REVIEW_PLATFORMS: Record<string, ReviewPlatformStyle> = {
  Facebook: {
    label: "Follow us on Facebook",
    background: "#0866FF",
    image: "/review-cards/facebook.jpg",
  },
  Instagram: {
    label: "Follow us on Instagram",
    background:
      "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
    image: "/review-cards/instagram.jpg",
  },
  TikTok: {
    label: "Follow us on TikTok",
    background: "#0a0a0a",
    image: "/review-cards/tiktok.jpg",
  },
  "Google Review": {
    label: "Leave us a Google review",
    background: "linear-gradient(135deg, #1a73e8, #0b57d0)",
    image: "/review-cards/google-review.jpg",
  },
  "Facebook (QR Code)": {
    label: "Follow us on Facebook (with QR code)",
    background: "#0866FF",
    image: "/review-cards/facebook-qr.jpg",
  },
  "Instagram (QR Code)": {
    label: "Follow us on Instagram (with QR code)",
    background:
      "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
    image: "/review-cards/instagram-qr.jpg",
  },
  "TikTok (QR Code)": {
    label: "Follow us on TikTok (with QR code)",
    background: "#0a0a0a",
    image: "/review-cards/tiktok-qr.jpg",
  },
  "Google Review (QR Code)": {
    label: "Leave us a Google review (with QR code)",
    background: "linear-gradient(135deg, #1a73e8, #0b57d0)",
    image: "/review-cards/google-review-qr.jpg",
  },
};
