"use client";

export default function FieldEditSheet({
  title,
  onCancel,
  onSave,
  saving = false,
  error,
  children,
}: {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
      onClick={onCancel}
    >
      <div
        className="mx-auto flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-white md:max-w-xl lg:max-w-2xl xl:max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-6 py-4">
          <h2 className="text-base font-bold text-black">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-black/40 hover:text-black"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          {children}
        </div>

        <div className="shrink-0 border-t border-black/10 px-6 py-4">
          {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
