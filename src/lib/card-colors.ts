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
    swatch: "linear-gradient(135deg, #3a3a3a, #050505)",
    cardGradient: "linear-gradient(135deg, #262626, #050505)",
    textClass: "text-white",
    subTextClass: "text-white/85",
    qrColor: "#ffffff",
  },
};
