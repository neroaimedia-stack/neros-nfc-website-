const SIZE = 25;
const FINDER_CORNERS: [number, number][] = [
  [0, 0],
  [SIZE - 7, 0],
  [0, SIZE - 7],
];
const ALIGNMENT_ORIGIN: [number, number] = [16, 16];

function inBox(x: number, y: number, bx: number, by: number, size: number) {
  return x >= bx && x < bx + size && y >= by && y < by + size;
}

function isFinderModule(lx: number, ly: number) {
  const onRing = lx === 0 || lx === 6 || ly === 0 || ly === 6;
  const onCore = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return onRing || onCore;
}

function isAlignmentModule(lx: number, ly: number) {
  const onRing = lx === 0 || lx === 4 || ly === 0 || ly === 4;
  const isCenter = lx === 2 && ly === 2;
  return onRing || isCenter;
}

function moduleOn(x: number, y: number) {
  for (const [cx, cy] of FINDER_CORNERS) {
    if (inBox(x, y, cx, cy, 7)) return isFinderModule(x - cx, y - cy);
  }

  const [acx, acy] = ALIGNMENT_ORIGIN;
  if (inBox(x, y, acx, acy, 5)) return isAlignmentModule(x - acx, y - acy);

  if (y === 6 && x >= 8 && x <= SIZE - 9) return x % 2 === 0;
  if (x === 6 && y >= 8 && y <= SIZE - 9) return y % 2 === 0;

  return (x * 3 + y * 5 + x * y * 2) % 7 < 4;
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
