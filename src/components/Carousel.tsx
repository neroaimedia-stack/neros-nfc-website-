"use client";

import { useEffect, useRef, useState } from "react";

export default function Carousel({ items }: { items: React.ReactNode[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setScrollable(maxScroll > 4);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= maxScroll - 4);
    const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setActiveIndex(Math.round(progress * (items.length - 1)));
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = items.length > 1 ? (index / (items.length - 1)) * maxScroll : 0;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent transition-opacity duration-300 sm:w-16 ${
          scrollable && !atStart ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent transition-opacity duration-300 sm:w-16 ${
          scrollable && !atEnd ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items}
      </div>

      {scrollable && (
        <div className="mt-4 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-black" : "w-2 bg-black/20 hover:bg-black/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
