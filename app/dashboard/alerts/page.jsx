"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";
import { getTier, hasFeature } from "../../../lib/subscription";
import { LimitNotice } from "@/components/upgrade-prompt";
import { BellIcon, ExternalLinkIcon, PlusIcon, SearchIcon, Trash2Icon, TrendingUpIcon } from "lucide-react";

const TRIGGER_PRESETS = [
  "Brand mentioned in AI answer",
  "High-confidence match found",
  "Competitor appears in results",
  "New Reddit signal found",
];

export default function AlertsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [watchedBrandsCount, setWatchedBrandsCount] = useState(0);
  const [signalsTodayCount, setSignalsTodayCount] = useState(0);
  const [newRule, setNewRule] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "error" });
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/signin"); return; }
      setUser(session.user);
      await Promise.all([loadRules(), loadRecentAlerts(), loadStats()]);
      setLoading(false);
    };
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { router.replace("/signin"); }
      else {
        setUser(session.user);
        loadRules(); loadRecentAlerts(); loadStats();
        setLoading(false);
      }
    });
    return () => authListener?.subscription?.unsubscribe();
  }, [router, supabase]);

  const loadStats = async () => {
    if (!supabase) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [keywordsRes, signalsTodayRes] = await Promise.all([
      supabase.from("tracked_keywords").select("id", { count: "exact", head: true }),
      supabase.from("reddit_leads").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    ]);
    setWatchedBrandsCount(keywordsRes.count ?? 0);
    setSignalsTodayCount(signalsTodayRes.count ?? 0);
  };

  const loadRules = async () => {
    if (!supabase) return;
    const [rulesRes, profileRes] = await Promise.all([
      supabase.from("alert_rules").select("id, name, trigger, channel, active").order("created_at", { ascending: false }),
      supabase.from("user_profiles").select("*").maybeSingle(),
    ]);
    if (profileRes.data) setProfile(normalizeWorkspaceProfile(profileRes.data));
    if (rulesRes.error) {
      setMessage({ text: "Could not load audit rules.", type: "error" });
      return;
    }
    setRules(rulesRes.data || []);
    setMessage({ text: "", type: "error" });
  };

  const loadRecentAlerts = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("reddit_leads")
      .select("id, title, subreddit, keyword, intent, posted_at, url")
      .in("intent", ["High", "Medium"])
      .order("posted_at", { ascending: false })
      .limit(5);
    setRecentAlerts(data || []);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const toggleRule = async (id) => {
    if (!supabase) return;
    const rule = rules.find((r) => r.id === id);
    if (!rule) return;
    const { error } = await supabase.from("alert_rules").update({ active: !rule.active }).eq("id", id);
    if (!error) setRules((curr) => curr.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = async (id) => {
    if (!supabase || deletingId) return;
    setDeletingId(id);
    const { error } = await supabase.from("alert_rules").delete().eq("id", id);
    if (!error) setRules((curr) => curr.filter((r) => r.id !== id));
    setDeletingId(null);
  };

  const addRule = async (event) => {
    event.preventDefault();
    if (!newRule.trim() || !user || !supabase) return;
    const tierKey = profile?.subscription_tier || "free";
    const channel = hasFeature(tierKey, "emailAlerts") ? "Instant email" : "Dashboard only";
    const { data, error } = await supabase
      .from("alert_rules")
      .insert({ user_id: user.id, name: newRule.trim(), trigger: newTrigger.trim() || "new matching signal found", channel, active: true })
      .select("id, name, trigger, channel, active")
      .single();
    if (error) { setMessage({ text: error.message || "Could not add rule.", type: "error" }); return; }
    setRules((curr) => [data, ...curr]);
    setNewRule("");
    setNewTrigger("");
    setMessage({ text: `Rule "${data.name}" added.`, type: "success" });
    setTimeout(() => setMessage((m) => m.text.includes(data.name) ? { text: "", type: "error" } : m), 3000);
  };

  const getAlertTime = (postedAt) => {
    if (!postedAt) return "recently";
    const diffMs = Date.now() - new Date(postedAt).getTime();
    const minutes = Math.max(1, Math.round(diffMs / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  };

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

  const emailAlertsEnabled = hasFeature(profile?.subscription_tier || "free", "emailAlerts");

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={profile?.subscription_tier || "free"} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Alerts</h1>
              <p className="page-subtitle">
                Control when you are notified about high-value visibility signals
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><BellIcon /></div>
                <h3>Active rules</h3>
                <p className="stat-value">{rules.filter((r) => r.active).length}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-green"><TrendingUpIcon /></div>
                <h3>Signals today</h3>
                <p className="stat-value">{signalsTodayCount}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple"><SearchIcon /></div>
                <h3>Tracked keywords</h3>
                <p className="stat-value">{watchedBrandsCount}</p>
              </div>
            </div>

            <div className="alerts-grid">
              {/* Create rule form */}
              <section className="dashboard-card">
                <div className="card-header">
                  <div>
                    <h2>Create audit rule</h2>
                    <p className="card-supporting-copy">
                      Get notified when a high-value visibility signal matches.
                    </p>
                  </div>
                </div>

                {message.text ? (
                  <p className={`audit-message audit-message-${message.type}`}>{message.text}</p>
                ) : null}

                <form className="alerts-form" onSubmit={addRule}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="alert-name">Rule name</label>
                    <input
                      id="alert-name"
                      className="form-input"
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="e.g., New ChatGPT mention"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="alert-trigger">Trigger</label>
                    <div className="audit-presets">
                      {TRIGGER_PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`audit-preset-chip${newTrigger === p ? " audit-preset-chip-active" : ""}`}
                          onClick={() => setNewTrigger((cur) => cur === p ? "" : p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <input
                      id="alert-trigger"
                      className="form-input"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      placeholder="or type a custom trigger condition…"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notification channel</label>
                    <div className="alert-channel-pill">
                      {emailAlertsEnabled ? (
                        <span className="alert-channel-on">⚡ Instant email &amp; Slack</span>
                      ) : (
                        <span className="alert-channel-off">🔒 Instant email — locked · using Dashboard only</span>
                      )}
                    </div>
                  </div>

                  {!emailAlertsEnabled ? (
                    <LimitNotice
                      title="Get notified the moment your visibility changes"
                      description="Instant email & Slack alerts are on Pro and above. Free plans see alerts in the dashboard only."
                      ctaTier={getTier("pro").name}
                    />
                  ) : null}

                  <button type="submit" className="primary-button alerts-create-button">
                    <PlusIcon /> Add rule
                  </button>
                </form>
              </section>

              {/* Recent signals */}
              <section className="dashboard-card">
                <div className="card-header">
                  <h2>Recent signals</h2>
                  <Link href="/dashboard/leads" className="card-link">Open signals</Link>
                </div>
                <div className="alert-feed">
                  {recentAlerts.length === 0 ? (
                    <div className="audit-empty-state">
                      <p>No recent signals yet.</p>
                      <Link href="/dashboard/reddit" className="audit-empty-link">
                        Find opportunities in Reddit Engine →
                      </Link>
                    </div>
                  ) : (
                    recentAlerts.map((alert) => (
                      <div key={alert.id} className="alert-feed-item">
                        <div className={`alert-priority-dot priority-${alert.intent.toLowerCase()}`} />
                        <div className="alert-feed-body">
                          <div className="alert-feed-head">
                            <h3>{alert.title}</h3>
                            <span className={`audit-intent-badge audit-intent-${alert.intent.toLowerCase()}`}>
                              {alert.intent}
                            </span>
                          </div>
                          <p>
                            {alert.subreddit}
                            {alert.keyword ? ` · ${alert.keyword}` : ""}
                            {" · "}{getAlertTime(alert.posted_at)}
                          </p>
                          {alert.url && alert.url !== "https://example.com" ? (
                            <a
                              href={alert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="audit-signal-link"
                            >
                              <ExternalLinkIcon className="button-icon" /> View thread
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Audit rules list */}
              <section className="dashboard-card dashboard-card-wide">
                <div className="card-header">
                  <div>
                    <h2>Audit rules</h2>
                    <p className="card-supporting-copy">Toggle or delete rules at any time.</p>
                  </div>
                  <span className="card-meta-count">
                    {rules.length} {rules.length === 1 ? "rule" : "rules"}
                  </span>
                </div>
                <div className="alert-rules-list">
                  {rules.length === 0 ? (
                    <div className="audit-empty-state">
                      <p>No audit rules yet — create one above to start monitoring.</p>
                    </div>
                  ) : (
                    rules.map((rule) => (
                      <div key={rule.id} className={`alert-rule-item${!rule.active ? " alert-rule-item-inactive" : ""}`}>
                        <div className="alert-rule-main">
                          <h3>{rule.name}</h3>
                          <p>{rule.trigger}</p>
                          <span className="stat-badge">{rule.channel}</span>
                        </div>
                        <div className="audit-rule-actions">
                          <button
                            type="button"
                            className="audit-delete-btn"
                            onClick={() => deleteRule(rule.id)}
                            disabled={deletingId === rule.id}
                            title="Delete rule"
                          >
                            <Trash2Icon className="button-icon" />
                          </button>
                          <label className="switch">
                            <input type="checkbox" checked={rule.active} onChange={() => toggleRule(rule.id)} />
                            <span />
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
