import Link from "next/link";
import CardMockup from "@/components/CardMockup";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import WifiCardMock from "@/components/WifiCardMock";
import OrderCardMock from "@/components/OrderCardMock";

const steps = [
  {
    title: "Tap or scan",
    description:
      "Hold your HERNEROS card up to any phone, or scan the QR code on the back — no app required.",
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
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-16 lg:flex-row lg:justify-between lg:pt-24">
        <div className="max-w-lg text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            Your digital identity, one tap away.
          </h1>
          <p className="mt-5 text-lg text-black/60">
            HERNEROS cards let you share your profile, links, and contact info
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
        <div className="mt-8 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="flex flex-col rounded-3xl border border-black/10 p-6 text-center shadow-sm">
            <FlippableCard
              className="mx-auto mb-5 w-[220px] max-w-full"
              reflection={false}
            />
            <h3 className="text-lg font-semibold text-black">
              Business Card
            </h3>
            <p className="mt-2 text-sm text-black/60">
              Share your profile and contact info with one tap.
            </p>
            <Link
              href="/product/business-card"
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Buy Now
            </Link>
          </div>

          <div className="flex flex-col rounded-3xl border border-black/10 p-6 text-center shadow-sm">
            <ReviewCardMock className="mx-auto mb-5 w-[130px]" />
            <h3 className="text-lg font-semibold text-black">
              Review Card
            </h3>
            <p className="mt-2 text-sm text-black/60">
              Drive customers straight to your review or social page.
            </p>
            <Link
              href="/product/review-card"
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Buy Now
            </Link>
          </div>

          <div className="flex flex-col rounded-3xl border border-black/10 p-6 text-center shadow-sm">
            <WifiCardMock className="mx-auto mb-5 w-[130px]" />
            <h3 className="text-lg font-semibold text-black">Wifi Card</h3>
            <p className="mt-2 text-sm text-black/60">
              Let guests connect to your Wi-Fi with a single tap.
            </p>
            <Link
              href="/product/wifi-card"
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Buy Now
            </Link>
          </div>

          <div className="flex flex-col rounded-3xl border border-black/10 p-6 text-center shadow-sm">
            <OrderCardMock className="mx-auto mb-5 w-[130px]" />
            <h3 className="text-lg font-semibold text-black">Order Card</h3>
            <p className="mt-2 text-sm text-black/60">
              Let guests browse your menu and order with a single tap.
            </p>
            <Link
              href="/product/order-card"
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Buy Now
            </Link>
          </div>

          <div className="flex flex-col rounded-3xl border border-black/10 p-6 text-center shadow-sm">
            <div className="mx-auto mb-5 flex aspect-[340/214] w-[220px] max-w-full items-center justify-center rounded-[18px] border-2 border-dashed border-black/20 bg-neutral-50">
              <span className="text-4xl font-light text-black/25">+</span>
            </div>
            <h3 className="text-lg font-semibold text-black">Custom</h3>
            <p className="mt-2 text-sm text-black/60">
              Need a custom design, bulk order, or something unique? Let's
              talk.
            </p>
            <Link
              href="/custom"
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/account"
              className="inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80"
            >
              Set Up
            </Link>
            <Link
              href="mailto:herneros.ph@gmail.com?subject=Support"
              className="inline-block rounded-full border border-white px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
