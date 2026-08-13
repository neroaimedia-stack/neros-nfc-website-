export const DEFAULT_CURRENCY = "USD";

// Static approximate rates (units of currency per 1 USD). Good enough for
// display purposes on a site with no live checkout/payment processing.
const RATES: Record<string, number> = {
  USD: 1,
  PHP: 56.5,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  SGD: 1.34,
  JPY: 149,
  INR: 83,
};

const EUROZONE = new Set([
  "DE", "FR", "ES", "IT", "NL", "PT", "IE", "AT", "BE", "FI", "GR",
  "LU", "SK", "SI", "EE", "LV", "LT", "CY", "MT", "HR",
]);

const REGION_CURRENCY: Record<string, string> = {
  PH: "PHP",
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  SG: "SGD",
  JP: "JPY",
  IN: "INR",
};

export function detectCurrency(): string {
  if (typeof navigator === "undefined") return DEFAULT_CURRENCY;
  const locale = navigator.language || "en-US";
  const region = locale.split("-")[1]?.toUpperCase() ?? "";
  if (EUROZONE.has(region)) return "EUR";
  return REGION_CURRENCY[region] ?? DEFAULT_CURRENCY;
}

export function toUSD(amount: number, currency: string): number {
  const rate = RATES[currency] ?? 1;
  return amount / rate;
}

export function fromUSD(amountUSD: number, currency: string): number {
  const rate = RATES[currency] ?? 1;
  return amountUSD * rate;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}
