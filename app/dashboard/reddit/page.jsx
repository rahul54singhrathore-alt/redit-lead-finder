"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookmarkIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  TargetIcon,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

const CITATION_FILTERS = ["All", "High", "Medium", "Low"];

export default function RedditPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scan, setScan] = useState({ status: "idle" });
  const [copied, setCopied] = useState(null);
  const [savedLeads, setSavedLeads] = useState(new Set());
  const [savingIndex, setSavingIndex] = useState(null);
  const [citationFilter, setCitationFilter] = useState("All");
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
  const category = profile?.product_category || profile?.starter_keyword || "";

  const runScan = async () => {
    setScan({ status: "loading" });
    setSavedLeads(new Set());
    setCitationFilter("All");
    try {
      const response = await fetch("/api/reddit-opportunities", {
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

  const copyDraft = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      setTimeout(() => setCopied((c) => (c === index ? null : c)), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  const saveLead = async (item, index) => {
    if (!supabase || !user || savedLeads.has(index) || savingIndex === index) return;
    setSavingIndex(index);
    try {
      const { error } = await supabase.from("reddit_leads").insert({
        user_id: user.id,
        title: item.post,
        subreddit: item.subreddit || "",
        keyword: category || brand,
        intent: item.citation,
        url: `https://www.reddit.com/search/?q=${encodeURIComponent(item.post)}`,
        author: "opportunity-engine",
        score: item.score,
        comments: 0,
        status: "New",
      });
      if (!error) {
        setSavedLeads((prev) => new Set([...prev, index]));
      }
    } finally {
      setSavingIndex(null);
    }
  };

  const openOnReddit = (post) => {
    window.open(
      `https://www.reddit.com/search/?q=${encodeURIComponent(post)}&sort=relevance&t=year`,
      "_blank",
      "noopener,noreferrer"
    );
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

  const allOpportunities = scan.data?.opportunities || [];
  const opportunities =
    citationFilter === "All"
      ? allOpportunities
      : allOpportunities.filter((o) => o.citation === citationFilter);

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Reddit Opportunity Engine</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>
                AI models cite Reddit heavily — reply on these threads to get {brand} cited.
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>
                    <MessageSquareIcon className="reddit-title-icon" /> Reply opportunities
                  </h2>
                  <p className="card-supporting-copy">
                    Threads worth a helpful reply — each with a ready-to-post draft mentioning {brand}.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={runScan}
                  disabled={scan.status === "loading"}
                >
                  {scan.status === "loading" ? (
                    <>
                      <RefreshCwIcon className="button-icon spin" /> Finding…
                    </>
                  ) : scan.status === "done" ? (
                    <>
                      <RefreshCwIcon className="button-icon" /> Refresh
                    </>
                  ) : (
                    <>
                      <TargetIcon className="button-icon" /> Find opportunities
                    </>
                  )}
                </button>
              </div>

              {scan.status === "done" && allOpportunities.length > 0 && (
                <div className="reddit-filters">
                  {CITATION_FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`reddit-filter-pill${citationFilter === f ? " reddit-filter-pill-active" : ""}`}
                      onClick={() => setCitationFilter(f)}
                    >
                      {f === "All" ? "All" : `${f} citation`}
                      {f !== "All" && (
                        <span className="reddit-filter-count">
                          {allOpportunities.filter((o) => o.citation === f).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {scan.status === "idle" ? (
                <div className="reddit-empty">
                  <MessageSquareIcon />
                  <p>Find Reddit threads where {brand} can reply and earn an AI citation.</p>
                </div>
              ) : scan.status === "loading" ? (
                <div className="reddit-empty">
                  <RefreshCwIcon className="spin" />
                  <p>Finding Reddit opportunities…</p>
                </div>
              ) : scan.status === "error" ? (
                <div className="reddit-empty reddit-empty-error">
                  <p>{scan.error}</p>
                  <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>
                    Try again
                  </button>
                </div>
              ) : (
                <div className="reddit-list">
                  {opportunities.length === 0 ? (
                    <div className="reddit-empty">
                      <p>No {citationFilter.toLowerCase()} citation opportunities found.</p>
                    </div>
                  ) : (
                    opportunities.map((item) => {
                      const globalIndex = allOpportunities.indexOf(item);
                      const isSaved = savedLeads.has(globalIndex);
                      const isSaving = savingIndex === globalIndex;
                      return (
                        <article key={`${item.post}-${globalIndex}`} className="reddit-card">
                          <div className="reddit-card-head">
                            <div>
                              <div className="reddit-card-meta">
                                {item.subreddit ? <span className="reddit-sub">{item.subreddit}</span> : null}
                                {item.type ? (
                                  <span className={`reddit-type reddit-type-${item.type.toLowerCase()}`}>
                                    {item.type}
                                  </span>
                                ) : null}
                              </div>
                              <h3 className="reddit-post">{item.post}</h3>
                            </div>
                            <div className="reddit-badges">
                              <span className="reddit-score">{item.score}/10</span>
                              <span className={`reddit-citation reddit-citation-${item.citation.toLowerCase()}`}>
                                {item.citation} citation
                              </span>
                            </div>
                          </div>

                          {item.draft ? (
                            <div className="reddit-draft">
                              <div className="reddit-draft-top">
                                <span>Reply draft</span>
                                <button
                                  type="button"
                                  className="reddit-copy"
                                  onClick={() => copyDraft(item.draft, globalIndex)}
                                >
                                  {copied === globalIndex ? (
                                    <>
                                      <CheckIcon /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <CopyIcon /> Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <p>{item.draft}</p>
                            </div>
                          ) : null}

                          <div className="reddit-actions">
                            <button
                              type="button"
                              className="reddit-action-btn reddit-search-btn"
                              onClick={() => openOnReddit(item.post)}
                            >
                              <ExternalLinkIcon /> Search on Reddit
                            </button>
                            <button
                              type="button"
                              className={`reddit-action-btn reddit-save-btn${isSaved ? " reddit-save-btn-saved" : ""}`}
                              onClick={() => saveLead(item, globalIndex)}
                              disabled={isSaved || isSaving}
                            >
                              {isSaved ? (
                                <>
                                  <CheckIcon /> Saved to leads
                                </>
                              ) : isSaving ? (
                                <>
                                  <RefreshCwIcon className="spin" /> Saving…
                                </>
                              ) : (
                                <>
                                  <BookmarkIcon /> Save lead
                                </>
                              )}
                            </button>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              )}

              {scan.status === "done" ? (
                <p className="reddit-disclaimer">
                  Threads are AI-generated examples — use "Search on Reddit" to find the live version and reply genuinely.
                </p>
              ) : null}
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
