"use client";

import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { downloadVCard } from "@/lib/vcard";

type SaveContactProfile = {
  full_name: string | null;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  emails: string[] | null;
  phone_numbers: string[] | null;
  links: { label?: string; url?: string }[] | null;
};

export default function SaveContactButton({
  profile,
  className,
}: {
  profile: SaveContactProfile;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  const handleClick = () => {
    downloadVCard(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      }
    >
      {saved ? (
        <span className="flex items-center justify-center gap-1.5">
          <FiCheck className="h-4 w-4" />
          Saved to Contacts
        </span>
      ) : (
        "Save to Contacts"
      )}
    </button>
  );
}
