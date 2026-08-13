function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-16 w-16"} fill="#0866FF">
      <path d="M13.5 8.5h1.6V6.32c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.46-3.9 4.14v2.06H6.9v2.75h2.96V19.7h2.76v-6.55h2.14l.34-2.75h-2.48v-1.8c0-.8.22-1.35 1.38-1.35Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-16 w-16"}
      fill="none"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="white" stroke="none" />
    </svg>
  );
}

const TIKTOK_PATH =
  "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-16 w-16"}>
      <path d={TIKTOK_PATH} fill="#25F4EE" transform="translate(-0.9,-0.9)" />
      <path d={TIKTOK_PATH} fill="#FE2C55" transform="translate(0.9,0.9)" />
      <path d={TIKTOK_PATH} fill="#ffffff" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className ?? "h-16 w-16"}>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18A13.44 13.44 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.98 21.98 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export default function PlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  switch (platform) {
    case "Facebook":
      return <FacebookIcon className={className} />;
    case "Instagram":
      return <InstagramIcon className={className} />;
    case "TikTok":
      return <TikTokIcon className={className} />;
    case "Google Review":
      return <GoogleIcon className={className} />;
    default:
      return <FacebookIcon className={className} />;
  }
}

export function ContactlessIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 140"
      className={className ?? "w-56"}
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="70" cy="68" rx="64" ry="42" />
      <path d="M40 50A20 20 0 0 1 40 86" />
      <path d="M54 40A32 32 0 0 1 54 96" />
      <path d="M68 30A44 44 0 0 1 68 106" />

      <rect
        x="128"
        y="10"
        width="46"
        height="72"
        rx="9"
        fill="#ffffff"
      />
      <text
        x="151"
        y="51"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        stroke="none"
        fill="currentColor"
      >
        NFC
      </text>

      <path
        d="M112 92c0-10 8-18 18-18h20c11 0 19 8 19 18v20c0 8-7 15-15 15h-27c-8 0-15-7-15-15Z"
        fill="#ffffff"
      />
      <path d="M118 84c2-9 6-15 12-19" />
    </svg>
  );
}
