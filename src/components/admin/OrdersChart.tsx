"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import type { RangeKey } from "@/lib/order-ranges";

type Point = { date: string; orders: number; revenuePHP: number };
type Metric = "revenue" | "orders";
type Granularity = "hour" | "day" | "week" | "month";

const BAR_HUE = "#008300";
const BAR_HUE_HOVER = "#00a300";
const LINE_HUE = "#005c00";
const GRID_COLOR = "#e5e5e3";
const CHART_HEIGHT = 220;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 28;
const PADDING_LEFT = 4;
const PADDING_RIGHT = 4;

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "3months", label: "Last 3 months" },
  { key: "year", label: "This year" },
  { key: "3years", label: "Last 3 years" },
];

function niceMax(value: number): number {
  if (value <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function compactPHP(value: number): string {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(1)}K`;
  return `₱${Math.round(value)}`;
}

function formatBucketLabel(key: string, granularity: Granularity): string {
  if (granularity === "hour") {
    const hour = Number(key.slice(11, 13));
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}${period}`;
  }
  if (granularity === "month") {
    const d = new Date(`${key}-01T00:00:00`);
    return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  }
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function OrdersChart() {
  const [range, setRange] = useState<RangeKey>("week");
  const [series, setSeries] = useState<Point[] | null>(null);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [metric, setMetric] = useState<Metric>("revenue");
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setSeries(null);
    fetch(`/api/admin/orders/timeseries?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setSeries(data.series);
        setGranularity(data.granularity);
      });
    return () => {
      active = false;
    };
  }, [range]);

  const values = useMemo(
    () => (series ?? []).map((p) => (metric === "revenue" ? p.revenuePHP : p.orders)),
    [series, metric]
  );
  const maxValue = useMemo(() => niceMax(Math.max(...values, 0)), [values]);
  const total = values.reduce((s, v) => s + v, 0);
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  const rangeLabel = RANGE_OPTIONS.find((r) => r.key === range)?.label ?? "";

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setRange(opt.key)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              range === opt.key
                ? "border-black bg-black text-white"
                : "border-black/15 text-black/60 hover:border-black/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center gap-2 text-center">
        <div className="flex rounded-full border border-black/15 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMetric("revenue")}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              metric === "revenue" ? "bg-black text-white" : "text-black/60"
            }`}
          >
            Revenue
          </button>
          <button
            type="button"
            onClick={() => setMetric("orders")}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              metric === "orders" ? "bg-black text-white" : "text-black/60"
            }`}
          >
            Orders
          </button>
        </div>
        <p className="text-xs text-black/40">
          {metric === "revenue" ? "Earnings" : "Orders"} · {rangeLabel.toLowerCase()}
        </p>
        <p className="text-4xl font-bold text-black">
          {series === null
            ? "…"
            : metric === "revenue"
              ? formatCurrency(total, "PHP")
              : total}
        </p>
      </div>

      {series === null ? (
        <p className="mt-8 mb-4 text-center text-sm text-black/40">Loading…</p>
      ) : total === 0 ? (
        <p className="mt-8 mb-4 text-center text-sm text-black/40">
          No orders in this range yet.
        </p>
      ) : (
        <ChartBody
          series={series}
          metric={metric}
          granularity={granularity}
          maxValue={maxValue}
          gridSteps={gridSteps}
          hovered={hovered}
          setHovered={setHovered}
        />
      )}
    </div>
  );
}

function ChartBody({
  series,
  metric,
  granularity,
  maxValue,
  gridSteps,
  hovered,
  setHovered,
}: {
  series: Point[];
  metric: Metric;
  granularity: Granularity;
  maxValue: number;
  gridSteps: number[];
  hovered: number | null;
  setHovered: (i: number | null) => void;
}) {
  const n = series.length;
  const chartWidth = 600;
  const innerWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const bandWidth = innerWidth / n;
  const barWidth = Math.min(8, Math.max(3, bandWidth * 0.3));
  const labelEvery = Math.max(1, Math.ceil(n / 7));

  const valueOf = (point: Point) => (metric === "revenue" ? point.revenuePHP : point.orders);
  const barTop = (point: Point) => {
    const barHeight = maxValue > 0 ? (valueOf(point) / maxValue) * innerHeight : 0;
    return PADDING_TOP + innerHeight - barHeight;
  };
  const barCenterX = (i: number) => PADDING_LEFT + i * bandWidth + bandWidth / 2;

  const linePath = series
    .map((point, i) => `${i === 0 ? "M" : "L"} ${barCenterX(i)} ${barTop(point)}`)
    .join(" ");

  return (
    <div className="relative mt-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`${metric === "revenue" ? "Earnings" : "Orders"} over time`}
      >
        {gridSteps.map((step) => {
          const y = PADDING_TOP + innerHeight * (1 - step);
          const value = maxValue * step;
          return (
            <g key={step}>
              <line
                x1={PADDING_LEFT}
                x2={chartWidth - PADDING_RIGHT}
                y1={y}
                y2={y}
                stroke={GRID_COLOR}
                strokeWidth={1}
              />
              <text x={PADDING_LEFT} y={y - 4} fontSize={9} fill="#8a8a86" className="tabular-nums">
                {metric === "revenue" ? compactPHP(value) : Math.round(value)}
              </text>
            </g>
          );
        })}

        {series.map((point, i) => {
          const value = valueOf(point);
          const barHeight = maxValue > 0 ? (value / maxValue) * innerHeight : 0;
          const x = PADDING_LEFT + i * bandWidth + (bandWidth - barWidth) / 2;
          const y = barTop(point);
          const showLabel = i % labelEvery === 0;
          const isHovered = hovered === i;

          return (
            <g key={point.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={Math.min(4, barWidth / 2)}
                fill={isHovered ? BAR_HUE_HOVER : BAR_HUE}
                fillOpacity={0.55}
              />
              {showLabel && (
                <text
                  x={barCenterX(i)}
                  y={CHART_HEIGHT - 8}
                  fontSize={9}
                  fill="#8a8a86"
                  textAnchor="middle"
                >
                  {formatBucketLabel(point.date, granularity)}
                </text>
              )}
            </g>
          );
        })}

        <path d={linePath} fill="none" stroke={LINE_HUE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {series.map((point, i) => (
          <g key={`hit-${point.date}`}>
            {hovered === i && (
              <circle cx={barCenterX(i)} cy={barTop(point)} r={4} fill={LINE_HUE} stroke="#fff" strokeWidth={2} />
            )}
            <rect
              x={PADDING_LEFT + i * bandWidth}
              y={PADDING_TOP}
              width={bandWidth}
              height={innerHeight}
              fill="transparent"
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
              tabIndex={0}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
            />
          </g>
        ))}
      </svg>

      {hovered !== null && series[hovered] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-black px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{
            left: `${(barCenterX(hovered) / chartWidth) * 100}%`,
            top: `calc(${(barTop(series[hovered]) / CHART_HEIGHT) * 100}% - 8px)`,
          }}
        >
          <p className="font-semibold">
            {metric === "revenue"
              ? formatCurrency(series[hovered].revenuePHP, "PHP")
              : `${series[hovered].orders} order${series[hovered].orders === 1 ? "" : "s"}`}
          </p>
          <p className="text-white/60">{formatBucketLabel(series[hovered].date, granularity)}</p>
        </div>
      )}
    </div>
  );
}
