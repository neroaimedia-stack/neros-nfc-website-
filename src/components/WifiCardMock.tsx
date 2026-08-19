import Image from "next/image";
import {
  DEFAULT_WIFI_CARD_FORMAT,
  WIFI_CARD_FORMATS,
} from "@/lib/wifi-card";

export default function WifiCardMock({
  format = DEFAULT_WIFI_CARD_FORMAT,
  className,
  shadow = true,
  imageOverride,
}: {
  format?: string;
  className?: string;
  shadow?: boolean;
  imageOverride?: string | null;
}) {
  const style =
    WIFI_CARD_FORMATS[format] ?? WIFI_CARD_FORMATS[DEFAULT_WIFI_CARD_FORMAT];

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
