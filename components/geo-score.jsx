"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircleIcon, ArrowRightIcon, CheckCircle2Icon, GaugeIcon, RefreshCwIcon } from "lucide-react";

function scoreLabel(score) {
  if (score >= 80) return { grade: "Strong", color: "#22c55e", ring: "#22c55e", ringFade: "rgba(34,197,94,0.12)" };
  if (score >= 55) return { grade: "Growing", color: "#f59e0b", ring: "#f59e0b", ringFade: "rgba(245,158,11,0.12)" };
  return { grade: "Needs work", color: "#ef4444", ring: "#ef4444", ringFade: "rgba(239,68,68,0.12)" };
}

export function GeoScore({ brand, category }) {
  const cleanBrand = (brand || "Your brand").trim();
  const [scan, setScan] = useState({ status: "idle" });

  const runScan = async () => {
    setScan({ status: "loading" });
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

  useEffect(() => {
    runScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanBrand]);

  const data = scan.data;
  const meta = data ? scoreLabel(data.score) : null;
  const ringAngle = data ? (data.score / 100) * 360 : 0;
  const isStrong = data?.score >= 80;

  return (
    <section className="dashboard-card geo-score-card">
      <div className="card-header">
        <div>
          <h2><GaugeIcon className="geo-score-title-icon" /> GEO Score</h2>
          <p className="card-supporting-copy">
            How often AI assistants mention {cleanBrand} — and what to improve.
          </p>
        </div>
        <button type="button" className="action-button" onClick={runScan} disabled={scan.status === "loading"}>
          <RefreshCwIcon className={scan.status === "loading" ? "button-icon spin" : "button-icon"} />
          Refresh
        </button>
      </div>

      {scan.status === "error" ? (
        <div className="geo-score-empty">
          <p>{scan.error}</p>
          <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>Try again</button>
        </div>
      ) : scan.status !== "done" ? (
        <div className="geo-score-empty">
          <RefreshCwIcon className="spin" />
          <p>Calculating {cleanBrand}&apos;s GEO score…</p>
        </div>
      ) : (
        <div className="geo-score-body">
          <div className="geo-score-ringwrap">
            <div
              className="geo-score-ring"
              style={{ background: `conic-gradient(${meta.ring} ${ringAngle}deg, ${meta.ringFade} 0deg)` }}
            >
              <div className="geo-score-ring-inner">
                <strong>{data.score}</strong>
                <span>/ 100</span>
              </div>
            </div>
            <span className="geo-score-grade" style={{ color: meta.color }}>{meta.grade}</span>
            {data.impact > 0 ? (
              <div className="geo-score-potential">
                <span className="geo-score-arrow">→ {data.potential}</span>
                <span>potential</span>
              </div>
            ) : null}
          </div>

          <div className="geo-score-detail">
            {data.reasons.length ? (
              <>
                <h3 className="geo-score-reasons-title">
                  {isStrong ? "What’s working" : "Gaps to close"}
                </h3>
                <ul className="geo-score-reasons">
                  {data.reasons.map((reason, index) => (
                    <li key={index}>
                      {isStrong ? <CheckCircle2Icon className="geo-reason-check" /> : <AlertCircleIcon />}
                      {reason}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {data.impact > 0 ? (
              <div className="geo-score-impact">
                <div>
                  <span className="geo-score-impact-plus">+{data.impact}</span>
                  <span className="geo-score-impact-label">pts available</span>
                </div>
                <Link href="/dashboard/recommendations" className="primary-button">
                  See recommendations <ArrowRightIcon className="button-icon" />
                </Link>
              </div>
            ) : (
              <Link href="/dashboard/recommendations" className="action-button" style={{ alignSelf: "flex-start" }}>
                View recommendations <ArrowRightIcon className="button-icon" />
              </Link>
            )}

            <p className="geo-score-disclaimer">Score is an informed AI estimate, not live-tracked data.</p>
          </div>
        </div>
      )}
    </section>
  );
}
