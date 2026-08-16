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
      <label className="text-sm font-medium text-black">{label}</label>

      {value.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          {value.map((entry, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-2xl border border-black/10 p-3"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="text-xs font-medium text-black/40 hover:text-black"
                >
                  Remove
                </button>
              </div>
              {fields.map((field) => (
                <input
                  key={field.key}
                  type="text"
                  value={entry[field.key] ?? ""}
                  onChange={(e) => updateEntry(index, field.key, e.target.value)}
                  placeholder={field.placeholder ?? field.label}
                  className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addEntry}
        className="mt-3 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-60"
      >
        {addLabel}
      </button>
    </div>
  );
}
