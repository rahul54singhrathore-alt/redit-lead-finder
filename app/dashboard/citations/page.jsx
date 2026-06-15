"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, QuoteIcon, RefreshCwIcon, TargetIcon, WrenchIcon, XIcon } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

export default function CitationsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scan, setScan] = useState({ status: "idle" });
  // Per-source "Fix it" plans: { [sourceName]: { status, steps, error } }
  const [fixes, setFixes] = useState({});
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

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const tierKey = profile?.subscription_tier || "free";
  const brandRaw = profile?.product_name || profile?.starter_keyword || "Your brand";
  const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
  const category = profile?.product_category || profile?.starter_keyword || "";

  const runScan = async () => {
    setScan({ status: "loading" });
    setFixes({});
    try {
      const response = await fetch("/api/citation-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, category }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Scan failed.");
      setScan({ status: "done", data });
    } catch (error) {
      setScan({ status: "error", error: error.message });
    }
  };

  const runFix = async (source) => {
    setFixes((current) => ({ ...current, [source]: { status: "loading" } }));
    try {
      const response = await fetch("/api/citation-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, source, category }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Fix failed.");
      setFixes((current) => ({ ...current, [source]: { status: "done", steps: data.steps || [] } }));
    } catch (error) {
      setFixes((current) => ({ ...current, [source]: { status: "error", error: error.message } }));
    }
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

  const data = scan.data;

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>AI Citation Tracker</h1>
              <p className="page-subtitle">
                See which websites AI uses as sources in {brand}’s space — and where {brand} is missing.
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            <section className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>
                    <QuoteIcon className="cite-title-icon" /> Source citations
                  </h2>
                  <p className="card-supporting-copy">
                    AI cites these sites when recommending tools like {brand}. Get onto the “missing” ones to get cited.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={runScan}
                  disabled={scan.status === "loading"}
                >
                  {scan.status === "loading" ? (
                    <>
                      <RefreshCwIcon className="button-icon spin" /> Scanning…
                    </>
                  ) : scan.status === "done" ? (
                    <>
                      <RefreshCwIcon className="button-icon" /> Re-scan
                    </>
                  ) : (
                    <>
                      <TargetIcon className="button-icon" /> Run scan
                    </>
                  )}
                </button>
              </div>

              {scan.status === "idle" ? (
                <div className="cite-empty">
                  <QuoteIcon />
                  <p>Run a scan to see which sources AI cites — and which of {brand}’s properties are missing.</p>
                </div>
              ) : scan.status === "loading" ? (
                <div className="cite-empty">
                  <RefreshCwIcon className="spin" />
                  <p>Checking AI source citations…</p>
                </div>
              ) : scan.status === "error" ? (
                <div className="cite-empty cite-empty-error">
                  <XIcon />
                  <p>{scan.error}</p>
                  <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>
                    Try again
                  </button>
                </div>
              ) : (
                <div className="cite-cols">
                  <div className="cite-col">
                    <h3 className="cite-col-title cite-col-title-yes">
                      AI Sources ({data.cited.length})
                    </h3>
                    <ul className="cite-list">
                      {data.cited.map((item, index) => (
                        <li key={`${item.name}-${index}`} className="cite-row cite-row-yes">
                          <span className="cite-mark cite-mark-yes"><CheckIcon /></span>
                          <div>
                            <strong>{item.name}</strong>
                            {item.note ? <span>{item.note}</span> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="cite-col">
                    <h3 className="cite-col-title cite-col-title-no">
                      Missing ({data.missing.length})
                    </h3>
                    <ul className="cite-list">
                      {data.missing.map((item, index) => {
                        const fix = fixes[item.name];
                        return (
                          <li key={`${item.name}-${index}`} className="cite-row cite-row-no cite-row-fixable">
                            <div className="cite-row-main">
                              <span className="cite-mark cite-mark-no"><XIcon /></span>
                              <div>
                                <strong>{item.name}</strong>
                                {item.note ? <span>{item.note}</span> : null}
                              </div>
                              <button
                                type="button"
                                className="cite-fix-button"
                                onClick={() => runFix(item.name)}
                                disabled={fix?.status === "loading"}
                              >
                                {fix?.status === "loading" ? (
                                  <RefreshCwIcon className="spin" />
                                ) : (
                                  <WrenchIcon />
                                )}
                                {fix?.status === "done" ? "Re-fix" : "Fix it"}
                              </button>
                            </div>

                            {fix?.status === "error" ? (
                              <p className="cite-fix-error">{fix.error}</p>
                            ) : null}

                            {fix?.status === "done" && fix.steps.length ? (
                              <ol className="cite-fix-steps">
                                {fix.steps.map((step, i) => (
                                  <li key={i}>
                                    <span className="cite-fix-num">{i + 1}</span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {scan.status === "done" ? (
                <p className="cite-disclaimer">Source picks are informed AI estimates, not live-crawled citations.</p>
              ) : null}
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
