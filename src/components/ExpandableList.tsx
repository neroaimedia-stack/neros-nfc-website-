"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export default function ExpandableList<T>({
  items,
  max = 5,
  renderItem,
  className = "flex flex-col gap-2",
}: {
  items: T[];
  max?: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = items.length - max;
  const visible = expanded || hiddenCount <= 0 ? items : items.slice(0, max);

  return (
    <div>
      <div className={className}>{visible.map((item, i) => renderItem(item, i))}</div>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-xs font-semibold text-black/50 transition-colors hover:text-black"
        >
          {expanded ? "See less" : `See more (${hiddenCount})`}
        </button>
      )}
    </div>
  );
}
