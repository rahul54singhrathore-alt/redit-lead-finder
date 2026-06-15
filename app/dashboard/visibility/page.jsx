"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  RefreshCwIcon,
  SearchIcon,
  TrendingUpIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

const ENGINE_META = {
  chatgpt:    { color: "#10a37f", bg: "rgba(16,163,127,0.08)",  label: "ChatGPT",    tagline: "Largest user base — highest brand awareness impact." },
  gemini:     { color: "#4285f4", bg: "rgba(66,133,244,0.08)",  label: "Gemini",     tagline: "Google's AI — critical for search-adjacent discovery." },
  claude:     { color: "#d97706", bg: "rgba(217,119,6,0.08)",   label: "Claude",     tagline: "Technical and B2B audiences prefer this engine." },
  perplexity: { color: "#7c3aed", bg: "rgba(124,58,237,0.08)",  label: "Perplexity", tagline: "Research-driven users with high purchase intent." },
};
const ENGINE_ORDER = ["chatgpt", "gemini", "claude", "perplexity"];

function scoreLabel(score) {
  if (score >= 75) return { text: "Strong",  color: "#16a34a" };
  if (score >= 40) return { text: "Growing", color: "#d97706" };
  return                { text: "Low",     color: "#dc2626" };
}

export default function VisibilityPage() {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scan, setScan]       = useState({ status: "idle" });
  const [openPrompt, setOpenPrompt] = useState(null);
  const router  = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/signin"); return; }
      setUser(session.user);
      const { data } = await supabase.from("user_profiles").select("*").maybeSingle();
      if (data) setProfile(normalizeWorkspaceProfile(data));
      setLoading(false);
    };
    check();
  }, [router, supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const tierKey  = profile?.subscription_tier || "free";
  const brandRaw = profile?.product_name || profile?.starter_keyword || "Your brand";
  const brand    = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
  const category = profile?.industry || profile?.brand_description || "";

  const runScan = async () => {
    setScan({ status: "loading" });
    setOpenPrompt(null);
    try {
      const response = await fetch("/api/visibility-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, category }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Scan failed.");
      setScan({ status: "done", data });
    } catch (error) {
      setScan({ status: "error", error: error.message });
    }
  };

  useEffect(() => {
    if (!loading && brand && scan.status === "idle") runScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, brand]);

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="dashboard-main">
            <div className="page-loader"><div className="page-loader-ring" /></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const data = scan.data;
  const weakest  = data ? [...data.engines].sort((a, b) => a.score  - b.score)[0]  : null;
  const strongest = data ? [...data.engines].sort((a, b) => b.score - a.score)[0]  : null;

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main">

          {/* Header */}
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Visibility</h1>
              <p className="page-subtitle">
                What AI engines actually say about <strong>{brand}</strong> — real queries, real answers.
              </p>
            </div>
            <button
              type="button"
              className="action-button vis-refresh-btn"
              onClick={runScan}
              disabled={scan.status === "loading"}
            >
              <RefreshCwIcon className={scan.status === "loading" ? "button-icon spin" : "button-icon"} />
              {scan.status === "loading" ? "Scanning…" : "Refresh"}
            </button>
          </div>

          <div className="dashboard-content">

            {/* Loading */}
            {scan.status === "loading" && (
              <div className="vis-loading-card">
                <div className="vis-loading-ring">
                  <RefreshCwIcon className="spin" />
                </div>
                <p className="vis-loading-title">Running AI visibility checks…</p>
                <p className="vis-loading-sub">Querying ChatGPT, Gemini, Claude &amp; Perplexity with 3 prompts each</p>
                <div className="vis-loading-engines">
                  {ENGINE_ORDER.map((k) => (
                    <span key={k} className="vis-loading-engine-dot" style={{ background: ENGINE_META[k].color }} />
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {scan.status === "error" && (
              <section className="dashboard-card">
                <div className="vis-empty">
                  <p>{scan.error}</p>
                  <button type="button" className="geo-build-cta action-button" onClick={runScan}>Try again</button>
                </div>
              </section>
            )}

            {scan.status === "done" && (
              <>
                {/* Hero strip */}
                <div className="vis-hero-strip">
                  <div className="vis-hero-stat">
                    <span className={`vis-hero-number ${data.mentionedCount > 0 ? "vis-hero-number-positive" : "vis-hero-number-negative"}`}>
                      {data.mentionedCount}/{data.engineCount}
                    </span>
                    <span className="vis-hero-label">Engines that mention you</span>
                  </div>
                  <div className="vis-hero-divider" />
                  <div className="vis-hero-stat">
                    <span className="vis-hero-number">
                      {data.bestRank ? `#${data.bestRank}` : "—"}
                    </span>
                    <span className="vis-hero-label">Best rank across engines</span>
                  </div>
                  <div className="vis-hero-divider" />
                  <div className="vis-hero-stat">
                    <span className="vis-hero-number">{data.overall}</span>
                    <span className="vis-hero-label">Overall score</span>
                  </div>
                  <div className="vis-hero-divider" />
                  <div className="vis-hero-stat">
                    <span className="vis-hero-number">{data.totalChecks}</span>
                    <span className="vis-hero-label">AI checks run</span>
                  </div>
                  <div className="vis-hero-divider" />
                  <div className="vis-hero-stat">
                    <span className={`vis-hero-number ${data.liveCount > 0 ? "vis-hero-number-live" : "vis-hero-number-muted"}`}>
                      {data.liveCount > 0 ? `${data.liveCount} live` : "Groq fallback"}
                    </span>
                    <span className="vis-hero-label">Engine mode</span>
                  </div>
                </div>

                {/* Per-engine cards */}
                <section className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h2>Per-engine breakdown</h2>
                      <p className="card-supporting-copy">
                        What each AI engine says about {brand} — and where it ranks.
                      </p>
                    </div>
                  </div>
                  <div className="vis-engine-grid">
                    {ENGINE_ORDER.map((key) => {
                      const engine = data.engines?.find((e) => e.key === key);
                      const meta   = ENGINE_META[key];
                      if (!engine) return null;
                      const label  = scoreLabel(engine.score);
                      return (
                        <div
                          key={key}
                          className={`vis-engine-card vis-engine-${key}`}
                        >
                          <div className="vis-engine-card-header">
                            <div className="vis-engine-dot" />
                            <strong>{meta.label}</strong>
                            <span className="vis-engine-score-pill">
                              {engine.score}
                            </span>
                          </div>
                          <div className="vis-engine-card-body">
                            {/* Status */}
                            <div className="vis-engine-status">
                              {engine.mentioned ? (
                                <span className="vis-engine-status-yes">
                                  <CheckCircle2Icon /> Mentioned — rank #{engine.rank ?? "?"}
                                  {engine.mentionCount < engine.totalPrompts &&
                                    ` (${engine.mentionCount}/${engine.totalPrompts} prompts)`}
                                </span>
                              ) : (
                                <span className="vis-engine-status-no">
                                  <XCircleIcon /> Not found in any query
                                </span>
                              )}
                            </div>
                            {/* Score bar */}
                            <div className="vis-engine-bar-wrap">
                              <div className="vis-engine-bar-track">
                                <div className="vis-engine-bar-fill" style={{ width: `${engine.score}%` }} />
                              </div>
                              <span className={`vis-engine-bar-label vis-bar-label-${label.text.toLowerCase()}`}>{label.text}</span>
                            </div>
                            {/* Answer quote */}
                            {engine.answer ? (
                              <blockquote className="vis-engine-answer">
                                &ldquo;{engine.answer.slice(0, 140)}{engine.answer.length > 140 ? "…" : ""}&rdquo;
                              </blockquote>
                            ) : (
                              <p className="vis-engine-desc vis-engine-no-answer">
                                {engine.mentioned ? meta.tagline : `${meta.label} did not include ${brand} in its answers.`}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Prompts tested */}
                <section className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h2><SearchIcon className="vis-icon-sm" /> Prompts tested</h2>
                      <p className="card-supporting-copy">The real queries used to check {brand}&apos;s AI visibility.</p>
                    </div>
                  </div>
                  <div className="vis-prompt-list">
                    {data.prompts?.map((p, i) => (
                      <div key={i} className={`vis-prompt-row${openPrompt === i ? " vis-prompt-open" : ""}`}>
                        <button
                          type="button"
                          className="vis-prompt-toggle"
                          onClick={() => setOpenPrompt(openPrompt === i ? null : i)}
                        >
                          <span className={`vis-prompt-icon${p.mentioned ? " vis-prompt-icon-yes" : " vis-prompt-icon-no"}`}>
                            {p.mentioned ? <CheckCircle2Icon /> : <XCircleIcon />}
                          </span>
                          <span className="vis-prompt-text">&ldquo;{p.prompt}&rdquo;</span>
                          <span className="vis-prompt-engines">
                            {ENGINE_ORDER.map((k) => {
                              const e = p.engines?.find((e) => e.key === k);
                              return (
                                <span
                                  key={k}
                                  className="vis-prompt-dot"
                                  style={{ background: e?.mentioned ? ENGINE_META[k].color : "#e4e4e7" }}
                                  title={e?.mentioned ? `${ENGINE_META[k].label} #${e.rank}` : `${ENGINE_META[k].label} — not mentioned`}
                                />
                              );
                            })}
                          </span>
                          <span className="vis-prompt-count">{p.mentionedCount}/{p.engines?.length ?? 4}</span>
                          <ChevronDownIcon className={`vis-prompt-chevron${openPrompt === i ? " vis-prompt-chevron-open" : ""}`} />
                        </button>
                        {openPrompt === i && (
                          <div className="vis-prompt-detail">
                            {ENGINE_ORDER.map((k) => {
                              const e = p.engines?.find((e) => e.key === k);
                              const meta = ENGINE_META[k];
                              return (
                                <div key={k} className={`vis-prompt-engine-row${e?.mentioned ? " vis-prompt-engine-hit" : ""}`}>
                                  <span className="vis-prompt-engine-dot" style={{ background: meta.color }} />
                                  <span className="vis-prompt-engine-name">{meta.label}</span>
                                  {e?.mentioned
                                    ? <span className="vis-prompt-rank" style={{ color: meta.color }}>Rank #{e.rank}</span>
                                    : <span className="vis-prompt-miss">not mentioned</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Insights */}
                {weakest && strongest && (
                  <section className="dashboard-card vis-insight-card">
                    <div className="card-header">
                      <h2><TrendingUpIcon className="vis-icon-sm" /> Insights</h2>
                    </div>
                    <div className="vis-insights">
                      <div className="vis-insight-item vis-insight-win">
                        <span className="vis-insight-tag vis-insight-tag-win">Best performing</span>
                        <strong>{strongest.name}</strong>
                        <p>
                          {strongest.mentioned
                            ? `Ranked #${strongest.rank} — ${brand} has strong presence here. Keep content aligned with this engine's citation signals.`
                            : `Score of ${strongest.score} — still an opportunity, but this is your best starting point.`}
                        </p>
                      </div>
                      <div className="vis-insight-item vis-insight-gap">
                        <span className="vis-insight-tag vis-insight-tag-gap">Biggest gap</span>
                        <strong>{weakest.name}</strong>
                        <p>
                          {weakest.mentioned
                            ? `Ranked #${weakest.rank} — room to climb. Publishing content matching ${weakest.name}'s citation patterns can move this fast.`
                            : `Not mentioned yet — this is your highest-leverage opportunity. ${ENGINE_META[weakest.key]?.tagline}`}
                        </p>
                        <Link href="/dashboard/recommendations" className="vis-insight-link">
                          Get specific actions <ArrowRightIcon />
                        </Link>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
