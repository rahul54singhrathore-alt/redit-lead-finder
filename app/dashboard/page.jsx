"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardOnboarding } from "@/components/dashboard-onboarding";
import { GeoScore } from "@/components/geo-score";
import { MembershipBanner } from "@/components/membership-banner";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../lib/workspace-profile";
import { SparklesIcon } from "lucide-react";

// SVG icons
const BellIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLeads, setDashboardLeads] = useState([]);
  const [keywordCount, setKeywordCount] = useState(0);
  const [sourceCount, setSourceCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/signin");
        return;
      }
      setUser(session.user);
      const needsOnboarding = await loadDashboardData(session.user.id);
      if (needsOnboarding) {
        router.replace("/onboarding");
        return;
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        loadDashboardData(session.user.id).then((needsOnboarding) => {
          if (needsOnboarding) {
            router.replace("/onboarding");
          } else {
            setLoading(false);
          }
        });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const loadDashboardData = async (userId) => {
    if (!supabase) return false;

    const [profileResult, leadsResult, keywordsResult, alertsResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("reddit_leads")
        .select("id, subreddit, title, author, posted_at, score, comments, intent, keyword, url")
        .order("posted_at", { ascending: false })
        .limit(5),
      supabase
        .from("tracked_keywords")
        .select("id, subreddits"),
      supabase
        .from("alert_rules")
        .select("id")
        .eq("active", true),
    ]);

    // Check if profile exists and onboarding is completed
    const profile = profileResult.data ? normalizeWorkspaceProfile(profileResult.data) : null;
    if (!profile || !profile.onboarding_completed) {
      // Redirect to onboarding if not completed
      return true;
    }

    setProfile(profile);
    const keywords = keywordsResult.error ? [] : keywordsResult.data || [];
    const sources = new Set(keywords.flatMap((item) => item.subreddits || []));
    setDashboardLeads(leadsResult.error ? [] : leadsResult.data || []);
    setKeywordCount(keywords.length);
    setSourceCount(sources.size);
    setAlertCount(alertsResult.error ? 0 : (alertsResult.data || []).length);
    setMessage("");
    return false;
  };

  const handleOnboardingComplete = async () => {
    if (!user) return;

    await loadDashboardData(user.id);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const getInitials = (email) => {
    if (!email) return "U";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase();
  };

  const latestLeadCount = dashboardLeads.length;
  const isOnboarding = !profile?.onboarding_completed;
  const supabaseStatus = supabase ? "Supabase connected" : "Supabase not configured";

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div
            className="dashboard-main dashboard-main-shadcn"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <p>Loading...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (isOnboarding) {
    return (
      <SidebarProvider>
        <AppSidebar
          user={user}
          onSignOut={handleSignOut}
          leadCount={latestLeadCount}
          alertCount={alertCount}
        />
        <SidebarInset>
          <main className="dashboard-main dashboard-main-shadcn">
            <div className="dashboard-header">
              <div>
                <SidebarTrigger className="dashboard-sidebar-trigger" />
                <h1>Set up your workspace</h1>
                <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>
                  Add your first brand, the sources to watch, and the audit cadence.
                </p>
              </div>
              <div className="user-menu">
                <div className="user-avatar">{getInitials(user?.email)}</div>
              </div>
            </div>

            {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}
            <DashboardOnboarding user={user} supabase={supabase} onComplete={handleOnboardingComplete} />
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        onSignOut={handleSignOut}
        leadCount={latestLeadCount}
        alertCount={alertCount}
        subscriptionTier={profile?.subscription_tier || "free"}
      />
      <SidebarInset>
        <main className="dashboard-main dashboard-main-shadcn">
          <div className="dashboard-header">
              <div>
                <SidebarTrigger className="dashboard-sidebar-trigger" />
                <h1>Overview</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Your AI visibility and latest signals in one place.</p>
            </div>
            <div className="user-menu">
              <span className={`header-status-pill${supabase ? " header-status-pill-ready" : " header-status-pill-warn"}`}>
                <span />
                {supabaseStatus}
              </span>
              <Link href="/dashboard/alerts" className="header-action-button">
                <BellIcon />
                Audits
              </Link>
              <Link href="/onboarding" className="header-action-button">
                <SparklesIcon />
                Onboarding
              </Link>
              <div className="user-avatar">{getInitials(user?.email)}</div>
            </div>
          </div>

          <div className="dashboard-content">
            <MembershipBanner subscriptionTier={profile?.subscription_tier || "free"} />

            <GeoScore
              brand={profile?.product_name || profile?.starter_keyword || "Your brand"}
              category={profile?.industry || profile?.brand_description || profile?.starter_keyword || ""}
            />

            {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
