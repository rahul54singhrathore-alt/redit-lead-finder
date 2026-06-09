"use client";

import { useState } from "react";
import { RadarIcon, RefreshCwIcon, TargetIcon, WrenchIcon, XCircleIcon } from "lucide-react";

// AI Mention Opportunities: runs a batch of realistic buyer prompts through
// Claude and surfaces the ones where the brand is NOT recommended — the direct,
// actionable visibility gaps. Powered by /api/mention-opportunities.
export function MentionOpportunities({ brand, category }) {
  const cleanBrand = (brand || "Your brand").trim();
  const [scan, setScan] = useState({ status: "idle" });

  const runScan = async () => {
    setScan({ status: "loading" });
    try {
      const response = await fetch("/api/mention-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: cleanBrand, category, count: 30 }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Scan failed.");
      setScan({ status: "done", data });
    } catch (error) {
      setScan({ status: "error", error: error.message });
    }
  };

  const data = scan.data;

  return (
    <section className="dashboard-card mention-opp">
      <div className="card-header">
        <div>
          <h2>
            <RadarIcon className="mention-opp-title-icon" /> AI Mention Opportunities
          </h2>
          <p className="card-supporting-copy">
            We run realistic buyer prompts through AI and show where {cleanBrand} is missing — each one a chance to get recommended.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={runScan}
          disabled={scan.status === "loading"}
        >
          {scan.status === "loading" ? (
            <>
              <RefreshCwIcon className="button-icon spin" /> Running…
            </>
          ) : scan.status === "done" ? (
            <>
              <RefreshCwIcon className="button-icon" /> Re-run
            </>
          ) : (
            <>
              <TargetIcon className="button-icon" /> Run scan
            </>
          )}
        </button>
      </div>

      {scan.status === "idle" ? (
        <div className="mention-opp-empty">
          <RadarIcon />
          <p>Run a scan to see how many AI buyer prompts {cleanBrand} is missing from.</p>
        </div>
      ) : scan.status === "loading" ? (
        <div className="mention-opp-empty">
          <RefreshCwIcon className="spin" />
          <p>Running buyer prompts through AI…</p>
        </div>
      ) : scan.status === "error" ? (
        <div className="mention-opp-empty mention-opp-error">
          <XCircleIcon />
          <p>{scan.error}</p>
          <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mention-opp-headline">
            <div className="mention-opp-bignum">
              <strong>{data.missingCount}</strong>
              <span>of {data.total}</span>
            </div>
            <div className="mention-opp-headline-copy">
              <h3>
                {cleanBrand} is missing in {data.missingCount} of {data.total} buyer prompts.
              </h3>
              <p>
                AI recommended {cleanBrand} in {data.mentionedCount} — fixing the gaps below puts you in more AI answers.
              </p>
              <div className="mention-opp-meter">
                <span
                  style={{ width: `${data.total ? (data.mentionedCount / data.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mention-opp-lists">
            <div>
              <h4 className="mention-opp-list-title mention-opp-list-title-miss">
                Missing — opportunities ({data.missing.length})
              </h4>
              <ul className="mention-opp-list">
                {data.missing.map((item, index) => (
                  <li key={`${item.prompt}-${index}`} className="mention-opp-row mention-opp-row-miss">
                    <span className="mention-opp-prompt">{item.prompt}</span>
                    {item.topBrands.length ? (
                      <span className="mention-opp-rec">AI picks: {item.topBrands.slice(0, 3).join(", ")}</span>
                    ) : null}
                    {item.fix ? (
                      <span className="mention-opp-fix">
                        <WrenchIcon /> <strong>Fix:</strong> {item.fix}
                      </span>
                    ) : null}
                  </li>
                ))}
                {data.missing.length === 0 ? (
                  <li className="mention-opp-row">No gaps — {cleanBrand} shows up everywhere. 🎉</li>
                ) : null}
              </ul>
            </div>

            {data.present.length ? (
              <div>
                <h4 className="mention-opp-list-title mention-opp-list-title-win">
                  Already recommended ({data.present.length})
                </h4>
                <ul className="mention-opp-list">
                  {data.present.map((item, index) => (
                    <li key={`${item.prompt}-${index}`} className="mention-opp-row mention-opp-row-win">
                      <span className="mention-opp-prompt">{item.prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
