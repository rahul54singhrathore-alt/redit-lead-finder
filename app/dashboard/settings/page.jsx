"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BellIcon,
  Building2Icon,
  CreditCardIcon,
  DownloadIcon,
  LogOutIcon,
  SlidersHorizontalIcon,
  UserIcon,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SourcePresetPicker } from "@/components/source-preset-picker";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { getTier } from "../../../lib/subscription";
import {
  INDUSTRY_OPTIONS,
  formatDefaultVisibilitySources,
  formatCommaSeparatedList,
  normalizeWorkspaceProfile,
  parseCommaSeparatedList,
} from "../../../lib/workspace-profile";

// Maps a normalized profile into the editable settings form shape.
function settingsFromProfile(profile) {
  return {
    productName: profile.product_name || "",
    productUrl: profile.product_url || "",
    industry: profile.industry || "",
    customerType: profile.customer_type || "both",
    brandDescription: profile.brand_description || "",
    emailDigest: profile.email_digest,
    instantAlerts: profile.instant_alerts,
    digestFrequency: profile.digest_frequency,
    alertChannel: profile.alert_channel,
    defaultSubreddits: formatCommaSeparatedList(profile.target_subreddits),
    minScore: profile.min_score,
    minComments: profile.min_comments,
    ignoredTerms: profile.ignored_terms,
    exportFormat: profile.export_format,
  };
}

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    productName: "",
    productUrl: "",
    industry: "",
    customerType: "both",
    brandDescription: "",
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
  const [digestTestStatus, setDigestTestStatus] = useState(null);
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
        setSettings(settingsFromProfile(normalized));
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
            if (error || !data) return;
            const normalized = normalizeWorkspaceProfile(data);
            setProfile(normalized);
            setSettings(settingsFromProfile(normalized));
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
      product_name: settings.productName.trim(),
      product_url: settings.productUrl.trim(),
      industry: settings.industry,
      customer_type: settings.customerType,
      brand_description: settings.brandDescription.trim(),
      starter_keyword: profile?.starter_keyword || settings.productName.trim(),
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

  const sendTestDigest = async () => {
    if (!supabase || !user) return;
    setDigestTestStatus("sending");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/digest/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ test: true, userId: user.id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setDigestTestStatus("error");
      } else if (json.sent > 0) {
        setDigestTestStatus("sent");
      } else {
        setDigestTestStatus("skipped");
      }
    } catch {
      setDigestTestStatus("error");
    }
    setTimeout(() => setDigestTestStatus(null), 5000);
  };

  const tierKey = profile?.subscription_tier || "free";
  const tier = getTier(tierKey);
  const isPaid = tierKey !== "free";

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
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Settings</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>
                Manage your brand, account, and workspace preferences.
              </p>
            </div>
          </div>

          {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}

          <form className="dashboard-content" onSubmit={handleSave}>
            <div className="settings-grid">
              <section className="dashboard-card dashboard-card-wide">
                <div className="card-header">
                  <div>
                    <h2><Building2Icon className="settings-section-icon" /> Brand</h2>
                    <p className="card-supporting-copy">
                      This powers every AI check — Mention Opportunities, GEO Roadmap, Citations, and Reddit drafts.
                    </p>
                  </div>
                </div>
                <div className="settings-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-name">Brand / product name</label>
                    <input
                      id="product-name"
                      className="form-input"
                      value={settings.productName}
                      onChange={(event) => updateSetting("productName", event.target.value)}
                      placeholder="e.g., Oras"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-url">Website</label>
                    <input
                      id="product-url"
                      className="form-input"
                      value={settings.productUrl}
                      onChange={(event) => updateSetting("productUrl", event.target.value)}
                      placeholder="https://yourbrand.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="industry">Industry</label>
                    <select
                      id="industry"
                      className="form-input"
                      value={settings.industry}
                      onChange={(event) => updateSetting("industry", event.target.value)}
                    >
                      <option value="">Select industry…</option>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer-type">Sells to</label>
                    <select
                      id="customer-type"
                      className="form-input"
                      value={settings.customerType}
                      onChange={(event) => updateSetting("customerType", event.target.value)}
                    >
                      <option value="b2b">B2B (businesses)</option>
                      <option value="b2c">B2C (consumers)</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="form-group settings-span-2">
                    <label className="form-label" htmlFor="brand-description">What does your brand do?</label>
                    <textarea
                      id="brand-description"
                      className="form-input textarea-input"
                      value={settings.brandDescription}
                      onChange={(event) => updateSetting("brandDescription", event.target.value)}
                      placeholder="One or two lines — used to make AI checks more accurate."
                    />
                  </div>
                </div>
              </section>

              <section className="dashboard-card">
                <div className="card-header">
                  <h2><UserIcon className="settings-section-icon" /> Account</h2>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      type="button"
                      className="action-button"
                      onClick={sendTestDigest}
                      disabled={digestTestStatus === "sending" || !settings.emailDigest}
                    >
                      {digestTestStatus === "sending" ? "Sending…" : "Send test digest"}
                    </button>
                    {digestTestStatus === "sent" && (
                      <span style={{ fontSize: "13px", color: "#22c55e" }}>✓ Sent — check your inbox</span>
                    )}
                    {digestTestStatus === "skipped" && (
                      <span style={{ fontSize: "13px", color: "#f59e0b" }}>No brand set — add your brand name first</span>
                    )}
                    {digestTestStatus === "error" && (
                      <span style={{ fontSize: "13px", color: "#ef4444" }}>Failed to send — check server logs</span>
                    )}
                  </div>
                </div>
              </section>

              <section className="dashboard-card">
                <div className="card-header">
                  <h2><CreditCardIcon className="settings-section-icon" /> Plan</h2>
                </div>
                <div className="settings-stack">
                  <div className="settings-plan-row">
                    <div>
                      <span className="settings-plan-name">{tier.name}</span>
                      <span className={`settings-plan-tag${isPaid ? " settings-plan-tag-paid" : ""}`}>
                        {isPaid ? "Active member" : "Free plan"}
                      </span>
                    </div>
                  </div>
                  <Link href="/pricing" className="action-button">
                    {isPaid ? "Manage plan" : "Upgrade plan"}
                  </Link>
                </div>
              </section>

              <section className="dashboard-card">
                <div className="card-header">
                  <h2><BellIcon className="settings-section-icon" /> Alerts</h2>
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
                  <div>
                    <h2><SlidersHorizontalIcon className="settings-section-icon" /> Signal Matching</h2>
                    <p className="card-supporting-copy">Tune which sources and thresholds count as a signal.</p>
                  </div>
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
                  <h2><DownloadIcon className="settings-section-icon" /> Exports</h2>
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
                    <DownloadIcon className="button-icon" />
                    Export current signals
                  </button>
                </div>
              </section>

              <section className="dashboard-card">
                <div className="card-header">
                  <h2><LogOutIcon className="settings-section-icon" /> Session</h2>
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
