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

  return (
    <div className={`block ${className ?? ""}`} style={{ transform: "rotate(-3deg) scale(0.82)" }}>
      <div style={{ perspective: "1000px" }}>
        <div
          className="review-tilt relative"
          style={{ transform: "rotateY(22deg) rotateX(4deg)" }}
        >
          <div
            className={`relative flex aspect-square flex-col overflow-hidden rounded-[32px] ${shadow ? "review-card-shadow" : ""}`}
            style={{ background: style.background, transform: "translateZ(9px)" }}
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-3 sm:gap-3 sm:px-7">
              {style.showStars && <StarRow className="scale-90 sm:scale-100" />}
              {style.badgeIcon ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] sm:h-20 sm:w-20">
                  <PlatformIcon platform={platform} className="h-8 w-8 sm:h-11 sm:w-11" />
                </div>
              ) : (
                <PlatformIcon platform={platform} className="h-11 w-11 sm:h-16 sm:w-16" />
              )}
              <p
                className={`whitespace-pre-line text-center text-sm leading-tight font-extrabold tracking-tight sm:text-xl ${style.labelTextClass}`}
              >
                {style.label}
              </p>
            </div>

            <div className="relative bg-white">
              <svg
                className="absolute inset-x-0 -top-6 h-7 w-full sm:-top-9 sm:h-9"
                viewBox="0 0 400 36"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,16 C120,30 280,2 400,16 L400,36 L0,36 Z"
                  fill="#ffffff"
                />
                <path
                  d="M0,16 C120,30 280,2 400,16"
                  fill="none"
                  stroke="#a9c8f0"
                  strokeWidth="3.5"
                  transform="translate(0,2.5)"
                />
                <path
                  d="M0,16 C120,30 280,2 400,16"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                />
              </svg>

              <div className="flex flex-col items-center gap-1 pt-3 text-black sm:gap-2 sm:pt-5">
                <TapPhoneIcon className="h-8 w-16 sm:h-12 sm:w-24" />
                <p className="text-xs font-bold tracking-wide text-black sm:text-base">
                  {style.tapLabel ?? "TAP YOUR PHONE"}
                </p>
              </div>
              <p className="pb-2 pt-2 text-center text-[9px] tracking-wide text-black/40 sm:pb-4 sm:pt-3 sm:text-xs">
                Powered by <span className="font-semibold text-black/60">HERNEROS</span>
              </p>
            </div>
          </div>

          <div
            className="review-card-edge absolute inset-y-0 left-0 w-24 overflow-hidden rounded-l-[32px]"
            style={{
              transformOrigin: "left center",
              transform: "rotateY(-90deg) translateZ(9px)",
              background: style.background,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(0,0,0,0.4))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
