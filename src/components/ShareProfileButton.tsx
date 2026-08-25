"use client";

import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { SITE_URL } from "@/lib/site";

export default function ShareProfileButton({
  cardId,
  className,
}: {
  cardId: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url = `${SITE_URL}/c/${cardId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "rounded-full border border-black px-6 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-60"
      }
    >
      {copied ? (
        <span className="flex items-center justify-center gap-1.5">
          <FiCheck className="h-4 w-4" />
          Link copied!
        </span>
      ) : (
        "Share profile"
      )}
    </button>
  );
}
