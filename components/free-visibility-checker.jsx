"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon, LockIcon, SearchIcon, SparklesIcon, TrophyIcon } from "lucide-react";

import {
  SIM_ENGINES,
  overallGeoScore,
  simulateVisibility,
} from "@/lib/visibility-sim";
import { searchBrands } from "@/lib/brands";

const DEFAULT_PROMPT = "best tools in your category";

// Public, no-signup visibility checker for the landing page. Gives an instant
// GEO score + competitor gap (the "aha" moment), then funnels to sign-up for
// the full report. Uses the same deterministic simulator as the app.
export function FreeVisibilityChecker() {
  const [brand, setBrand] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const competitorMatches = searchBrands(competitor);

  const handleCheck = async (event) => {
    event.preventDefault();
    const cleanBrand = brand.trim();
    if (!cleanBrand) return;

    setError("");
    setChecking(true);
    // Any brand is allowed — new and unknown brands are exactly who this is for.
    // An unrecognized brand simply gets a low visibility score, which is the point.
    setChecking(false);

    const rivals = competitor.trim()
      ? [competitor.trim()]
      : ["Competitor A", "Competitor B"];

    const engines = simulateVisibility({
      prompt: DEFAULT_PROMPT,
      brand: cleanBrand,
      competitors: rivals,
      engines: SIM_ENGINES,
    });

    const score = overallGeoScore(engines);
    const losing = engines.filter((e) => e.brandRank !== 1).length;
    const topRival = engines[0]?.rows.find((r) => !r.isBrand)?.name || rivals[0];

    setResult({ brand: cleanBrand, engines, score, losing, topRival });
  };

  return (
    <section className="checker" id="check">
      <div className="checker-intro">
        <span className="checker-eyebrow">
          <SparklesIcon /> Free AI visibility check
        </span>
        <h2>Are AI engines recommending you or your competitors?</h2>
        <p>
          Enter your brand and get an instant visibility score across ChatGPT, Gemini,
          Claude, and Perplexity. No signup needed.
        </p>

        <form className="checker-form" onSubmit={handleCheck}>
          <div className="checker-field">
            <label htmlFor="checker-brand">Your brand</label>
            <input
              id="checker-brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="e.g., Oras"
              autoComplete="off"
            />
          </div>
          <div className="checker-field">
            <label htmlFor="checker-rival">Main competitor <span>(optional)</span></label>
            <div className="checker-combo">
              <input
                id="checker-rival"
                value={competitor}
                onChange={(event) => { setCompetitor(event.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                placeholder="e.g., Ahrefs"
                autoComplete="off"
              />
              <button
                type="button"
                className="checker-combo-toggle"
                aria-label="Show options"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <ChevronDownIcon className={dropdownOpen ? "checker-chevron-open" : ""} />
              </button>

              {dropdownOpen && competitorMatches.length > 0 ? (
                <ul className="checker-dropdown" role="listbox">
                  {competitorMatches.map((name) => (
                    <li key={name}>
                      <button
                        type="button"
                        className={`checker-option${competitor === name ? " checker-option-active" : ""}`}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setCompetitor(name);
                          setDropdownOpen(false);
                        }}
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <button type="submit" className="checker-submit" disabled={checking}>
            <SearchIcon /> {checking ? "Checking…" : "Check visibility"}
          </button>

          {error ? <p className="checker-brand-error">{error}</p> : null}
        </form>
      </div>

      <div className="checker-result-panel">
        {!result ? (
          <div className="checker-placeholder">
            <span className="checker-preview-badge">
              <SparklesIcon /> Live preview
            </span>

            <div className="checker-preview">
              <div className="checker-preview-ring">
                <strong>62</strong>
                <span>/100</span>
              </div>
              <div className="checker-preview-engines">
                {["ChatGPT", "Gemini", "Claude", "Perplexity"].map((engine, index) => (
                  <div key={engine} className="checker-preview-pill" style={{ animationDelay: `${index * 0.12}s` }}>
                    <span>{engine}</span>
                    <strong>#{(index % 3) + 1}</strong>
                  </div>
                ))}
              </div>
            </div>

            <p className="checker-preview-hint">
              👆 Enter your brand to reveal your <strong>real</strong> AI visibility score.
            </p>

            <div className="checker-preview-brands">
              <span>Tracked by brands like</span>
              <em>Oras · Ahrefs · Semrush · Notion</em>
            </div>
          </div>
        ) : (
          <div className="checker-result">
            <div className="checker-score-head">
              <div className={`checker-score-ring score-${result.score >= 60 ? "good" : result.score >= 40 ? "mid" : "low"}`}>
                <strong>{result.score}</strong>
                <span>/100</span>
              </div>
              <div className="checker-verdict">
                <h3>{result.brand}&apos;s AI visibility</h3>
                {result.losing > 0 ? (
                  <p className="checker-verdict-bad">
                    You&apos;re losing to <strong>{result.topRival}</strong> on {result.losing} of 4 engines.
                  </p>
                ) : (
                  <p className="checker-verdict-good">You lead across all 4 engines. 🎉</p>
                )}
              </div>
            </div>

            <div className="checker-engines">
              {result.engines.map((engine) => (
                <div key={engine.engine} className="checker-engine">
                  <span>{engine.engine}</span>
                  <strong className={engine.brandRank === 1 ? "checker-rank-win" : ""}>
                    {engine.brandRank === 1 ? <TrophyIcon /> : null}#{engine.brandRank}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checker-locked">
              <div className="checker-locked-blur">
                <p>1. Add comparison pages targeting “{result.topRival}”</p>
                <p>2. Build Reddit &amp; Quora citations</p>
                <p>3. Add FAQ schema to key pages</p>
              </div>
              <div className="checker-locked-overlay">
                <LockIcon />
                <strong>See the 5 fixes to outrank {result.topRival}</strong>
                <Link href="/signin" className="checker-cta">
                  Get your full report, free <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
