"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  productSlug: string;
  title: string;
  color: string;
  /** Price in USD, regardless of the product's native currency. */
  price: number;
  quantity: number;
  notes?: string;
  /** Business card personalization. */
  name?: string;
  jobTitle?: string;
  /** Review card destination URLs — QR and NFC can point to different places. */
  qrDestinationLink?: string;
  nfcDestinationLink?: string;
  /** Recurring add-on (e.g. Order Card's website), in USD. Billed separately, not part of the one-time subtotal/total. */
  monthlyFee?: number;
};

export type PromoScope = { slug: string; variant: string };

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  removeItems: (ids: string[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  appliedCode: string | null;
  discountRate: number;
  promoScope: PromoScope[];
  applyPromo: (code: string, discountRate: number, scope: PromoScope[]) => void;
  removePromo: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "herneros-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState(0);
  const [promoScope, setPromoScope] = useState<PromoScope[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                notes: item.notes || i.notes,
                name: item.name || i.name,
                jobTitle: item.jobTitle || i.jobTitle,
                qrDestinationLink:
                  item.qrDestinationLink || i.qrDestinationLink,
                nfcDestinationLink:
                  item.nfcDestinationLink || i.nfcDestinationLink,
                monthlyFee: item.monthlyFee ?? i.monthlyFee,
              }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const removeItems = (ids: string[]) => {
    const idSet = new Set(ids);
    setItems((prev) => prev.filter((i) => !idSet.has(i.id)));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const applyPromo = (code: string, rate: number, scope: PromoScope[]) => {
    setAppliedCode(code);
    setDiscountRate(rate);
    setPromoScope(scope);
  };

  const removePromo = () => {
    setAppliedCode(null);
    setDiscountRate(0);
    setPromoScope([]);
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        removeItems,
        updateQuantity,
        clearCart,
        count,
        subtotal,
        appliedCode,
        discountRate,
        promoScope,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
