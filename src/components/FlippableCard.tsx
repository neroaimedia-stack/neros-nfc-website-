import { CARD_COLORS, DEFAULT_CARD_COLOR } from "@/lib/card-colors";

export default function FlippableCard({
  color = DEFAULT_CARD_COLOR,
  className,
  shadow = true,
}: {
  color?: string;
  className?: string;
  shadow?: boolean;
}) {
  const style = CARD_COLORS[color] ?? CARD_COLORS[DEFAULT_CARD_COLOR];

  return (
    <div className={`block ${className ?? ""}`}>
      <div className={shadow ? "card-reflect" : ""}>
        <div
          className={`relative aspect-[340/214] overflow-hidden rounded-[18px] ${shadow ? "card-shadow" : ""} ${style.borderClass ?? ""}`}
          style={{ background: style.cardGradient }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
          <div className="card-edge-shade" />
          <div className="card-corner-gloss" />
          <div className="card-sheen" />
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
    </div>
  );
}
