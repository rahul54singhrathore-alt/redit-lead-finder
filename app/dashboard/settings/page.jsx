"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  BellIcon,
  Building2Icon,
  CheckIcon,
  CreditCardIcon,
  LogOutIcon,
  MonitorIcon,
  UserIcon,
  WandSparklesIcon,
  ZapIcon,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { PricingPlans } from "@/components/pricing-plans";
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

const SECTIONS = [
  { key: "general",       label: "General",       icon: Building2Icon },
  { key: "account",       label: "Account",        icon: UserIcon },
  { key: "platforms",     label: "Platforms",      icon: MonitorIcon },
  { key: "notifications", label: "Notifications",  icon: BellIcon },
  { key: "plan",          label: "Plan",           icon: CreditCardIcon },
];

function settingsFromProfile(profile) {
  return {
    productName:       profile.product_name || "",
    productUrl:        profile.product_url || "",
    industry:          profile.industry || "",
    customerType:      profile.customer_type || "both",
    brandDescription:  profile.brand_description || "",
    competitors:       Array.isArray(profile.competitors) ? profile.competitors.join(", ") : "",
    emailDigest:       profile.email_digest ?? true,
    digestFrequency:   profile.digest_frequency || "daily",
    defaultSubreddits: formatCommaSeparatedList(profile.target_subreddits),
    minScore:          profile.min_score ?? 5,
    minComments:       profile.min_comments ?? 3,
    ignoredTerms:      profile.ignored_terms || "",
    exportFormat:      profile.export_format || "csv",
  };
}

