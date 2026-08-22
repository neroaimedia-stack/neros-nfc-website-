"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CopyEmailButton from "@/components/CopyEmailButton";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/c/") || pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-black/40">
          &copy; {new Date().getFullYear()} HERNEROS. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-black/60">
          <Link href="/privacy" className="transition-opacity hover:opacity-60">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-opacity hover:opacity-60">
            Terms &amp; Conditions
          </Link>
          <CopyEmailButton
            email="herneros.ph@gmail.com"
            className="text-black/60 hover:text-black"
          />
        </div>
      </div>
    </footer>
  );
}
