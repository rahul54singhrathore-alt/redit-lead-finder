"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCwIcon } from "lucide-react";

/* ── constants ──────────────────────────────────────────────────────────── */

const ENGINE_KEYS = ["chatgpt", "gemini", "claude", "perplexity"];
const ENGINE_META = {
  chatgpt:    { label: "CHATGPT",    color: "#10a37f" },
  gemini:     { label: "GEMINI",     color: "#4285f4" },
  claude:     { label: "CLAUDE",     color: "#7c3aed" },
  perplexity: { label: "PERPLEXITY", color: "#f59e0b" },
};
const SOV_COLORS = ["#18181b", "#d1d5db", "#a1a1aa", "#e4e4e7"];

/* ── helpers ────────────────────────────────────────────────────────────── */

async function fetchOverview(brand, category) {
  try {
    const res = await fetch("/api/visibility-overview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, category }),
    });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function fetchCitations(brand, category) {
  try {
    const res = await fetch("/api/citation-tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, category }),
    });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

/* ── main component ─────────────────────────────────────────────────────── */

export function DashboardOverview({ brand, category, competitors = [], accessToken }) {
  const [status,        setStatus]        = useState("idle"); // idle | scanning | done | error
  const [brandData,     setBrandData]     = useState(null);
  const [compData,      setCompData]      = useState([]);
  const [citations,     setCitations]     = useState(null);
  const [activeTab,     setActiveTab]     = useState("overview");
  const [lastScanned,   setLastScanned]   = useState(null);

  const compList = Array.isArray(competitors) ? competitors.slice(0, 3) : [];

  const runScan = useCallback(async () => {
    if (!brand) return;
    setStatus("scanning");

    const tasks = [
      fetchOverview(brand, category),
      ...compList.map((c) => fetchOverview(c, category)),
      fetchCitations(brand, category),
    ];

    try {
      const results = await Promise.all(tasks);
      const brandResult = results[0];
      const compResults = results.slice(1, 1 + compList.length);
      const citeResult  = results[1 + compList.length];

      setBrandData(brandResult);
      setCompData(compList.map((name, i) => ({ name, data: compResults[i] })));
      setCitations(citeResult);
      setLastScanned(new Date());
      setStatus("done");

      // Save score in background
      if (accessToken && brandResult?.overall != null) {
        fetch("/api/save-score", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            brand,
            score: brandResult.overall,
            engines: brandResult.engines || [],
          }),
        }).catch(() => {});
      }
    } catch {
      setStatus("error");
    }
  }, [brand, category, accessToken]);

  useEffect(() => { runScan(); }, [runScan]);

  /* ── derived data ── */
  const allRows = [
    { name: brand, you: true,  data: brandData },
    ...compData,
  ];

  // Share of voice: proportional to overall scores
  const scoredRows = allRows.filter((r) => r.data?.overall != null);
  const totalScore = scoredRows.reduce((s, r) => s + r.data.overall, 0) || 1;
  const sovRows = scoredRows.map((r, i) => ({
    label: r.you ? "You" : r.name,
    score: r.data.overall,
    pct:   Math.round((r.data.overall / totalScore) * 100),
    color: SOV_COLORS[i] || "#e4e4e7",
  }));

  const domain = brand
    ? `${brand.toLowerCase().replace(/\s+/g, "")}.com`
    : "yourbrand.com";

  const scanning = status === "scanning";

  /* ── render ── */
  return (
    <div className="dov-root">

      {/* ── header ── */}
      <div className="dov-header">
        <div className="dov-header-left">
          <span className="dov-domain">{domain}</span>
          {["Overview", "Engines", "Citations"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`dov-tab${activeTab === tab.toLowerCase() ? " dov-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="dov-header-right">
          <span className={`dov-scan-badge${scanning ? " scanning" : " done"}`}>
            <span className="dov-scan-dot" />
            {scanning ? "Scanning…" : "Scan complete"}
          </span>
          <span className="dov-date-range">Last 7 days</span>
          <button
            type="button"
            className="dov-refresh-btn"
            onClick={runScan}
            disabled={scanning}
            title="Re-scan"
          >
            <RefreshCwIcon className={scanning ? "dov-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── body ── */}
      <div className="dov-body">

        {/* ── engine ranking table ── */}
        <div className="dov-table-wrap">
          <div className="dov-section-label">BY ENGINE · BRAND RANKING</div>
          <table className="dov-table">
            <thead>
              <tr>
                <th className="dov-th-brand">BRAND</th>
                {ENGINE_KEYS.map((k) => (
                  <th key={k} style={{ color: ENGINE_META[k].color }}>
                    {ENGINE_META[k].label}
                  </th>
                ))}
                <th>GEO</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((row) => {
                const engines = row.data?.engines || [];
                const geo     = row.data?.overall ?? null;
                return (
                  <tr key={row.name} className={row.you ? "dov-row-you" : "dov-row"}>
                    <td>
                      <div className="dov-brand-cell">
                        {row.you && <span className="dov-you-dot" />}
                        <span className="dov-brand-name">
                          {row.you ? "Your Brand" : row.name}
                        </span>
                        {row.you && <span className="dov-you-tag">YOU</span>}
                      </div>
                    </td>
                    {ENGINE_KEYS.map((k) => {
                      const eng  = engines.find((e) => e.key === k);
                      const rank = eng?.rank ?? null;
                      return (
                        <td key={k} className="dov-rank-cell">
                          {scanning
                            ? <span className="dov-skel dov-skel-sm" />
                            : rank
                              ? <span className="dov-rank-hit" style={{ color: ENGINE_META[k].color }}>#{rank}</span>
                              : <span className="dov-rank-miss">—</span>}
                        </td>
                      );
                    })}
                    <td className="dov-geo-cell">
                      {scanning
                        ? <span className="dov-skel dov-skel-sm" />
                        : <span className={`dov-geo-badge${row.you ? " dov-geo-you" : ""}`}>
                            {geo ?? "—"}
                          </span>}
                    </td>
                  </tr>
                );
              })}

              {compList.length === 0 && status === "done" && (
                <tr>
                  <td colSpan={6} className="dov-empty-row">
                    <Link href="/dashboard/settings" className="dov-add-comp-link">
                      + Add competitors in Settings to compare rankings
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── right column ── */}
        <div className="dov-right-col">

          {/* Share of Voice */}
          <div className="dov-panel">
            <div className="dov-panel-label">SHARE OF VOICE</div>
            <div className="dov-sov-body">
              {scanning
                ? <SovSkeleton />
                : <SovChart rows={sovRows} />}
            </div>
          </div>

          {/* Recent Citations */}
          <div className="dov-panel dov-cite-panel">
            <div className="dov-panel-label">RECENT CITATIONS</div>
            <div className="dov-cite-list">
              {scanning
                ? [1, 2, 3, 4].map((i) => (
                    <div key={i} className="dov-cite-row">
                      <span className="dov-skel dov-skel-tag" />
                      <span className="dov-skel dov-skel-text" />
                    </div>
                  ))
                : citations?.cited?.length > 0
                  ? citations.cited.slice(0, 6).map((c, i) => (
                      <div key={i} className="dov-cite-row">
                        <span className="dov-cite-src">{c.name}</span>
                        <span className="dov-cite-note">{c.note}</span>
                      </div>
                    ))
                  : <p className="dov-empty-msg">No citation data yet</p>}
            </div>
          </div>

        </div>
      </div>

      {/* ── last scanned ── */}
      {lastScanned && !scanning && (
        <div className="dov-footer-bar">
          <span>Last scanned: {lastScanned.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <Link href="/dashboard/visibility" className="dov-footer-link">
            Full visibility report →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── SOV donut chart ─────────────────────────────────────────────────────── */

function SovChart({ rows }) {
  const R    = 30;
  const CIRC = 2 * Math.PI * R;
  let   off  = CIRC / 4; // start at 12 o'clock

  const slices = rows.map((r) => {
    const dash  = (r.pct / 100) * CIRC;
    const slice = { ...r, dash, dashOffset: -off + CIRC };
    off += dash;
    return slice;
  });

  const myPct = rows[0]?.pct ?? 0;

  return (
    <div className="dov-sov-inner">
      <div className="dov-donut-wrap">
        <svg viewBox="0 0 80 80" className="dov-donut">
          <circle cx="40" cy="40" r={R} fill="none" stroke="#f4f4f5" strokeWidth="12" />
          {slices.map((s, i) => (
            <circle
              key={i}
              cx="40" cy="40" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${s.dash} ${CIRC}`}
              strokeDashoffset={s.dashOffset}
              style={{ transition: "stroke-dasharray 0.9s ease, stroke-dashoffset 0.9s ease" }}
            />
          ))}
          <text x="40" y="37" textAnchor="middle" fontSize="12" fontWeight="800" fill="#18181b">
            {myPct}%
          </text>
          <text x="40" y="47" textAnchor="middle" fontSize="7" fill="#a1a1aa">you</text>
        </svg>
      </div>
      <div className="dov-sov-legend">
        {rows.map((r, i) => (
          <div key={i} className="dov-sov-leg-row">
            <span className="dov-sov-leg-dot" style={{ background: r.color }} />
            <span className="dov-sov-leg-name">{r.label}</span>
            <span className="dov-sov-leg-pct">{r.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SovSkeleton() {
  return (
    <div className="dov-sov-inner">
      <div className="dov-skel dov-skel-donut" />
      <div className="dov-sov-legend">
        {[1, 2, 3].map((i) => (
          <div key={i} className="dov-sov-leg-row">
            <span className="dov-skel" style={{ width: 8, height: 8, borderRadius: "50%" }} />
            <span className="dov-skel dov-skel-text" style={{ flex: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
