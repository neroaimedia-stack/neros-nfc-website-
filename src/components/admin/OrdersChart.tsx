"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";

type Point = { date: string; orders: number; revenuePHP: number };
type Metric = "revenue" | "orders";

const BAR_HUE = "#2a78d6";
const BAR_HUE_HOVER = "#3987e5";
const GRID_COLOR = "#e5e5e3";
const CHART_HEIGHT = 200;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;
const PADDING_LEFT = 4;
const PADDING_RIGHT = 4;

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

function formatDateLabel(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function OrdersChart() {
  const [series, setSeries] = useState<Point[] | null>(null);
  const [metric, setMetric] = useState<Metric>("revenue");
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/orders/timeseries")
      .then((res) => res.json())
      .then((data) => {
        if (active) setSeries(data.series);
      });
    return () => {
      active = false;
    };
  }, []);

  const values = useMemo(
    () => (series ?? []).map((p) => (metric === "revenue" ? p.revenuePHP : p.orders)),
    [series, metric]
  );
  const maxValue = useMemo(() => niceMax(Math.max(...values, 0)), [values]);
  const total = values.reduce((s, v) => s + v, 0);
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  if (series === null) {
    return (
      <div className="rounded-2xl border border-black/10 p-5">
        <p className="text-sm text-black/40">Loading chart…</p>
      </div>
    );
  }

  const n = series.length;
  const chartWidth = 600;
  const innerWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const bandWidth = innerWidth / n;
  const barWidth = Math.min(24, bandWidth - 4);

  const barTopPercent = (point: Point) => {
    const value = metric === "revenue" ? point.revenuePHP : point.orders;
    const barHeight = maxValue > 0 ? (value / maxValue) * innerHeight : 0;
    const y = PADDING_TOP + innerHeight - barHeight;
    return (y / CHART_HEIGHT) * 100;
  };

  return (
    <div className="rounded-2xl border border-black/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-black">
            {metric === "revenue" ? "Earnings" : "Orders"} · last 14 days
          </p>
          <p className="text-xs text-black/40">
            {metric === "revenue" ? formatCurrency(total, "PHP") : `${total} orders`} total
          </p>
        </div>
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
      </div>

      {total === 0 ? (
        <p className="mt-8 mb-4 text-center text-sm text-black/40">
          No orders in the last 14 days yet.
        </p>
      ) : (
        <div className="relative mt-4">
          <svg
            viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
            className="w-full"
            role="img"
            aria-label={`${metric === "revenue" ? "Earnings" : "Orders"} for the last 14 days`}
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
                  <text
                    x={PADDING_LEFT}
                    y={y - 4}
                    fontSize={9}
                    fill="#8a8a86"
                    className="tabular-nums"
                  >
                    {metric === "revenue" ? compactPHP(value) : Math.round(value)}
                  </text>
                </g>
              );
            })}

            {series.map((point, i) => {
              const value = metric === "revenue" ? point.revenuePHP : point.orders;
              const barHeight = maxValue > 0 ? (value / maxValue) * innerHeight : 0;
              const x = PADDING_LEFT + i * bandWidth + (bandWidth - barWidth) / 2;
              const y = PADDING_TOP + innerHeight - barHeight;
              const showLabel = n <= 10 || i % 2 === 0;
              const isHovered = hovered === i;

              return (
                <g key={point.date}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, value > 0 ? 2 : 0)}
                    rx={4}
                    fill={isHovered ? BAR_HUE_HOVER : BAR_HUE}
                  />
                  <rect
                    x={x - 2}
                    y={PADDING_TOP}
                    width={barWidth + 4}
                    height={innerHeight}
                    fill="transparent"
                    onPointerEnter={() => setHovered(i)}
                    onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                    tabIndex={0}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered((h) => (h === i ? null : h))}
                  />
                  {showLabel && (
                    <text
                      x={x + barWidth / 2}
                      y={CHART_HEIGHT - 8}
                      fontSize={9}
                      fill="#8a8a86"
                      textAnchor="middle"
                    >
                      {formatDateLabel(point.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {hovered !== null && series[hovered] && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-black px-2.5 py-1.5 text-xs text-white shadow-lg"
              style={{
                left: `${((PADDING_LEFT + hovered * bandWidth + bandWidth / 2) / chartWidth) * 100}%`,
                top: `calc(${barTopPercent(series[hovered])}% - 8px)`,
              }}
            >
              <p className="font-semibold">
                {metric === "revenue"
                  ? formatCurrency(series[hovered].revenuePHP, "PHP")
                  : `${series[hovered].orders} order${series[hovered].orders === 1 ? "" : "s"}`}
              </p>
              <p className="text-white/60">{formatDateLabel(series[hovered].date)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
