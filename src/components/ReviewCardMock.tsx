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
  const tapLabel = style.tapLabel;
  const [tapFirst, ...tapRest] = (tapLabel ?? "TAP YOUR PHONE").split(" ");

  return (
    <div className={`block ${className ?? ""}`}>
      <div
        className={`relative flex aspect-square flex-col overflow-hidden rounded-[32px] bg-white ${shadow ? "review-card-shadow" : ""}`}
      >
        <div
          className="flex h-[54%] flex-col items-center justify-center gap-3 px-6 pt-4 pb-6 sm:gap-4 sm:px-8 sm:pt-6"
          style={{ background: style.background }}
        >
          {style.showStars && <StarRow />}
          {style.badgeIcon ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] sm:h-20 sm:w-20">
              <PlatformIcon platform={platform} className="h-8 w-8 sm:h-11 sm:w-11" />
            </div>
          ) : (
            <PlatformIcon platform={platform} className="h-14 w-14 sm:h-20 sm:w-20" />
          )}
          <p
            className={`whitespace-pre-line text-center leading-tight tracking-tight ${style.labelTextClass}`}
          >
            {style.labelAccent ? (
              <>
                <span className="text-base font-extrabold sm:text-2xl">
                  {style.label}
                </span>{" "}
                <span className="text-base font-medium sm:text-2xl">
                  {style.labelAccent}
                </span>
              </>
            ) : (
              <span className="text-base font-extrabold sm:text-2xl">
                {style.label}
              </span>
            )}
          </p>
        </div>

        <div className="relative flex flex-1 flex-col items-center">
          <svg
            className="absolute inset-x-0 -top-5 h-6 w-full sm:-top-7 sm:h-8"
            viewBox="0 0 400 30"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id={waveShadowId} x="-10%" y="-30%" width="120%" height="180%">
                <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.18" />
              </filter>
            </defs>
            <g filter={`url(#${waveShadowId})`}>
              <path
                d="M0,12 C130,24 270,4 400,14 L400,30 L0,30 Z"
                fill="#ffffff"
              />
            </g>
          </svg>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pt-6 text-black sm:gap-6 sm:pt-8">
            <p className="text-center text-sm tracking-wide sm:text-lg">
              <span className="font-extrabold">{tapFirst}</span>{" "}
              <span className="font-medium">{tapRest.join(" ")}</span>
            </p>
            <ContactlessIcon className="w-36 text-black sm:w-52" />
          </div>
          <p className="pb-3 text-center text-[9px] tracking-wide text-black/40 sm:pb-5 sm:text-xs">
            Powered by <span className="font-semibold text-black/60">HERNEROS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
