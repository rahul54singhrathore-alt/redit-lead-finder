"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  GaugeIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";

const ENGINE_ORDER = ["chatgpt", "gemini", "claude", "perplexity"];
const ENGINE_LABELS = { chatgpt: "ChatGPT", gemini: "Gemini", claude: "Claude", perplexity: "Perplexity" };
const ENGINE_COLORS = { chatgpt: "#10a37f", gemini: "#4285f4", claude: "#7c3aed", perplexity: "#f59e0b" };

function scoreLabel(score) {
  if (score >= 75) return { grade: "Strong", color: "#16a34a", ringColor: "#22c55e", ringFade: "rgba(34,197,94,0.10)" };
  if (score >= 45) return { grade: "Growing", color: "#d97706", ringColor: "#f59e0b", ringFade: "rgba(245,158,11,0.10)" };
  return { grade: "Low visibility", color: "#dc2626", ringColor: "#ef4444", ringFade: "rgba(239,68,68,0.10)" };
}

function rateColor(rate) {
  if (rate >= 75) return "#16a34a";
  if (rate >= 40) return "#d97706";
  return "#dc2626";
}

export function GeoScore({ brand, category }) {
  const cleanBrand = (brand || "Your brand").trim();
  const [scan, setScan] = useState({ status: "idle" });
  const [expanded, setExpanded] = useState(null);

  const runScan = async () => {
    setScan({ status: "loading" });
    setExpanded(null);
    try {
      const response = await fetch("/api/geo-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: cleanBrand, category }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Scan failed.");
      setScan({ status: "done", data });
    } catch (error) {
      setScan({ status: "error", error: error.message });
    }
  };

  useEffect(() => { runScan(); }, [cleanBrand]);

  const data = scan.data;
  const meta = data ? scoreLabel(data.score) : null;
  const ringAngle = data ? (data.score / 100) * 360 : 0;

  return (
    <div className="geo-score-layout">
      {/* Main score card */}
      <section className="dashboard-card geo-score-card">
        <div className="card-header">
          <div>
            <h2><GaugeIcon className="geo-score-title-icon" /> GEO Score</h2>
            <p className="card-supporting-copy">
              How often {cleanBrand} appears across ChatGPT, Gemini, Claude &amp; Perplexity.
            </p>
          </div>
          <button
            type="button"
            className="action-button geo-refresh-btn"
            onClick={runScan}
            disabled={scan.status === "loading"}
          >
            <RefreshCwIcon className={scan.status === "loading" ? "button-icon spin" : "button-icon"} />
            {scan.status === "loading" ? "Scanning…" : "Refresh"}
          </button>
        </div>

        {scan.status === "error" ? (
          <div className="geo-score-empty">
            <AlertCircleIcon style={{ width: 28, height: 28, color: "#ef4444" }} />
            <p>{scan.error}</p>
            <button type="button" className="geo-build-cta" onClick={runScan} style={{ marginTop: 12 }}>
              Try again
            </button>
          </div>
        ) : scan.status !== "done" ? (
          <div className="geo-score-loading">
            <div className="geo-loading-ring">
              <RefreshCwIcon className="spin" />
            </div>
            <p className="geo-loading-title">Scanning AI engines…</p>
            <p className="geo-loading-sub">
              Running {cleanBrand} through {4} queries across ChatGPT, Gemini, Claude &amp; Perplexity
            </p>
            <div className="geo-loading-steps">
              {["Category search", "Direct lookup", "Comparison query", "Features &amp; pricing"].map((s, i) => (
                <span key={i} className="geo-loading-step">{s}</span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="geo-score-body">
              {/* Ring */}
              <div className="geo-score-ringwrap">
                <div
                  className="geo-score-ring"
                  style={{
                    background: `conic-gradient(${meta.ringColor} ${ringAngle}deg, ${meta.ringFade} 0deg)`,
                  }}
                >
                  <div className="geo-score-ring-inner">
                    <strong style={{ color: meta.color }}>{data.score}</strong>
                    <span>/ 100</span>
                  </div>
                </div>
                <span className="geo-score-grade" style={{ color: meta.color }}>{meta.grade}</span>
                <div className="geo-score-checks-note">
                  {data.totalChecks} AI checks · {data.liveChecks > 0 ? `${data.liveChecks} live engines` : "simulated engines"}
                </div>
              </div>

              {/* Right column: engine breakdown + reasons */}
              <div className="geo-score-detail">
                <div className="geo-engine-grid">
                  {ENGINE_ORDER.map((key) => {
                    const eng = data.engines?.find((e) => e.key === key);
                    if (!eng) return null;
                    const color = ENGINE_COLORS[key] || rateColor(eng.mentionRate);
                    return (
                      <div key={key} className="geo-engine-card">
                        <div className="geo-engine-top">
                          <span className="geo-engine-label">
                            <span className="geo-engine-dot" style={{ background: color }} />
                            {eng.label}
                          </span>
                          <span className="geo-engine-rate" style={{ color }}>
                            {eng.mentionCount}/{eng.totalPrompts}
                            <em>{eng.mentionRate}%</em>
                          </span>
                        </div>
                        <div className="geo-engine-bar-track">
                          <div
                            className="geo-engine-bar-fill"
                            style={{ width: `${eng.mentionRate}%`, background: color }}
                          />
                        </div>
                        {eng.mentionRate === 0 ? (
                          <span className="geo-engine-sub geo-engine-sub-miss">not mentioned</span>
                        ) : eng.avgRank ? (
                          <span className="geo-engine-sub">avg rank #{eng.avgRank}</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Reasons */}
                {data.reasons?.length > 0 && (
                  <>
                    <h3 className="geo-score-reasons-title" style={{ marginTop: 20 }}>What&apos;s pulling the score down</h3>
                    <ul className="geo-score-reasons">
                      {data.reasons.map((reason, i) => (
                        <li key={i}>
                          <AlertCircleIcon />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Impact CTA */}
                {data.impact > 0 ? (
                  <div className="geo-score-impact">
                    <div>
                      <span className="geo-score-impact-plus">+{data.impact}</span>
                      <span className="geo-score-impact-label">pts available</span>
                    </div>
                    <Link href="/dashboard/recommendations" className="primary-button geo-impact-btn">
                      See roadmap <ArrowRightIcon className="button-icon" />
                    </Link>
                  </div>
                ) : (
                  <Link href="/dashboard/recommendations" className="action-button" style={{ alignSelf: "flex-start", marginTop: 16, width: "auto" }}>
                    View recommendations <ArrowRightIcon className="button-icon" />
                  </Link>
                )}
              </div>
            </div>

            {/* Query breakdown table */}
            <div className="geo-prompt-section">
              <h3 className="geo-prompt-heading">
                Query breakdown
                <span className="geo-prompt-badge">{data.prompts?.length} queries</span>
              </h3>
              <div className="geo-prompt-list">
                {data.prompts?.map((p, pi) => (
                  <div key={pi} className={`geo-prompt-row${expanded === pi ? " geo-prompt-expanded" : ""}`}>
                    <button
                      type="button"
                      className="geo-prompt-toggle"
                      onClick={() => setExpanded(expanded === pi ? null : pi)}
                    >
                      <span className={`geo-prompt-status geo-prompt-status-${p.mentioned ? "yes" : "no"}`}>
                        {p.mentioned ? <CheckIcon /> : <XIcon />}
                      </span>
                      <span className="geo-prompt-text">&ldquo;{p.prompt}&rdquo;</span>
                      <span className="geo-prompt-engines-dots">
                        {ENGINE_ORDER.map((key) => {
                          const eng = p.engines?.find((e) => e.key === key);
                          return (
                            <span
                              key={key}
                              className={`geo-dot geo-dot-${eng?.mentioned ? "yes" : "no"}`}
                              title={eng?.mentioned ? `${ENGINE_LABELS[key]} #${eng.rank}` : `${ENGINE_LABELS[key]} — not mentioned`}
                            />
                          );
                        })}
                      </span>
                      <span className="geo-prompt-count">
                        {p.mentionedCount}/{p.engineCount} engines
                      </span>
                    </button>

                    {expanded === pi && (
                      <div className="geo-prompt-detail">
                        {ENGINE_ORDER.map((key) => {
                          const eng = p.engines?.find((e) => e.key === key);
                          return (
                            <div key={key} className={`geo-prompt-engine-row${eng?.mentioned ? "" : " geo-prompt-engine-miss"}`}>
                              <span className="geo-prompt-engine-icon">
                                {eng?.mentioned
                                  ? <CheckCircle2Icon style={{ color: "#16a34a" }} />
                                  : <XIcon style={{ color: "#a1a1aa" }} />}
                              </span>
                              <span className="geo-prompt-engine-name">{ENGINE_LABELS[key]}</span>
                              {eng?.mentioned
                                ? <span className="geo-prompt-rank">Rank #{eng.rank}</span>
                                : <span className="geo-prompt-miss">not mentioned</span>}
                              {eng?.answer && (
                                <p className="geo-prompt-answer">&ldquo;{eng.answer.slice(0, 160)}{eng.answer.length > 160 ? "…" : ""}&rdquo;</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
