"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_CURRENCY, detectCurrency } from "@/lib/currency";

const CurrencyContext = createContext<string>(DEFAULT_CURRENCY);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  return (
    <CurrencyContext.Provider value={currency}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
