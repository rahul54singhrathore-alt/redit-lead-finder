"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangleIcon,
  BellIcon,
  Building2Icon,
  CreditCardIcon,
  LogOutIcon,
  MonitorIcon,
  UserIcon,
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

const SECTIONS = [
  { key: "general",       label: "General",       icon: Building2Icon },
  { key: "account",       label: "Account",        icon: UserIcon },
  { key: "platforms",     label: "Platforms",      icon: MonitorIcon },
  { key: "notifications", label: "Notifications",  icon: BellIcon },
  { key: "plan",          label: "Plan",           icon: CreditCardIcon },
  { key: "danger",        label: "Danger zone",    icon: AlertTriangleIcon },
];

function settingsFromProfile(profile) {
  return {
    productName:       profile.product_name || "",
    productUrl:        profile.product_url || "",
    industry:          profile.industry || "",
    customerType:      profile.customer_type || "both",
    brandDescription:  profile.brand_description || "",
    competitors:       Array.isArray(profile.competitors) ? profile.competitors.join(", ") : "",
    emailDigest:       profile.email_digest,
    digestFrequency:   profile.digest_frequency,
    defaultSubreddits: formatCommaSeparatedList(profile.target_subreddits),
    minScore:          profile.min_score,
    minComments:       profile.min_comments,
    ignoredTerms:      profile.ignored_terms,
    exportFormat:      profile.export_format,
  };
}

