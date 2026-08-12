import QrMock from "@/components/QrMock";

export default function CardMockup() {
  return (
    <div
      className="card-reflect w-full max-w-sm drop-shadow-2xl"
      role="img"
      aria-label="NEROS NFC card, front and back"
    >
      <div className="perspective-1600 w-full">
        <div className="card-flip preserve-3d relative aspect-[340/214]">
          <div className="backface-hidden absolute inset-0 overflow-hidden rounded-[18px] bg-neutral-950">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
            <div className="card-sheen" />
            <div className="relative flex h-full flex-col justify-between p-7">
              <span className="text-xl font-bold tracking-tight text-white">
                NEROS
              </span>
              <span className="text-sm tracking-[0.2em] text-white/85">
                TAP &amp; SCAN
              </span>
            </div>
          </div>

          <div className="backface-hidden absolute inset-0 overflow-hidden rounded-[18px] bg-neutral-950 [transform:rotateY(180deg)]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="card-sheen" />
            <div className="relative flex h-full items-center justify-center p-7">
              <div className="aspect-square w-[36%] rounded-sm bg-white p-1.5 shadow-lg">
                <QrMock className="h-full w-full" />
              </div>
            </div>
            <span className="absolute bottom-4 right-5 text-xs font-semibold tracking-wide text-white/80">
              HER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
