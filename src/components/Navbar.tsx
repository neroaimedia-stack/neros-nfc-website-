import Link from "next/link";
import CartIcon from "@/components/CartIcon";

const links = [
  { href: "/", label: "Home" },
  { href: "/account", label: "Account" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-black">
          HERNEROS
        </Link>
        <ul className="flex items-center gap-6 text-sm font-medium text-black">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="transition-opacity hover:opacity-60"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <CartIcon />
          </li>
        </ul>
      </nav>
    </header>
  );
}
