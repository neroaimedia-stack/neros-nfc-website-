export type ReviewPlatformStyle = {
  label: string;
  background: string;
  labelTextClass: string;
  tapLabel?: string;
  showStars?: boolean;
  badgeIcon?: boolean;
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
    background: "#0866FF",
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
    label: "WE WOULD APPRECIATE\nYOUR GOOGLE REVIEW!",
    background: "linear-gradient(135deg, #1a73e8, #0b57d0)",
    labelTextClass: "text-white",
    tapLabel: "Tap to rate your experience",
    showStars: true,
    badgeIcon: true,
  },
};
