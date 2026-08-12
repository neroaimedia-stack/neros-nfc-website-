import Link from "next/link";

export default function CustomOrderPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-black">
        Let&apos;s build something custom
      </h1>
      <p className="mt-4 text-black/60">
        Custom designs, bulk orders, or anything else — email us what you
        need and we&apos;ll get back to you.
      </p>
      <Link
        href="mailto:herneros.ph@gmail.com?subject=Custom%20Order"
        className="mt-8 rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        Email us
      </Link>
    </main>
  );
}