function initials(email) {
  if (!email) return "?";
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

function Field({ label, description, inputLabel, children, noBorder }) {
  return (
    <div className={`stg2-field${noBorder ? " stg2-field-no-border" : ""}`}>
      <div className="stg2-field-desc">
        <strong>{label}</strong>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="stg2-field-right">
        {inputLabel ? <label className="stg2-input-label">{inputLabel}</label> : null}
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [user,             setUser]             = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [saved,            setSaved]            = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [dirty,            setDirty]            = useState(false);
  const [message,          setMessage]          = useState("");
  const [activeSection,    setActiveSection]    = useState("general");
  const [profile,          setProfile]          = useState(null);
  const [digestTestStatus, setDigestTestStatus] = useState(null);
  const [autoFillStatus,   setAutoFillStatus]   = useState("idle");
  const [autoFillMessage,  setAutoFillMessage]  = useState("");
  const savedTimer = useRef(null);

  const [settings, setSettings] = useState({
    productName:       "",
    productUrl:        "",
    industry:          "",
    customerType:      "both",
    brandDescription:  "",
    competitors:       "",
    emailDigest:       true,
    digestFrequency:   "daily",
    defaultSubreddits: formatDefaultVisibilitySources(),
    minScore:          5,
    minComments:       3,
    ignoredTerms:      "",
    exportFormat:      "csv",
  });

  const router   = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/signin"); return; }
      setUser(session.user);
      const { data, error } = await supabase
        .from("user_profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (error) setMessage("Could not load settings.");
      else if (data) {
        const n = normalizeWorkspaceProfile(data);
        setProfile(n);
        setSettings(settingsFromProfile(n));
      }
      setLoading(false);
    };
    load();
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { router.replace("/signin"); return; }
      setUser(session.user);
      supabase.from("user_profiles").select("*").eq("user_id", session.user.id).maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          const n = normalizeWorkspaceProfile(data);
          setProfile(n);
          setSettings(settingsFromProfile(n));
        });
      setLoading(false);
    });
    return () => listener?.subscription?.unsubscribe();
  }, [router, supabase]);

  const set = (key, val) => {
    setSettings(s => ({ ...s, [key]: val }));
    setDirty(true);
    setSaved(false);
  };

  const isValidUrl = (v) => {
    const t = String(v || "").trim();
    if (!t) return false;
    try { return new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`).hostname.includes("."); }
    catch { return false; }
  };

  const handleAutoFill = async () => {
    setAutoFillMessage(""); setDirty(false);
    if (!isValidUrl(settings.productUrl)) {
      setAutoFillStatus("error"); setAutoFillMessage("Enter a valid URL first."); return;
    }
    setAutoFillStatus("loading");
    try {
      const res  = await fetch("/api/brand-lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: settings.productUrl.trim() }) });
      const data = await res.json();
      if (!res.ok) { setAutoFillStatus("error"); setAutoFillMessage(data?.error || "Could not read that site."); return; }
      const filled = [];
      setSettings(s => {
        const n = { ...s };
        if (data.brandName)   { n.productName      = data.brandName;                filled.push("name"); }
        if (data.description) { n.brandDescription = data.description.slice(0, 220); filled.push("description"); }
        if (data.industry)    { n.industry         = data.industry;                 filled.push("industry"); }
        if (data.websiteUrl)    n.productUrl       = data.websiteUrl;
        return n;
      });
      setAutoFillStatus("success");
      setAutoFillMessage(filled.length ? `Auto-filled: ${filled.join(", ")}.` : "No metadata found.");
      setDirty(true);
    } catch { setAutoFillStatus("error"); setAutoFillMessage("Something went wrong."); }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!supabase || !user) return;
    setSaving(true);
    const payload = {
      user_id:              user.id,
      onboarding_completed: profile?.onboarding_completed ?? true,
      product_name:         settings.productName.trim(),
      product_url:          settings.productUrl.trim(),
      industry:             settings.industry,
      customer_type:        settings.customerType,
      brand_description:    settings.brandDescription.trim(),
      competitors:          settings.competitors.split(",").map(c => c.trim()).filter(Boolean),
      starter_keyword:      profile?.starter_keyword || settings.productName.trim(),
      target_subreddits:    parseCommaSeparatedList(settings.defaultSubreddits),
      digest_frequency:     settings.digestFrequency,
      email_digest:         settings.emailDigest,
      min_score:            Number(settings.minScore) || 0,
      min_comments:         Number(settings.minComments) || 0,
      ignored_terms:        settings.ignoredTerms,
      export_format:        settings.exportFormat,
      updated_at:           new Date().toISOString(),
    };
    const { error, data } = await supabase.from("user_profiles").upsert(payload).select("*").single();
    setSaving(false);
    if (error) { setMessage(error.message || "Could not save."); return; }
    if (data) setProfile(normalizeWorkspaceProfile(data));
    setSaved(true); setDirty(false); setMessage("");
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 3000);
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
      const res  = await fetch("/api/digest/send", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` }, body: JSON.stringify({ test: true, userId: user.id }) });
      const json = await res.json();
      if (!res.ok || json.error) setDigestTestStatus("error");
      else if (json.sent > 0)    setDigestTestStatus("sent");
      else                       setDigestTestStatus("skipped");
    } catch { setDigestTestStatus("error"); }
    setTimeout(() => setDigestTestStatus(null), 4000);
  };

  const switchSection = (key) => {
    setActiveSection(key);
    setSaved(false);
  };

  const tierKey = profile?.subscription_tier || "free";
  const tier    = getTier(tierKey);
  const isPaid  = tierKey !== "free";
  const showSave = !["account", "plan"].includes(activeSection);

  if (loading) return (
    <SidebarProvider>
      <SidebarInset>
        <div className="dashboard-main">
          <div className="page-loader"><div className="page-loader-ring" /></div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main stg2-main">
          <div className="dashboard-header">
            <SidebarTrigger className="dashboard-sidebar-trigger" />
          </div>

          {message ? <p className="stg2-error">{message}</p> : null}

          <div className="stg2-layout">

            {/* ── Left nav ── */}
            <nav className="stg2-nav">
              {/* User avatar */}
              <div className="stg2-nav-user">
                <div className="stg2-avatar">{initials(user?.email)}</div>
                <div className="stg2-nav-user-info">
                  <span className="stg2-nav-user-email">{user?.email || "—"}</span>
                  <span className="stg2-nav-user-plan">{tier.name} plan</span>
                </div>
              </div>

              <div className="stg2-nav-divider" />

              {/* Section links */}
              <div className="stg2-nav-items">
                {SECTIONS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    className={`stg2-nav-item${activeSection === key ? " stg2-nav-active" : ""}${key === "danger" ? " stg2-nav-danger" : ""}`}
                    onClick={() => switchSection(key)}
                  >
                    <Icon />
                    {label}
                    {key === "danger" && <span className="stg2-nav-danger-dot" />}
                  </button>
                ))}
              </div>

              <div className="stg2-nav-bottom">
                <div className="stg2-nav-divider" />
                <button type="button" className="stg2-nav-logout" onClick={handleSignOut}>
                  <LogOutIcon />
                  Log out
                </button>
              </div>
            </nav>

            {/* ── Content ── */}
            <form className={`stg2-content${activeSection === "plan" ? " stg2-content-wide" : ""}`} onSubmit={handleSave}>

              {activeSection !== "plan" && (
                <div className="stg2-content-head">
                  <div>
                    <h2 className="stg2-section-title">
                      {SECTIONS.find(s => s.key === activeSection)?.label}
                    </h2>
                    {activeSection === "general" && <p className="stg2-section-sub">Manage your brand information used across all AI checks.</p>}
                    {activeSection === "account" && <p className="stg2-section-sub">Manage your account details and session.</p>}
                    {activeSection === "platforms" && <p className="stg2-section-sub">Choose which AI engines to include in visibility checks.</p>}
                    {activeSection === "notifications" && <p className="stg2-section-sub">Control how and when Oras sends you email updates.</p>}
                    </div>
                  {dirty && showSave && (
                    <span className="stg2-unsaved-badge">Unsaved changes</span>
                  )}
                </div>
              )}

              <div className="stg2-fields-wrap">

                {/* General */}
                {activeSection === "general" && (
                  <div className="stg2-fields">
                    <Field label="Brand name" description="The name of your product, service, or company." inputLabel="Brand name">
                      <input className="stg2-input" value={settings.productName} onChange={e => set("productName", e.target.value)} placeholder="e.g., Oras" />
                    </Field>
                    <Field label="Website" description="Used for auto-fill and brand lookups across AI engines." inputLabel="Website URL">
                      <div className="stg2-url-row">
                        <input className="stg2-input" value={settings.productUrl} onChange={e => { set("productUrl", e.target.value); setAutoFillMessage(""); setAutoFillStatus("idle"); }} placeholder="https://yourbrand.com" />
                        <button type="button" className="stg2-autofill-btn" onClick={handleAutoFill} disabled={autoFillStatus === "loading"}>
                          <WandSparklesIcon className={autoFillStatus === "loading" ? "stg2-spin" : ""} />
                          {autoFillStatus === "loading" ? "Reading…" : "Auto-fill"}
                        </button>
                      </div>
                      {autoFillMessage ? <span className={`stg2-note stg2-note-${autoFillStatus}`}>{autoFillMessage}</span> : null}
                    </Field>
                    <Field label="Industry" description="Helps Oras tailor AI prompts to your market segment." inputLabel="Industry">
                      <select className="stg2-input" value={settings.industry} onChange={e => set("industry", e.target.value)}>
                        <option value="">Select industry…</option>
                        {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Sells to" description="Whether you target businesses, consumers, or both." inputLabel="Customer type">
                      <select className="stg2-input" value={settings.customerType} onChange={e => set("customerType", e.target.value)}>
                        <option value="b2b">B2B — businesses</option>
                        <option value="b2c">B2C — consumers</option>
                        <option value="both">Both</option>
                      </select>
                    </Field>
                    <Field label="Description" description="A short summary of what your brand does. Makes AI checks significantly more accurate." inputLabel="Description">
                      <textarea className="stg2-input stg2-textarea" value={settings.brandDescription} onChange={e => set("brandDescription", e.target.value)} placeholder="What does your brand do and who does it help?" rows={3} />
                    </Field>
                    <Field label="Competitors" description="Brands tracked alongside yours in every AI check." inputLabel="Competitors" noBorder>
                      <input className="stg2-input" value={settings.competitors} onChange={e => set("competitors", e.target.value)} placeholder="Competitor A, Competitor B" />
                      <span className="stg2-field-hint">Comma-separated</span>
                    </Field>
                  </div>
                )}

                {/* Account */}
                {activeSection === "account" && (
                  <div className="stg2-fields">
                    {(user?.user_metadata?.full_name || user?.user_metadata?.name) && (
                      <Field label="Name" description="Your name as provided during sign-up." inputLabel="Full name">
                        <input className="stg2-input" value={user?.user_metadata?.full_name || user?.user_metadata?.name || ""} readOnly />
                      </Field>
                    )}
                    <Field label="Email address" description="The email you use to sign in to Oras. Cannot be changed here." inputLabel="Email">
                      <input className="stg2-input" value={user?.email || ""} readOnly />
                    </Field>
                    {user?.app_metadata?.provider && (
                      <Field label="Sign-in method" description="How you authenticate with Oras.">
                        <span className="stg2-meta-value stg2-meta-provider">
                          {user.app_metadata.provider === "google" ? "Google" :
                           user.app_metadata.provider === "github" ? "GitHub" :
                           user.app_metadata.provider === "email"  ? "Email & password" :
                           user.app_metadata.provider}
                        </span>
                      </Field>
                    )}
                    {user?.created_at && (
                      <Field label="Member since" description="When your Oras account was created.">
                        <span className="stg2-meta-value">
                          {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </Field>
                    )}
                    {user?.last_sign_in_at && (
                      <Field label="Last sign-in" description="The most recent time you logged in.">
                        <span className="stg2-meta-value">
                          {new Date(user.last_sign_in_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </Field>
                    )}
                    <Field label="Sign out" description="End your current session on this device." noBorder>
                      <button type="button" className="stg2-outline-btn" onClick={handleSignOut}>
                        <LogOutIcon />
                        Sign out
                      </button>
                    </Field>
                  </div>
                )}

                {/* Platforms */}
                {activeSection === "platforms" && (
                  <div className="stg2-fields">
                    <Field label="AI engines" description="Select the engines Oras will query when checking your brand's visibility." noBorder>
                      <SourcePresetPicker value={settings.defaultSubreddits} onChange={v => set("defaultSubreddits", v)} />
                    </Field>
                  </div>
                )}

                {/* Notifications */}
                {activeSection === "notifications" && (
                  <div className="stg2-fields">
                    <Field label="Email digest" description="Receive a regular summary of your brand's AI visibility signals.">
                      <label className="stg2-toggle">
                        <input type="checkbox" checked={settings.emailDigest} onChange={e => set("emailDigest", e.target.checked)} />
                        <span />
                        <span className="stg2-toggle-label">{settings.emailDigest ? "Enabled" : "Disabled"}</span>
                      </label>
                    </Field>
                    <Field label="Digest frequency" description="How often you want to receive the email digest." inputLabel="Frequency">
                      <select className="stg2-input stg2-input-sm" value={settings.digestFrequency} disabled={!settings.emailDigest} onChange={e => set("digestFrequency", e.target.value)}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="off">Off</option>
                      </select>
                    </Field>
                    <Field label="Send a test" description="Send a sample digest to your inbox right now to preview the format." noBorder>
                      <div className="stg2-test-row">
                        <button type="button" className="stg2-outline-btn" onClick={sendTestDigest} disabled={digestTestStatus === "sending" || !settings.emailDigest}>
                          {digestTestStatus === "sending" ? "Sending…" : "Send test email"}
                        </button>
                        {digestTestStatus === "sent"    && <span className="stg2-status-ok"><CheckIcon />Sent — check your inbox</span>}
                        {digestTestStatus === "skipped" && <span className="stg2-status-warn">No brand set yet</span>}
                        {digestTestStatus === "error"   && <span className="stg2-status-err">Failed to send</span>}
                      </div>
                    </Field>
                  </div>
                )}

                {/* Plan */}
                {activeSection === "plan" && (
                  <div className="stg2-pricing-embed">
                    <PricingPlans />
                  </div>
                )}


              </div>

              {/* Save bar */}
              {showSave && (
                <div className="stg2-save-bar">
                  {saved
                    ? <span className="stg2-saved-msg"><CheckIcon />Saved</span>
                    : <span className="stg2-save-hint">Press Save to apply changes</span>
                  }
                  <button type="submit" className={`stg2-save-btn${dirty ? " stg2-save-btn-active" : ""}`} disabled={saving}>
                    {saving ? "Saving…" : "Save settings"}
                  </button>
                </div>
              )}

            </form>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
