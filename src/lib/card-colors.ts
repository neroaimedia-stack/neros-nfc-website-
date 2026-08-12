export type CardColorStyle = {
  swatch: string;
  cardGradient: string;
  textClass: string;
  subTextClass: string;
  ringClass?: string;
};

export const DEFAULT_CARD_COLOR = "Jet Black";

export const CARD_COLORS: Record<string, CardColorStyle> = {
  "Jet Black": {
    swatch: "linear-gradient(135deg, #3a3a3a, #050505)",
    cardGradient: "linear-gradient(135deg, #262626, #050505)",
    textClass: "text-white",
    subTextClass: "text-white/85",
  },
  "Jet Black - Gold": {
    swatch: "linear-gradient(135deg, #3a3a3a, #050505)",
    cardGradient: "linear-gradient(135deg, #262626, #050505)",
    textClass: "text-amber-300",
    subTextClass: "text-amber-200/80",
  },
  "Pastel Pink": {
    swatch: "linear-gradient(135deg, #f9c9dd, #ee8fb7)",
    cardGradient: "linear-gradient(135deg, #f9c9dd, #ee8fb7)",
    textClass: "text-black",
    subTextClass: "text-black/65",
  },
  "Evening Blue": {
    swatch: "linear-gradient(135deg, #4a83f0, #142b6e)",
    cardGradient: "linear-gradient(135deg, #4a83f0, #142b6e)",
    textClass: "text-white",
    subTextClass: "text-white/85",
  },
  "Pearl White": {
    swatch: "linear-gradient(135deg, #ffffff, #e4e4e4)",
    cardGradient: "linear-gradient(135deg, #ffffff, #ececec)",
    textClass: "text-black",
    subTextClass: "text-black/60",
    ringClass: "ring-1 ring-black/15",
  },
  "Light Mint": {
    swatch: "linear-gradient(135deg, #ddf7ea, #9fe4c4)",
    cardGradient: "linear-gradient(135deg, #ddf7ea, #9fe4c4)",
    textClass: "text-black",
    subTextClass: "text-black/60",
  },
};
