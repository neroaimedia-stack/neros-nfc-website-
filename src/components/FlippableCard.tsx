"use client";

import { useLayoutEffect, useRef, useState } from "react";
import QrCode from "@/components/QrCode";
import { CARD_COLORS, DEFAULT_CARD_COLOR, type CardColorStyle } from "@/lib/card-colors";

const CARD_WIDTH = 340;
const CARD_HEIGHT = 214;
const FLIP_DURATION_MS = 800;
const REFLECTION_GAP = 10;
// The reflection fades to fully transparent well before its own full height,
// so only reserve layout space out to roughly where it disappears.
const REFLECTION_RESERVE = REFLECTION_GAP + CARD_HEIGHT * 0.6;

function CardFaceContent({
  variant,
  style,
}: {
  variant: "front" | "back";
  style: CardColorStyle;
}) {
  if (variant === "front") {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
      <div className="card-edge-shade" />
      <div className="card-corner-gloss-dim" />
      <div className="relative flex h-full flex-col p-7">
        <span className={`text-xl font-bold tracking-tight ${style.textClass}`}>HERNEROS</span>
        <div className="flex flex-1 items-center justify-center">
          <QrCode color={style.qrColor} className="w-[30%]" />
        </div>
        <span className={`self-end text-sm tracking-[0.2em] ${style.subTextClass}`}>
          TAP &amp; SCAN
        </span>
      </div>
    </>
  );
}

export default function FlippableCard({
  color = DEFAULT_CARD_COLOR,
  className,
  shadow = true,
  reflection = shadow,
}: {
  color?: string;
  className?: string;
  shadow?: boolean;
  reflection?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [reflectedFlipped, setReflectedFlipped] = useState(false);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const style = CARD_COLORS[color] ?? CARD_COLORS[DEFAULT_CARD_COLOR];

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      setScale(el.offsetWidth / CARD_WIDTH);
      setReady(true);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    // Swap the reflected face once the real card visually crosses edge-on,
    // instead of the moment the click happens.
    window.setTimeout(() => setReflectedFlipped(next), FLIP_DURATION_MS / 2);
  };

  return (
    <div
      ref={wrapperRef}
      className={`block min-w-0 ${className ?? ""}`}
      style={{
        aspectRatio: `${CARD_WIDTH} / ${
          reflection ? CARD_HEIGHT + REFLECTION_RESERVE : CARD_HEIGHT
        }`,
      }}
    >
      <div
        className={`relative transition-opacity duration-200 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <button
          type="button"
          onClick={handleFlip}
          aria-label="Flip HERNEROS card to see the other side"
          className="block cursor-pointer text-left transition-transform active:scale-[0.98]"
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
        >
          <div
            className={`overflow-hidden rounded-[18px] ${shadow ? "card-shadow" : ""}`}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          >
            <div className="perspective-1600" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
              <div
                className="card-flip-transition preserve-3d relative will-change-transform"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  transform: `rotateY(${flipped ? 180 : 0}deg)`,
                }}
              >
                <div
                  className={`backface-hidden absolute inset-0 overflow-hidden rounded-[18px] ${style.borderClass ?? ""}`}
                  style={{ background: style.cardGradient }}
                >
                  <CardFaceContent variant="front" style={style} />
                </div>

                <div
                  className={`backface-hidden absolute inset-0 overflow-hidden rounded-[18px] [transform:rotateY(180deg)] ${style.borderClass ?? ""}`}
                  style={{ background: style.cardGradient }}
                >
                  <CardFaceContent variant="back" style={style} />
                </div>
              </div>
            </div>
          </div>
        </button>

        {reflection && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute overflow-hidden rounded-[18px] ${style.borderClass ?? ""}`}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              top: CARD_HEIGHT + REFLECTION_GAP,
              left: 0,
              background: style.cardGradient,
              transform: "scaleY(-1)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 62%)",
              maskImage: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 62%)",
            }}
          >
            <CardFaceContent variant={reflectedFlipped ? "back" : "front"} style={style} />
          </div>
        )}
      </div>
    </div>
  );
}
