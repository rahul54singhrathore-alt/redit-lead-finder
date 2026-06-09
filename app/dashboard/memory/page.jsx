"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainIcon, PencilIcon } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

export default function BrandMemoryPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/signin");
        return;
      }
      setUser(session.user);
      const { data } = await supabase.from("user_profiles").select("*").maybeSingle();
      if (data) setProfile(normalizeWorkspaceProfile(data));
      setLoading(false);
    };
    check();
  }, [router, supabase]);

  const brandRaw = profile?.product_name || profile?.starter_keyword || "Your brand";
  const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
  const notesKey = `brand-memory-${brand.toLowerCase()}`;

  useEffect(() => {
    try {
      setNotes(localStorage.getItem(notesKey) || "");
    } catch {
      /* ignore */
    }
  }, [notesKey]);

  const saveNotes = () => {
    try {
      localStorage.setItem(notesKey, notes);
      setSavedNotes(true);
      setTimeout(() => setSavedNotes(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const tierKey = profile?.subscription_tier || "free";
  const competitors = profile?.competitors || [];

  const customerLabel = { b2b: "B2B (businesses)", b2c: "B2C (consumers)", both: "B2B & B2C" }[
    profile?.customer_type || "both"
  ];

  const facts = [
    { label: "Brand name", value: profile?.product_name || "—" },
    { label: "Website", value: profile?.product_url || "—" },
    { label: "Industry", value: profile?.industry || "—" },
    { label: "Sells to", value: customerLabel },
    { label: "Description", value: profile?.brand_description || "—" },
  ];

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
                What your AI assistant knows about {brand} — used to make every check accurate.
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2><BrainIcon className="settings-section-icon" /> Brand profile</h2>
                  <p className="card-supporting-copy">The core context AI uses for visibility checks.</p>
                </div>
                <Link href="/dashboard/settings" className="action-button">
                  <PencilIcon className="button-icon" /> Edit
                </Link>
              </div>
              <dl className="memory-facts">
                {facts.map((fact) => (
                  <div key={fact.label} className="memory-fact">
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>Tracked competitors</h2>
                  <p className="card-supporting-copy">Brands AI weighs {brand} against.</p>
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
                <p className="competitor-empty-hint">
                  No competitors yet — add them on the Competitors page.
                </p>
              )}
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>Key facts &amp; notes</h2>
                  <p className="card-supporting-copy">
                    Extra context to remember about {brand} (saved on this device).
                  </p>
                </div>
              </div>
              <textarea
                className="form-input textarea-input"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. Launched 2024 · best-known for AI visibility tracking · pricing from $29/mo · featured on Product Hunt…"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
                {savedNotes ? <span className="settings-saved">✓ Saved</span> : null}
                <button type="button" className="primary-button" onClick={saveNotes}>Save notes</button>
              </div>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
