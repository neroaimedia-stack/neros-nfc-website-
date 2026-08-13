import PlatformIcon, { StarRow, TapPhoneIcon } from "@/components/PlatformIcon";
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
          className="flex flex-col items-center gap-2 px-6 pt-6 pb-7 sm:gap-3 sm:px-8 sm:pt-9 sm:pb-10"
          style={{ background: style.background }}
        >
          {style.showStars && <StarRow className="scale-90 sm:scale-100" />}
          <p
            className={`whitespace-pre-line text-center text-sm leading-tight font-extrabold tracking-tight sm:text-xl ${style.labelTextClass}`}
          >
            {style.label}
          </p>
        </div>

        <div className="relative flex flex-1 flex-col items-center bg-white">
          <svg
            className="absolute inset-x-0 -top-7 h-8 w-full sm:-top-10 sm:h-10"
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
                d="M0,20 C25,6 75,6 100,20 C125,34 175,34 200,20 C225,6 275,6 300,20 C325,34 375,34 400,20 L400,40 L0,40 Z"
                fill="#ffffff"
              />
            </g>
            <path
              d="M0,20 C25,6 75,6 100,20 C125,34 175,34 200,20 C225,6 275,6 300,20 C325,34 375,34 400,20"
              fill="none"
              stroke={style.waveAccent}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0,3)"
            />
            <path
              d="M0,20 C25,6 75,6 100,20 C125,34 175,34 200,20 C225,6 275,6 300,20 C325,34 375,34 400,20"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 sm:-top-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.22)] sm:h-20 sm:w-20">
              <PlatformIcon platform={platform} className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
          </div>

          <div className="mt-9 flex flex-1 flex-col items-center justify-center gap-2 px-6 sm:mt-11 sm:gap-3">
            <TapPhoneIcon className="h-8 w-16 sm:h-12 sm:w-24" />
            <p className="text-xs font-bold tracking-wide text-black sm:text-base">
              {style.tapLabel ?? "TAP YOUR PHONE"}
            </p>
          </div>
          <p className="pb-3 text-center text-[9px] tracking-wide text-black/40 sm:pb-4 sm:text-xs">
            Powered by <span className="font-semibold text-black/60">HERNEROS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
