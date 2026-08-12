export default function CardFace({ className }: { className?: string }) {
  return (
    <div
      className={`aspect-[340/214] overflow-hidden rounded-[18px] bg-neutral-950 shadow-2xl ${className ?? ""}`}
    >
      <div className="relative h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-7">
          <span className="text-xl font-bold tracking-tight text-white">
            HERNEROS
          </span>
          <span className="text-sm tracking-[0.2em] text-white/85">
            TAP &amp; SCAN
          </span>
        </div>
      </div>
    </div>
  );
}
