"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const MAX_VISIBLE_DISTANCE = 2.4;

export default function CardCarousel({ items }: { items: React.ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardGap, setCardGap] = useState(300);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const draggedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setCardGap(Math.min(300, Math.max(220, el.clientWidth * 0.62)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clampIndex = (i: number) => Math.max(0, Math.min(items.length - 1, i));
  const goTo = (i: number) => setActiveIndex(clampIndex(i));

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(true);
    draggedRef.current = false;
    startXRef.current = e.clientX;
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > 6) draggedRef.current = true;
    setDragOffset(delta);
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    const deltaCards = -dragOffset / cardGap;
    if (Math.abs(deltaCards) > 0.15) {
      goTo(Math.round(activeIndex + deltaCards));
    }
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
        className="relative h-[440px] max-w-full touch-pan-y overflow-hidden select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
      >
        {items.map((item, i) => {
          const distance = i - activeIndex - dragOffset / cardGap;
          const abs = Math.abs(distance);
          if (abs > MAX_VISIBLE_DISTANCE) return null;

          const translateX = distance * cardGap;
          const scale = Math.max(0.78, 1 - abs * 0.16);
          const opacity = Math.max(0.2, 1 - abs * 0.45);
          const brightness = Math.max(0.55, 1 - abs * 0.35);
          const isActive = i === activeIndex && dragOffset === 0;

          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                opacity,
                filter: `brightness(${brightness})`,
                zIndex: 100 - Math.round(abs * 10),
                transition: dragging
                  ? "none"
                  : "transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease, filter 0.5s ease",
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

      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous card"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-black transition-opacity hover:opacity-60 disabled:opacity-25"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to card ${i + 1}`}
              aria-current={i === activeIndex}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-black" : "w-2 bg-black/20 hover:bg-black/40"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === items.length - 1}
          aria-label="Next card"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-black transition-opacity hover:opacity-60 disabled:opacity-25"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
