export type CardColorStyle = {
  swatch: string;
  cardGradient: string;
  textClass: string;
  subTextClass: string;
  borderClass?: string;
};

export const DEFAULT_CARD_COLOR = "Jet Black";

export const CARD_COLOR_ORDER = [
  "Jet Black",
  "Pastel Pink",
  "Evening Blue",
  "Pearl White",
];

export const CARD_COLORS: Record<string, CardColorStyle> = {
  "Jet Black": {
    swatch: "linear-gradient(135deg, #3a3a3a, #050505)",
    cardGradient: "linear-gradient(135deg, #262626, #050505)",
    textClass: "text-white",
    subTextClass: "text-white/85",
  },
  "Pastel Pink": {
    swatch: "linear-gradient(135deg, #f9c9dd, #ee8fb7)",
    cardGradient: "linear-gradient(135deg, #f9c9dd, #ee8fb7)",
    textClass: "text-black",
    subTextClass: "text-black/65",
  },
  "Evening Blue": {
    swatch: "linear-gradient(135deg, #1f4a9e, #060f2e)",
    cardGradient: "linear-gradient(135deg, #1f4a9e, #060f2e)",
    textClass: "text-white",
    subTextClass: "text-white/85",
  },
  "Pearl White": {
    swatch: "linear-gradient(135deg, #ffffff, #e4e4e4)",
    cardGradient:
      "linear-gradient(135deg, #ffffff 0%, #f7f7f9 28%, #e7e7ec 58%, #fbfbfc 100%)",
    textClass: "text-black",
    subTextClass: "text-black/70",
    borderClass: "border border-black/8",
  },
};
