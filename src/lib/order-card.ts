export type OrderCardFormatStyle = {
  label: string;
  image: string;
};

export const DEFAULT_ORDER_CARD_FORMAT = "NFC Only";

export const ORDER_CARD_FORMAT_ORDER = ["NFC Only", "NFC + QR Code"];

export const ORDER_CARD_FORMATS: Record<string, OrderCardFormatStyle> = {
  "NFC Only": {
    label: "Tap to order",
    image: "/order-cards/nfc-only.jpg",
  },
  "NFC + QR Code": {
    label: "Tap or scan to order",
    image: "/order-cards/nfc-qr.jpg",
  },
};
