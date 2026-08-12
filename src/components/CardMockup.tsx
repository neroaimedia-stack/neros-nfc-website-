export default function CardMockup() {
  return (
    <svg
      viewBox="0 0 340 214"
      className="w-full max-w-sm drop-shadow-2xl"
      role="img"
      aria-label="HERNEROS NFC card"
    >
      <rect x="1" y="1" width="338" height="212" rx="18" fill="#0a0a0a" stroke="#000" />
      <rect x="1" y="1" width="338" height="212" rx="18" fill="url(#sheen)" opacity="0.15" />
      <text x="28" y="48" fill="#ffffff" fontSize="22" fontWeight="700" fontFamily="Arial, sans-serif">
        HERNEROS
      </text>
      <text x="28" y="188" fill="#ffffff" fontSize="14" letterSpacing="2" fontFamily="Arial, sans-serif" opacity="0.85">
        TAP &amp; SCAN
      </text>
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
