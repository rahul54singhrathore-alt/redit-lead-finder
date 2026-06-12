"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainIcon, CheckIcon, PencilIcon, SparklesIcon } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

const COMPLETENESS_FIELDS = [
  ["product_name", "Brand name"],
  ["product_url", "Website"],
  ["brand_description", "Description"],
  ["industry", "Industry"],
  ["starter_keyword", "Primary keyword"],
];

function calcCompleteness(profile) {
  if (!profile) return { filled: 0, total: COMPLETENESS_FIELDS.length, pct: 0, missing: [] };
  const missing = [];
  let filled = 0;
  for (const [key, label] of COMPLETENESS_FIELDS) {
    if (profile[key]?.trim?.()) filled++;
    else missing.push(label);
  }
  return { filled, total: COMPLETENESS_FIELDS.length, pct: Math.round((filled / COMPLETENESS_FIELDS.length) * 100), missing };
}

export default function BrandMemoryPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/signin"); return; }
      setUser(session.user);
      const { data } = await supabase.from("user_profiles").select("*").maybeSingle();
      if (data) {
        setProfile(normalizeWorkspaceProfile(data));
        setNotes(data.brand_notes || "");
      }
      setLoading(false);
    };
    check();
  }, [router, supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const saveNotes = async () => {
    if (!supabase || !user || notesSaving) return;
    setNotesSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({ brand_notes: notes })
      .eq("user_id", user.id);
    setNotesSaving(false);
    if (!error) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  const tierKey = profile?.subscription_tier || "free";
  const brandRaw = profile?.product_name || profile?.starter_keyword || "Your brand";
  const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
  const competitors = profile?.competitors || [];
  const { filled, total, pct, missing } = calcCompleteness(profile);

  const customerLabel = { b2b: "B2B (businesses)", b2c: "B2C (consumers)", both: "B2B & B2C" }[profile?.customer_type || "both"];

  const facts = [
    { label: "Brand name", value: profile?.product_name || "" },
    { label: "Website", value: profile?.product_url || "", isUrl: true },
    { label: "Industry", value: profile?.industry || "" },
    { label: "Sells to", value: customerLabel },
    { label: "Primary keyword", value: profile?.starter_keyword || "" },
    { label: "Description", value: profile?.brand_description || "" },
  ];

  const aiContextLines = [
    profile?.product_name && `Brand: ${profile.product_name}`,
    profile?.product_url && `Website: ${profile.product_url}`,
    profile?.industry && `Industry: ${profile.industry}`,
    profile?.brand_description && `Description: ${profile.brand_description}`,
    profile?.customer_type && `Sells to: ${customerLabel}`,
    profile?.starter_keyword && `Primary keyword: ${profile.starter_keyword}`,
    competitors.length > 0 && `Competitors: ${competitors.join(", ")}`,
    notes?.trim() && `Extra context: ${notes.trim()}`,
  ].filter(Boolean);

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
              <h1>Brand Memory</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>
                What AI models know about {brand} — used to make every check accurate.
              </p>
            </div>
          </div>

          <div className="dashboard-content">

            {/* Completeness bar */}
            <section className="dashboard-card memory-completeness-card">
              <div className="memory-completeness-header">
                <div>
                  <span className="memory-completeness-label">Profile completeness</span>
                  <span className={`memory-completeness-pct${pct === 100 ? " memory-completeness-pct-done" : ""}`}>
                    {filled}/{total} fields · {pct}%
                  </span>
                </div>
                <Link href="/dashboard/settings" className="action-button">
                  <PencilIcon className="button-icon" /> Edit profile
                </Link>
              </div>
              <div className="memory-progress-track">
                <div className="memory-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              {missing.length > 0 && (
                <p className="memory-completeness-missing">
                  Missing: {missing.join(" · ")}
                </p>
              )}
              {pct === 100 && (
                <p className="memory-completeness-done-msg">
                  <CheckIcon style={{ width: 13, height: 13, verticalAlign: -2 }} /> Profile complete — AI checks are fully optimised.
                </p>
              )}
            </section>

            <div className="memory-grid">
              {/* Brand profile facts */}
              <section className="dashboard-card">
                <div className="card-header">
                  <div>
                    <h2><BrainIcon className="settings-section-icon" /> Brand profile</h2>
                    <p className="card-supporting-copy">Core context AI uses for every visibility check.</p>
                  </div>
                </div>
                <dl className="memory-facts">
                  {facts.map((fact) => (
                    <div key={fact.label} className="memory-fact">
                      <dt>{fact.label}</dt>
                      <dd>
                        {fact.value ? (
                          fact.isUrl ? (
                            <a href={fact.value.startsWith("http") ? fact.value : `https://${fact.value}`}
                              target="_blank" rel="noopener noreferrer" className="memory-url-link">
                              {fact.value}
                            </a>
                          ) : fact.value
                        ) : (
                          <span className="memory-fact-empty">Not set</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* AI context preview */}
              <section className="dashboard-card">
                <div className="card-header">
                  <div>
                    <h2><SparklesIcon className="settings-section-icon" style={{ color: "#8b5cf6" }} /> AI context preview</h2>
                    <p className="card-supporting-copy">Exactly what AI models receive when checking {brand}.</p>
                  </div>
                </div>
                {aiContextLines.length > 0 ? (
                  <pre className="memory-ai-preview">
                    {aiContextLines.join("\n")}
                  </pre>
                ) : (
                  <div className="memory-ai-empty">
                    <p>Fill in your brand profile to see the AI context.</p>
                    <Link href="/dashboard/settings" className="audit-empty-link">Set up profile →</Link>
                  </div>
                )}
              </section>
            </div>

            {/* Tracked competitors */}
            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>Tracked competitors</h2>
                  <p className="card-supporting-copy">Brands AI weighs {brand} against in every check.</p>
                </div>
                <span className="pricing-badge">{competitors.length} tracked</span>
              </div>
              {competitors.length > 0 ? (
                <div className="competitor-chip-row">
                  {competitors.map((name) => (
                    <span key={name} className="competitor-chip">{name}</span>
                  ))}
                </div>
              ) : (
                <div className="memory-ai-empty">
                  <p>No competitors tracked yet.</p>
                  <Link href="/dashboard/competitors" className="audit-empty-link">Add competitors →</Link>
                </div>
              )}
            </section>

            {/* Notes — saved to Supabase */}
            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>Key facts &amp; notes</h2>
                  <p className="card-supporting-copy">
                    Extra context about {brand} — included in every AI check.
                  </p>
                </div>
              </div>
              <textarea
                className="form-input textarea-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Launched 2024 · best-known for AI visibility tracking · pricing from $29/mo · featured on Product Hunt…"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
                <button
                  type="button"
                  className="primary-button"
                  onClick={saveNotes}
                  disabled={notesSaving}
                >
                  {notesSaving ? "Saving…" : notesSaved ? <><CheckIcon className="button-icon" /> Saved</> : "Save notes"}
                </button>
                <span className="memory-notes-hint">Synced across devices</span>
              </div>
            </section>

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
