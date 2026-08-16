"use client";

import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/crop-image";

export default function ImageCropModal({
  imageSrc,
  aspect,
  cropShape = "rect",
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  aspect: number;
  cropShape?: "rect" | "round";
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
    setSaving(false);
    onConfirm(blob);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>

      <div className="flex flex-col gap-4 bg-black p-5">
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-white"
          aria-label="Zoom"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || !croppedAreaPixels}
            className="flex-1 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
