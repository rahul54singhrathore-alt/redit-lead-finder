"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BellIcon,
  Building2Icon,
  CreditCardIcon,
  LogOutIcon,
  SlidersHorizontalIcon,
  WandSparklesIcon,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SourcePresetPicker } from "@/components/source-preset-picker";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { getTier, formatLimit } from "../../../lib/subscription";
import {
  INDUSTRY_OPTIONS,
  formatCommaSeparatedList,
  formatDefaultVisibilitySources,
  normalizeWorkspaceProfile,
  parseCommaSeparatedList,
} from "../../../lib/workspace-profile";

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
  const [autoFillStatus, setAutoFillStatus] = useState("idle");
  const [autoFillMessage, setAutoFillMessage] = useState("");
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/signin"); return; }
      setUser(session.user);
      const { data, error } = await supabase
        .from("user_profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (error) {
        setMessage("Could not load settings. Please refresh the page.");
      } else if (data) {
        const normalized = normalizeWorkspaceProfile(data);
        setProfile(normalized);
        setSettings(settingsFromProfile(normalized));
        setMessage("");
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        supabase.from("user_profiles").select("*").eq("user_id", session.user.id).maybeSingle()
          .then(({ data, error }) => {
            if (error || !data) return;
            const normalized = normalizeWorkspaceProfile(data);
            setProfile(normalized);
            setSettings(settingsFromProfile(normalized));
          });
        setLoading(false);
      }
    });

    return () => authListener?.subscription?.unsubscribe();
  }, [router, supabase]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const isValidUrl = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return false;
    try {
      const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
      return url.hostname.includes(".");
    } catch { return false; }
  };

  const handleAutoFill = async () => {
    setAutoFillMessage("");
    setSaved(false);
    if (!isValidUrl(settings.productUrl)) {
      setAutoFillStatus("error");
      setAutoFillMessage("Enter a valid website URL first.");
      return;
    }
    setAutoFillStatus("loading");
    try {
      const response = await fetch("/api/brand-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: settings.productUrl.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAutoFillStatus("error");
        setAutoFillMessage(data?.error || "Could not read that website.");
        return;
      }
      const filled = [];
      setSettings((current) => {
        const next = { ...current };
        if (data.brandName) { next.productName = data.brandName; filled.push("name"); }
        if (data.description) { next.brandDescription = data.description.slice(0, 220); filled.push("description"); }
        if (data.industry) { next.industry = data.industry; filled.push("industry"); }
        if (data.websiteUrl) next.productUrl = data.websiteUrl;
        return next;
      });
      setAutoFillStatus("success");
      setAutoFillMessage(
        filled.length ? `Auto-filled ${filled.join(", ")}. Review and save.` : "Reached the site but found no brand metadata.",
      );
    } catch {
      setAutoFillStatus("error");
      setAutoFillMessage("Something went wrong reaching that website.");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!supabase || !user) { setMessage("Supabase is not configured yet."); return; }

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

    const { error, data } = await supabase.from("user_profiles").upsert(payload).select("*").single();
    if (error) { setMessage(error.message || "Could not save settings."); return; }
    if (data) setProfile(normalizeWorkspaceProfile(data));
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` },
        body: JSON.stringify({ test: true, userId: user.id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) setDigestTestStatus("error");
      else if (json.sent > 0) setDigestTestStatus("sent");
      else setDigestTestStatus("skipped");
    } catch { setDigestTestStatus("error"); }
    setTimeout(() => setDigestTestStatus(null), 5000);
  };

  const tierKey = profile?.subscription_tier || "free";
  const tier = getTier(tierKey);
  const isPaid = tierKey !== "free";

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
              <h1>Settings</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>
                Manage your brand, notifications, and workspace preferences.
              </p>
            </div>
          </div>

          {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}

          <form className="dashboard-content" onSubmit={handleSave}>
            <div className="settings-grid">

              {/* Brand — full width */}
              <section className="dashboard-card dashboard-card-wide">
                <div className="card-header">
                  <div>
                    <h2><Building2Icon className="settings-section-icon" /> Brand</h2>
                    <p className="card-supporting-copy">
                      Powers every AI check — GEO Roadmap, Visibility, and Reddit drafts.
                    </p>
                  </div>
                </div>
                <div className="settings-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-name">Brand name</label>
                    <input
                      id="product-name"
                      className="form-input"
                      value={settings.productName}
                      onChange={(e) => updateSetting("productName", e.target.value)}
                      placeholder="e.g., Oras"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="product-url">Website</label>
                    <div className="settings-autofill-row">
                      <input
                        id="product-url"
                        className="form-input"
                        value={settings.productUrl}
                        onChange={(e) => {
                          updateSetting("productUrl", e.target.value);
                          setAutoFillMessage("");
                          setAutoFillStatus("idle");
                        }}
                        placeholder="https://yourbrand.com"
                      />
                      <button
                        type="button"
                        className="settings-autofill-button"
                        onClick={handleAutoFill}
                        disabled={autoFillStatus === "loading"}
                      >
                        <WandSparklesIcon className={autoFillStatus === "loading" ? "onboarding-spin" : ""} />
                        {autoFillStatus === "loading" ? "Reading…" : "Auto-fill"}
                      </button>
                    </div>
                    {autoFillMessage ? (
                      <span className={`settings-autofill-note settings-autofill-note-${autoFillStatus}`}>
                        {autoFillMessage}
                      </span>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="industry">Industry</label>
                    <select
                      id="industry"
                      className="form-input"
                      value={settings.industry}
                      onChange={(e) => updateSetting("industry", e.target.value)}
                    >
                      <option value="">Select industry…</option>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer-type">Sells to</label>
                    <select
                      id="customer-type"
                      className="form-input"
                      value={settings.customerType}
                      onChange={(e) => updateSetting("customerType", e.target.value)}
                    >
                      <option value="b2b">B2B — businesses</option>
                      <option value="b2c">B2C — consumers</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="form-group settings-span-2">
                    <label className="form-label" htmlFor="brand-description">What does your brand do?</label>
                    <textarea
                      id="brand-description"
                      className="form-input textarea-input"
                      value={settings.brandDescription}
                      onChange={(e) => updateSetting("brandDescription", e.target.value)}
                      placeholder="One or two lines — makes AI checks more accurate."
                    />
                  </div>
                </div>
              </section>

              {/* Notifications — Account + Alerts merged */}
              <section className="dashboard-card">
                <div className="card-header">
                  <h2><BellIcon className="settings-section-icon" /> Notifications</h2>
                </div>
                <div className="settings-stack">
                  <div className="form-group">
                    <label className="form-label" htmlFor="account-email">Email</label>
                    <input id="account-email" className="form-input" value={user?.email || ""} readOnly />
                  </div>
                  <div className="setting-row">
                    <div>
                      <h3>Email digest</h3>
                      <p>Summarize new visibility signals on a schedule.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.emailDigest}
                        onChange={(e) => updateSetting("emailDigest", e.target.checked)}
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
                      disabled={!settings.emailDigest}
                      onChange={(e) => updateSetting("digestFrequency", e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                  <div className="settings-test-row">
                    <button
                      type="button"
                      className="action-button settings-test-btn"
                      onClick={sendTestDigest}
                      disabled={digestTestStatus === "sending" || !settings.emailDigest}
                    >
                      {digestTestStatus === "sending" ? "Sending…" : "Send test digest"}
                    </button>
                    {digestTestStatus === "sent" && (
                      <span className="settings-test-status settings-test-ok">✓ Sent — check your inbox</span>
                    )}
                    {digestTestStatus === "skipped" && (
                      <span className="settings-test-status settings-test-warn">No brand set yet</span>
                    )}
                    {digestTestStatus === "error" && (
                      <span className="settings-test-status settings-test-err">Failed — check your email settings</span>
                    )}
                  </div>
                  <div className="settings-divider" />
                  <button type="button" className="danger-button" onClick={handleSignOut}>
                    <LogOutIcon className="button-icon" />
                    Sign out
                  </button>
                </div>
              </section>

              {/* Plan */}
              <section className="dashboard-card">
                <div className="card-header">
                  <h2><CreditCardIcon className="settings-section-icon" /> Plan</h2>
                </div>
                <div className="settings-stack">
                  <div className="settings-plan-row">
                    <span className="settings-plan-name">{tier.name}</span>
                    <span className={`settings-plan-tag${isPaid ? " settings-plan-tag-paid" : ""}`}>
                      {isPaid ? "Active" : "Free"}
                    </span>
                  </div>
                  <div className="settings-plan-limits">
                    <div className="settings-plan-limit">
                      <span className="settings-plan-limit-val">{formatLimit(tier.limits.brands)}</span>
                      <span className="settings-plan-limit-label">brand{tier.limits.brands !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="settings-plan-limit">
                      <span className="settings-plan-limit-val">{formatLimit(tier.limits.promptRuns)}</span>
                      <span className="settings-plan-limit-label">AI checks / mo</span>
                    </div>
                    <div className="settings-plan-limit">
                      <span className="settings-plan-limit-val">
                        {tier.limits.historyDays === Infinity ? "∞" : `${tier.limits.historyDays}d`}
                      </span>
                      <span className="settings-plan-limit-label">history</span>
                    </div>
                  </div>
                  <div className="settings-engines">
                    {tier.limits.engines.map((e) => (
                      <span key={e} className="settings-engine-chip">{e}</span>
                    ))}
                  </div>
                  <Link href="/pricing" className="action-button">
                    {isPaid ? "Manage plan" : "Upgrade plan →"}
                  </Link>
                </div>
              </section>

              {/* Signal Matching — full width */}
              <section className="dashboard-card dashboard-card-wide">
                <div className="card-header">
                  <div>
                    <h2><SlidersHorizontalIcon className="settings-section-icon" /> AI Platforms</h2>
                    <p className="card-supporting-copy">Choose which AI platforms to include in your visibility checks.</p>
                  </div>
                </div>
                <SourcePresetPicker
                  value={settings.defaultSubreddits}
                  onChange={(value) => updateSetting("defaultSubreddits", value)}
                />
              </section>

            </div>

            <div className="settings-actions">
              {saved && <span className="settings-saved">✓ Saved</span>}
              <button type="submit" className="primary-button settings-save-button">
                Save settings
              </button>
            </div>
          </form>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
