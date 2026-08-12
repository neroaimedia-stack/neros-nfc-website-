const SIZE = 21;
const FINDER_CORNERS: [number, number][] = [
  [0, 0],
  [SIZE - 7, 0],
  [0, SIZE - 7],
];

function isFinderModule(x: number, y: number, cx: number, cy: number) {
  const lx = x - cx;
  const ly = y - cy;
  const onRing = lx === 0 || lx === 6 || ly === 0 || ly === 6;
  const onCore = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return onRing || onCore;
}

function moduleOn(x: number, y: number) {
  const finder = FINDER_CORNERS.find(
    ([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
  );
  if (finder) return isFinderModule(x, y, finder[0], finder[1]);
  return (x * 7 + y * 13 + x * y) % 5 < 2;
}

export default function QrMock({ className }: { className?: string }) {
  const cells = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (moduleOn(x, y)) {
        cells.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0a0a0a" />
        );
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code"
    >
      <rect x={0} y={0} width={SIZE} height={SIZE} fill="#ffffff" />
      {cells}
    </svg>
  );
}
