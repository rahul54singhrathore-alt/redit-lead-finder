"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  SearchIcon,
  SparklesIcon,
  ZapIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  MessageSquareIcon,
  TrendingUpIcon,
} from "lucide-react";

const ENGINE_META = {
  chatgpt:    { color: "#10a37f", label: "ChatGPT" },
  gemini:     { color: "#4285f4", label: "Gemini" },
  claude:     { color: "#7c3aed", label: "Claude" },
  perplexity: { color: "#f59e0b", label: "Perplexity" },
};

const PRIORITY_ICON = {
  High: AlertCircleIcon,
  Medium: InfoIcon,
  Low: CheckCircleIcon,
};

const PRIORITY_STYLE = {
  High:   { border: "#ef4444", badge: "#fee2e2", badgeText: "#991b1b" },
  Medium: { border: "#f59e0b", badge: "#fef3c7", badgeText: "#78350f" },
  Low:    { border: "#22c55e", badge: "#dcfce7", badgeText: "#166534" },
};

function getGrade(score) {
  if (score >= 70) return { label: "Strong",   color: "#15803d", bg: "#dcfce7", ringColor: "#16a34a" };
  if (score >= 40) return { label: "Growing",  color: "#b45309", bg: "#fef3c7", ringColor: "#f59e0b" };
  return               { label: "Critical", color: "#b91c1c", bg: "#fee2e2", ringColor: "#ef4444" };
}

function barWidth(rank, mentioned) {
  if (!mentioned) return 0;
  return rank === 1 ? 92 : rank === 2 ? 72 : rank === 3 ? 54 : 38;
}

function redditLevel(result) {
  const mentionedReddit = result.recommendations?.some((r) =>
    r.detail?.toLowerCase().includes("reddit"),
  );
  if (!mentionedReddit) return "Low";
  return result.mentionedCount === 0 ? "High" : "Medium";
}

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
            <label htmlFor="checker-prompt">
              Buyer prompt <span>(optional)</span>
            </label>
            <input
              id="checker-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., best GEO tracking tools"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="checker-submit"
            disabled={checking || !brand.trim()}
          >
            {checking ? (
              <>
                <ZapIcon className="checker-spin" /> Querying AI engines…
              </>
            ) : (
              <>
                <SearchIcon /> Check visibility
              </>
            )}
          </button>
          {error ? <p className="checker-brand-error">{error}</p> : null}
        </form>
      </div>

      <div className="checker-result-panel">
        {!result && !checking ? (
          <PlaceholderPreview />
        ) : checking ? (
          <LoadingState />
        ) : result ? (
          <ResultView result={result} />
        ) : null}
      </div>
    </section>
  );
}

/* ─── Placeholder ──────────────────────────────────────────────────────────── */

function PlaceholderPreview() {
  return (
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
            <div
              key={engine}
              className="checker-preview-pill"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
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
  );
}

/* ─── Loading ───────────────────────────────────────────────────────────────── */

function LoadingState() {
  return (
    <div className="checker-loading">
      <div className="checker-loading-dots">
        {["ChatGPT", "Gemini", "Claude", "Perplexity"].map((e, i) => (
          <div
            key={e}
            className="checker-loading-engine"
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            <span className="checker-loading-dot" />
            <span>{e}</span>
          </div>
        ))}
      </div>
      <p>Querying all 4 AI engines in real time…</p>
    </div>
  );
}

/* ─── Result ────────────────────────────────────────────────────────────────── */

