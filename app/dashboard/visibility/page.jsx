"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, RefreshCwIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

const ENGINES = [
  {
    name: "ChatGPT",
    color: "#10a37f",
    bg: "rgba(16,163,127,0.08)",
    description: "Largest user base — highest impact on brand awareness.",
  },
  {
    name: "Gemini",
    color: "#4285f4",
    bg: "rgba(66,133,244,0.08)",
    description: "Google's AI — critical for search-adjacent visibility.",
  },
  {
    name: "Claude",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    description: "Preferred by technical and B2B audiences.",
  },
  {
    name: "Perplexity",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    description: "Research-focused users — high purchase intent.",
  },
];

function scoreLabel(score) {
  if (score >= 75) return { text: "Strong", color: "#22c55e" };
  if (score >= 50) return { text: "Growing", color: "#f59e0b" };
  return { text: "Low", color: "#ef4444" };
}

function EngineCard({ name, score, color, bg, description }) {
  const label = scoreLabel(score);
  return (
    <div className="vis-engine-card" style={{ borderColor: `${color}30` }}>
      <div className="vis-engine-card-header" style={{ background: bg }}>
        <div className="vis-engine-dot" style={{ background: color }} />
        <strong>{name}</strong>
        <span className="vis-engine-score-pill" style={{ color, background: `${color}15` }}>
          {score}
        </span>
      </div>
      <div className="vis-engine-card-body">
        <div className="vis-engine-bar-wrap">
          <div className="vis-engine-bar-track">
            <div
              className="vis-engine-bar-fill"
              style={{ width: `${score}%`, background: color }}
            />
          </div>
          <span className="vis-engine-bar-label" style={{ color: label.color }}>{label.text}</span>
        </div>
        <p className="vis-engine-desc">{description}</p>
      </div>
    </div>
  );
}

export default function VisibilityPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scan, setScan] = useState({ status: "idle" });
  const router = useRouter();
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

  const tierKey = profile?.subscription_tier || "free";
  const brandRaw = profile?.product_name || profile?.starter_keyword || "Your brand";
  const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
  const category = profile?.industry || profile?.brand_description || "";

  const runScan = async () => {
    setScan({ status: "loading" });
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
          <div className="dashboard-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p>Loading...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const data = scan.data;
  const up = data ? data.trend >= 0 : true;
  const weakestEngine = data
    ? [...data.engines].sort((a, b) => a.score - b.score)[0]
    : null;
  const strongestEngine = data
    ? [...data.engines].sort((a, b) => b.score - a.score)[0]
    : null;

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Visibility</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>
                How {brand} appears across the major AI engines.
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

          <div className="dashboard-content">

            {/* Hero strip */}
            {scan.status === "done" ? (
              <div className="vis-hero-strip">
                <div className="vis-hero-stat">
                  <span className="vis-hero-number">{data.overall}</span>
                  <span className="vis-hero-label">Overall score</span>
                </div>
                <div className="vis-hero-divider" />
                <div className="vis-hero-stat">
                  <span className={`vis-hero-number${up ? " vis-hero-up" : " vis-hero-down"}`}>
                    {up ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    {up ? "+" : ""}{data.trend}%
                  </span>
                  <span className="vis-hero-label">30-day trend</span>
                </div>
                <div className="vis-hero-divider" />
                <div className="vis-hero-stat">
                  <span className="vis-hero-number">{data.shareOfVoice}%</span>
                  <span className="vis-hero-label">Share of voice</span>
                </div>
                <div className="vis-hero-divider" />
                <div className="vis-hero-stat">
                  <span className="vis-hero-number">{data.mentions}</span>
                  <span className="vis-hero-label">Brand mentions</span>
                </div>
                <div className="vis-hero-divider" />
                <div className="vis-hero-stat">
                  <span className="vis-hero-number">{data.citations}</span>
                  <span className="vis-hero-label">Citations</span>
                </div>
              </div>
            ) : scan.status === "loading" ? (
              <div className="vis-hero-strip vis-hero-strip-loading">
                <RefreshCwIcon className="spin" />
                <span>Scanning {brand} across AI engines…</span>
              </div>
            ) : null}

            {/* Engine cards */}
            {scan.status === "done" ? (
              <section className="dashboard-card">
                <div className="card-header">
                  <div>
                    <h2>Per-engine breakdown</h2>
                    <p className="card-supporting-copy">Estimated visibility score for each AI platform (0–100).</p>
                  </div>
                </div>
                <div className="vis-engine-grid">
                  {data.engines.map((engine) => {
                    const meta = ENGINES.find((e) => e.name === engine.name) || {};
                    return (
                      <EngineCard
                        key={engine.name}
                        name={engine.name}
                        score={engine.score}
                        color={meta.color || "#71717a"}
                        bg={meta.bg || "#f4f4f5"}
                        description={meta.description || ""}
                      />
                    );
                  })}
                </div>
              </section>
            ) : null}

            {/* Insight card */}
            {scan.status === "done" && weakestEngine && strongestEngine ? (
              <section className="dashboard-card vis-insight-card">
                <h2>Quick insight</h2>
                <div className="vis-insights">
                  <div className="vis-insight-item vis-insight-win">
                    <strong>Strongest: {strongestEngine.name}</strong>
                    <p>
                      Score of {strongestEngine.score} — {brand} is well-represented here.
                      Focus on maintaining quality content that reinforces this engine's training signals.
                    </p>
                  </div>
                  <div className="vis-insight-item vis-insight-gap">
                    <strong>Biggest gap: {weakestEngine.name}</strong>
                    <p>
                      Score of {weakestEngine.score} — this is your highest-leverage opportunity.
                      Publishing content that aligns with {weakestEngine.name}&apos;s citation patterns can move this the fastest.
                    </p>
                    <Link href="/dashboard/recommendations" className="vis-insight-link">
                      Get specific actions <ArrowRightIcon />
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}

            {scan.status === "error" ? (
              <section className="dashboard-card">
                <div className="vis-empty">
                  <p>{scan.error}</p>
                  <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>
                    Try again
                  </button>
                </div>
              </section>
            ) : null}

            {scan.status === "done" ? (
              <p className="vis-disclaimer">Figures are informed AI estimates, not live-measured per engine.</p>
            ) : null}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
