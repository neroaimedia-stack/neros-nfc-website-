"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { copyText } from "@/lib/clipboard";

// A mailto: link only works if the device has a mail client configured —
// on many laptops/desktops (no default Mail/Outlook app, browser-only
// webmail) clicking it silently does nothing. This gives people a
// fallback that always works: copy the address and paste it into
// whatever email they actually use.
export default function CopyEmailButton({
  email,
  iconOnly = false,
  className = "",
}: {
  email: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(email);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Email address copied" : `Copy ${email}`}
      title={iconOnly ? (copied ? "Copied!" : `Copy ${email}`) : undefined}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {copied ? (
        <FiCheck className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <FiCopy className="h-3.5 w-3.5 shrink-0" />
      )}
      {!iconOnly && <span>{copied ? "Copied!" : email}</span>}
    </button>
  );
}
