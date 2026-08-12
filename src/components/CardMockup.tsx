"use client";

import { useState } from "react";
import QrMock from "@/components/QrMock";
import {
  CARD_COLORS,
  CARD_COLOR_ORDER,
  DEFAULT_CARD_COLOR,
} from "@/lib/card-colors";

export default function CardMockup() {
  const [flipped, setFlipped] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const color = CARD_COLOR_ORDER[colorIndex] ?? DEFAULT_CARD_COLOR;
  const style = CARD_COLORS[color];

  const handleFlip = () => setFlipped((prev) => !prev);
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

        <button
          type="button"
          onClick={handleFlip}
          aria-label="Flip HERNEROS NFC card to see the other side"
          className="card-reflect flex-1 cursor-pointer text-left drop-shadow-2xl transition-transform active:scale-[0.98]"
        >
          <div className="perspective-1600 w-full">
            <div
              className="card-flip-transition preserve-3d relative aspect-[340/214] will-change-transform"
              style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}
            >
              <div
                className={`backface-hidden absolute inset-0 overflow-hidden rounded-[18px] ${style.ringClass ?? ""}`}
                style={{ background: style.cardGradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
                <div className="card-corner-gloss" />
                <div className="card-sheen" />
                <div className="relative flex h-full flex-col justify-between p-7">
                  <span className={`text-xl font-bold tracking-tight ${style.textClass}`}>
                    HERNEROS
                  </span>
                  <span className={`text-sm tracking-[0.2em] ${style.subTextClass}`}>
                    TAP &amp; SCAN
                  </span>
                </div>
              </div>

              <div
                className={`backface-hidden absolute inset-0 overflow-hidden rounded-[18px] [transform:rotateY(180deg)] ${style.ringClass ?? ""}`}
                style={{ background: style.cardGradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                <div className="card-corner-gloss" />
                <div className="card-sheen" />
                <div className="relative flex h-full items-center justify-center p-7">
                  <div className="aspect-square w-[36%] rounded-sm bg-white p-1.5 shadow-lg">
                    <QrMock className="h-full w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>

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
