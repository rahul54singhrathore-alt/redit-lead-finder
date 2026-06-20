"use client";

import { useEffect, useRef, useState } from "react";

/* ── demo data ──────────────────────────────────────────────────────────── */

const BRANDS = [
  {
    name: "Your Brand",
    you: true,
    scores: { chatgpt: "#3", gemini: null, claude: "#2", perplexity: "#1" },
    geo: 74,
    sov: 18,
  },
  {
    name: "Competitor A",
    scores: { chatgpt: "#1", gemini: "#1", claude: "#1", perplexity: "#2" },
    geo: 91,
    sov: 42,
  },
  {
    name: "Competitor B",
    scores: { chatgpt: "#2", gemini: "#3", claude: null, perplexity: "#3" },
    geo: 62,
    sov: 35,
  },
];

const ENGINES = [
  { key: "chatgpt",    label: "CHATGPT",    color: "#10a37f" },
  { key: "gemini",     label: "GEMINI",     color: "#4285f4" },
  { key: "claude",     label: "CLAUDE",     color: "#7c3aed" },
  { key: "perplexity", label: "PERPLEXITY", color: "#f59e0b" },
];

const CITATIONS = [
  { source: "Reddit",  note: "r/marketing · best AI visibility tools" },
  { source: "G2",      note: "Listed in AI SEO Tools category" },
  { source: "Quora",   note: "Answer: How do brands track AI mentions?" },
  { source: "Blog",    note: "SEJ: 'Top GEO tools for 2026' — mentioned" },
];

const SOV = [
  { label: "You",     pct: 18, color: "#18181b" },
  { label: "Comp. A", pct: 42, color: "#d1d5db" },
  { label: "Comp. B", pct: 35, color: "#a1a1aa" },
];

/* ── timing ─────────────────────────────────────────────────────────────── */

const ROW_STAGGER  = 420;
const CITE_STAGGER = 280;
const HOLD_DONE    = 3000;
const RESET_GAP    = 500;

/* ── component ──────────────────────────────────────────────────────────── */

