"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  FileTextIcon,
  LockIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchXIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";
import { getTier, hasFeature } from "../../../lib/subscription";
import {
  buildLeaderboard,
  shareFromLeaderboard,
  suggestCompetitors,
} from "../../../lib/leaderboard";
import { openWhiteLabelReport } from "../../../lib/report-export";
import { ShareOfVoice } from "@/components/share-of-voice";
import { CompetitorEdge } from "@/components/competitor-edge";

// Asks the real /api/visibility-check route, which queries AI with the
// prompt and returns its genuine ranked list of recommended brands.
async function scanVisibility(prompt, brand) {
  const response = await fetch("/api/visibility-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, brand }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Scan failed.");
  return data;
}

export default function CompetitorsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newCompetitor, setNewCompetitor] = useState("");
  // Real AI scan: { status: "loading"|"done"|"error", data, error }
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

  const tierKey = profile?.subscription_tier || "free";
  const unlocked = hasFeature(tierKey, "competitorTracker");
  const canReport = hasFeature(tierKey, "whiteLabelReports");
  const brandRaw = profile?.product_name || profile?.starter_keyword || "Your brand";
  const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
  const competitors = profile?.competitors || [];
  const prompt = profile?.starter_keyword || `best ${brand} alternatives`;

  // One real AI call powers the whole page: ranking, scores, suggestions.
  const runScan = useCallback(async () => {
    if (!brand) return;
    setScan({ status: "loading" });
    try {
      const data = await scanVisibility(prompt, brand);
      setScan({ status: "done", data });
    } catch (error) {
      setScan({ status: "error", error: error.message });
    }
  }, [brand, prompt]);

  // Scan once when the feature is unlocked and we know the brand/prompt.
  useEffect(() => {
    if (!loading && unlocked && brand && scan.status === "idle") {
      runScan();
    }
  }, [loading, unlocked, brand, scan.status, runScan]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const persistCompetitors = async (list) => {
    setProfile((prev) => ({ ...prev, competitors: list }));
    if (supabase && user) {
      await supabase
        .from("user_profiles")
        .update({ competitors: list, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }
  };

  const addCompetitor = (rawName) => {
    const name = rawName.trim();
    if (!name) return;
    const current = profile?.competitors || [];
    if (current.some((c) => c.toLowerCase() === name.toLowerCase())) return;
    persistCompetitors([...current, name]);
  };

  const handleAddCompetitor = (event) => {
    event.preventDefault();
    addCompetitor(newCompetitor);
    setNewCompetitor("");
  };

  const handleRemoveCompetitor = (name) => {
    persistCompetitors((profile?.competitors || []).filter((c) => c !== name));
  };

  const brandsInOrder = scan.data?.brandsInOrder || [];

  // Everything below is derived locally from AI's real ranking — adding or
  // removing a competitor recomputes instantly without another API call.
  const leaderboard = useMemo(
    () => (brandsInOrder.length ? buildLeaderboard({ brandsInOrder, brand, competitors }) : []),
    [brandsInOrder, brand, competitors],
  );
  const sovData = useMemo(() => shareFromLeaderboard(leaderboard), [leaderboard]);
  const suggestions = useMemo(
    () => suggestCompetitors({ brandsInOrder, brand, competitors }),
    [brandsInOrder, brand, competitors],
  );
  const myGeo = scan.data?.score ?? 0;

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

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Competitor Intelligence</h1>
              <p className="page-subtitle">
                Real AI benchmark — we ask AI “{prompt}” and rank {brand} against the brands it recommends.
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            {!unlocked ? (
              <section className="dashboard-card unlock-hero">
                <div className="unlock-hero-icon">
                  <LockIcon />
                </div>
                <h2>Competitor Intelligence is a {getTier("pro").name} feature</h2>
                <p>
                  Unlock a real AI leaderboard, auto-discovered competitors, and head-to-head
                  benchmarking against every brand AI recommends.
                </p>
                <ul className="unlock-benefits">
                  <li><BarChart3Icon /> Real AI visibility leaderboard</li>
                  <li><SparklesIcon /> Auto-suggested competitors</li>
                  <li><FileTextIcon /> Exportable competitor reports</li>
                </ul>
                <Link href="/pricing" className="primary-button">
                  Upgrade to {getTier("pro").name} <ArrowRightIcon className="button-icon" />
                </Link>
              </section>
            ) : (
              <>
                <section className="unlock-welcome">
                  <div className="unlock-welcome-left">
                    <span className="unlock-welcome-tag">✦ {getTier(tierKey).name} unlocked</span>
                    <h2>You’re tracking {competitors.length} competitor{competitors.length === 1 ? "" : "s"}.</h2>
                    <p>Live ranking of {brand} vs competitors, straight from AI.</p>
                    <div className="unlock-welcome-meta">
                      <span className="unlock-welcome-stat">
                        <UsersIcon />
                        {competitors.length} tracked
                      </span>
                      <span className="unlock-welcome-stat">
                        <BarChart3Icon />
                        {scan.status === "done" ? `${leaderboard.length} ranked` : "Scanning…"}
                      </span>
                    </div>
                  </div>
                  <div className="unlock-welcome-score">
                    <div className="unlock-score-ring">
                      <span className="unlock-score-num">{scan.status === "done" ? myGeo : "—"}</span>
                    </div>
                    <small>GEO score</small>
                  </div>
                </section>

                <section className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h2><UsersIcon className="card-header-icon" /> Your competitors</h2>
                      <p className="card-supporting-copy">
                        Add the brands AI recommends instead of you — or pick from AI’s suggestions below.
                      </p>
                    </div>
                    <span className={`ci-tracked-badge${competitors.length > 0 ? " ci-tracked-badge-active" : ""}`}>
                      {competitors.length} tracked
                    </span>
                  </div>

                  <form className="competitor-add-form" onSubmit={handleAddCompetitor}>
                    <input
                      className="form-input"
                      value={newCompetitor}
                      onChange={(event) => setNewCompetitor(event.target.value)}
                      placeholder="e.g., Ahrefs, Semrush, Surfer SEO"
                      aria-label="Competitor name"
                    />
                    <button type="submit" className="primary-button">
                      <PlusIcon className="button-icon" /> Add
                    </button>
                  </form>

                  {competitors.length > 0 ? (
                    <div className="competitor-chip-row">
                      {competitors.map((name) => (
                        <span key={name} className="competitor-chip">
                          {name}
                          <button
                            type="button"
                            onClick={() => handleRemoveCompetitor(name)}
                            aria-label={`Remove ${name}`}
                          >
                            <XIcon />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="competitor-empty-hint">
                      No competitors yet. Add a few, or add AI’s suggestions below.
                    </p>
                  )}

                  {suggestions.length > 0 ? (
                    <div className="competitor-suggest">
                      <span className="competitor-suggest-label">
                        <SparklesIcon /> AI recommends these for “{prompt}”
                      </span>
                      <div className="competitor-suggest-row">
                        {suggestions.map((name) => (
                          <button
                            key={name}
                            type="button"
                            className="competitor-suggest-chip"
                            onClick={() => addCompetitor(name)}
                          >
                            <PlusIcon /> {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h2><BarChart3Icon className="card-header-icon" /> Visibility leaderboard</h2>
                      <p className="card-supporting-copy">Ranked by AI’s real recommendations.</p>
                    </div>
                    <div className="leaderboard-actions-row" style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="action-button"
                        onClick={runScan}
                        disabled={scan.status === "loading"}
                      >
                        <RefreshCwIcon className={scan.status === "loading" ? "button-icon spin" : "button-icon"} />
                        Re-scan
                      </button>
                      {canReport ? (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() =>
                            openWhiteLabelReport({
                              brand,
                              generatedOn: new Date().toLocaleDateString(),
                              leads: [],
                            })
                          }
                        >
                          <FileTextIcon className="button-icon" /> Export report
                        </button>
                      ) : (
                        <span className="pricing-badge">Reports: Agency</span>
                      )}
                    </div>
                  </div>

                  {scan.status === "loading" || scan.status === "idle" ? (
                    <div className="empty-state">
                      <h2>Asking AI…</h2>
                      <p>Running a live recommendation check for “{prompt}”.</p>
                    </div>
                  ) : scan.status === "error" ? (
                    <div className="empty-state">
                      <h2>Couldn’t run the scan</h2>
                      <p>{scan.error}</p>
                      <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>
                        Try again
                      </button>
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="ci-empty-state">
                      <SearchXIcon />
                      <h2>No ranking yet</h2>
                      <p>AI didn’t return a recommendation list for this prompt.</p>
                      <button type="button" className="action-button" onClick={runScan}>
                        <RefreshCwIcon className="button-icon" /> Re-scan
                      </button>
                    </div>
                  ) : (
                    <div className="leaderboard">
                      {leaderboard.map((entry) => (
                        <div
                          key={entry.name}
                          className={`leaderboard-row${entry.isBrand ? " leaderboard-row-brand" : ""}${entry.rank === 1 ? " leaderboard-row-first" : ""}`}
                        >
                          <span className={`leaderboard-rank${entry.rank === 1 ? " leaderboard-rank-first" : ""}`}>
                            {entry.rank === 1 ? <TrophyIcon /> : entry.rank}
                          </span>
                          <span className="leaderboard-name">
                            {entry.name}
                            {entry.isBrand ? <em> (you)</em> : null}
                          </span>
                          <span className="leaderboard-bar">
                            <span className="leaderboard-fill" style={{ width: `${entry.score}%` }} />
                          </span>
                          <span className="leaderboard-wins">
                            {entry.mentioned ? `AI #${entry.claudeRank}` : "Not ranked"}
                          </span>
                          <span className={`leaderboard-score${entry.isBrand ? " leaderboard-score-brand" : ""}`}>{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {competitors.length > 0 ? (
                  <CompetitorEdge brand={brand} competitors={competitors} category={prompt} />
                ) : null}

                {scan.status === "done" && sovData.length > 1 ? <ShareOfVoice data={sovData} /> : null}
              </>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
