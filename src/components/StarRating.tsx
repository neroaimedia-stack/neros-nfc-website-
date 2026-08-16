"use client";

export function StarDisplay({
  value,
  className = "text-base",
}: {
  value: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={`inline-flex ${className}`}
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rounded ? "text-black" : "text-black/20"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            aria-pressed={starValue === value}
            className={`text-2xl leading-none transition-colors ${
              starValue <= value
                ? "text-black"
                : "text-black/20 hover:text-black/40"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
