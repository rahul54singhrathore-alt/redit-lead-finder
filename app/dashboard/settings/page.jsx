"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
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

function settingsFromProfile(profile) {
  return {
    productName: profile.product_name || "",
    productUrl: profile.product_url || "",
    industry: profile.industry || "",
    customerType: profile.customer_type || "both",
    brandDescription: profile.brand_description || "",
    competitors: Array.isArray(profile.competitors) ? profile.competitors.join(", ") : "",
    emailDigest: profile.email_digest,
    digestFrequency: profile.digest_frequency,
    defaultSubreddits: formatCommaSeparatedList(profile.target_subreddits),
    minScore: profile.min_score,
    minComments: profile.min_comments,
    ignoredTerms: profile.ignored_terms,
    exportFormat: profile.export_format,
  };
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="stg-section-head">
      <div className="stg-section-title">
        <Icon className="stg-section-icon" />
        {title}
      </div>
      {description ? <p className="stg-section-desc">{description}</p> : null}
    </div>
  );
}

function FieldRow({ label, hint, children, wide }) {
  return (
    <div className={`stg-field-row${wide ? " stg-field-row-wide" : ""}`}>
      <div className="stg-field-meta">
        <span className="stg-field-label">{label}</span>
        {hint ? <span className="stg-field-hint">{hint}</span> : null}
      </div>
      <div className="stg-field-control">{children}</div>
    </div>
  );
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
    competitors: "",
    emailDigest: true,
    digestFrequency: "daily",
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
        setMessage("Could not load settings. Please refresh.");
      } else if (data) {
        const normalized = normalizeWorkspaceProfile(data);
        setProfile(normalized);
        setSettings(settingsFromProfile(normalized));
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

  const set = (key, value) => { setSettings((s) => ({ ...s, [key]: value })); setSaved(false); };

  const isValidUrl = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return false;
    try {
      const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
      return url.hostname.includes(".");
    } catch { return false; }
  };

  const handleAutoFill = async () => {
    setAutoFillMessage(""); setSaved(false);
    if (!isValidUrl(settings.productUrl)) {
      setAutoFillStatus("error");
      setAutoFillMessage("Enter a valid website URL first.");
      return;
    }
    setAutoFillStatus("loading");
    try {
      const res = await fetch("/api/brand-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: settings.productUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setAutoFillStatus("error"); setAutoFillMessage(data?.error || "Could not read that website."); return; }
      const filled = [];
      setSettings((s) => {
        const next = { ...s };
        if (data.brandName) { next.productName = data.brandName; filled.push("name"); }
        if (data.description) { next.brandDescription = data.description.slice(0, 220); filled.push("description"); }
        if (data.industry) { next.industry = data.industry; filled.push("industry"); }
        if (data.websiteUrl) next.productUrl = data.websiteUrl;
        return next;
      });
      setAutoFillStatus("success");
      setAutoFillMessage(filled.length ? `Auto-filled ${filled.join(", ")}.` : "No brand metadata found.");
    } catch {
      setAutoFillStatus("error");
      setAutoFillMessage("Something went wrong.");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!supabase || !user) { setMessage("Not authenticated."); return; }
    const competitorList = settings.competitors.split(",").map((c) => c.trim()).filter(Boolean);
    const payload = {
      user_id: user.id,
      onboarding_completed: profile?.onboarding_completed ?? true,
      product_name: settings.productName.trim(),
      product_url: settings.productUrl.trim(),
      industry: settings.industry,
      customer_type: settings.customerType,
      brand_description: settings.brandDescription.trim(),
      competitors: competitorList,
      starter_keyword: profile?.starter_keyword || settings.productName.trim(),
      target_subreddits: parseCommaSeparatedList(settings.defaultSubreddits),
      digest_frequency: settings.digestFrequency,
      email_digest: settings.emailDigest,
      min_score: Number(settings.minScore) || 0,
      min_comments: Number(settings.minComments) || 0,
      ignored_terms: settings.ignoredTerms,
      export_format: settings.exportFormat,
      updated_at: new Date().toISOString(),
    };
    const { error, data } = await supabase.from("user_profiles").upsert(payload).select("*").single();
    if (error) { setMessage(error.message || "Could not save settings."); return; }
    if (data) setProfile(normalizeWorkspaceProfile(data));
    setSaved(true); setMessage("");
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
              <p className="stg-page-desc">Manage your brand, notifications, and workspace.</p>
            </div>
          </div>

          {message ? <p className="stg-error">{message}</p> : null}

          <form className="stg-form" onSubmit={handleSave}>

            {/* Brand */}
            <section className="stg-section">
              <SectionHeader
                icon={Building2Icon}
                title="Brand"
                description="Powers every AI check — GEO Score, Visibility, and Recommendations."
              />
              <div className="stg-fields">
                <FieldRow label="Brand name">
                  <input
                    className="stg-input"
                    value={settings.productName}
                    onChange={(e) => set("productName", e.target.value)}
                    placeholder="e.g., Oras"
                  />
                </FieldRow>
                <FieldRow label="Website" hint="Used for auto-fill and brand lookups.">
                  <div className="stg-url-row">
                    <input
                      className="stg-input"
                      value={settings.productUrl}
                      onChange={(e) => { set("productUrl", e.target.value); setAutoFillMessage(""); setAutoFillStatus("idle"); }}
                      placeholder="https://yourbrand.com"
                    />
                    <button type="button" className="stg-autofill-btn" onClick={handleAutoFill} disabled={autoFillStatus === "loading"}>
                      <WandSparklesIcon className={autoFillStatus === "loading" ? "stg-spin" : ""} />
                      {autoFillStatus === "loading" ? "Reading…" : "Auto-fill"}
                    </button>
                  </div>
                  {autoFillMessage ? (
                    <span className={`stg-note stg-note-${autoFillStatus}`}>{autoFillMessage}</span>
                  ) : null}
                </FieldRow>
                <FieldRow label="Industry">
                  <select className="stg-input" value={settings.industry} onChange={(e) => set("industry", e.target.value)}>
                    <option value="">Select industry…</option>
                    {INDUSTRY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </FieldRow>
                <FieldRow label="Sells to">
                  <select className="stg-input" value={settings.customerType} onChange={(e) => set("customerType", e.target.value)}>
                    <option value="b2b">B2B — businesses</option>
                    <option value="b2c">B2C — consumers</option>
                    <option value="both">Both</option>
                  </select>
                </FieldRow>
                <FieldRow label="Description" hint="Makes AI checks more accurate." wide>
                  <textarea
                    className="stg-input stg-textarea"
                    value={settings.brandDescription}
                    onChange={(e) => set("brandDescription", e.target.value)}
                    placeholder="One or two lines about what your brand does."
                    rows={2}
                  />
                </FieldRow>
                <FieldRow label="Competitors" hint="Comma-separated. Tracked alongside your brand." wide>
                  <input
                    className="stg-input"
                    value={settings.competitors}
                    onChange={(e) => set("competitors", e.target.value)}
                    placeholder="Competitor A, Competitor B"
                  />
                </FieldRow>
              </div>
            </section>

            {/* Platforms */}
            <section className="stg-section">
              <SectionHeader
                icon={MonitorIcon}
                title="AI Platforms"
                description="Choose which AI engines to include in visibility checks."
              />
              <div className="stg-fields stg-fields-plain">
                <SourcePresetPicker
                  value={settings.defaultSubreddits}
                  onChange={(value) => set("defaultSubreddits", value)}
                />
              </div>
            </section>

            {/* Notifications */}
            <section className="stg-section">
              <SectionHeader
                icon={BellIcon}
                title="Notifications"
                description="Control how and when Oras sends you updates."
              />
              <div className="stg-fields">
                <FieldRow label="Email digest" hint="Summarize visibility signals on a schedule.">
                  <label className="stg-toggle">
                    <input type="checkbox" checked={settings.emailDigest} onChange={(e) => set("emailDigest", e.target.checked)} />
                    <span />
                  </label>
                </FieldRow>
                <FieldRow label="Digest frequency">
                  <select
                    className="stg-input stg-input-sm"
                    value={settings.digestFrequency}
                    disabled={!settings.emailDigest}
                    onChange={(e) => set("digestFrequency", e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="off">Off</option>
                  </select>
                </FieldRow>
                <FieldRow label="Test digest" hint="Send a sample digest to your inbox.">
                  <div className="stg-test-row">
                    <button
                      type="button"
                      className="stg-secondary-btn"
                      onClick={sendTestDigest}
                      disabled={digestTestStatus === "sending" || !settings.emailDigest}
                    >
                      {digestTestStatus === "sending" ? "Sending…" : "Send test"}
                    </button>
                    {digestTestStatus === "sent" && <span className="stg-status-ok">Sent — check your inbox</span>}
                    {digestTestStatus === "skipped" && <span className="stg-status-warn">No brand set yet</span>}
                    {digestTestStatus === "error" && <span className="stg-status-err">Failed to send</span>}
                  </div>
                </FieldRow>
              </div>
            </section>

            {/* Plan */}
            <section className="stg-section">
              <SectionHeader icon={CreditCardIcon} title="Plan" />
              <div className="stg-fields">
                <FieldRow label="Current plan">
                  <div className="stg-plan-row">
                    <span className="stg-plan-name">{tier.name}</span>
                    <span className={`stg-plan-badge${isPaid ? " stg-plan-badge-paid" : ""}`}>
                      {isPaid ? "Active" : "Free"}
                    </span>
                  </div>
                </FieldRow>
                <FieldRow label="Limits">
                  <div className="stg-plan-limits">
                    <div className="stg-plan-limit">
                      <span>{formatLimit(tier.limits.brands)}</span>
                      <label>brand{tier.limits.brands !== 1 ? "s" : ""}</label>
                    </div>
                    <div className="stg-plan-limit">
                      <span>{formatLimit(tier.limits.promptRuns)}</span>
                      <label>AI checks/mo</label>
                    </div>
                    <div className="stg-plan-limit">
                      <span>{tier.limits.historyDays === Infinity ? "∞" : `${tier.limits.historyDays}d`}</span>
                      <label>history</label>
                    </div>
                  </div>
                </FieldRow>
                <FieldRow label="Engines">
                  <div className="stg-engines">
                    {tier.limits.engines.map((e) => <span key={e} className="stg-engine-chip">{e}</span>)}
                  </div>
                </FieldRow>
                <FieldRow label="">
                  <Link href="/pricing" className="stg-secondary-btn">
                    {isPaid ? "Manage plan" : "Upgrade plan →"}
                  </Link>
                </FieldRow>
              </div>
            </section>

            {/* Account */}
            <section className="stg-section stg-section-last">
              <SectionHeader icon={UserIcon} title="Account" />
              <div className="stg-fields">
                <FieldRow label="Email">
                  <input className="stg-input" value={user?.email || ""} readOnly />
                </FieldRow>
                <FieldRow label="Session">
                  <button type="button" className="stg-danger-btn" onClick={handleSignOut}>
                    <LogOutIcon />
                    Sign out
                  </button>
                </FieldRow>
              </div>
            </section>

            <div className="stg-save-bar">
              {saved ? <span className="stg-saved-label">Changes saved</span> : null}
              <button type="submit" className="stg-save-btn">Save changes</button>
            </div>

          </form>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
