export default function CardMockup() {
  return (
    <svg
      viewBox="0 0 340 214"
      className="w-full max-w-sm drop-shadow-2xl"
      role="img"
      aria-label="NERO NFC card"
    >
      <rect x="1" y="1" width="338" height="212" rx="18" fill="#0a0a0a" stroke="#000" />
      <rect x="1" y="1" width="338" height="212" rx="18" fill="url(#sheen)" opacity="0.15" />
      <text x="28" y="48" fill="#ffffff" fontSize="22" fontWeight="700" fontFamily="Arial, sans-serif">
        NERO
      </text>
      <g transform="translate(270, 26)" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.9">
        <path d="M6 24a24 24 0 0 1 0-24" strokeLinecap="round" transform="translate(0,0)" />
        <path d="M14 30a34 34 0 0 1 0-36" strokeLinecap="round" />
        <path d="M22 36a44 44 0 0 1 0-48" strokeLinecap="round" />
      </g>
      <rect x="28" y="120" width="40" height="30" rx="6" fill="#d4af37" opacity="0.85" />
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
