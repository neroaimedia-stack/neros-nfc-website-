import { CARD_COLORS, DEFAULT_CARD_COLOR } from "@/lib/card-colors";

export default function CardFace({
  className,
  color = DEFAULT_CARD_COLOR,
}: {
  className?: string;
  color?: string;
}) {
  const style = CARD_COLORS[color] ?? CARD_COLORS[DEFAULT_CARD_COLOR];

  return (
    <div
      className={`aspect-[340/214] overflow-hidden rounded-[18px] shadow-2xl ${style.ringClass ?? ""} ${className ?? ""}`}
      style={{ background: style.cardGradient }}
    >
      <div className="relative h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-7">
          <span className={`text-xl font-bold tracking-tight ${style.textClass}`}>
            HERNEROS
          </span>
          <span className={`text-sm tracking-[0.2em] ${style.subTextClass}`}>
            TAP &amp; SCAN
          </span>
        </div>
      </div>
    </div>
  );
}
