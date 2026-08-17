// Strip characters that could be used to break out of text content into
// markup (defense in depth — React already escapes rendered text, but this
// keeps stored data itself free of raw tag syntax).
export function sanitizeText(raw: string): string {
  return raw.replace(/[<>]/g, "");
}

// Only allow http(s) links to ever be used as an href. Anything else
// (javascript:, data:, vbscript:, etc.) is a stored-XSS vector once another
// visitor clicks the link, so it's rejected outright rather than rendered.
export function sanitizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  return `https://${trimmed}`;
}

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

const PHONE_PATTERN = /^[0-9+\-().\s]{5,20}$/;
export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.trim());
}
