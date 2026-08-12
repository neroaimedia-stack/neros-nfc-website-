"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="transition-opacity hover:opacity-60"
    >
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
