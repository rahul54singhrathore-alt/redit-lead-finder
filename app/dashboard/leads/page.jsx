"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "../../../lib/supabase";

const HomeIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

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

const SettingsIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
      setMessage("Could not load leads. Run supabase-schema.sql in Supabase first.");
      return;
    }

    setLeads(data || []);
    setMessage("");
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.split("@")[0].charAt(0).toUpperCase();
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
      setMessage(error.message || "Could not update lead.");
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
      subreddit: newLead.subreddit.trim().startsWith("r/") ? newLead.subreddit.trim() : `r/${newLead.subreddit.trim()}`,
      keyword: newLead.keyword.trim(),
      intent: newLead.intent,
      url: newLead.url.trim() || "https://reddit.com",
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
      setMessage(error.message || "Could not add Reddit lead.");
      return;
    }

    setLeads((current) => [data, ...current]);
    setNewLead({ title: "", subreddit: "", keyword: "", url: "", intent: "Medium" });
    setMessage("Reddit lead saved to Supabase.");
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
      <div className="dashboard-layout">
        <div className="dashboard-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link className="brand" href="/">
            <img src="/logo.svg" alt="" />
            Lead Finder
          </Link>
        </div>
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Workspace</span>
          <Link href="/dashboard" className="sidebar-item">
            <HomeIcon />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/keywords" className="sidebar-item">
            <SearchIcon />
            <span>Keywords</span>
          </Link>
          <Link href="/dashboard/leads" className="sidebar-item active">
            <TrendingIcon />
            <span>Leads</span>
            <span className="sidebar-badge">48</span>
          </Link>
          <Link href="/dashboard/alerts" className="sidebar-item">
            <BellIcon />
            <span>Alerts</span>
            <span className="sidebar-badge">7</span>
          </Link>
          <Link href="/dashboard/settings" className="sidebar-item">
            <SettingsIcon />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="sidebar-status">
          <div className="sidebar-status-dot" />
          <div>
            <p className="sidebar-status-title">Monitoring active</p>
            <p className="sidebar-status-meta">8 subreddits watched</p>
          </div>
        </div>
        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={handleSignOut}>
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Leads</h1>
            <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Review, qualify, and track Reddit posts that match your keywords</p>
          </div>
          <div className="user-menu">
            <div className="user-avatar">{getInitials(user?.email)}</div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <TrendingIcon />
              </div>
              <h3>Total leads</h3>
              <p className="stat-value">{leads.length}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <SearchIcon />
              </div>
              <h3>New leads</h3>
              <p className="stat-value">{leads.filter((lead) => lead.status === "New").length}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <BellIcon />
              </div>
              <h3>High intent</h3>
              <p className="stat-value">{leads.filter((lead) => lead.intent === "High").length}</p>
            </div>
          </div>

          <section className="dashboard-card">
            <div className="card-header">
              <h2>Add Reddit lead</h2>
              <span style={{ fontSize: "0.875rem", color: "#71717a" }}>Saved to Supabase</span>
            </div>
            <form className="add-keyword-form" onSubmit={handleAddLead}>
              <div className="form-fields lead-form-fields">
                <div className="form-group">
                  <label className="form-label" htmlFor="new-lead-title">Post title</label>
                  <input
                    id="new-lead-title"
                    className="form-input"
                    value={newLead.title}
                    onChange={(event) => setNewLead((current) => ({ ...current, title: event.target.value }))}
                    placeholder="e.g., Best CRM for a small agency?"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-lead-subreddit">Subreddit</label>
                  <input
                    id="new-lead-subreddit"
                    className="form-input"
                    value={newLead.subreddit}
                    onChange={(event) => setNewLead((current) => ({ ...current, subreddit: event.target.value }))}
                    placeholder="r/Entrepreneur"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-lead-keyword">Keyword</label>
                  <input
                    id="new-lead-keyword"
                    className="form-input"
                    value={newLead.keyword}
                    onChange={(event) => setNewLead((current) => ({ ...current, keyword: event.target.value }))}
                    placeholder="best CRM"
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
                  <label className="form-label" htmlFor="new-lead-url">Reddit URL</label>
                  <input
                    id="new-lead-url"
                    className="form-input"
                    value={newLead.url}
                    onChange={(event) => setNewLead((current) => ({ ...current, url: event.target.value }))}
                    placeholder="https://reddit.com/r/..."
                  />
                </div>
              </div>
              <button type="submit" className="primary-button">Save Reddit lead</button>
            </form>
          </section>

          <section className="dashboard-card">
            {message ? <p className="signin-message" style={{ textAlign: "left", marginBottom: "16px" }}>{message}</p> : null}
            <div className="leads-toolbar">
              <div className="form-group leads-search">
                <label className="form-label" htmlFor="lead-search">Search leads</label>
                <input
                  id="lead-search"
                  className="form-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, subreddit, keyword, or author"
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
              <button type="button" className="primary-button leads-export-button">Export leads</button>
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
                      <a className="icon-action-button" href={lead.url} target="_blank" rel="noreferrer" aria-label="Open Reddit post">
                        <ExternalIcon />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
              {filteredLeads.length === 0 && (
                <div className="empty-state">
                  <h2>No leads found</h2>
                  <p>Try a different search or status filter.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
