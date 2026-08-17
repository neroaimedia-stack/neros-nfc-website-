"use client";

export type EntryField = {
  key: string;
  label: string;
  placeholder?: string;
};

export default function MultiEntryEditor({
  label,
  fields,
  value,
  onChange,
  addLabel = "+ Add",
}: {
  label: string;
  fields: EntryField[];
  value: Record<string, string>[];
  onChange: (entries: Record<string, string>[]) => void;
  addLabel?: string;
}) {
  const updateEntry = (index: number, key: string, fieldValue: string) => {
    onChange(
      value.map((entry, i) =>
        i === index ? { ...entry, [key]: fieldValue } : entry
      )
    );
  };

  const removeEntry = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addEntry = () => {
    onChange([
      ...value,
      Object.fromEntries(fields.map((f) => [f.key, ""])),
    ]);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-black">{label}</label>
        <button
          type="button"
          onClick={addEntry}
          className="shrink-0 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-60"
        >
          {addLabel}
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-3 flex flex-col">
          {value.map((entry, index) => (
            <div key={index} className="border-b border-black/10 py-3 last:border-b-0">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  aria-label="Remove entry"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-black/40 hover:bg-black/5 hover:text-black"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {fields.map((field) => (
                  <input
                    key={field.key}
                    type="text"
                    value={entry[field.key] ?? ""}
                    onChange={(e) => updateEntry(index, field.key, e.target.value)}
                    placeholder={field.placeholder ?? field.label}
                    className="min-w-0 w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
