import Link from "next/link";
import CardMockup from "@/components/CardMockup";

const steps = [
  {
    title: "Tap or scan",
    description:
      "Hold your NEROS card up to any phone, or scan the QR code on the back — no app required.",
  },
  {
    title: "Create your profile",
    description:
      "First tap takes you to a quick sign-up. Add your name, photo, links, and contact details.",
  },
  {
    title: "Share instantly",
    description:
      "Every future tap or scan shares your live profile. Update it anytime — the card never needs to be reprogrammed.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-16 md:flex-row md:justify-between md:pt-24">
        <div className="max-w-lg text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            Your digital identity, one tap away.
          </h1>
          <p className="mt-5 text-lg text-black/60">
            NEROS cards let you share your profile, links, and contact info
            instantly — just tap or scan.
          </p>
          <Link
            href="#buy"
            className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Buy Now
          </Link>
        </div>
        <CardMockup />
      </section>

      <section className="bg-black py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-white">
            How it works
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl bg-white p-8 text-center shadow-lg"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-black">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-black/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="buy" className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-black">
          Choose your card
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="flex flex-col rounded-3xl border border-black/10 p-8 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-black">
              Business Card
            </h3>
            <p className="mt-2 flex-1 text-sm text-black/60">
              Share your profile and contact info with one tap.
            </p>
            <Link
              href="mailto:hello@neros.com?subject=Business%20Card%20Order"
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Buy Now
            </Link>
          </div>

          <div className="flex flex-col rounded-3xl border border-black/10 p-8 text-center shadow-sm">
            <span className="mx-auto rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black/60">
              Coming soon
            </span>
            <h3 className="mt-3 text-lg font-semibold text-black">
              Review Card
            </h3>
            <p className="mt-2 flex-1 text-sm text-black/60">
              Drive customers straight to your review page. Low exposure —
              limited availability.
            </p>
            <Link
              href="mailto:hello@neros.com?subject=Review%20Card%20Pre-order"
              className="mt-6 rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-60"
            >
              Pre-order
            </Link>
          </div>

          <div className="flex flex-col rounded-3xl border border-black/10 p-8 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-black">Custom</h3>
            <p className="mt-2 flex-1 text-sm text-black/60">
              Need a custom design, bulk order, or something unique? Let's
              talk.
            </p>
            <Link
              href="mailto:hello@neros.com?subject=Custom%20Order"
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-black py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Already have one?</h2>
          <p className="mt-4 text-white/60">
            Claim your card and set up your profile in under a minute.
          </p>
          <Link
            href="/account"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80"
          >
            Set Up
          </Link>
        </div>
      </section>
    </main>
  );
}
