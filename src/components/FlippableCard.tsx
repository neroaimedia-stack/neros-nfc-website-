"use client";

import { useState } from "react";
import QrCode from "@/components/QrCode";
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
      className={`block min-w-0 cursor-pointer text-left transition-transform active:scale-[0.98] ${className ?? ""}`}
    >
      <div
        className={`overflow-hidden rounded-[18px] ${shadow ? "card-reflect card-shadow" : ""}`}
      >
        <div className="perspective-1600 w-full">
          <div
            className="card-flip-transition preserve-3d relative aspect-[340/214] will-change-transform"
            style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}
          >
            <div
              className={`backface-hidden absolute inset-0 overflow-hidden rounded-[18px] ${style.borderClass ?? ""}`}
              style={{ background: style.cardGradient }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
              <div className="card-edge-shade" />
              <div className="card-corner-gloss" />
              <div className="card-sheen" />
              <div className="relative flex h-full flex-col justify-end gap-1 p-7">
                <span className={`text-xl font-bold tracking-tight uppercase ${style.textClass}`}>
                  Hernero Cruz
                </span>
                <span className={`text-xs tracking-[0.2em] uppercase ${style.subTextClass}`}>
                  CEO &amp; Founder
                </span>
              </div>
            </div>

            <div
              className={`backface-hidden absolute inset-0 overflow-hidden rounded-[18px] [transform:rotateY(180deg)] ${style.borderClass ?? ""}`}
              style={{ background: style.cardGradient }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
              <div className="card-edge-shade" />
              <div className="card-corner-gloss-dim" />
              <div className="relative flex h-full flex-col p-7">
                <span className={`text-xl font-bold tracking-tight ${style.textClass}`}>
                  HERNEROS
                </span>
                <div className="flex flex-1 items-center justify-center">
                  <QrCode color={style.qrColor} className="w-[30%]" />
                </div>
                <span
                  className={`self-end text-sm tracking-[0.2em] ${style.subTextClass}`}
                >
                  TAP &amp; SCAN
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
