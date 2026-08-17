"use client";

import { useState } from "react";
import { sanitizeText } from "@/lib/sanitize";

export default function TagListInput({
  label,
  values,
  onChange,
  placeholder,
  maxLength = 60,
  validate,
  invalidMessage = "That doesn't look right.",
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxLength?: number;
  validate?: (value: string) => boolean;
  invalidMessage?: string;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const addTag = () => {
    const trimmed = sanitizeText(draft).trim();
    if (!trimmed) {
      setDraft("");
      setError("");
      return;
    }
    if (validate && !validate(trimmed)) {
      setError(invalidMessage);
      return;
    }
    if (values.includes(trimmed)) {
      setDraft("");
      setError("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
    setError("");
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  return (
    <div>
      <label className="text-sm font-medium text-black">{label}</label>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          maxLength={maxLength}
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

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {values.length > 0 && (
        <div className="mt-3 flex flex-col">
          {values.map((tag) => (
            <div
              key={tag}
              className="flex items-center justify-between border-b border-black/10 py-3 last:border-b-0"
            >
              <span className="text-sm font-medium text-black">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-black/40 hover:bg-black/5 hover:text-black"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
