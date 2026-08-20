import type { CartItem, PromoScope } from "./cart-context";

export function computeTotals(
  items: CartItem[],
  discountRate: number,
  promoScope: PromoScope[]
) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const itemMatchesScope = (item: CartItem) =>
    promoScope.some(
      (s) => s.slug === item.productSlug && (s.variant === "" || s.variant === item.color)
    );
  const discountableSubtotal =
    promoScope.length === 0
      ? subtotal
      : items.filter(itemMatchesScope).reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = discountableSubtotal * discountRate;
  const total = subtotal - discount;
  const monthlyTotal = items.reduce((sum, i) => sum + (i.monthlyFee || 0), 0);
  return { subtotal, discountableSubtotal, discount, total, monthlyTotal };
}
