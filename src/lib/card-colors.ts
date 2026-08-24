export type CardColorStyle = {
  swatch: string;
  cardGradient: string;
  textClass: string;
  subTextClass: string;
  qrColor: string;
  borderClass?: string;
};

export const DEFAULT_CARD_COLOR = "Jet Black";

export const CARD_COLOR_ORDER = ["Jet Black"];

export const CARD_COLORS: Record<string, CardColorStyle> = {
  "Jet Black": {
    swatch: "linear-gradient(135deg, #17171a, #050506)",
    cardGradient: "linear-gradient(160deg, #111113, #060607)",
    textClass: "text-white",
    subTextClass: "text-white/70",
    qrColor: "#ffffff",
  },
};
