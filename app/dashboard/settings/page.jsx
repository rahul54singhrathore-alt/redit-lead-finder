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

const DownloadIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailDigest: true,
    instantAlerts: true,
    digestFrequency: "daily",
    alertChannel: "email",
    defaultSubreddits: "r/SaaS, r/startups, r/Entrepreneur",
    minScore: 5,
    minComments: 3,
    ignoredTerms: "hiring, job, internship",
    exportFormat: "csv",
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
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.split("@")[0].charAt(0).toUpperCase();
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
          <Link href="/dashboard/alerts" className="sidebar-item">
            <BellIcon />
            <span>Alerts</span>
            <span className="sidebar-badge">7</span>
          </Link>
          <Link href="/dashboard/settings" className="sidebar-item active">
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
            <h1>Settings</h1>
            <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Manage your account, lead matching, and alert preferences</p>
          </div>
          <div className="user-menu">
            <div className="user-avatar">{getInitials(user?.email)}</div>
          </div>
        </div>

        <form className="dashboard-content" onSubmit={handleSave}>
          <div className="settings-grid">
            <section className="dashboard-card">
              <div className="card-header">
                <h2>Account</h2>
              </div>
              <div className="settings-stack">
                <div className="form-group">
                  <label className="form-label" htmlFor="account-email">Email</label>
                  <input id="account-email" className="form-input" value={user?.email || ""} readOnly />
                </div>
                <div className="setting-row">
                  <div>
                    <h3>Email digest</h3>
                    <p>Receive a summary of new matching Reddit posts.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.emailDigest}
                      onChange={(event) => updateSetting("emailDigest", event.target.checked)}
                    />
                    <span />
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="digest-frequency">Digest frequency</label>
                  <select
                    id="digest-frequency"
                    className="form-input"
                    value={settings.digestFrequency}
                    onChange={(event) => updateSetting("digestFrequency", event.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="off">Off</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <h2>Alerts</h2>
              </div>
              <div className="settings-stack">
                <div className="setting-row">
                  <div>
                    <h3>Instant alerts</h3>
                    <p>Notify me when a high-intent lead appears.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.instantAlerts}
                      onChange={(event) => updateSetting("instantAlerts", event.target.checked)}
                    />
                    <span />
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="alert-channel">Alert channel</label>
                  <select
                    id="alert-channel"
                    className="form-input"
                    value={settings.alertChannel}
                    onChange={(event) => updateSetting("alertChannel", event.target.value)}
                  >
                    <option value="email">Email</option>
                    <option value="dashboard">Dashboard only</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="dashboard-card dashboard-card-wide">
              <div className="card-header">
                <h2>Lead Matching</h2>
              </div>
              <div className="settings-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="default-subreddits">Default subreddits</label>
                  <textarea
                    id="default-subreddits"
                    className="form-input textarea-input"
                    value={settings.defaultSubreddits}
                    onChange={(event) => updateSetting("defaultSubreddits", event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ignored-terms">Ignored terms</label>
                  <textarea
                    id="ignored-terms"
                    className="form-input textarea-input"
                    value={settings.ignoredTerms}
                    onChange={(event) => updateSetting("ignoredTerms", event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="min-score">Minimum score</label>
                  <input
                    id="min-score"
                    className="form-input"
                    type="number"
                    min="0"
                    value={settings.minScore}
                    onChange={(event) => updateSetting("minScore", event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="min-comments">Minimum comments</label>
                  <input
                    id="min-comments"
                    className="form-input"
                    type="number"
                    min="0"
                    value={settings.minComments}
                    onChange={(event) => updateSetting("minComments", event.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <h2>Exports</h2>
              </div>
              <div className="settings-stack">
                <div className="form-group">
                  <label className="form-label" htmlFor="export-format">Default format</label>
                  <select
                    id="export-format"
                    className="form-input"
                    value={settings.exportFormat}
                    onChange={(event) => updateSetting("exportFormat", event.target.value)}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <button type="button" className="action-button">
                  <DownloadIcon />
                  Export current leads
                </button>
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <h2>Session</h2>
              </div>
              <div className="settings-stack">
                <button type="button" className="danger-button" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            </section>
          </div>

          <div className="settings-actions">
            {saved && <span className="settings-saved">Settings saved</span>}
            <button type="submit" className="primary-button settings-save-button">Save settings</button>
          </div>
        </form>
      </main>
    </div>
  );
}
