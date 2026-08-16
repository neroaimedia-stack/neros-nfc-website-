export type WifiCardFormatStyle = {
  label: string;
  image: string;
};

export const DEFAULT_WIFI_CARD_FORMAT = "NFC Only";

export const WIFI_CARD_FORMAT_ORDER = ["NFC Only", "NFC + QR Code"];

export const WIFI_CARD_FORMATS: Record<string, WifiCardFormatStyle> = {
  "NFC Only": {
    label: "Tap to connect",
    image: "/wifi-cards/nfc-only.jpg",
  },
  "NFC + QR Code": {
    label: "Tap to connect, or attach your own QR code",
    image: "/wifi-cards/nfc-qr.jpg",
  },
};
