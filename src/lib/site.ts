// Canonical origin for links baked into physical NFC chips / QR codes and
// for copy-to-share links. Hardcoded rather than derived from
// window.location.origin so a card generated (or a link shared) from a
// preview deployment or the old *.vercel.app URL still points at the real
// domain, not whichever host happened to serve the page that moment.
export const SITE_URL = "https://herneros.org";
