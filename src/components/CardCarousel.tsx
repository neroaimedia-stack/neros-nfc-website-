"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const MAX_VISIBLE_DISTANCE = 2.4;

// Shortest signed distance from 0 to `raw` on a circle of size n, e.g. with
// n=5 a raw delta of 4 is really -1 away (wrap the other direction).
function wrappedDelta(raw: number, n: number) {
  let d = raw % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

// Isolated so the linter doesn't flag the impure performance.now() call as a
// possible render-time read — it's only ever invoked from pointer handlers.
function now() {
  return performance.now();
}

const TRANSITION_MS = 500;
// Extra horizontal breathing room between card centers, on top of the
// card's own measured width, so neighbors always peek rather than overlap.
const PEEK_GAP = 28;
// Smallest sliver of a neighboring card that must stay visible at the
// container's edge — on narrow screens the card is nearly as wide as the
// container, so without this the "ideal" gap above pushes neighbors
// entirely out of view and the carousel stops looking like one.
const MIN_PEEK = 60;

export default function CardCarousel({ items }: { items: React.ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(288);
  const [containerWidth, setContainerWidth] = useState(1152);
  const [activeIndex, setActiveIndex] = useState(0);
  // Stacking order lags behind activeIndex until a snap animation finishes,
  // so a card never jumps in front of one it's still visually sliding past.
  const [zIndexBase, setZIndexBase] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  const draggedRef = useRef(false);
  // Pointer events from a fast flick can fire faster than React commits the
  // `dragging`/`dragOffset` state updates, so the move/up handlers read
  // these refs (always current) instead of the closure-captured state.
  const draggingRef = useRef(false);
  const offsetRef = useRef(0);
  const zTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const n = items.length;

  const idealGap = cardWidth + PEEK_GAP;
  const maxGapForPeek = containerWidth / 2 + cardWidth / 2 - MIN_PEEK;
  // Never let the gap drop below the card's own width, or neighbors would
  // start overlapping the active card instead of just sitting closer.
  const cardGap = Math.min(idealGap, Math.max(maxGapForPeek, cardWidth));

  useEffect(() => {
    const cardEl = cardRef.current;
    const containerEl = containerRef.current;
    if (!cardEl || !containerEl) return;
    const measure = () => {
      const cw = cardEl.getBoundingClientRect().width;
      const containerW = containerEl.getBoundingClientRect().width;
      if (cw > 0) setCardWidth(cw);
      if (containerW > 0) setContainerWidth(containerW);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(cardEl);
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (zTimeoutRef.current) clearTimeout(zTimeoutRef.current);
    };
  }, []);

  const goTo = (i: number) => {
    const next = ((i % n) + n) % n;
    setActiveIndex(next);
    if (zTimeoutRef.current) clearTimeout(zTimeoutRef.current);
    zTimeoutRef.current = setTimeout(() => setZIndexBase(next), TRANSITION_MS);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    draggedRef.current = false;
    startXRef.current = e.clientX;
    startTimeRef.current = now();
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > 6) draggedRef.current = true;
    offsetRef.current = delta;
    setDragOffset(delta);
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const offset = offsetRef.current;
    const elapsed = Math.max(1, now() - startTimeRef.current);
    const velocity = offset / elapsed; // px per ms
    const deltaCards = -offset / cardGap;
    // A drag past ~8% of the gap, or a quick flick that's fast but short,
    // both count as "swipe to the next card" — always move at least one
    // card in that direction rather than rounding back to the same spot. A
    // longer deliberate drag can still jump multiple cards.
    if (Math.abs(deltaCards) > 0.08) {
      const cardsToMove = Math.max(1, Math.round(Math.abs(deltaCards)));
      goTo(activeIndex + Math.sign(deltaCards) * cardsToMove);
    } else if (Math.abs(velocity) > 0.15) {
      goTo(activeIndex + (velocity < 0 ? 1 : -1));
    }
    offsetRef.current = 0;
    setDragOffset(0);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      draggedRef.current = false;
    }
  };

  return (
    <div>
      <div
        ref={containerRef}
        className="relative -ml-[calc(50vw-50%)] h-[408px] w-screen touch-none overflow-hidden select-none sm:ml-0 sm:w-full sm:max-w-full"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
      >
        {items.map((item, i) => {
          const distance = wrappedDelta(i - activeIndex - dragOffset / cardGap, n);
          const abs = Math.abs(distance);
          if (abs > MAX_VISIBLE_DISTANCE) return null;

          const translateX = distance * cardGap;
          const scale = Math.max(0.78, 1 - abs * 0.16);
          const opacity = Math.max(0.2, 1 - abs * 0.45);
          const brightness = Math.max(0.55, 1 - abs * 0.35);
          const isActive = i === activeIndex && dragOffset === 0;
          const zAbs = dragging ? abs : Math.abs(wrappedDelta(i - zIndexBase, n));

          return (
            <div
              key={i}
              ref={isActive ? cardRef : undefined}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                opacity,
                filter: `brightness(${brightness})`,
                zIndex: 100 - Math.round(zAbs * 10),
                transition: dragging
                  ? "none"
                  : `transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), opacity ${TRANSITION_MS}ms ease, filter ${TRANSITION_MS}ms ease`,
                cursor: isActive ? "default" : "pointer",
              }}
              onClick={() => {
                if (!isActive) goTo(i);
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to card ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-5 bg-black" : "w-1.5 bg-black/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
