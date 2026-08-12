import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/account", label: "Account" },
  { href: "/#buy", label: "Shop" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-black">
          herneros
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
        </ul>
      </nav>
    </header>
  );
}
