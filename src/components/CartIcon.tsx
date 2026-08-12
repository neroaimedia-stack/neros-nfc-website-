"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartIcon() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative inline-flex items-center transition-opacity hover:opacity-60"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5 text-black"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h1.6l1.2 12.2a2 2 0 0 0 2 1.8h9.4a2 2 0 0 0 2-1.7L21 8H6"
        />
        <circle cx="9.5" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
