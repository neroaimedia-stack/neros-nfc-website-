import Image from "next/image";
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
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-[32px] ${shadow ? "review-card-shadow" : ""}`}
      >
        <Image
          src={style.image}
          alt={style.label}
          fill
          sizes="(max-width: 640px) 90vw, 400px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
