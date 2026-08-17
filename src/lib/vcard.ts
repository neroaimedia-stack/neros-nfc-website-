type VCardSource = {
  full_name: string | null;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  emails: string[] | null;
  phone_numbers: string[] | null;
  links: { label?: string; url?: string }[] | null;
};

function escapeVCardText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

function splitName(fullName: string): { given: string; family: string } {
  const trimmed = fullName.trim();
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) return { given: trimmed, family: "" };
  return {
    given: trimmed.slice(0, firstSpace),
    family: trimmed.slice(firstSpace + 1),
  };
}

export function buildVCard(profile: VCardSource): string {
  const name = (profile.full_name || "").trim();
  const { given, family } = splitName(name);

  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`FN:${escapeVCardText(name || "Unnamed contact")}`);
  lines.push(`N:${escapeVCardText(family)};${escapeVCardText(given)};;;`);

  if (profile.job_title) {
    lines.push(`TITLE:${escapeVCardText(profile.job_title)}`);
  }
  for (const phone of profile.phone_numbers ?? []) {
    if (phone.trim()) lines.push(`TEL;TYPE=CELL:${escapeVCardText(phone.trim())}`);
  }
  for (const email of profile.emails ?? []) {
    if (email.trim()) lines.push(`EMAIL:${escapeVCardText(email.trim())}`);
  }
  for (const link of profile.links ?? []) {
    if (link.url?.trim()) lines.push(`URL:${escapeVCardText(link.url.trim())}`);
  }
  if (profile.bio) {
    lines.push(`NOTE:${escapeVCardText(profile.bio)}`);
  }
  if (profile.avatar_url) {
    lines.push(`PHOTO;VALUE=URI:${profile.avatar_url}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(profile: VCardSource): void {
  const vcard = buildVCard(profile);
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const safeName = (profile.full_name || "contact")
    .trim()
    .replace(/[^a-zA-Z0-9\- ]/g, "")
    .replace(/\s+/g, "-") || "contact";

  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeName}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
