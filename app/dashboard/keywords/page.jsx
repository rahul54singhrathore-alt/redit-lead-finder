"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "../../../lib/supabase";

// Simple SVG icons
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

const PlusIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TrashIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function KeywordsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newSubreddits, setNewSubreddits] = useState("");
  const [message, setMessage] = useState("");
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
      await loadKeywords();
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        loadKeywords();
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const loadKeywords = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("tracked_keywords")
      .select("id, keyword, subreddits, leads_found")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load keywords. Run supabase-schema.sql in Supabase first.");
      return;
    }

    setKeywords(data || []);
    setMessage("");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const getInitials = (email) => {
    if (!email) return "U";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase();
  };

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim() || !user || !supabase) return;
    const subreddits = newSubreddits
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const { data, error } = await supabase
      .from("tracked_keywords")
      .insert({
        user_id: user.id,
        keyword: newKeyword.trim(),
        subreddits,
      })
      .select("id, keyword, subreddits, leads_found")
      .single();

    if (error) {
      setMessage(error.message || "Could not add keyword.");
      return;
    }

    const keyword = {
      id: data.id,
      keyword: newKeyword,
      subreddits: data.subreddits || [],
      leads_found: data.leads_found || 0,
    };
    setKeywords([...keywords, keyword]);
    setNewKeyword("");
    setNewSubreddits("");
    setMessage("");
  };

  const handleDeleteKeyword = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from("tracked_keywords").delete().eq("id", id);
    if (error) {
      setMessage(error.message || "Could not delete keyword.");
      return;
    }
    setKeywords(keywords.filter(k => k.id !== id));
  };

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
      {/* Sidebar */}
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
          <Link href="/dashboard/keywords" className="sidebar-item active">
            <SearchIcon />
            <span>Keywords</span>
          </Link>
          <Link href="/dashboard/leads" className="sidebar-item">
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

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Keywords</h1>
            <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>
              Manage the keywords you want to track on Reddit
            </p>
          </div>
          <div className="user-menu">
            <div className="user-avatar">{getInitials(user?.email)}</div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Add New Keyword Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Add New Keyword</h2>
            </div>
            <form onSubmit={handleAddKeyword} className="add-keyword-form">
              <div className="form-fields">
                <div className="form-group">
                  <label className="form-label">Keyword</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., best CRM for startups"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subreddits (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., r/SaaS, r/Entrepreneur"
                    value={newSubreddits}
                    onChange={(e) => setNewSubreddits(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="primary-button">
                <PlusIcon /> Add Keyword
              </button>
            </form>
          </div>

          {/* Keywords List */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Your Keywords</h2>
              <span style={{ fontSize: "0.875rem", color: "#71717a" }}>
                {keywords.length} keywords
              </span>
            </div>
            {message ? <p className="signin-message" style={{ textAlign: "left", marginBottom: "16px" }}>{message}</p> : null}
            <div className="keywords-list">
              {keywords.map((keyword) => (
                <div key={keyword.id} className="keyword-item">
                  <div className="keyword-info">
                    <div className="keyword-name">
                      {keyword.keyword}
                    </div>
                    <div className="keyword-subreddits">
                      {Array.isArray(keyword.subreddits) && keyword.subreddits.length > 0 ? keyword.subreddits.join(", ") : "All subreddits"}
                    </div>
                  </div>
                  <div className="keyword-stats">
                    <span className="stat-badge">
                      {keyword.leads_found || 0} leads found
                    </span>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteKeyword(keyword.id)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
              {keywords.length === 0 && (
                <div className="empty-state">
                  <h2>No keywords yet</h2>
                  <p>Add your first keyword to start tracking Reddit leads.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
