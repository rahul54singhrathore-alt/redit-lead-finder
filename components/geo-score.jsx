"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircleIcon, ArrowRightIcon, GaugeIcon, RefreshCwIcon } from "lucide-react";

// GEO Score: the brand's estimated AI-visibility score, why it isn't higher, and
// the score it could reach if the gaps are fixed. Powered by /api/geo-score.
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

  // Auto-run once on mount so the GEO Score is the first thing the user sees.
  useEffect(() => {
    runScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanBrand]);

  const data = scan.data;
  // Ring fill: score as a fraction of 100.
  const ringAngle = data ? (data.score / 100) * 360 : 0;

  return (
    <section className="dashboard-card geo-score-card">
      <div className="card-header">
        <div>
          <h2>
            <GaugeIcon className="geo-score-title-icon" /> GEO Score
          </h2>
          <p className="card-supporting-copy">
            How often AI assistants would recommend {cleanBrand} — and what’s holding it back.
          </p>
        </div>
        <button
          type="button"
          className="action-button"
          onClick={runScan}
          disabled={scan.status === "loading"}
        >
          <RefreshCwIcon className={scan.status === "loading" ? "button-icon spin" : "button-icon"} />
          Refresh
        </button>
      </div>

      {scan.status === "error" ? (
        <div className="geo-score-empty">
          <p>{scan.error}</p>
          <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>
            Try again
          </button>
        </div>
      ) : scan.status !== "done" ? (
        <div className="geo-score-empty">
          <RefreshCwIcon className="spin" />
          <p>Calculating {cleanBrand}’s GEO score…</p>
        </div>
      ) : (
        <div className="geo-score-body">
          <div className="geo-score-ringwrap">
            <div
              className="geo-score-ring"
              style={{ background: `conic-gradient(#f97316 ${ringAngle}deg, rgba(249,115,22,0.14) 0deg)` }}
            >
              <div className="geo-score-ring-inner">
                <strong>{data.score}</strong>
                <span>/ 100</span>
              </div>
            </div>
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
                <h3 className="geo-score-reasons-title">Reasons you’re missing</h3>
                <ul className="geo-score-reasons">
                  {data.reasons.map((reason, index) => (
                    <li key={index}>
                      <AlertCircleIcon /> {reason}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="geo-score-impact">
              <div>
                <span className="geo-score-impact-plus">+{data.impact}</span>
                <span className="geo-score-impact-label">estimated score if fixed</span>
              </div>
              <Link href="/dashboard/recommendations" className="primary-button">
                Fix these <ArrowRightIcon className="button-icon" />
              </Link>
            </div>

            <p className="geo-score-disclaimer">Score is an informed AI estimate, not live-tracked data.</p>
          </div>
        </div>
      )}
    </section>
  );
}
