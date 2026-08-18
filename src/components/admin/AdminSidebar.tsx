"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBox,
  FiCreditCard,
  FiGrid,
  FiShoppingBag,
  FiTag,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const NAV_ITEMS: { href: string; label: string; icon: IconType }[] = [
  { href: "/admin", label: "Dashboard", icon: FiGrid },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { href: "/admin/promos", label: "Promo codes", icon: FiTag },
  { href: "/admin/inventory", label: "Inventory", icon: FiBox },
  { href: "/admin/cards", label: "NFC cards", icon: FiCreditCard },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <>
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-black/10 md:bg-white">
        <div className="px-6 py-6">
          <p className="text-lg font-bold tracking-tight text-black">HERNEROS</p>
          <p className="text-xs text-black/40">Admin dashboard</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="sticky top-0 z-40 flex gap-2 overflow-x-auto border-b border-black/10 bg-white px-4 py-3 [scrollbar-width:none] [-ms-overflow-style:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                active ? "border-black bg-black text-white" : "border-black/15 text-black/70"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
