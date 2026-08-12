import PlatformIcon, { TapPhoneIcon } from "@/components/PlatformIcon";
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
    <div className={`block ${className ?? ""}`}>
      <div className={shadow ? "card-reflect" : ""}>
        <div
          className={`relative aspect-square overflow-hidden rounded-[32px] ${shadow ? "card-shadow" : ""}`}
          style={{ background: style.background }}
        >
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 pt-11">
            <PlatformIcon platform={platform} />
            <p
              className={`text-center text-lg font-extrabold tracking-tight ${style.labelTextClass}`}
            >
              {style.label}
            </p>
          </div>

          <svg
            className="absolute inset-x-0"
            style={{ top: "48%" }}
            viewBox="0 0 400 32"
            preserveAspectRatio="none"
            width="100%"
            height="32"
          >
            <path d="M0,20 C100,36 300,0 400,18 L400,32 L0,32 Z" fill="#ffffff" />
          </svg>

          <div
            className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-between bg-white pb-4"
            style={{ top: "50%" }}
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-black">
              <TapPhoneIcon className="h-12 w-24" />
              <p className="text-sm font-bold tracking-wide text-black">
                TAP YOUR PHONE
              </p>
            </div>
            <p className="text-[10px] text-black/40">
              Powered by <span className="font-semibold text-black/60">HERNEROS</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
