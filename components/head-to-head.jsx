"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  RefreshCwIcon,
  SwordsIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  XCircleIcon,
} from "lucide-react";

const ENGINE_META = {
  chatgpt:    { label: "ChatGPT",    color: "#10a37f" },
  gemini:     { label: "Gemini",     color: "#4285f4" },
  claude:     { label: "Claude",     color: "#d97706" },
  perplexity: { label: "Perplexity", color: "#7c3aed" },
  grok:       { label: "Grok",       color: "#0891b2" },
};
const ENGINE_ORDER = ["chatgpt", "gemini", "claude", "perplexity", "grok"];

async function fetchOverview(brand, category) {
  const res = await fetch("/api/visibility-overview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brand, category }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Scan failed.");
  return data;
}

function ScoreRing({ score, color }) {
  return (
    <div className="h2h-score-ring" style={{ "--ring-color": color }}>
      <span className="h2h-score-num" style={{ color }}>{score}</span>
      <span className="h2h-score-denom">/100</span>
    </div>
  );
}

function EngineRow({ engineKey, yourEngine, theirEngine, yourBrand, theirBrand }) {
  const meta = ENGINE_META[engineKey];
  if (!meta) return null;
  const yourScore  = yourEngine?.score  ?? 0;
  const theirScore = theirEngine?.score ?? 0;
  const youWin = yourScore >= theirScore;

  return (
    <div className="h2h-engine-row">
      <div className="h2h-engine-label">
        <span className="h2h-engine-dot" style={{ background: meta.color }} />
        <span>{meta.label}</span>
      </div>

      <div className="h2h-engine-bars">
        {/* Your bar — grows left from center */}
        <div className="h2h-bar-wrap h2h-bar-left">
          <div className="h2h-bar-track">
            <div
              className={`h2h-bar-fill h2h-bar-fill-you${youWin ? " h2h-bar-winner" : ""}`}
              style={{ width: `${yourScore}%` }}
            />
          </div>
          <span className={`h2h-bar-score${youWin ? " h2h-bar-score-winner" : ""}`}>{yourScore}</span>
        </div>

        <div className="h2h-engine-vs-dot" />

        {/* Their bar — grows right from center */}
        <div className="h2h-bar-wrap h2h-bar-right">
          <span className={`h2h-bar-score${!youWin ? " h2h-bar-score-winner" : ""}`}>{theirScore}</span>
          <div className="h2h-bar-track">
            <div
              className={`h2h-bar-fill h2h-bar-fill-them${!youWin ? " h2h-bar-winner" : ""}`}
              style={{ width: `${theirScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="h2h-engine-winner">
        {youWin
          ? <span className="h2h-win-badge h2h-win-you">You</span>
          : <span className="h2h-win-badge h2h-win-them">{theirBrand}</span>}
      </div>
    </div>
  );
}

export function HeadToHead({ brand, competitors = [], category = "" }) {
  const [picked, setPicked] = useState(competitors[0] || "");
  const [custom, setCustom] = useState("");
  const [scan, setScan] = useState({ status: "idle" });

  const competitor = custom.trim() || picked;

  const runScan = async () => {
    const comp = competitor.trim();
    if (!comp || !brand) return;
    setScan({ status: "loading" });
    try {
      const [yourData, theirData] = await Promise.all([
        fetchOverview(brand, category),
        fetchOverview(comp, category),
      ]);
      setScan({ status: "done", yourData, theirData, competitor: comp });
    } catch (err) {
      setScan({ status: "error", error: err.message });
    }
  };

  const d = scan.status === "done" ? scan : null;
  const yourScore  = d?.yourData?.overall  ?? 0;
  const theirScore = d?.theirData?.overall ?? 0;
  const scoreDiff  = yourScore - theirScore;
  const youWinOverall = yourScore >= theirScore;

  const yourEngines  = d?.yourData?.engines  || [];
  const theirEngines = d?.theirData?.engines || [];

  const engineWins = ENGINE_ORDER.filter((k) => {
    const y = yourEngines.find((e) => e.key === k);
    const t = theirEngines.find((e) => e.key === k);
    return (y?.score ?? 0) >= (t?.score ?? 0);
  });

  return (
    <section className="dashboard-card h2h-card">
      <div className="card-header">
        <div>
          <h2><SwordsIcon className="card-header-icon" /> Head-to-head</h2>
          <p className="card-supporting-copy">
            Run the same AI prompts for you and one competitor — see who wins each engine.
          </p>
        </div>
        {scan.status === "done" && (
          <button
            type="button"
            className="action-button"
            onClick={runScan}
            disabled={scan.status === "loading"}
          >
            <RefreshCwIcon className="button-icon" /> Re-run
          </button>
        )}
      </div>

      {/* Competitor picker */}
      {scan.status !== "done" && (
        <div className="h2h-setup">
          {competitors.length > 0 && (
            <div className="h2h-field">
              <label className="h2h-field-label">Pick a saved competitor</label>
              <div className="h2h-select-wrap">
                <select
                  className="h2h-select"
                  value={picked}
                  onChange={(e) => { setPicked(e.target.value); setCustom(""); }}
                  disabled={!!custom.trim()}
                >
                  {competitors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDownIcon className="h2h-select-icon" />
              </div>
            </div>
          )}

          <div className="h2h-field">
            <label className="h2h-field-label">
              {competitors.length > 0 ? "Or type a different competitor" : "Enter a competitor to compare"}
            </label>
            <input
              type="text"
              className="form-input"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g., Peec AI, Profound, HubSpot"
              onKeyDown={(e) => e.key === "Enter" && runScan()}
            />
          </div>

          <button
            type="button"
            className="primary-button h2h-run-btn"
            onClick={runScan}
            disabled={!competitor || scan.status === "loading"}
          >
            {scan.status === "loading" ? (
              <><RefreshCwIcon className="button-icon spin" /> Scanning both brands…</>
            ) : (
              <><SwordsIcon className="button-icon" /> Compare {brand} vs {competitor || "…"}</>
            )}
          </button>

          {scan.status === "loading" && (
            <p className="h2h-loading-note">
              Querying ChatGPT, Gemini, Claude &amp; Perplexity for both brands simultaneously…
            </p>
          )}

          {scan.status === "error" && (
            <p className="h2h-error">{scan.error}</p>
          )}
        </div>
      )}

      {/* Results */}
      {scan.status === "done" && d && (
        <div className="h2h-results">

          {/* Score hero */}
          <div className="h2h-hero">
            <div className="h2h-brand-col">
              <span className="h2h-brand-name h2h-brand-you">{brand}</span>
              <ScoreRing score={yourScore} color={youWinOverall ? "#16a34a" : "#ea580c"} />
              <span className="h2h-engine-wins-label">
                {engineWins.length}/{ENGINE_ORDER.length} engines
              </span>
            </div>

            <div className="h2h-vs-col">
              <span className="h2h-vs-badge">VS</span>
              <div className={`h2h-verdict ${youWinOverall ? "h2h-verdict-win" : "h2h-verdict-lose"}`}>
                {youWinOverall ? <TrendingUpIcon /> : <TrendingDownIcon />}
                <span>
                  {scoreDiff === 0
                    ? "Tied"
                    : youWinOverall
                    ? `+${scoreDiff} ahead`
                    : `${scoreDiff} behind`}
                </span>
              </div>
            </div>

            <div className="h2h-brand-col h2h-brand-col-right">
              <span className="h2h-brand-name h2h-brand-them">{scan.competitor}</span>
              <ScoreRing score={theirScore} color={!youWinOverall ? "#16a34a" : "#71717a"} />
              <span className="h2h-engine-wins-label">
                {ENGINE_ORDER.length - engineWins.length}/{ENGINE_ORDER.length} engines
              </span>
            </div>
          </div>

          {/* Engine-by-engine */}
          <div className="h2h-engines">
            <div className="h2h-engines-header">
              <span className="h2h-engines-col-label">{brand}</span>
              <span className="h2h-engines-mid">Engine</span>
              <span className="h2h-engines-col-label h2h-engines-col-right">{scan.competitor}</span>
            </div>
            {ENGINE_ORDER.map((key) => (
              <EngineRow
                key={key}
                engineKey={key}
                yourEngine={yourEngines.find((e) => e.key === key)}
                theirEngine={theirEngines.find((e) => e.key === key)}
                yourBrand={brand}
                theirBrand={scan.competitor}
              />
            ))}
          </div>

          {/* Insights */}
          <div className="h2h-insights">
            {engineWins.length === ENGINE_ORDER.length ? (
              <div className="h2h-insight h2h-insight-win">
                <CheckCircle2Icon />
                <span><strong>{brand}</strong> leads on all 4 engines. Focus on widening the gap with more citation sources.</span>
              </div>
            ) : engineWins.length === 0 ? (
              <div className="h2h-insight h2h-insight-lose">
                <XCircleIcon />
                <span><strong>{scan.competitor}</strong> leads on all 4 engines. Use GEO Fix on Visibility to generate content that closes the gap.</span>
              </div>
            ) : (
              <>
                <div className="h2h-insight h2h-insight-win">
                  <CheckCircle2Icon />
                  <span>
                    <strong>{brand}</strong> wins on{" "}
                    {engineWins.map((k) => ENGINE_META[k]?.label).join(", ")}.
                  </span>
                </div>
                <div className="h2h-insight h2h-insight-lose">
                  <XCircleIcon />
                  <span>
                    <strong>{scan.competitor}</strong> leads on{" "}
                    {ENGINE_ORDER.filter((k) => !engineWins.includes(k))
                      .map((k) => ENGINE_META[k]?.label)
                      .join(", ")}.{" "}
                    <Link href="/dashboard/visibility" className="h2h-fix-link">
                      Fix those gaps <ArrowRightIcon />
                    </Link>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Reset */}
          <button
            type="button"
            className="h2h-reset"
            onClick={() => { setScan({ status: "idle" }); setCustom(""); }}
          >
            Compare a different competitor
          </button>
        </div>
      )}
    </section>
  );
}
