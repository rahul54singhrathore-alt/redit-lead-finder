"use client";

import { useState } from "react";
import { CheckIcon, RefreshCwIcon, RocketIcon, SwordsIcon, TrophyIcon } from "lucide-react";

// "Why Competitor Wins": for each tracked competitor, explain the visibility
// gap — competitor mentions vs yours, plus the concrete reasons (backlinks, G2,
// Reddit, comparison pages). Powered by /api/competitor-edge (AI estimates).
export function CompetitorEdge({ brand, competitors = [], category }) {
  const cleanBrand = (brand || "Your brand").trim();
  // Per-competitor analysis: { [name]: { status, data, error } }
  const [edges, setEdges] = useState({});

  const analyze = async (competitor) => {
    setEdges((current) => ({ ...current, [competitor]: { status: "loading" } }));
    try {
      const response = await fetch("/api/competitor-edge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: cleanBrand, competitor, category }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Analysis failed.");
      setEdges((current) => ({ ...current, [competitor]: { status: "done", data } }));
    } catch (error) {
      setEdges((current) => ({ ...current, [competitor]: { status: "error", error: error.message } }));
    }
  };

  if (competitors.length === 0) return null;

  return (
    <section className="dashboard-card">
      <div className="card-header">
        <div>
          <h2>
            <SwordsIcon className="edge-title-icon" /> Why competitors win
          </h2>
          <p className="card-supporting-copy">
            Not just who’s mentioned more — the concrete reasons each competitor out-ranks {cleanBrand}.
          </p>
        </div>
      </div>

      <div className="edge-list">
        {competitors.map((competitor) => {
          const edge = edges[competitor];
          return (
            <div key={competitor} className="edge-item">
              <div className="edge-item-head">
                <strong>{competitor}</strong>
                <button
                  type="button"
                  className="action-button"
                  onClick={() => analyze(competitor)}
                  disabled={edge?.status === "loading"}
                >
                  {edge?.status === "loading" ? (
                    <>
                      <RefreshCwIcon className="button-icon spin" /> Analyzing…
                    </>
                  ) : edge?.status === "done" ? (
                    <>
                      <RefreshCwIcon className="button-icon" /> Re-analyze
                    </>
                  ) : (
                    "Why do they win?"
                  )}
                </button>
              </div>

              {edge?.status === "error" ? (
                <p className="edge-error">{edge.error}</p>
              ) : null}

              {edge?.status === "done" ? (
                <div className="edge-result">
                  <div className="edge-mentions">
                    <div className="edge-mention edge-mention-win">
                      <span className="edge-mention-label">
                        <TrophyIcon /> {competitor}
                      </span>
                      <strong>{edge.data.competitorMentions}</strong>
                      <span className="edge-mention-sub">mentions</span>
                    </div>
                    <div className="edge-vs">vs</div>
                    <div className="edge-mention edge-mention-you">
                      <span className="edge-mention-label">{cleanBrand} (you)</span>
                      <strong>{edge.data.yourMentions}</strong>
                      <span className="edge-mention-sub">mentions</span>
                    </div>
                  </div>

                  {edge.data.reasons.length ? (
                    <div className="edge-reasons">
                      <span className="edge-reasons-title">Why {competitor} wins</span>
                      <ul>
                        {edge.data.reasons.map((reason, index) => (
                          <li key={index}>
                            <CheckIcon /> {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {edge.data.actions?.length ? (
                    <div className="edge-actions">
                      <span className="edge-actions-title">
                        <RocketIcon /> Your action plan to catch up
                      </span>
                      <ol>
                        {edge.data.actions.map((action, index) => (
                          <li key={index}>
                            <span className="edge-action-num">{index + 1}</span>
                            {action}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  <p className="edge-disclaimer">Figures are AI estimates, not live-tracked data.</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
