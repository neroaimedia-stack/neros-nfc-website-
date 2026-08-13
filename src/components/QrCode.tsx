const QR_MATRIX = [
  "#######..#....#######",
  "#.....#..####.#.....#",
  "#.###.#.#.#...#.###.#",
  "#.###.#.###...#.###.#",
  "#.###.#.#..##.#.###.#",
  "#.....#.##..#.#.....#",
  "#######.#.#.#.#######",
  "........##.##........",
  "#.#####...#.#.#####..",
  ".#......##..#...###.#",
  "#.##.##..###.##..###.",
  "#...#...###.....###..",
  "..#####...##..#.##..#",
  "........#.#.#####.#.#",
  "#######..#..#.#....#.",
  "#.....#.#.####.####..",
  "#.###.#.#.##..##...##",
  "#.###.#.###.....##...",
  "#.###.#.#######......",
  "#.....#....#.#...##..",
  "#######.#..#..#....#.",
];

const SIZE = QR_MATRIX.length;
const QUIET = 2;
const VIEWBOX = SIZE + QUIET * 2;

export default function QrCode({
  color = "#ffffff",
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="HERNEROS profile QR code"
    >
      {QR_MATRIX.flatMap((row, r) =>
        [...row].map((ch, c) =>
          ch === "#" ? (
            <rect
              key={`${r}-${c}`}
              x={c + QUIET}
              y={r + QUIET}
              width={1}
              height={1}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
}
