"use client";

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
  return (
    <button
      type="button"
      onClick={() => downloadVCard(profile)}
      className={
        className ??
        "rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      }
    >
      Save to Contacts
    </button>
  );
}
