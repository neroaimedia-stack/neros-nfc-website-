"use client";

import { findSocialPlatform, SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { sanitizeText } from "@/lib/sanitize";

export type SocialLink = { platform: string; url: string };

export default function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  const usedSlugs = new Set(value.map((link) => link.platform));
  const available = SOCIAL_PLATFORMS.filter((p) => !usedSlugs.has(p.slug));

  const addPlatform = (slug: string) => {
    onChange([...value, { platform: slug, url: "" }]);
  };

  const updateUrl = (slug: string, url: string) => {
    onChange(value.map((link) => (link.platform === slug ? { ...link, url } : link)));
  };

  const removePlatform = (slug: string) => {
    onChange(value.filter((link) => link.platform !== slug));
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-col gap-2">
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
                  onChange={(e) => updateUrl(link.platform, sanitizeText(e.target.value))}
                  placeholder={platform.placeholder}
                  maxLength={300}
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

      {available.length > 0 && (
        <div className={`flex flex-col ${value.length > 0 ? "mt-3" : ""}`}>
          {available.map((platform) => {
            const Icon = platform.Icon;
            return (
              <button
                key={platform.slug}
                type="button"
                onClick={() => addPlatform(platform.slug)}
                className="flex items-center gap-3 border-b border-black/10 py-3 text-left text-black transition-colors last:border-b-0 hover:opacity-60"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{platform.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
