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
    <div className="flex w-full max-w-lg items-center justify-center gap-10">
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous color"
        className="flex h-9 w-9 shrink-0 items-center justify-center text-black/40 transition-colors hover:text-black/70"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <FlippableCard color={color} className="flex-1" />

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next color"
        className="flex h-9 w-9 shrink-0 items-center justify-center text-black/40 transition-colors hover:text-black/70"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
