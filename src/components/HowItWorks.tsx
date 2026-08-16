"use client";

import { useState } from "react";
import { HOW_IT_WORKS } from "@/lib/how-it-works";

export default function HowItWorks() {
  const [activeSlug, setActiveSlug] = useState(HOW_IT_WORKS[0].slug);
  const active =
    HOW_IT_WORKS.find((p) => p.slug === activeSlug) ?? HOW_IT_WORKS[0];

  return (
    <div>
      <h2 className="text-center text-3xl font-bold text-white">
        How it works
      </h2>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {HOW_IT_WORKS.map((product) => (
          <button
            key={product.slug}
            type="button"
            onClick={() => setActiveSlug(product.slug)}
            aria-pressed={product.slug === activeSlug}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              product.slug === activeSlug
                ? "border-white bg-white text-black"
                : "border-white/25 text-white hover:border-white/60"
            }`}
          >
            {product.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {active.steps.map((step, index) => (
          <div
            key={`${active.slug}-${step.title}`}
            className="rounded-3xl bg-white p-8 text-center shadow-lg"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              {index + 1}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-black">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-black/60">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
