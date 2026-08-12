"use client";

import { useState } from "react";
import FlippableCard from "@/components/FlippableCard";
import { CARD_COLOR_ORDER, DEFAULT_CARD_COLOR } from "@/lib/card-colors";

export default function CardMockup() {
  const [colorIndex, setColorIndex] = useState(0);
  const color = CARD_COLOR_ORDER[colorIndex] ?? DEFAULT_CARD_COLOR;

  const handlePrev = () =>
    setColorIndex(
      (i) => (i - 1 + CARD_COLOR_ORDER.length) % CARD_COLOR_ORDER.length
    );
  const handleNext = () =>
    setColorIndex((i) => (i + 1) % CARD_COLOR_ORDER.length);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="flex w-full items-center justify-center gap-4">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous color"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black/40 transition-colors hover:bg-black/10 hover:text-black/70"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <FlippableCard color={color} className="flex-1" />

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next color"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black/40 transition-colors hover:bg-black/10 hover:text-black/70"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
        {color}
      </p>
    </div>
  );
}
