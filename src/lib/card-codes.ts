// Unambiguous charset: no 0/O or 1/I, so printed codes are easy to read
// and type by hand.
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCardCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

export const PRODUCT_TYPES = [
  "business-card",
  "review-card",
  "wifi-card",
  "order-card",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];
