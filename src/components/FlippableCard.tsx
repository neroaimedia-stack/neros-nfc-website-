"use client";

import { useState } from "react";
import Image from "next/image";
import { CARD_COLORS, DEFAULT_CARD_COLOR } from "@/lib/card-colors";

export default function FlippableCard({
  color = DEFAULT_CARD_COLOR,
  className,
  shadow = true,
}: {
  color?: string;
  className?: string;
  shadow?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const style = CARD_COLORS[color] ?? CARD_COLORS[DEFAULT_CARD_COLOR];

  const handleFlip = () => setFlipped((prev) => !prev);

  return (
    <button
      type="button"
      onClick={handleFlip}
      aria-label="Flip HERNEROS card to see the other side"
      className={`block min-w-0 cursor-pointer text-left transition-transform active:scale-[0.98] ${shadow ? "card-reflect drop-shadow-2xl" : ""} ${className ?? ""}`}
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
              <div className="relative aspect-square w-[26%] overflow-hidden rounded-xl bg-white/95 p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.3)] ring-1 ring-white/50">
                <Image
                  src="/qr-code.jpg"
                  alt="HERNEROS profile QR code"
                  fill
                  sizes="120px"
                  className="rounded-sm object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
