"use client";

import { useMemo } from "react";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

import { trendSeries } from "@/lib/visibility-sim";

// 30-day visibility trend as a smooth SVG area chart. Deterministic series.
export function TrendChart({ brand = "Your brand", currentScore = 0, days = 30 }) {
  const series = useMemo(
    () => trendSeries(brand, currentScore, days),
    [brand, currentScore, days],
  );

  const width = 640;
  const height = 160;
  const padY = 16;

  const { linePath, areaPath, last, delta } = useMemo(() => {
    const max = 100;
    const stepX = width / (series.length - 1);
    const toXY = (value, index) => {
      const x = index * stepX;
      const y = padY + (1 - value / max) * (height - padY * 2);
      return [x, y];
    };
    const points = series.map(toXY);
    const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const area = `${line} L${width} ${height} L0 ${height} Z`;
    return {
      linePath: line,
      areaPath: area,
      last: series[series.length - 1],
      delta: series[series.length - 1] - series[0],
    };
  }, [series]);

  const up = delta >= 0;

  return (
    <section className="dashboard-card trend-card">
      <div className="card-header">
        <div>
          <h2>Visibility trend</h2>
          <p className="card-supporting-copy">
            {brand}&apos;s GEO score over the last {days} days.
          </p>
        </div>
        <div className={`trend-delta${up ? " trend-delta-up" : " trend-delta-down"}`}>
          {up ? <TrendingUpIcon /> : <TrendingDownIcon />}
          {up ? "+" : ""}
          {delta} pts
        </div>
      </div>

      <div className="trend-chart-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="trend-svg">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={width}
              y1={padY + (1 - g / 100) * (height - padY * 2)}
              y2={padY + (1 - g / 100) * (height - padY * 2)}
              className="trend-grid"
            />
          ))}
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={linePath} fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        <div className="trend-current">
          <strong>{last}</strong>
          <span>today</span>
        </div>
      </div>

      <div className="trend-axis">
        <span>{days} days ago</span>
        <span>today</span>
      </div>
    </section>
  );
}
