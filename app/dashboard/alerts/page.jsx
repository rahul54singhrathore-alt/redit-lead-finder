"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";
import { hasFeature } from "../../../lib/subscription";
import { PlusIcon, Trash2Icon } from "lucide-react";

const TRIGGER_OPTIONS = [
  "Brand mentioned in AI answer",
  "High-confidence match found",
  "Competitor appears in results",
  "New Reddit signal found",
];

export default function AlertsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [profile, setProfile] = useState(null);
  const [newRule, setNewRule] = useState("");
  const [newTrigger, setNewTrigger] = useState(TRIGGER_OPTIONS[0]);
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
      await loadRules();
      setLoading(false);
    };
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { router.replace("/signin"); }
      else { setUser(session.user); loadRules(); setLoading(false); }
    });
    return () => authListener?.subscription?.unsubscribe();
  }, [router, supabase]);

  const loadRules = async () => {
    if (!supabase) return;
    const [rulesRes, profileRes] = await Promise.all([
      supabase.from("alert_rules").select("id, name, trigger, channel, active").order("created_at", { ascending: false }),
      supabase.from("user_profiles").select("*").maybeSingle(),
    ]);
    if (profileRes.data) setProfile(normalizeWorkspaceProfile(profileRes.data));
    if (!rulesRes.error) setRules(rulesRes.data || []);
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

  const addRule = async (e) => {
    e.preventDefault();
    if (!newRule.trim() || !user || !supabase) return;
    const tierKey = profile?.subscription_tier || "free";
    const channel = hasFeature(tierKey, "emailAlerts") ? "Instant email" : "Dashboard only";
    const { data, error } = await supabase
      .from("alert_rules")
      .insert({ user_id: user.id, name: newRule.trim(), trigger: newTrigger, channel, active: true })
      .select("id, name, trigger, channel, active")
      .single();
    if (error) { setMessage({ text: error.message || "Could not add rule.", type: "error" }); return; }
    setRules((curr) => [data, ...curr]);
    setNewRule("");
    setNewTrigger(TRIGGER_OPTIONS[0]);
    setMessage({ text: "Rule added.", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "error" }), 2000);
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

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={profile?.subscription_tier || "free"} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Alerts</h1>
              <p className="page-subtitle">Get notified when visibility signals match your rules</p>
            </div>
          </div>

          <div className="dashboard-content">
            <section className="dashboard-card" style={{ maxWidth: 560 }}>
              <h2 style={{ marginBottom: 16 }}>New rule</h2>

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
                  <label className="form-label" htmlFor="alert-trigger">When to notify</label>
                  <select
                    id="alert-trigger"
                    className="form-input"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                  >
                    {TRIGGER_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="primary-button">
                  <PlusIcon /> Add rule
                </button>
              </form>
            </section>

            <section className="dashboard-card" style={{ marginTop: 24 }}>
              <div className="card-header">
                <h2>Your rules</h2>
                <span className="card-meta-count">{rules.length} {rules.length === 1 ? "rule" : "rules"}</span>
              </div>
              <div className="alert-rules-list">
                {rules.length === 0 ? (
                  <p className="audit-empty-state">No rules yet — add one above.</p>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className={`alert-rule-item${!rule.active ? " alert-rule-item-inactive" : ""}`}>
                      <div className="alert-rule-main">
                        <h3>{rule.name}</h3>
                        <p>{rule.trigger}</p>
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