function Field({ label, description, inputLabel, children }) {
  return (
    <div className="stg2-field">
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
  const [user,            setUser]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [saved,           setSaved]           = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [message,         setMessage]         = useState("");
  const [activeSection,   setActiveSection]   = useState("general");
  const [profile,         setProfile]         = useState(null);
  const [digestTestStatus,setDigestTestStatus]= useState(null);
  const [autoFillStatus,  setAutoFillStatus]  = useState("idle");
  const [autoFillMessage, setAutoFillMessage] = useState("");

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
    ignoredTerms:      "hiring, job, internship",
    exportFormat:      "csv",
  });

  const router  = useRouter();
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

  const set = (key, val) => { setSettings(s => ({ ...s, [key]: val })); setSaved(false); };

  const isValidUrl = (v) => {
    const t = String(v || "").trim();
    if (!t) return false;
    try { return new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`).hostname.includes("."); }
    catch { return false; }
  };

  const handleAutoFill = async () => {
    setAutoFillMessage(""); setSaved(false);
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
        if (data.brandName)   { n.productName       = data.brandName;               filled.push("name"); }
        if (data.description) { n.brandDescription  = data.description.slice(0,220); filled.push("description"); }
        if (data.industry)    { n.industry          = data.industry;                filled.push("industry"); }
        if (data.websiteUrl)    n.productUrl        = data.websiteUrl;
        return n;
      });
      setAutoFillStatus("success");
      setAutoFillMessage(filled.length ? `Auto-filled: ${filled.join(", ")}.` : "No metadata found.");
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
    setSaved(true); setMessage("");
    setTimeout(() => setSaved(false), 3000);
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

  const tierKey = profile?.subscription_tier || "free";
  const tier    = getTier(tierKey);
  const isPaid  = tierKey !== "free";

  const sectionTitle = SECTIONS.find(s => s.key === activeSection)?.label || "";

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
            <h1>Settings</h1>
          </div>

          {message ? <p className="stg2-error">{message}</p> : null}

          <div className="stg2-layout">

            {/* Left nav */}
            <nav className="stg2-nav">
              <div className="stg2-nav-items">
                {SECTIONS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    className={`stg2-nav-item${activeSection === key ? " stg2-nav-active" : ""}${key === "danger" ? " stg2-nav-danger" : ""}`}
                    onClick={() => setActiveSection(key)}
                  >
                    <Icon />
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" className="stg2-nav-logout" onClick={handleSignOut}>
                <LogOutIcon />
                Log out
              </button>
            </nav>

            {/* Content */}
            <form className="stg2-content" onSubmit={handleSave}>
              <h2 className="stg2-section-title">{sectionTitle}</h2>

              {/* General */}
              {activeSection === "general" && (
                <div className="stg2-fields">
                  <Field label="Brand name" description="The name of your product, service, or company." inputLabel="Brand name">
                    <input className="stg2-input" value={settings.productName} onChange={e => set("productName", e.target.value)} placeholder="e.g., Oras" />
                  </Field>
                  <Field label="Website" description="Used for auto-fill and brand lookups." inputLabel="Website URL">
                    <div className="stg2-url-row">
                      <input className="stg2-input" value={settings.productUrl} onChange={e => { set("productUrl", e.target.value); setAutoFillMessage(""); setAutoFillStatus("idle"); }} placeholder="https://yourbrand.com" />
                      <button type="button" className="stg2-autofill-btn" onClick={handleAutoFill} disabled={autoFillStatus === "loading"}>
                        <WandSparklesIcon className={autoFillStatus === "loading" ? "stg2-spin" : ""} />
                        {autoFillStatus === "loading" ? "Reading…" : "Auto-fill"}
                      </button>
                    </div>
                    {autoFillMessage ? <span className={`stg2-note stg2-note-${autoFillStatus}`}>{autoFillMessage}</span> : null}
                  </Field>
                  <Field label="Industry" description="Helps tailor AI prompts to your market." inputLabel="Industry">
                    <select className="stg2-input" value={settings.industry} onChange={e => set("industry", e.target.value)}>
                      <option value="">Select industry…</option>
                      {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Sells to" description="Whether you sell to businesses, consumers, or both." inputLabel="Customer type">
                    <select className="stg2-input" value={settings.customerType} onChange={e => set("customerType", e.target.value)}>
                      <option value="b2b">B2B — businesses</option>
                      <option value="b2c">B2C — consumers</option>
                      <option value="both">Both</option>
                    </select>
                  </Field>
                  <Field label="Description" description="A short summary of what your brand does. Makes AI checks more accurate." inputLabel="Description">
                    <textarea className="stg2-input stg2-textarea" value={settings.brandDescription} onChange={e => set("brandDescription", e.target.value)} placeholder="One or two lines about what your brand does." rows={3} />
                  </Field>
                  <Field label="Competitors" description="Comma-separated list of brands tracked alongside yours." inputLabel="Competitors">
                    <input className="stg2-input" value={settings.competitors} onChange={e => set("competitors", e.target.value)} placeholder="Competitor A, Competitor B" />
                  </Field>
                </div>
              )}

              {/* Account */}
              {activeSection === "account" && (
                <div className="stg2-fields">
                  <Field label="Email address" description="The email you use to sign in to Oras." inputLabel="Email">
                    <input className="stg2-input" value={user?.email || ""} readOnly />
                  </Field>
                  <Field label="Sign out" description="Sign out of your current session on this device.">
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
                  <Field label="AI engines" description="Choose which AI platforms to include in visibility and GEO checks.">
                    <SourcePresetPicker value={settings.defaultSubreddits} onChange={v => set("defaultSubreddits", v)} />
                  </Field>
                </div>
              )}

              {/* Notifications */}
              {activeSection === "notifications" && (
                <div className="stg2-fields">
                  <Field label="Email digest" description="Receive a summary of your brand's visibility signals on a regular schedule.">
                    <label className="stg2-toggle">
                      <input type="checkbox" checked={settings.emailDigest} onChange={e => set("emailDigest", e.target.checked)} />
                      <span />
                    </label>
                  </Field>
                  <Field label="Digest frequency" description="How often you receive the email digest." inputLabel="Frequency">
                    <select className="stg2-input stg2-input-sm" value={settings.digestFrequency} disabled={!settings.emailDigest} onChange={e => set("digestFrequency", e.target.value)}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="off">Off</option>
                    </select>
                  </Field>
                  <Field label="Test digest" description="Send a sample digest to your inbox right now.">
                    <div className="stg2-test-row">
                      <button type="button" className="stg2-outline-btn" onClick={sendTestDigest} disabled={digestTestStatus === "sending" || !settings.emailDigest}>
                        {digestTestStatus === "sending" ? "Sending…" : "Send test email"}
                      </button>
                      {digestTestStatus === "sent"    && <span className="stg2-status-ok">Sent — check your inbox</span>}
                      {digestTestStatus === "skipped" && <span className="stg2-status-warn">No brand set yet</span>}
                      {digestTestStatus === "error"   && <span className="stg2-status-err">Failed to send</span>}
                    </div>
                  </Field>
                </div>
              )}

              {/* Plan */}
              {activeSection === "plan" && (
                <div className="stg2-fields">
                  <Field label="Current plan" description="Your active subscription tier and its included limits.">
                    <div className="stg2-plan-card">
                      <div className="stg2-plan-top">
                        <span className="stg2-plan-name">{tier.name}</span>
                        <span className={`stg2-plan-badge${isPaid ? " stg2-plan-badge-paid" : ""}`}>{isPaid ? "Active" : "Free"}</span>
                      </div>
                      <div className="stg2-plan-limits">
                        <div className="stg2-plan-stat">
                          <span>{formatLimit(tier.limits.brands)}</span>
                          <label>brand{tier.limits.brands !== 1 ? "s" : ""}</label>
                        </div>
                        <div className="stg2-plan-stat">
                          <span>{formatLimit(tier.limits.promptRuns)}</span>
                          <label>AI checks/mo</label>
                        </div>
                        <div className="stg2-plan-stat">
                          <span>{tier.limits.historyDays === Infinity ? "∞" : `${tier.limits.historyDays}d`}</span>
                          <label>history</label>
                        </div>
                      </div>
                      <div className="stg2-plan-engines">
                        {tier.limits.engines.map(e => <span key={e} className="stg2-engine-chip">{e}</span>)}
                      </div>
                    </div>
                  </Field>
                  <Field label={isPaid ? "Manage subscription" : "Upgrade your plan"} description={isPaid ? "Update billing, download invoices, or cancel your subscription." : "Unlock more brands, AI checks, and team access."}>
                    <Link href="/pricing" className="stg2-outline-btn">{isPaid ? "Billing portal →" : "View plans →"}</Link>
                  </Field>
                </div>
              )}

              {/* Danger zone */}
              {activeSection === "danger" && (
                <div className="stg2-fields">
                  <Field label="Sign out" description="Sign out of your current session on this device.">
                    <button type="button" className="stg2-danger-btn" onClick={handleSignOut}>
                      <LogOutIcon />
                      Sign out
                    </button>
                  </Field>
                </div>
              )}

              <div className="stg2-save-bar">
                {saved ? <span className="stg2-saved-msg">Settings saved</span> : null}
                {activeSection !== "account" && activeSection !== "danger" && (
                  <button type="submit" className="stg2-save-btn" disabled={saving}>
                    {saving ? "Saving…" : "Save settings"}
                  </button>
                )}
              </div>
            </form>

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
