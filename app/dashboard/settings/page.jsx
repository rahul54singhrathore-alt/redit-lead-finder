"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SourcePresetPicker } from "@/components/source-preset-picker";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import {
  formatDefaultVisibilitySources,
  formatCommaSeparatedList,
  normalizeWorkspaceProfile,
  parseCommaSeparatedList,
} from "../../../lib/workspace-profile";

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
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    emailDigest: true,
    instantAlerts: true,
    digestFrequency: "daily",
    alertChannel: "email",
    defaultSubreddits: formatDefaultVisibilitySources(),
    minScore: 5,
    minComments: 3,
    ignoredTerms: "hiring, job, internship",
    exportFormat: "csv",
  });
  const [profile, setProfile] = useState(null);
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
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        setMessage("Could not load settings. Run supabase-schema.sql in Supabase first.");
      } else if (data) {
        const normalized = normalizeWorkspaceProfile(data);
        setProfile(normalized);
        setSettings({
          emailDigest: normalized.email_digest,
          instantAlerts: normalized.instant_alerts,
          digestFrequency: normalized.digest_frequency,
          alertChannel: normalized.alert_channel,
          defaultSubreddits: formatCommaSeparatedList(normalized.target_subreddits),
          minScore: normalized.min_score,
          minComments: normalized.min_comments,
          ignoredTerms: normalized.ignored_terms,
          exportFormat: normalized.export_format,
        });
        setMessage("");
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) return;
            if (!data) return;
            const normalized = normalizeWorkspaceProfile(data);
            setProfile(normalized);
            setSettings({
              emailDigest: normalized.email_digest,
              instantAlerts: normalized.instant_alerts,
              digestFrequency: normalized.digest_frequency,
              alertChannel: normalized.alert_channel,
              defaultSubreddits: formatCommaSeparatedList(normalized.target_subreddits),
              minScore: normalized.min_score,
              minComments: normalized.min_comments,
              ignoredTerms: normalized.ignored_terms,
              exportFormat: normalized.export_format,
            });
          });
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

  const handleSave = async (event) => {
    event.preventDefault();
    if (!supabase || !user) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    const payload = {
      user_id: user.id,
      onboarding_completed: profile?.onboarding_completed ?? true,
      starter_keyword: profile?.starter_keyword || "",
      target_subreddits: parseCommaSeparatedList(settings.defaultSubreddits),
      digest_frequency: settings.digestFrequency,
      email_digest: settings.emailDigest,
      instant_alerts: settings.instantAlerts,
      alert_channel: settings.alertChannel,
      min_score: Number(settings.minScore) || 0,
      min_comments: Number(settings.minComments) || 0,
      ignored_terms: settings.ignoredTerms,
      export_format: settings.exportFormat,
      updated_at: new Date().toISOString(),
    };

    const { error, data } = await supabase
      .from("user_profiles")
      .upsert(payload)
      .select("*")
      .single();

    if (error) {
      setMessage(error.message || "Could not save settings.");
      return;
    }

    if (data) {
      setProfile(normalizeWorkspaceProfile(data));
    }
    setSaved(true);
    setMessage("");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
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
      <AppSidebar user={user} onSignOut={handleSignOut} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Settings</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Manage your account, visibility matching, and audit preferences</p>
            </div>
          </div>

          {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}

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
                      <p>Receive a summary of new matching visibility signals.</p>
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
                      <p>Notify me when a high-confidence signal appears.</p>
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
                  <h2>Visibility Matching</h2>
                </div>
                <div className="settings-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="default-subreddits">Default sources</label>
                    <textarea
                      id="default-subreddits"
                      className="form-input textarea-input"
                      value={settings.defaultSubreddits}
                      onChange={(event) => updateSetting("defaultSubreddits", event.target.value)}
                      placeholder={formatDefaultVisibilitySources()}
                    />
                    <SourcePresetPicker
                      value={settings.defaultSubreddits}
                      onChange={(value) => updateSetting("defaultSubreddits", value)}
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
                    Export current signals
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
              {saved && <span className="settings-saved">✓ Settings saved</span>}
              <button type="submit" className="primary-button settings-save-button">Save settings</button>
            </div>
          </form>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
