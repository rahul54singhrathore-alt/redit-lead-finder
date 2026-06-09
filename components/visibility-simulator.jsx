"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, LockIcon, SparklesIcon, TrophyIcon } from "lucide-react";

import {
  SIM_ENGINES,
  overallGeoScore,
  simulateVisibility,
  whyNotFirst,
} from "@/lib/visibility-sim";
import { getLimits, getTier } from "@/lib/subscription";

const SAMPLE_PROMPTS = [
  "best SEO tools",
  "best AI visibility tracker",
  "best GEO software for agencies",
];

// Interactive "AI Recommendation Simulator": type a prompt and see how the
// brand ranks against competitors across AI engines. Free tier sees one engine;
// paid tiers unlock all engines (ties into the subscription system).
export function VisibilitySimulator({ brand, competitors = [], subscriptionTier = "free" }) {
  const tier = getTier(subscriptionTier);
  const allowedEngines = getLimits(subscriptionTier).engines;
  const rawBrand = (brand || "Your brand").trim();
  const cleanBrand = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1);
  const hasCompetitors = competitors.length > 0;

  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0]);
  const [activePrompt, setActivePrompt] = useState(SAMPLE_PROMPTS[0]);

  const results = useMemo(
    () => simulateVisibility({ prompt: activePrompt, brand: cleanBrand, competitors }),
    [activePrompt, cleanBrand, competitors],
  );
  const geoScore = useMemo(() => overallGeoScore(results), [results]);

  const lockedEngines = SIM_ENGINES.filter((engine) => !allowedEngines.includes(engine));

  const handleRun = (event) => {
    event.preventDefault();
    const next = prompt.trim();
    if (next) setActivePrompt(next);
  };

  return (
    <section className="dashboard-card sim-card">
      <div className="card-header">
        <div>
          <h2>
            <SparklesIcon className="sim-title-icon" /> AI recommendation simulator
          </h2>
          <p className="card-supporting-copy">
            See where <strong>{cleanBrand}</strong> ranks against competitors when people
            ask AI engines this prompt.
          </p>
        </div>
        <div className="sim-score" title="Overall simulated GEO score">
          <span className="sim-score-value">{geoScore}</span>
          <span className="sim-score-label">GEO score</span>
        </div>
      </div>

      <form className="sim-form" onSubmit={handleRun}>
        <input
          className="form-input"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="e.g., best SEO tools for startups"
          aria-label="Prompt to simulate"
        />
        <button type="submit" className="primary-button sim-run-button">
          Simulate <ArrowRightIcon className="button-icon" />
        </button>
      </form>

      <div className="sim-prompt-chips">
        {SAMPLE_PROMPTS.map((sample) => (
          <button
            key={sample}
            type="button"
            className={`sim-chip${activePrompt === sample ? " sim-chip-active" : ""}`}
            onClick={() => {
              setPrompt(sample);
              setActivePrompt(sample);
            }}
          >
            {sample}
          </button>
        ))}
      </div>

      {!hasCompetitors ? (
        <p className="sim-hint">
          Tip: add competitors in onboarding to benchmark {cleanBrand} against them.
        </p>
      ) : null}

      <div className="sim-engine-grid">
        {results.map((result) => {
          const locked = !allowedEngines.includes(result.engine);
          const reason = whyNotFirst(result);
          return (
            <article
              key={result.engine}
              className={`sim-engine${locked ? " sim-engine-locked" : ""}`}
            >
              <header className="sim-engine-head">
                <strong>{result.engine}</strong>
                {locked ? (
                  <span className="sim-lock-tag">
                    <LockIcon /> {getTier(subscriptionTier === "free" ? "pro" : subscriptionTier).name}
                  </span>
                ) : (
                  <span className={`sim-rank-tag${result.brandRank === 1 ? " sim-rank-first" : ""}`}>
                    {result.brandRank === 1 ? <TrophyIcon /> : null}
                    #{result.brandRank} of {result.total}
                  </span>
                )}
              </header>

              <div className="sim-engine-body">
                <div className={`sim-rows${locked ? " sim-rows-blurred" : ""}`}>
                  {result.rows.slice(0, 4).map((row) => (
                    <div
                      key={row.name}
                      className={`sim-row${row.isBrand ? " sim-row-brand" : ""}`}
                    >
                      <span className="sim-row-rank">{row.rank}</span>
                      <span className="sim-row-name">{row.name}</span>
                      <span className="sim-row-bar">
                        <span className="sim-row-fill" style={{ width: `${row.score}%` }} />
                      </span>
                      <span className="sim-row-score">{row.score}</span>
                    </div>
                  ))}
                </div>

                {locked ? (
                  <div className="sim-lock-overlay">
                    <LockIcon />
                    <span>See {result.engine} ranking</span>
                    <Link href="/pricing" className="sim-lock-button">
                      Unlock <ArrowRightIcon />
                    </Link>
                  </div>
                ) : null}
              </div>

              {!locked ? (
                reason ? (
                  <p className="sim-why">Why not #1? {reason}</p>
                ) : (
                  <p className="sim-why sim-why-win">{cleanBrand} leads on {result.engine}. 🎉</p>
                )
              ) : null}
            </article>
          );
        })}
      </div>

      {lockedEngines.length > 0 ? (
        <div className="sim-upgrade-foot">
          <span>
            You’re on <strong>{tier.name}</strong> — {lockedEngines.join(", ")} simulation is locked.
          </span>
          <Link href="/pricing" className="primary-button sim-foot-button">
            Unlock all engines <ArrowRightIcon className="button-icon" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
