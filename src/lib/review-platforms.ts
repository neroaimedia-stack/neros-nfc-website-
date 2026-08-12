export type ReviewPlatformStyle = {
  label: string;
  background: string;
  labelTextClass: string;
};

export const DEFAULT_REVIEW_PLATFORM = "Facebook";

export const REVIEW_PLATFORM_ORDER = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Google Review",
];

export const REVIEW_PLATFORMS: Record<string, ReviewPlatformStyle> = {
  Facebook: {
    label: "FOLLOW US ON FACEBOOK",
    background: "#1877F2",
    labelTextClass: "text-white",
  },
  Instagram: {
    label: "FOLLOW US ON INSTAGRAM",
    background:
      "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
    labelTextClass: "text-white",
  },
  TikTok: {
    label: "FOLLOW US ON TIKTOK",
    background: "#0a0a0a",
    labelTextClass: "text-white",
  },
  "Google Review": {
    label: "REVIEW US ON GOOGLE",
    background: "#ffffff",
    labelTextClass: "text-black",
  },
};
