"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

const ENGINE_LINES = [
  { key: "chatgpt_score",    label: "ChatGPT",    color: "#10a37f" },
  { key: "gemini_score",     label: "Gemini",     color: "#4285f4" },
  { key: "claude_score",     label: "Claude",     color: "#d97706" },
  { key: "perplexity_score", label: "Perplexity", color: "#7c3aed" },
  { key: "grok_score",       label: "Grok",       color: "#0891b2" },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildPath(points, W, H, PAD, minVal, maxVal) {
  if (points.length < 2) return null;
  const range = maxVal - minVal || 1;
  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const ys = points.map((v) => PAD + (1 - (v - minVal) / range) * (H - PAD * 2));
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < points.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  return { d, xs, ys };
}

export function TrendChart({ accessToken, brand }) {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tooltip, setTooltip]       = useState(null);
  const [showEngines, setShowEngines] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!accessToken || !brand) { setLoading(false); return; }
    fetch(`/api/score-history?brand=${encodeURIComponent(brand)}&days=30`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => setHistory(data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken, brand]);

  if (loading) {
    return (
      <section className="dashboard-card trend-card">
        <div className="trend-skeleton" />
      </section>
    );
  }

  if (history.length < 2) {
    return (
      <section className="dashboard-card trend-card">
        <div className="trend-empty">
          <p className="trend-empty-title">Score history starts building today</p>
          <p className="trend-empty-sub">Run a scan each day and your 30-day trend will appear here.</p>
        </div>
      </section>
    );
  }

  const W = 600, H = 160, PAD = 24;
  const scores = history.map((h) => h.score);
  const minVal = Math.max(0,   Math.min(...scores) - 8);
  const maxVal = Math.min(100, Math.max(...scores) + 8);

  const overall = buildPath(scores, W, H, PAD, minVal, maxVal);

  const latest  = scores[scores.length - 1];
  const weekAgo = scores.length >= 7 ? scores[scores.length - 7] : scores[0];
  const delta   = latest - weekAgo;

  const tickIdxs = [0, Math.floor((history.length - 1) / 2), history.length - 1];

  const handleMouseMove = (e) => {
    const svg = svgRef.current;
    if (!svg || !overall) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const { xs, ys } = overall;
    let closest = 0, minDist = Infinity;
    xs.forEach((x, i) => { const dist = Math.abs(x - relX); if (dist < minDist) { minDist = dist; closest = i; } });
    setTooltip({ x: (xs[closest] / W) * 100, y: (ys[closest] / H) * 100, entry: history[closest], score: scores[closest] });
  };

  const fillPath = overall
    ? `${overall.d} L ${PAD + (W - PAD * 2)} ${H - PAD} L ${PAD} ${H - PAD} Z`
    : "";

  return (
    <section className="dashboard-card trend-card">
      <div className="card-header">
        <div>
          <h2>Score trend</h2>
          <p className="card-supporting-copy">{brand} · last 30 days · {history.length} data points</p>
        </div>
        <div className="trend-header-right">
          <span className={`trend-delta ${delta >= 0 ? "trend-delta-up" : "trend-delta-down"}`}>
            {delta >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            {delta >= 0 ? "+" : ""}{delta} this week
          </span>
          <button
            className={`trend-toggle ${showEngines ? "trend-toggle-active" : ""}`}
            onClick={() => setShowEngines((v) => !v)}
          >
            Per engine
          </button>
        </div>
      </div>

      <div className="trend-chart-wrap" onMouseLeave={() => setTooltip(null)}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="trend-svg" onMouseMove={handleMouseMove}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#ea580c" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0"    />
            </linearGradient>
          </defs>

          {[25, 50, 75].map((v) => {
            const y = PAD + (1 - (v - minVal) / (maxVal - minVal || 1)) * (H - PAD * 2);
            if (y < PAD || y > H - PAD) return null;
            return (
              <g key={v}>
                <line x1={PAD} x2={W - PAD} y1={y} y2={y} className="trend-grid" />
                <text x={PAD - 6} y={y + 4} className="trend-axis-label" textAnchor="end">{v}</text>
              </g>
            );
          })}

          {showEngines && ENGINE_LINES.map(({ key, color }) => {
            const vals = history.map((h) => h[key] ?? 0);
            const result = buildPath(vals, W, H, PAD, minVal, maxVal);
            if (!result) return null;
            return <path key={key} d={result.d} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.55" strokeDasharray="4 2" />;
          })}

          {overall && <path d={fillPath} fill="url(#trendGrad)" />}
          {overall && <path d={overall.d} fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {overall && overall.xs.map((x, i) => (
            <circle
              key={i}
              cx={x} cy={overall.ys[i]}
              r={tooltip?.entry === history[i] ? 5 : 3}
              fill={tooltip?.entry === history[i] ? "#ea580c" : "#fff"}
              stroke="#ea580c" strokeWidth="2"
            />
          ))}

          {overall && tickIdxs.map((idx) => {
            if (idx >= history.length) return null;
            return (
              <text key={idx} x={overall.xs[idx]} y={H - 4} className="trend-axis-label"
                textAnchor={idx === 0 ? "start" : idx === history.length - 1 ? "end" : "middle"}>
                {formatDate(history[idx].recorded_date)}
              </text>
            );
          })}
        </svg>

        {tooltip && (
          <div className="trend-tooltip" style={{ left: `${Math.min(78, Math.max(12, tooltip.x))}%`, top: `${Math.max(5, tooltip.y - 18)}%` }}>
            <p className="trend-tooltip-date">{formatDate(tooltip.entry.recorded_date)}</p>
            <p className="trend-tooltip-score">{tooltip.score}<span>/100</span></p>
            {showEngines && (
              <div className="trend-tooltip-engines">
                {ENGINE_LINES.map(({ key, label, color }) =>
                  tooltip.entry[key] != null
                    ? <span key={key} style={{ color }}>{label}: {tooltip.entry[key]}</span>
                    : null
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showEngines && (
        <div className="trend-legend">
          {ENGINE_LINES.map(({ label, color }) => (
            <span key={label} className="trend-legend-item">
              <span className="trend-legend-dot" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
