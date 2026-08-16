"use client";

import { useState } from "react";

export default function TagListInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed || values.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  return (
    <div>
      <label className="text-sm font-medium text-black">{label}</label>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full bg-black/5 py-1.5 pr-2 pl-3 text-xs font-medium text-black"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-black/40 hover:bg-black/10 hover:text-black"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-full border border-black/15 px-4 py-2 text-sm outline-none focus:border-black"
        />
        <button
          type="button"
          onClick={addTag}
          className="shrink-0 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-60"
        >
          Add
        </button>
      </div>
    </div>
  );
}
