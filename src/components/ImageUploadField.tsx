"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ImageUploadField({
  label,
  cardId,
  folder,
  value,
  onChange,
  shape = "square",
  required = false,
}: {
  label: string;
  cardId: string;
  folder: "avatar" | "cover";
  value: string | null;
  onChange: (url: string | null) => void;
  shape?: "square" | "wide";
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${cardId}/${folder}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-media")
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (uploadError) {
      setError("Upload failed. Try a different image.");
      return;
    }
    const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
    onChange(`${data.publicUrl}?t=${Date.now()}`);
  };

  const buttons = (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-full border border-black px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-60 disabled:opacity-50"
      >
        {uploading ? "Uploading…" : value ? "Change" : "Upload"}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs font-medium text-black/40 hover:text-black"
        >
          Remove
        </button>
      )}
    </div>
  );

  return (
    <div className="min-w-0">
      <label className="text-sm font-medium text-black">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      {shape === "wide" ? (
        <div className="mt-2 flex flex-col gap-3">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label}
              className="h-28 w-full rounded-2xl border border-black/10 object-cover"
            />
          ) : (
            <div className="flex h-28 w-full items-center justify-center rounded-2xl border border-dashed border-black/20 text-xs text-black/30">
              Cover
            </div>
          )}
          {buttons}
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label}
              className="h-24 w-24 shrink-0 rounded-full border border-black/10 object-cover object-top"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-dashed border-black/20 text-xs text-black/30">
              Photo
            </div>
          )}
          {buttons}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
