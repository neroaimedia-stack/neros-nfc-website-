"use client";

import { useEffect, useRef, useState } from "react";
import QrMock from "@/components/QrMock";

const AUTO_FLIP_INTERVAL = 4500;

export default function CardMockup() {
  const [flipped, setFlipped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFlipped((prev) => !prev);
    }, AUTO_FLIP_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFlip = () => {
    setFlipped((prev) => !prev);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setFlipped((prev) => !prev);
    }, AUTO_FLIP_INTERVAL);
  };

  return (
    <button
      type="button"
      onClick={handleFlip}
      aria-label="Flip HERNEROS NFC card to see the other side"
      className="card-reflect block w-full max-w-sm cursor-pointer text-left drop-shadow-2xl transition-transform active:scale-[0.98]"
    >
      <div className="perspective-1600 w-full">
        <div
          className="card-flip-transition preserve-3d relative aspect-[340/214] will-change-transform"
          style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}
        >
          <div className="backface-hidden absolute inset-0 overflow-hidden rounded-[18px] bg-neutral-950">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
            <div className="card-corner-gloss" />
            <div className="card-sheen" />
            <div className="relative flex h-full flex-col justify-between p-7">
              <span className="text-xl font-bold tracking-tight text-white">
                HERNEROS
              </span>
              <span className="text-sm tracking-[0.2em] text-white/85">
                TAP &amp; SCAN
              </span>
            </div>
          </div>

          <div className="backface-hidden absolute inset-0 overflow-hidden rounded-[18px] bg-neutral-950 [transform:rotateY(180deg)]">
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
  );
}