function ResultView({ result }) {
  const grade = getGrade(result.score);
  const reddit = redditLevel(result);

  return (
    <div className="checker-result">

      {/* GEO score header */}
      <div className="checker-score-head">
        <div className="checker-score-col">
          <div
            className="checker-score-ring-new"
            style={{ "--ring-color": grade.ringColor }}
          >
            <strong>{result.score}</strong>
            <span>/100</span>
          </div>
          <span
            className="checker-grade-tag"
            style={{ background: grade.bg, color: grade.color }}
          >
            {grade.label}
          </span>
        </div>
        <div className="checker-verdict">
          <h3>{result.brand}&apos;s GEO Score</h3>
          {result.mentionedCount > 0 ? (
            <p className="checker-verdict-good">
              Found on{" "}
              <strong>
                {result.mentionedCount}/{result.engineCount}
              </strong>{" "}
              AI engines
            </p>
          ) : (
            <p className="checker-verdict-bad">
              Not found on any AI engine for this prompt
            </p>
          )}
          <small className="checker-prompt-used">
            Prompt: &ldquo;{result.promptUsed}&rdquo;
          </small>
        </div>
      </div>

      {/* Visibility per engine */}
      <div className="checker-engines-grid">
        <p className="checker-section-label">
          <TrendingUpIcon /> AI Engine Visibility
        </p>
        {(result.engines || []).map((engine) => {
          const meta =
            ENGINE_META[engine.key] || { color: "#71717a", label: engine.label };
          const fill = barWidth(engine.rank, engine.mentioned);
          return (
            <div key={engine.key} className="checker-eng-row">
              <div className="checker-eng-row-top">
                <span
                  className="checker-eng-dot"
                  style={{ background: meta.color }}
                />
                <span className="checker-eng-name">
                  {engine.label}
                  {!engine.live && (
                    <em className="checker-eng-sim"> sim</em>
                  )}
                </span>
                <span
                  className="checker-eng-rank"
                  style={{ color: engine.mentioned ? meta.color : "#a1a1aa" }}
                >
                  {engine.mentioned ? `Rank #${engine.rank}` : "Not mentioned"}
                </span>
              </div>
              <div className="checker-eng-bar-track">
                <div
                  className="checker-eng-bar-fill"
                  style={{ width: `${fill}%`, background: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reddit citation source */}
      <RedditPanel brand={result.brand} level={reddit} />

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <RecommendationsPanel brand={result.brand} recs={result.recommendations} />
      )}
    </div>
  );
}

/* ─── Reddit panel ──────────────────────────────────────────────────────────── */

const REDDIT_COPY = {
  High: (brand) =>
    `${brand} has no Reddit threads AI engines can cite. Answer questions in r/marketing, r/entrepreneur, and relevant subreddits. Perplexity and ChatGPT heavily weight community sources.`,
  Medium: (brand) =>
    `${brand} is visible on some engines but lacks Reddit citations to push higher. Find threads where competitors appear and add authoritative replies mentioning ${brand}.`,
  Low: (brand) =>
    `${brand} has solid community coverage. Keep engaging in relevant subreddits — AI engines re-index Reddit frequently, so staying active protects your ranking.`,
};

const REDDIT_BADGE_STYLE = {
  High:   { background: "#fee2e2", color: "#991b1b" },
  Medium: { background: "#fef3c7", color: "#78350f" },
  Low:    { background: "#dcfce7", color: "#166534" },
};

function RedditPanel({ brand, level }) {
  return (
    <div className="checker-reddit-panel">
      <div className="checker-reddit-top">
        <MessageSquareIcon className="checker-reddit-icon" />
        <span className="checker-reddit-title">Reddit Citation Source</span>
        <span className="checker-reddit-badge" style={REDDIT_BADGE_STYLE[level]}>
          {level} opportunity
        </span>
      </div>
      <p className="checker-reddit-copy">{REDDIT_COPY[level](brand)}</p>
    </div>
  );
}

/* ─── Recommendations panel ─────────────────────────────────────────────────── */

function RecommendationsPanel({ brand, recs }) {
  return (
    <div className="checker-recs">
      <h4 className="checker-recs-title">Recommended actions for {brand}</h4>
      <div className="checker-recs-list">
        {recs.map((rec, i) => {
          const Icon = PRIORITY_ICON[rec.priority] || InfoIcon;
          const style = PRIORITY_STYLE[rec.priority] || PRIORITY_STYLE.Medium;
          return (
            <div
              key={i}
              className="checker-rec-card"
              style={{ borderLeftColor: style.border }}
            >
              <div className="checker-rec-card-top">
                <span
                  className="checker-rec-priority"
                  style={{ background: style.badge, color: style.badgeText }}
                >
                  <Icon className="checker-rec-priority-icon" />
                  {rec.priority}
                </span>
                <strong className="checker-rec-title-text">{rec.title}</strong>
              </div>
              <p className="checker-rec-detail">{rec.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="checker-signup-cta">
        <div>
          <strong>Track {brand} daily — free</strong>
          <span>Get alerts when your AI ranking changes across all 4 engines.</span>
        </div>
        <Link href="/signin" className="checker-cta">
          Start monitoring <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
}
