"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SourcePresetPicker } from "@/components/source-preset-picker";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { formatDefaultVisibilitySources } from "../../../lib/workspace-profile";

const SearchIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const BellIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ExternalIcon = () => (
  <svg className="stat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function LeadsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leads, setLeads] = useState([]);
  const [message, setMessage] = useState("");
  const [newLead, setNewLead] = useState({
    title: "",
    subreddit: "",
    keyword: "",
    url: "",
    intent: "Medium",
  });
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/signin");
        return;
      }
      setUser(session.user);
      await loadLeads();
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        loadLeads();
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const loadLeads = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("reddit_leads")
      .select("id, title, subreddit, author, keyword, intent, status, score, comments, url, posted_at")
      .order("posted_at", { ascending: false });

    if (error) {
      setMessage("Could not load signals. Run supabase-schema.sql in Supabase first.");
      return;
    }

    setLeads(data || []);
    setMessage("");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const updateLeadStatus = async (id, status) => {
    if (!supabase) return;
    const { error } = await supabase.from("reddit_leads").update({ status }).eq("id", id);
    if (error) {
      setMessage(error.message || "Could not update signal.");
      return;
    }
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
  };

  const handleAddLead = async (event) => {
    event.preventDefault();
    if (!supabase || !user || !newLead.title.trim() || !newLead.subreddit.trim()) return;

    const payload = {
      user_id: user.id,
      title: newLead.title.trim(),
      subreddit: newLead.subreddit.trim(),
      keyword: newLead.keyword.trim(),
      intent: newLead.intent,
      url: newLead.url.trim() || "https://example.com",
      author: "manual-entry",
      score: 0,
      comments: 0,
      status: "New",
    };

    const { data, error } = await supabase
      .from("reddit_leads")
      .insert(payload)
      .select("id, title, subreddit, author, keyword, intent, status, score, comments, url, posted_at")
      .single();

    if (error) {
      setMessage(error.message || "Could not add signal.");
      return;
    }

    setLeads((current) => [data, ...current]);
    setNewLead({ title: "", subreddit: "", keyword: "", url: "", intent: "Medium" });
    setMessage("Signal saved to Supabase.");
  };

  const getLeadTime = (postedAt) => {
    if (!postedAt) return "recently";
    const diffMs = Date.now() - new Date(postedAt).getTime();
    const minutes = Math.max(1, Math.round(diffMs / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [lead.title, lead.subreddit, lead.keyword, lead.author].some((value) => value.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

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
      <AppSidebar user={user} onSignOut={handleSignOut} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Signals</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Review, qualify, and track visibility results that match your brands</p>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-green">
                  <TrendingIcon />
                </div>
                <h3>Total signals</h3>
                <p className="stat-value">{leads.length}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">
                  <SearchIcon />
                </div>
                <h3>New signals</h3>
                <p className="stat-value">{leads.filter((lead) => lead.status === "New").length}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple">
                  <BellIcon />
                </div>
                <h3>High confidence</h3>
                <p className="stat-value">{leads.filter((lead) => lead.intent === "High").length}</p>
              </div>
            </div>

            <section className="dashboard-card">
              <div className="card-header">
                <h2>Add signal</h2>
                <span style={{ fontSize: "0.875rem", color: "#71717a" }}>Saved to Supabase</span>
              </div>
              <form className="add-keyword-form" onSubmit={handleAddLead}>
                <div className="form-fields lead-form-fields">
                  <div className="form-group lead-source-field">
                    <label className="form-label" htmlFor="new-lead-title">Page or prompt title</label>
                    <input
                      id="new-lead-title"
                      className="form-input"
                      value={newLead.title}
                      onChange={(event) => setNewLead((current) => ({ ...current, title: event.target.value }))}
                      placeholder="e.g., Why does our brand appear in ChatGPT?"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-lead-subreddit">Source</label>
                    <input
                      id="new-lead-subreddit"
                      className="form-input"
                      value={newLead.subreddit}
                      onChange={(event) => setNewLead((current) => ({ ...current, subreddit: event.target.value }))}
                      placeholder={formatDefaultVisibilitySources()}
                      required
                    />
                    <SourcePresetPicker
                      mode="single"
                      value={newLead.subreddit}
                      onChange={(source) => setNewLead((current) => ({ ...current, subreddit: source }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-lead-keyword">Brand / keyword</label>
                    <input
                      id="new-lead-keyword"
                      className="form-input"
                      value={newLead.keyword}
                      onChange={(event) => setNewLead((current) => ({ ...current, keyword: event.target.value }))}
                      placeholder="Rankora"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-lead-intent">Intent</label>
                    <select
                      id="new-lead-intent"
                      className="form-input"
                      value={newLead.intent}
                      onChange={(event) => setNewLead((current) => ({ ...current, intent: event.target.value }))}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group lead-url-field">
                    <label className="form-label" htmlFor="new-lead-url">Source URL</label>
                    <input
                      id="new-lead-url"
                      className="form-input"
                      value={newLead.url}
                      onChange={(event) => setNewLead((current) => ({ ...current, url: event.target.value }))}
                      placeholder="https://example.com/article"
                    />
                  </div>
                </div>
                <button type="submit" className="primary-button">Save signal</button>
              </form>
            </section>

            <section className="dashboard-card">
              {message ? <p className="signin-message" style={{ textAlign: "left", marginBottom: "16px" }}>{message}</p> : null}
              <div className="leads-toolbar">
                <div className="form-group leads-search">
                  <label className="form-label" htmlFor="lead-search">Search signals</label>
                  <input
                    id="lead-search"
                    className="form-input"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title, source, keyword, or author"
                  />
                </div>
                <div className="form-group leads-filter">
                  <label className="form-label" htmlFor="lead-status">Status</label>
                  <select id="lead-status" className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="All">All</option>
                    <option value="New">New</option>
                    <option value="Saved">Saved</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <button type="button" className="primary-button leads-export-button">Export signals</button>
              </div>

              <div className="leads-list">
                {filteredLeads.map((lead) => (
                  <article key={lead.id} className="lead-row">
                    <div className="lead-row-main">
                      <div className="lead-row-heading">
                        <span className="lead-subreddit">{lead.subreddit}</span>
                        <span className={`intent-badge intent-${lead.intent.toLowerCase()}`}>{lead.intent} intent</span>
                        <span className={`status-badge status-${lead.status.toLowerCase()}`}>{lead.status}</span>
                      </div>
                      <h2>{lead.title}</h2>
                      <div className="lead-meta">
                        <span>Posted by {lead.author}</span>
                        <span>|</span>
                        <span>{getLeadTime(lead.posted_at)}</span>
                        <span>|</span>
                        <span>Keyword: {lead.keyword}</span>
                      </div>
                    </div>
                    <div className="lead-row-side">
                      <div className="lead-stats">
                        <span className="lead-stat">
                          <svg className="stat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {lead.score}
                        </span>
                        <span className="lead-stat">
                          <svg className="stat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          {lead.comments}
                        </span>
                      </div>
                      <div className="lead-actions">
                        <button type="button" className="small-action-button" onClick={() => updateLeadStatus(lead.id, "Saved")}>Save</button>
                        <button type="button" className="small-action-button" onClick={() => updateLeadStatus(lead.id, "Contacted")}>Contacted</button>
                        <a className="icon-action-button" href={lead.url} target="_blank" rel="noreferrer" aria-label="Open source page">
                          <ExternalIcon />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
                {filteredLeads.length === 0 && (
                  <div className="empty-state">
                    <h2>No signals found</h2>
                    <p>Try a different search or status filter.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
