import PlatformIcon, { ContactlessIcon } from "@/components/PlatformIcon";
import {
  DEFAULT_REVIEW_PLATFORM,
  REVIEW_PLATFORMS,
} from "@/lib/review-platforms";

const WAVE_STROKE_PATH = "M0,20 C130,32 270,8 400,20";
const WAVE_FILL_PATH = "M0,20 C130,32 270,8 400,20 L400,40 L0,40 Z";

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
  const idBase = platform.replace(/\s+/g, "-");
  const waveShadowId = `review-wave-shadow-${idBase}`;
  const leftClipId = `review-wave-left-${idBase}`;
  const rightClipId = `review-wave-right-${idBase}`;
  const tapArcId = `review-tap-arc-${idBase}`;
  const isDualAccent = Array.isArray(style.waveAccent);

  return (
    <div className={`block ${className ?? ""}`}>
      <div
        className={`relative flex aspect-square flex-col overflow-hidden rounded-[32px] bg-white ${shadow ? "review-card-shadow" : ""}`}
      >
        <div
          className="flex h-[48%] flex-col items-center justify-center gap-3 px-6 sm:gap-4 sm:px-8"
          style={{ background: style.background }}
        >
          {style.badgeIcon ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.22)] sm:h-24 sm:w-24">
              <PlatformIcon platform={platform} className="h-9 w-9 sm:h-14 sm:w-14" />
            </div>
          ) : (
            <PlatformIcon platform={platform} className="h-16 w-16 sm:h-24 sm:w-24" />
          )}
          <p
            className={`text-center text-base leading-tight font-extrabold tracking-tight sm:text-2xl ${style.labelTextClass}`}
          >
            {style.label}
          </p>
        </div>

        <div className="relative flex flex-1 flex-col items-center">
          <svg
            className="absolute inset-x-0 -top-9 h-11 w-full sm:-top-13 sm:h-16"
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id={waveShadowId} x="-10%" y="-30%" width="120%" height="180%">
                <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.18" />
              </filter>
              {isDualAccent && (
                <>
                  <clipPath id={leftClipId}>
                    <rect x="0" y="0" width="200" height="40" />
                  </clipPath>
                  <clipPath id={rightClipId}>
                    <rect x="200" y="0" width="200" height="40" />
                  </clipPath>
                </>
              )}
            </defs>

            {isDualAccent ? (
              <>
                <path
                  d={WAVE_STROKE_PATH}
                  fill="none"
                  stroke={style.waveAccent[0]}
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform="translate(0,-5)"
                  clipPath={`url(#${leftClipId})`}
                />
                <path
                  d={WAVE_STROKE_PATH}
                  fill="none"
                  stroke={style.waveAccent[1]}
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform="translate(0,-5)"
                  clipPath={`url(#${rightClipId})`}
                />
              </>
            ) : (
              <path
                d={WAVE_STROKE_PATH}
                fill="none"
                stroke={style.waveAccent as string}
                strokeWidth="3"
                strokeLinecap="round"
                transform="translate(0,-5)"
              />
            )}

            <g filter={`url(#${waveShadowId})`}>
              <path d={WAVE_FILL_PATH} fill="#ffffff" />
            </g>
          </svg>

          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 pt-8 text-black sm:gap-4 sm:pt-10">
            <svg viewBox="0 0 300 56" className="w-52 sm:w-72">
              <defs>
                <path id={tapArcId} d="M12,46 Q150,6 288,46" fill="none" />
              </defs>
              <text fontSize="26" fontFamily="Arial, sans-serif" fill="currentColor">
                <textPath href={`#${tapArcId}`} startOffset="50%" textAnchor="middle">
                  <tspan fontWeight="800">TAP</tspan>{" "}
                  <tspan fontWeight="500">YOUR PHONE</tspan>
                </textPath>
              </text>
            </svg>
            <ContactlessIcon className="w-32 text-black sm:w-48" />
          </div>
          <p className="pb-3 text-center text-[9px] tracking-wide text-black/40 sm:pb-5 sm:text-xs">
            Powered by <span className="font-semibold text-black/60">HERNEROS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
