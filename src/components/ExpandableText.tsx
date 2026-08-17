"use client";

import { useState } from "react";

export default function ExpandableText({
  text,
  max = 140,
  className = "text-sm text-black/80",
}: {
  text: string;
  max?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > max;
  const shown = expanded || !isLong ? text : `${text.slice(0, max).trimEnd()}…`;

  return (
    <p className={className}>
      {shown}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="ml-1 text-xs font-semibold text-black/50 transition-colors hover:text-black"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </p>
  );
}
