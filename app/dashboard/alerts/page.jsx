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

const PlusIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default function AlertsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [newRule, setNewRule] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
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
      await Promise.all([loadRules(), loadRecentAlerts()]);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        loadRules();
        loadRecentAlerts();
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const loadRules = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("alert_rules")
      .select("id, name, trigger, channel, active")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load alert rules. Run supabase-schema.sql in Supabase first.");
      return;
    }

    setRules(data || []);
    setMessage("");
  };

  const loadRecentAlerts = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("reddit_leads")
      .select("id, title, subreddit, keyword, intent, posted_at")
      .in("intent", ["High", "Medium"])
      .order("posted_at", { ascending: false })
      .limit(5);

    setRecentAlerts(data || []);
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

  const toggleRule = async (id) => {
    if (!supabase) return;
    const rule = rules.find((item) => item.id === id);
    if (!rule) return;
    const { error } = await supabase.from("alert_rules").update({ active: !rule.active }).eq("id", id);
    if (error) {
      setMessage(error.message || "Could not update alert rule.");
      return;
    }
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule)));
  };

  const addRule = async (event) => {
    event.preventDefault();
    if (!newRule.trim() || !user || !supabase) return;
    const { data, error } = await supabase
      .from("alert_rules")
      .insert({
        user_id: user.id,
        name: newRule,
        trigger: newTrigger || "new matching lead found",
        channel: "Instant email",
        active: true,
      })
      .select("id, name, trigger, channel, active")
      .single();

    if (error) {
      setMessage(error.message || "Could not add alert rule.");
      return;
    }

    setRules((current) => [data, ...current]);
    setNewRule("");
    setNewTrigger("");
    setMessage("");
  };

  const getAlertTime = (postedAt) => {
    if (!postedAt) return "recently";
    const diffMs = Date.now() - new Date(postedAt).getTime();
    const minutes = Math.max(1, Math.round(diffMs / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
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
          <Link href="/dashboard/leads" className="sidebar-item">
            <TrendingIcon />
            <span>Leads</span>
            <span className="sidebar-badge">48</span>
          </Link>
          <Link href="/dashboard/alerts" className="sidebar-item active">
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
            <h1>Alerts</h1>
            <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Control when you are notified about high-value Reddit leads</p>
          </div>
          <div className="user-menu">
            <div className="user-avatar">{getInitials(user?.email)}</div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <BellIcon />
              </div>
              <h3>Active rules</h3>
              <p className="stat-value">{rules.filter((rule) => rule.active).length}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <TrendingIcon />
              </div>
              <h3>Alerts today</h3>
              <p className="stat-value">{recentAlerts.length}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <SearchIcon />
              </div>
              <h3>Watched keywords</h3>
              <p className="stat-value">12</p>
            </div>
          </div>

          <div className="alerts-grid">
            <section className="dashboard-card">
              <div className="card-header">
                <h2>Create alert rule</h2>
              </div>
              {message ? <p className="signin-message" style={{ textAlign: "left", marginBottom: "16px" }}>{message}</p> : null}
              <form className="alerts-form" onSubmit={addRule}>
                <div className="form-group">
                  <label className="form-label" htmlFor="alert-name">Rule name</label>
                  <input
                    id="alert-name"
                    className="form-input"
                    value={newRule}
                    onChange={(event) => setNewRule(event.target.value)}
                    placeholder="e.g., New founder buying signal"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="alert-trigger">Trigger</label>
                  <input
                    id="alert-trigger"
                    className="form-input"
                    value={newTrigger}
                    onChange={(event) => setNewTrigger(event.target.value)}
                    placeholder="e.g., high intent and keyword is CRM"
                  />
                </div>
                <button type="submit" className="primary-button alerts-create-button">
                  <PlusIcon />
                  Add rule
                </button>
              </form>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <h2>Recent alerts</h2>
                <Link href="/dashboard/leads" className="card-link">Open leads</Link>
              </div>
              <div className="alert-feed">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="alert-feed-item">
                    <div className={`alert-priority-dot priority-${alert.intent.toLowerCase()}`} />
                    <div>
                      <h3>{alert.title}</h3>
                      <p>{alert.subreddit} | {alert.keyword} | {getAlertTime(alert.posted_at)}</p>
                    </div>
                  </div>
                ))}
                {recentAlerts.length === 0 && (
                  <div className="empty-state">
                    <h2>No recent alerts</h2>
                    <p>New high-intent leads will appear here.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="dashboard-card dashboard-card-wide">
              <div className="card-header">
                <h2>Alert rules</h2>
                <span style={{ fontSize: "0.875rem", color: "#71717a" }}>{rules.length} rules</span>
              </div>
              <div className="alert-rules-list">
                {rules.map((rule) => (
                  <div key={rule.id} className="alert-rule-item">
                    <div className="alert-rule-main">
                      <h3>{rule.name}</h3>
                      <p>{rule.trigger}</p>
                      <span className="stat-badge">{rule.channel}</span>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={rule.active} onChange={() => toggleRule(rule.id)} />
                      <span />
                    </label>
                  </div>
                ))}
                {rules.length === 0 && (
                  <div className="empty-state">
                    <h2>No alert rules yet</h2>
                    <p>Create your first rule to control notifications.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