export function HeroLiveScan() {
  const [phase,        setPhase]        = useState("scanning");
  const [rowsVisible,  setRowsVisible]  = useState(0);
  const [citesVisible, setCitesVisible] = useState(0);
  const [geoScore,     setGeoScore]     = useState(0);
  const [sovPct,       setSovPct]       = useState(0);

  const timers = useRef([]);
  const rafRef = useRef(null);

  function clearAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function after(fn, delay) {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
  }

  function countUp(setter, target, duration) {
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      setter(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    function cycle() {
      clearAll();
      setPhase("scanning");
      setRowsVisible(0);
      setCitesVisible(0);
      setGeoScore(0);
      setSovPct(0);

      let t = 700;

      // rows slide in
      BRANDS.forEach((_, i) => after(() => setRowsVisible(i + 1), t + i * ROW_STAGGER));
      t += BRANDS.length * ROW_STAGGER + 300;

      // switch to results, animate numbers
      after(() => {
        setPhase("results");
        countUp(setGeoScore, 74,  900);
        countUp(setSovPct,   18, 1000);
      }, t);
      t += 400;

      // citations appear
      CITATIONS.forEach((_, i) => after(() => setCitesVisible(i + 1), t + i * CITE_STAGGER));
      t += CITATIONS.length * CITE_STAGGER + 300;

      // complete badge
      after(() => setPhase("complete"), t);
      t += HOLD_DONE;

      // loop
      after(() => after(cycle, RESET_GAP), t);
    }

    cycle();
    return clearAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scanning = phase === "scanning";
  const results  = phase === "results" || phase === "complete";
  const complete = phase === "complete";

  // SOV donut
  const R    = 30;
  const CIRC = 2 * Math.PI * R;
  let   dovOff = CIRC / 4;
  const sovSlices = SOV.map((s) => {
    const pct   = results ? s.pct : 0;
    const dash  = (pct / 100) * CIRC;
    const slice = { ...s, dash, dashOffset: -dovOff + CIRC, pct };
    dovOff += dash;
    return slice;
  });

  return (
    <div className="hlscan-shell">

      {/* browser chrome */}
      <div className="hlscan-chrome">
        <div className="hlscan-chrome-dots"><span /><span /><span /></div>
        <div className="hlscan-chrome-bar">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.5 }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>app.tryoras.com · Overview</span>
        </div>
        {scanning && <div className="hlscan-chrome-progress"><div className="hlscan-chrome-progress-fill" /></div>}
      </div>

      {/* dashboard body */}
      <div className="hlscan-body">

        {/* sidebar */}
        <aside className="hlscan-sidebar">
          <div className="hlscan-sidebar-brand">
            <div className="hlscan-sidebar-logo" />
            <span>ORAS</span>
          </div>
          {["Overview", "Engines", "Citations", "Competitors", "Prompts", "Reddit"].map((item) => (
            <div key={item} className={`hlscan-sidebar-item${item === "Overview" ? " active" : ""}`}>
              {item}
            </div>
          ))}
        </aside>

        {/* main content — mirrors DashboardOverview layout */}
        <main className="hlscan-main">

          {/* header — matches dov-header */}
          <div className="hlscan-dov-header">
            <div className="hlscan-dov-header-left">
              <span className="hlscan-dov-domain">oras.com</span>
              {["Overview", "Engines", "Citations"].map((tab, i) => (
                <span key={tab} className={`hlscan-dov-tab${i === 0 ? " active" : ""}`}>{tab}</span>
              ))}
            </div>
            <div className="hlscan-dov-header-right">
              <span className={`hlscan-dov-scan-badge${scanning ? " scanning" : " done"}`}>
                <span className="hlscan-dov-scan-dot" />
                {scanning ? "Scanning…" : "Scan complete"}
              </span>
              <span className="hlscan-dov-date">Last 7 days</span>
            </div>
          </div>

          {/* body — matches dov-body grid */}
          <div className="hlscan-dov-body">

            {/* engine ranking table — matches dov-table-wrap */}
            <div className="hlscan-dov-table-wrap">
              <div className="hlscan-dov-section-label">BY ENGINE · BRAND RANKING</div>
              <table className="hlscan-dov-table">
                <thead>
                  <tr>
                    <th>BRAND</th>
                    {ENGINES.map((e) => (
                      <th key={e.key} style={{ color: e.color }}>{e.label}</th>
                    ))}
                    <th>GEO</th>
                  </tr>
                </thead>
                <tbody>
                  {BRANDS.map((brand, i) => {
                    const vis = results || i < rowsVisible;
                    return (
                      <tr
                        key={brand.name}
                        className={brand.you ? "hlscan-dov-row-you" : "hlscan-dov-row"}
                        style={{
                          opacity:    vis ? 1 : 0,
                          transform:  vis ? "none" : "translateY(6px)",
                          transition: "opacity 0.3s ease, transform 0.3s ease",
                        }}
                      >
                        <td>
                          <div className="hlscan-dov-brand-cell">
                            {brand.you && <span className="hlscan-dov-you-dot" />}
                            <span className="hlscan-dov-brand-name">{brand.name}</span>
                            {brand.you && <span className="hlscan-dov-you-tag">YOU</span>}
                          </div>
                        </td>
                        {ENGINES.map((e) => {
                          const rank = brand.scores[e.key];
                          return (
                            <td key={e.key} className="hlscan-dov-rank-cell">
                              {vis
                                ? rank
                                  ? <span style={{ color: e.color, fontWeight: 700 }}>{rank}</span>
                                  : <span className="hlscan-dov-rank-miss">—</span>
                                : <span className="hlscan-dov-skel hlscan-dov-skel-sm" />}
                            </td>
                          );
                        })}
                        <td className="hlscan-dov-geo-cell">
                          {vis
                            ? <span className={`hlscan-dov-geo-badge${brand.you ? " you" : ""}`}
                                style={{ opacity: results ? 1 : 0, transition: "opacity 0.4s" }}>
                                {brand.you ? geoScore : brand.geo}
                              </span>
                            : <span className="hlscan-dov-skel hlscan-dov-skel-sm" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* right column — matches dov-right-col */}
            <div className="hlscan-dov-right-col">

              {/* share of voice — matches dov-panel */}
              <div className="hlscan-dov-panel">
                <div className="hlscan-dov-panel-label">SHARE OF VOICE</div>
                <div className="hlscan-dov-sov-inner">
                  <svg viewBox="0 0 80 80" className="hlscan-dov-donut">
                    <circle cx="40" cy="40" r={R} fill="none" stroke="#f4f4f5" strokeWidth="12" />
                    {sovSlices.map((s, i) => (
                      <circle
                        key={i}
                        cx="40" cy="40" r={R}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="12"
                        strokeDasharray={`${s.dash} ${CIRC}`}
                        strokeDashoffset={s.dashOffset}
                        style={{ transition: `stroke-dasharray 0.9s ease ${0.1 * i}s` }}
                      />
                    ))}
                    <text x="40" y="37" textAnchor="middle" fontSize="12" fontWeight="800" fill="#18181b">
                      {results ? `${sovPct}%` : "—"}
                    </text>
                    <text x="40" y="47" textAnchor="middle" fontSize="7" fill="#a1a1aa">you</text>
                  </svg>
                  <div className="hlscan-dov-sov-legend">
                    {SOV.map((s) => (
                      <div key={s.label} className="hlscan-dov-sov-leg-row">
                        <span className="hlscan-dov-sov-dot" style={{ background: s.color }} />
                        <span className="hlscan-dov-sov-name">{s.label}</span>
                        <span className="hlscan-dov-sov-pct">
                          {results ? `${s.pct}%` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* citations — matches dov-cite-panel */}
              <div className="hlscan-dov-panel hlscan-dov-cite-panel">
                <div className="hlscan-dov-panel-label">RECENT CITATIONS</div>
                <div className="hlscan-dov-cite-list">
                  {CITATIONS.map((c, i) => {
                    const vis = i < citesVisible;
                    return (
                      <div
                        key={i}
                        className="hlscan-dov-cite-row"
                        style={{
                          opacity:    vis ? 1 : 0,
                          transform:  vis ? "none" : "translateY(5px)",
                          transition: "opacity 0.28s ease, transform 0.28s ease",
                        }}
                      >
                        <span className="hlscan-dov-cite-src">{c.source}</span>
                        <span className="hlscan-dov-cite-note">{c.note}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* footer bar — matches dov-footer-bar */}
          <div
            className="hlscan-dov-footer-bar"
            style={{
              opacity:    complete ? 1 : 0,
              transform:  complete ? "none" : "translateY(8px)",
              transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
            }}
          >
            <span>Last scanned: just now</span>
            <span className="hlscan-dov-footer-link">Full visibility report →</span>
          </div>

        </main>
      </div>
    </div>
  );
}
