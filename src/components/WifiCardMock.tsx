import Image from "next/image";
import {
  DEFAULT_WIFI_CARD_FORMAT,
  WIFI_CARD_FORMATS,
} from "@/lib/wifi-card";

export default function WifiCardMock({
  format = DEFAULT_WIFI_CARD_FORMAT,
  className,
  shadow = true,
}: {
  format?: string;
  className?: string;
  shadow?: boolean;
}) {
  const style =
    WIFI_CARD_FORMATS[format] ?? WIFI_CARD_FORMATS[DEFAULT_WIFI_CARD_FORMAT];

  return (
    <div className={`block ${className ?? ""}`}>
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-[8%] ${shadow ? "review-card-shadow" : ""}`}
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
