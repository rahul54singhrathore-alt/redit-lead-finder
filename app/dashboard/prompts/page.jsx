"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  TrophyIcon,
  XIcon,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient, isMissingSupabaseTableError } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

const STARTER_PROMPTS = [
  "best AI visibility tool",
  "best influencer marketing platform",
  "best SEO software",
  "best GEO tool",
];

async function checkVisibility(prompt, brand) {
  const response = await fetch("/api/visibility-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, brand }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Visibility check failed.");
  return data;
}

function timeAgo(iso) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

// Compares the two most recent mentioned ranks. Lower rank number = better,
// so a drop in rank number is an improvement (up).
function rankDelta(snapshots = []) {
  const ranked = snapshots.filter((s) => s.mentioned && s.rank != null);
  if (ranked.length < 2) return null;
  const [latest, previous] = ranked;
  const change = previous.rank - latest.rank; // +ve = moved up
  if (change === 0) return { dir: "same", amount: 0 };
  return { dir: change > 0 ? "up" : "down", amount: Math.abs(change) };
}

export default function PromptsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({}); // by prompt id
  const [history, setHistory] = useState({}); // by lowercased prompt -> [snapshots desc]
  const [engineStatus, setEngineStatus] = useState(null);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const tierKey = profile?.subscription_tier || "free";
  const brandRaw = profile?.product_name || profile?.starter_keyword || "Your brand";
  const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);

  // Persist a rank snapshot so we can track movement over time.
  const saveSnapshot = useCallback(
    async (prompt, data) => {
      if (!supabase || !user) return;
      const row = {
        user_id: user.id,
        prompt,
        rank: data.rank ?? null,
        total: data.total ?? null,
        score: data.score ?? 0,
        mentioned: Boolean(data.mentioned),
      };
      const { data: saved, error } = await supabase
        .from("prompt_rank_history")
        .insert(row)
        .select("rank, total, score, mentioned, checked_at")
        .single();
      if (error || !saved) return;
      setHistory((current) => {
        const key = prompt.toLowerCase();
        return { ...current, [key]: [saved, ...(current[key] || [])] };
      });
    },
    [supabase, user],
  );

  const runCheck = useCallback(
    async (item) => {
      setResults((current) => ({ ...current, [item.id]: { status: "loading" } }));
      try {
        const data = await checkVisibility(item.prompt, brand);
        setResults((current) => ({ ...current, [item.id]: { status: "done", data } }));
        saveSnapshot(item.prompt, data);
      } catch (error) {
        setResults((current) => ({ ...current, [item.id]: { status: "error", error: error.message } }));
      }
    },
    [brand, saveSnapshot],
  );

  // Load which AI engines are live vs. falling back to Groq.
  useEffect(() => {
    let active = true;
    fetch("/api/engines-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setEngineStatus(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/signin");
        return;
      }
      setUser(session.user);
      const [{ data: profileData }, promptsResult, historyResult] = await Promise.all([
        supabase.from("user_profiles").select("*").maybeSingle(),
        supabase.from("tracked_prompts").select("id, prompt").order("created_at", { ascending: false }),
        supabase
          .from("prompt_rank_history")
          .select("prompt, rank, total, score, mentioned, checked_at")
          .order("checked_at", { ascending: false })
          .limit(300),
      ]);
      if (profileData) setProfile(normalizeWorkspaceProfile(profileData));
      setPrompts(promptsResult.error ? [] : promptsResult.data || []);

      const grouped = {};
      (historyResult?.data || []).forEach((row) => {
        const key = row.prompt.toLowerCase();
        (grouped[key] = grouped[key] || []).push(row);
      });
      setHistory(grouped);
      setLoading(false);
    };
    check();
  }, [router, supabase]);

  // Auto-check any prompt that has no result yet this session.
  useEffect(() => {
    if (loading || !brand) return;
    prompts.forEach((item) => {
      if (!results[item.id] && !String(item.id).startsWith("temp-")) runCheck(item);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, brand, prompts]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const addPrompt = async (event) => {
    event.preventDefault();
    const text = newPrompt.trim();
    if (!text || !user) return;
    if (prompts.some((p) => p.prompt.toLowerCase() === text.toLowerCase())) {
      setNewPrompt("");
      return;
    }
    setNewPrompt("");
    if (!supabase) return;
    const { data, error } = await supabase
      .from("tracked_prompts")
      .insert({ user_id: user.id, prompt: text })
      .select("id, prompt")
      .single();
    if (error) {
      if (isMissingSupabaseTableError(error, "tracked_prompts")) return;
      return;
    }
    setPrompts((current) => [data, ...current]);
    runCheck(data);
  };

  const removePrompt = async (id) => {
    setPrompts((current) => current.filter((p) => p.id !== id));
    setResults((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (supabase && !String(id).startsWith("temp-")) {
      await supabase.from("tracked_prompts").delete().eq("id", id);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="dashboard-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p>Loading...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Prompt Rank Tracker</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>
                Like keyword ranks for SEO — track where {brand} ranks for each prompt, and watch it move.
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            <EngineStatusBar status={engineStatus} />

            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>Tracked prompts</h2>
                  <p className="card-supporting-copy">Add the prompts your buyers ask AI — we re-check the rank each time.</p>
                </div>
                <span className="pricing-badge">{prompts.length} tracked</span>
              </div>

              <form className="competitor-add-form" onSubmit={addPrompt}>
                <input
                  className="form-input"
                  value={newPrompt}
                  onChange={(event) => setNewPrompt(event.target.value)}
                  placeholder="e.g., best AI visibility tool"
                  aria-label="Prompt"
                />
                <button type="submit" className="primary-button">
                  <PlusIcon className="button-icon" /> Track
                </button>
              </form>

              {prompts.length === 0 ? (
                <div className="prompt-starters">
                  <span>Try one:</span>
                  {STARTER_PROMPTS.map((sample) => (
                    <button key={sample} type="button" className="sim-chip" onClick={() => setNewPrompt(sample)}>
                      {sample}
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            {prompts.map((item) => {
              const result = results[item.id];
              const snapshots = history[item.prompt.toLowerCase()] || [];
              const delta = rankDelta(snapshots);
              const lastChecked = snapshots[0]?.checked_at;
              return (
                <section key={item.id} className="dashboard-card prompt-result-card">
                  <div className="card-header">
                    <h2 className="prompt-result-title">“{item.prompt}”</h2>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="prompt-remove"
                        onClick={() => runCheck(item)}
                        disabled={result?.status === "loading"}
                        aria-label="Re-check rank"
                        title="Re-check rank"
                      >
                        <RefreshCwIcon className={result?.status === "loading" ? "spin" : undefined} />
                      </button>
                      <button type="button" className="prompt-remove" onClick={() => removePrompt(item.id)} aria-label="Stop tracking">
                        <XIcon />
                      </button>
                    </div>
                  </div>

                  {!result || result.status === "loading" ? (
                    <p className="card-supporting-copy">Checking rank…</p>
                  ) : result.status === "error" ? (
                    <p className="card-supporting-copy" style={{ color: "#dc2626" }}>{result.error}</p>
                  ) : (
                    <>
                      <RankRow data={result.data} delta={delta} lastChecked={lastChecked} />
                      <PromptDetail brand={brand} data={result.data} />
                    </>
                  )}
                </section>
              );
            })}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Rank-tracker header: current rank, movement since last check, score, last checked.
function RankRow({ data, delta, lastChecked }) {
  const isFirst = data.rank === 1;
  return (
    <div className="rank-row">
      <div className="rank-main">
        <span className={`rank-badge${isFirst ? " rank-badge-first" : ""}${!data.mentioned ? " rank-badge-none" : ""}`}>
          {isFirst ? <TrophyIcon /> : null}
          {data.mentioned ? `#${data.rank}` : "Not ranked"}
        </span>
        {data.mentioned ? <span className="rank-total">of {data.total}</span> : null}
        {delta ? (
          <span className={`rank-delta rank-delta-${delta.dir}`}>
            {delta.dir === "up" ? <ArrowUpIcon /> : delta.dir === "down" ? <ArrowDownIcon /> : <MinusIcon />}
            {delta.dir === "same" ? "no change" : delta.amount}
          </span>
        ) : (
          <span className="rank-delta rank-delta-new">new</span>
        )}
      </div>
      <div className="rank-meta">
        <span className="rank-score">{data.score}<small>/100</small></span>
        <span className="rank-checked">Checked {timeAgo(lastChecked)}</span>
      </div>
    </div>
  );
}

// Connection status for the four AI engines: which are wired to their own
// provider key (live) vs. answered by the Groq fallback.
function EngineStatusBar({ status }) {
  if (!status?.engines) return null;
  const liveCount = status.engines.filter((e) => e.live).length;
  return (
    <section className="engine-status">
      <div className="engine-status-head">
        <span className="engine-status-title">AI engines</span>
        <span className="engine-status-count">
          {liveCount}/{status.engines.length} live
        </span>
      </div>
      <div className="engine-status-list">
        {status.engines.map((e) => (
          <div
            key={e.key}
            className={`engine-status-item${e.live ? " engine-status-item-live" : ""}`}
            title={
              e.live
                ? `Live · ${e.provider} · ${e.model}`
                : `Falling back to Groq. Add ${e.envVar} to go live.`
            }
          >
            <span className={`engine-status-dot${e.live ? " engine-status-dot-live" : ""}`} />
            <span className="engine-status-name">{e.label}</span>
            <span className="engine-status-state">{e.live ? "live" : "fallback"}</span>
          </div>
        ))}
      </div>
      {liveCount === 0 ? (
        <p className="engine-status-hint">
          All engines are using the Groq fallback. Add a provider key (e.g.{" "}
          <code>ANTHROPIC_API_KEY</code>) to make an engine genuinely live.
        </p>
      ) : null}
    </section>
  );
}

// Per-engine breakdown: real rank on each AI engine, with a live vs. fallback
// indicator so it's clear which engines are wired to their own provider.
function EngineBreakdown({ engines }) {
  if (!Array.isArray(engines) || engines.length === 0) return null;
  return (
    <div className="engine-grid">
      {engines.map((e) => (
        <div
          key={e.key}
          className={`engine-chip${e.live ? " engine-chip-live" : ""}${e.error && !e.backend ? " engine-chip-down" : ""}`}
          title={e.error ? `Error: ${e.error}` : e.backend ? `Source: ${e.backend}` : ""}
        >
          <span className="engine-chip-name">{e.label}</span>
          <span className={`engine-chip-rank${e.mentioned ? "" : " engine-chip-rank-none"}`}>
            {e.error && !e.backend ? "—" : e.mentioned ? `#${e.rank}` : "Not ranked"}
          </span>
          <span className="engine-chip-tag">{e.live ? "live" : e.backend ? "fallback" : "offline"}</span>
        </div>
      ))}
    </div>
  );
}

function PromptDetail({ brand, data }) {
  return (
    <>
      <EngineBreakdown engines={data.engines} />

      {Array.isArray(data.brandsInOrder) && data.brandsInOrder.length > 0 ? (
        <ol className="prompt-brand-list">
          {data.brandsInOrder.map((name, index) => {
            const isBrand =
              name.trim().toLowerCase().includes(brand.trim().toLowerCase()) ||
              brand.trim().toLowerCase().includes(name.trim().toLowerCase());
            return (
              <li key={`${name}-${index}`} className={isBrand ? "prompt-brand-mine" : undefined}>
                <span className="prompt-brand-rank">{index + 1}</span>
                {name}
              </li>
            );
          })}
        </ol>
      ) : null}

      {data.answer ? (
        <details className="prompt-answer">
          <summary>What AI said</summary>
          <p>{data.answer}</p>
        </details>
      ) : null}
    </>
  );
}
