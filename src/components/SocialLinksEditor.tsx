"use client";

import { useState } from "react";
import { findSocialPlatform, SOCIAL_PLATFORMS } from "@/lib/social-platforms";

export type SocialLink = { platform: string; url: string };

export default function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  const [picking, setPicking] = useState(false);

  const usedSlugs = new Set(value.map((link) => link.platform));
  const available = SOCIAL_PLATFORMS.filter((p) => !usedSlugs.has(p.slug));

  const addPlatform = (slug: string) => {
    onChange([...value, { platform: slug, url: "" }]);
    setPicking(false);
  };

  const updateUrl = (slug: string, url: string) => {
    onChange(value.map((link) => (link.platform === slug ? { ...link, url } : link)));
  };

  const removePlatform = (slug: string) => {
    onChange(value.filter((link) => link.platform !== slug));
  };

  return (
    <div>
      <label className="text-sm font-medium text-black">Social networks</label>

      {value.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {value.map((link) => {
            const platform = findSocialPlatform(link.platform);
            if (!platform) return null;
            const Icon = platform.Icon;
            return (
              <div key={link.platform} className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black">
                  <Icon className="h-4 w-4" />
                </div>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateUrl(link.platform, e.target.value)}
                  placeholder={platform.placeholder}
                  className="min-w-0 flex-1 rounded-full border border-black/15 px-4 py-2 text-sm outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => removePlatform(link.platform)}
                  aria-label={`Remove ${platform.label}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/40 hover:bg-black/5 hover:text-black"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {picking ? (
        <div className="mt-3 rounded-2xl border border-black/10 p-3">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {available.map((platform) => {
              const Icon = platform.Icon;
              return (
                <button
                  key={platform.slug}
                  type="button"
                  onClick={() => addPlatform(platform.slug)}
                  title={platform.label}
                  className="flex flex-col items-center gap-1 rounded-xl p-2 text-black/70 transition-colors hover:bg-black/5 hover:text-black"
                >
                  <Icon className="h-5 w-5" />
                  <span className="w-full truncate text-center text-[10px]">
                    {platform.label}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setPicking(false)}
            className="mt-2 text-xs font-medium text-black/40 hover:text-black"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPicking(true)}
          disabled={available.length === 0}
          className="mt-3 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-60 disabled:opacity-40"
        >
          + Add platform
        </button>
      )}
    </div>
  );
}
