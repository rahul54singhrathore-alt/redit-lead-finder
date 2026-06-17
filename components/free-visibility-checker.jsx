"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, SearchIcon, SparklesIcon, TrophyIcon, ZapIcon, AlertCircleIcon, CheckCircleIcon, InfoIcon } from "lucide-react";

const PRIORITY_ICON = {
  High: AlertCircleIcon,
  Medium: InfoIcon,
  Low: CheckCircleIcon,
};

export function FreeVisibilityChecker() {
  const [brand, setBrand] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async (event) => {
    event.preventDefault();
    const cleanBrand = brand.trim();
    const cleanPrompt = prompt.trim() || `best ${cleanBrand} alternatives`;
    if (!cleanBrand) return;

    setError("");
    setResult(null);
    setChecking(true);

    try {
      const res = await fetch("/api/visibility-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: cleanBrand, prompt: cleanPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Check failed. Please try again.");
        return;
      }
      setResult({ ...data, promptUsed: cleanPrompt });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const scoreClass = result
    ? result.score >= 60 ? "score-good" : result.score >= 35 ? "score-mid" : "score-low"
    : "";

  return (
    <section className="checker" id="check">
      <div className="checker-intro">
        <span className="checker-eyebrow">
          <SparklesIcon /> Free AI visibility check
        </span>
        <h2>Are AI engines recommending you or your competitors?</h2>
        <p>
          Enter your brand and the prompt your buyers use — we&apos;ll query
          ChatGPT, Gemini, Claude, and Perplexity live and return your real rank.
        </p>

        <form className="checker-form" onSubmit={handleCheck}>
          <div className="checker-field">
            <label htmlFor="checker-brand">Your brand</label>
            <input
              id="checker-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Oras"
              autoComplete="off"
            />
          </div>
          <div className="checker-field">
            <label htmlFor="checker-prompt">Buyer prompt <span>(optional)</span></label>
            <input
              id="checker-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`e.g., best GEO tracking tools`}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="checker-submit" disabled={checking || !brand.trim()}>
            {checking ? (
              <><ZapIcon className="checker-spin" /> Querying AI engines…</>
            ) : (
              <><SearchIcon /> Check visibility</>
            )}
          </button>
          {error ? <p className="checker-brand-error">{error}</p> : null}
        </form>
      </div>

      <div className="checker-result-panel">
        {!result && !checking ? (
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
                {["ChatGPT", "Gemini", "Claude", "Perplexity"].map((engine, i) => (
                  <div key={engine} className="checker-preview-pill" style={{ animationDelay: `${i * 0.12}s` }}>
                    <span>{engine}</span>
                    <strong>#{(i % 3) + 1}</strong>
                  </div>
                ))}
              </div>
            </div>
            <p className="checker-preview-hint">
              👆 Enter your brand to see your <strong>real</strong> AI rank.
            </p>
            <div className="checker-preview-brands">
              <span>Live queries to</span>
              <em>ChatGPT · Gemini · Claude · Perplexity</em>
            </div>
          </div>
        ) : checking ? (
          <div className="checker-loading">
            <div className="checker-loading-dots">
              {["ChatGPT", "Gemini", "Claude", "Perplexity"].map((e, i) => (
                <div key={e} className="checker-loading-engine" style={{ animationDelay: `${i * 0.18}s` }}>
                  <span className="checker-loading-dot" />
                  <span>{e}</span>
                </div>
              ))}
            </div>
            <p>Querying all 4 AI engines in real time…</p>
          </div>
        ) : result ? (
          <div className="checker-result">
            <div className="checker-score-head">
              <div className={`checker-score-ring ${scoreClass}`}>
                <strong>{result.score}</strong>
                <span>/100</span>
              </div>
              <div className="checker-verdict">
                <h3>{result.brand}&apos;s GEO Score</h3>
                {result.mentionedCount > 0 ? (
                  <p className="checker-verdict-good">
                    Mentioned on <strong>{result.mentionedCount}/{result.engineCount}</strong> AI engines.
                  </p>
                ) : (
                  <p className="checker-verdict-bad">
                    Not found on any AI engine for this prompt.
                  </p>
                )}
                <small className="checker-prompt-used">Prompt: &ldquo;{result.promptUsed}&rdquo;</small>
              </div>
            </div>

            <div className="checker-engines">
              {(result.engines || []).map((engine) => (
                <div key={engine.key} className="checker-engine">
                  <span>
                    {engine.label}
                    {!engine.live && <em className="checker-engine-sim"> (sim)</em>}
                  </span>
                  <strong className={engine.mentioned ? "checker-rank-win" : "checker-rank-miss"}>
                    {engine.mentioned ? <><TrophyIcon />#{engine.rank}</> : "—"}
                  </strong>
                </div>
              ))}
            </div>

            {result.recommendations?.length > 0 && (
              <div className="checker-recs">
                <h4 className="checker-recs-title">What to fix for {result.brand}</h4>
                <div className="checker-recs-list">
                  {result.recommendations.map((rec, i) => {
                    const Icon = PRIORITY_ICON[rec.priority] || InfoIcon;
                    return (
                      <div key={i} className={`checker-rec checker-rec-${rec.priority.toLowerCase()}`}>
                        <Icon className="checker-rec-icon" />
                        <div>
                          <strong>{rec.title}</strong>
                          <p>{rec.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="checker-signup-cta">
                  <div>
                    <strong>Track {result.brand} daily — free</strong>
                    <span>Get alerts when your AI ranking changes across all 4 engines.</span>
                  </div>
                  <Link href="/signin" className="checker-cta">
                    Start monitoring <ArrowRightIcon />
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
