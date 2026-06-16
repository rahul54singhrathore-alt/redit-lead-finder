"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GeoRoadmap } from "@/components/geo-roadmap";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

export default function RecommendationsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
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

      // Fetch real scan history for this user
      const { data: scanData } = await supabase
        .from("prompt_rank_history")
        .select("prompt, rank, total, score, mentioned, checked_at")
        .eq("user_id", session.user.id)
        .order("checked_at", { ascending: false })
        .limit(20);
      if (scanData) setScanHistory(scanData);

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
  const brand = profile?.product_name || profile?.starter_keyword || "Your brand";
  const category = profile?.industry || profile?.brand_description || profile?.starter_keyword || "";
  const productUrl = profile?.product_url || "";
  const competitors = Array.isArray(profile?.competitors) ? profile.competitors : [];

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
              <h1>Recommendations</h1>
              <p className="page-subtitle">
                AI-generated action plan for <strong style={{ color: "#18181b" }}>{brand}</strong> — ranked by GEO impact.
              </p>
            </div>
          </div>
          <div className="dashboard-content">
            <GeoRoadmap
              brand={brand}
              category={category}
              currentScore={0}
              productUrl={productUrl}
              competitors={competitors}
              scanHistory={scanHistory}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
