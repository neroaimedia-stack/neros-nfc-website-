import Link from "next/link";
import CardMockup from "@/components/CardMockup";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import WifiCardMock from "@/components/WifiCardMock";
import OrderCardMock from "@/components/OrderCardMock";
import HowItWorks from "@/components/HowItWorks";
import CardCarousel from "@/components/CardCarousel";

export default function Home() {
  const cardItems = [
    <div
      key="business"
      className="flex w-64 flex-col rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm sm:w-72"
    >
      <FlippableCard
        className="mx-auto mb-5 w-[220px] max-w-full"
        reflection={false}
      />
      <h3 className="text-lg font-semibold text-black">Business Card</h3>
      <p className="mt-2 text-sm text-black/60">
        Share your profile and contact info with one tap.
      </p>
      <Link
        href="/product/business-card"
        className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        Buy Now
      </Link>
    </div>,
    <div
      key="review"
      className="flex w-64 flex-col rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm sm:w-72"
    >
      <ReviewCardMock className="mx-auto mb-5 w-[130px]" />
      <h3 className="text-lg font-semibold text-black">Review Card</h3>
      <p className="mt-2 text-sm text-black/60">
        Drive customers straight to your review or social page.
      </p>
      <Link
        href="/product/review-card"
        className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        Buy Now
      </Link>
    </div>,
    <div
      key="wifi"
      className="flex w-64 flex-col rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm sm:w-72"
    >
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
    </div>,
    <div
      key="order"
      className="flex w-64 flex-col rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm sm:w-72"
    >
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
    </div>,
    <div
      key="custom"
      className="flex w-64 flex-col rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm sm:w-72"
    >
      <div className="mx-auto mb-5 flex aspect-[340/214] w-[220px] max-w-full items-center justify-center rounded-[18px] border-2 border-dashed border-black/20 bg-neutral-50">
        <span className="text-4xl font-light text-black/25">+</span>
      </div>
      <h3 className="text-lg font-semibold text-black">Custom</h3>
      <p className="mt-2 text-sm text-black/60">
        Custom design, bulk orders, distributorship, or something unique?
        Let&apos;s talk.
      </p>
      <Link
        href="/custom"
        className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        Talk to us
      </Link>
    </div>,
  ];

  return (
    <main className="flex flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-16 lg:flex-row lg:justify-between lg:pt-24">
        <div className="max-w-lg text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            Every connection, one tap away.
          </h1>
          <p className="mt-5 text-lg text-black/60">
            Share your profile, collect reviews, hand out Wi-Fi, or take
            orders — every HERNEROS card works with a single tap or scan.
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
          <HowItWorks />
        </div>
      </section>

      <section id="buy" className="mx-auto w-full max-w-6xl px-6 pt-20 pb-8">
        <h2 className="text-center text-3xl font-bold text-black">
          Choose your card
        </h2>
        <div className="mt-4">
          <CardCarousel items={cardItems} />
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
