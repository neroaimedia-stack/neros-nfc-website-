import Image from "next/image";
import {
  DEFAULT_REVIEW_PLATFORM,
  REVIEW_PLATFORMS,
} from "@/lib/review-platforms";

export default function ReviewCardMock({
  platform = DEFAULT_REVIEW_PLATFORM,
  className,
  shadow = true,
  imageOverride,
}: {
  platform?: string;
  className?: string;
  shadow?: boolean;
  imageOverride?: string | null;
}) {
  const style =
    REVIEW_PLATFORMS[platform] ?? REVIEW_PLATFORMS[DEFAULT_REVIEW_PLATFORM];

  return (
    <div className={`block ${className ?? ""}`}>
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-[8%] ${shadow ? "review-card-shadow" : ""}`}
      >
        {imageOverride ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageOverride}
            alt={style.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={style.image}
            alt={style.label}
            fill
            sizes="(max-width: 640px) 90vw, 400px"
            className="object-cover"
          />
        )}
      </div>
    </div>
  );
}
