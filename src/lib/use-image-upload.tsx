"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";

export function useImageUpload({
  cardId,
  folder,
  onChange,
}: {
  cardId: string;
  folder: "avatar" | "cover";
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);

  const openFilePicker = () => inputRef.current?.click();

  const closeCropper = () => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    setPendingImageSrc(URL.createObjectURL(file));
  };

  const handleCropConfirm = async (blob: Blob) => {
    closeCropper();
    setUploading(true);
    setError("");
    const path = `${cardId}/${folder}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("profile-media")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    setUploading(false);
    if (uploadError) {
      setError("Upload failed. Try a different image.");
      return;
    }
    const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
    onChange(`${data.publicUrl}?t=${Date.now()}`);
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleFileChange}
    />
  );

  return {
    openFilePicker,
    hiddenInput,
    uploading,
    error,
    pendingImageSrc,
    closeCropper,
    handleCropConfirm,
  };
}
