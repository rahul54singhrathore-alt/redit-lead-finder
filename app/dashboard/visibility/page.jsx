"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon, SignalIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

const ENGINE_TONES = {
  ChatGPT: "green",
  Gemini: "blue",
  Claude: "purple",
  Perplexity: "amber",
};

export default function VisibilityPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scan, setScan] = useState({ status: "idle" });
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

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
  const category = profile?.industry || profile?.brand_description || profile?.starter_keyword || "";

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

  // Auto-load once the brand is known.
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
                How visible {brand} is across the major AI engines.
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>
                    <SignalIcon className="vis-title-icon" /> AI Visibility Score
                  </h2>
                  <p className="card-supporting-copy">Estimated visibility across ChatGPT, Gemini, Claude, and Perplexity.</p>
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
                <div className="vis-empty">
                  <p>{scan.error}</p>
                  <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>
                    Try again
                  </button>
                </div>
              ) : scan.status !== "done" ? (
                <div className="vis-empty">
                  <RefreshCwIcon className="spin" />
                  <p>Measuring {brand}’s AI visibility…</p>
                </div>
              ) : (
                <>
                  <div className="vis-hero">
                    <div className="vis-hero-score">
                      <strong>{data.overall}</strong>
                      <span>/ 100</span>
                    </div>
                    <div className={`vis-trend${up ? " vis-trend-up" : " vis-trend-down"}`}>
                      {up ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      {up ? "+" : ""}{data.trend}%
                      <span>last 30 days</span>
                    </div>
                  </div>

                  <div className="vis-engines">
                    {data.engines.map((engine) => (
                      <div key={engine.name} className="vis-engine">
                        <div className="vis-engine-label">
                          <strong>{engine.name}</strong>
                          <span>{engine.score}</span>
                        </div>
                        <div className={`vis-engine-track vis-engine-track-${ENGINE_TONES[engine.name] || "blue"}`}>
                          <span style={{ width: `${engine.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="vis-stats">
                    <div className="vis-stat">
                      <span className="vis-stat-value">{data.shareOfVoice}%</span>
                      <span className="vis-stat-label">Share of voice</span>
                    </div>
                    <div className="vis-stat">
                      <span className="vis-stat-value">{data.mentions}</span>
                      <span className="vis-stat-label">Brand mentions</span>
                    </div>
                    <div className="vis-stat">
                      <span className="vis-stat-value">{data.citations}</span>
                      <span className="vis-stat-label">Citations</span>
                    </div>
                  </div>

                  <p className="vis-disclaimer">Figures are informed AI estimates, not live-measured per engine.</p>
                </>
              )}
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
