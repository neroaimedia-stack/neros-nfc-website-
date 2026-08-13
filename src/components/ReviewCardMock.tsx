import PlatformIcon, {
  ContactlessIcon,
  StarRow,
} from "@/components/PlatformIcon";
import {
  DEFAULT_REVIEW_PLATFORM,
  REVIEW_PLATFORMS,
} from "@/lib/review-platforms";

export default function ReviewCardMock({
  platform = DEFAULT_REVIEW_PLATFORM,
  className,
  shadow = true,
}: {
  platform?: string;
  className?: string;
  shadow?: boolean;
}) {
  const style =
    REVIEW_PLATFORMS[platform] ?? REVIEW_PLATFORMS[DEFAULT_REVIEW_PLATFORM];
  const waveShadowId = `review-wave-shadow-${platform.replace(/\s+/g, "-")}`;

  return (
    <div className={`block ${className ?? ""}`}>
      <div
        className={`relative flex aspect-square flex-col overflow-hidden rounded-[32px] bg-white ${shadow ? "review-card-shadow" : ""}`}
      >
        <div
          className="flex h-[46%] flex-col items-center justify-center gap-1.5 px-5 pb-3 sm:gap-3 sm:px-8 sm:pb-5"
          style={{ background: style.background }}
        >
          {style.showStars && <StarRow />}
          <p
            className={`whitespace-pre-line text-center text-base leading-tight font-extrabold tracking-tight sm:text-2xl ${style.labelTextClass}`}
          >
            {style.label}
          </p>
        </div>

        <div className="relative flex flex-1 flex-col items-center">
          <svg
            className="absolute inset-x-0 -top-8 h-10 w-full sm:-top-11 sm:h-12"
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id={waveShadowId} x="-10%" y="-20%" width="120%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
              </filter>
            </defs>
            <g filter={`url(#${waveShadowId})`}>
              <path
                d="M0,18 C130,36 270,0 400,18 L400,40 L0,40 Z"
                fill="#ffffff"
              />
            </g>
            <path
              d="M0,18 C130,36 270,0 400,18"
              fill="none"
              stroke={style.waveAccent}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0,18 C130,36 270,0 400,18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="absolute -top-[40px] left-1/2 z-10 -translate-x-1/2 sm:-top-[52px]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.18)] sm:h-24 sm:w-24">
              <PlatformIcon platform={platform} className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 pt-10 sm:gap-4 sm:pt-12">
            <ContactlessIcon className="w-36 text-black sm:w-52" />
            <p className="text-center text-xs font-bold tracking-wide text-black sm:text-lg">
              {style.tapLabel ?? "TAP YOUR PHONE"}
            </p>
          </div>
          <p className="pb-3 text-center text-[9px] tracking-wide text-black/40 sm:pb-5 sm:text-xs">
            Powered by <span className="font-semibold text-black/60">HERNEROS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
