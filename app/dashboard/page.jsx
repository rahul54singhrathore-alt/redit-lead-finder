"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardOnboarding } from "@/components/dashboard-onboarding";
import { GeoScore } from "@/components/geo-score";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../lib/workspace-profile";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const profile = profileData ? normalizeWorkspaceProfile(profileData) : null;
    if (!profile || !profile.onboarding_completed) return true;

    setProfile(profile);
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
    return email.split("@")[0].charAt(0).toUpperCase();
  };

  const isOnboarding = !profile?.onboarding_completed;

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="dashboard-main dashboard-main-shadcn">
            <div className="page-loader"><div className="page-loader-ring" /></div>
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
        />
        <SidebarInset>
          <main className="dashboard-main dashboard-main-shadcn">
            <div className="dashboard-header">
              <div>
                <SidebarTrigger className="dashboard-sidebar-trigger" />
                <h1>Set up your workspace</h1>
                <p className="page-subtitle">
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
        subscriptionTier={profile?.subscription_tier || "free"}
      />
      <SidebarInset>
        <main className="dashboard-main dashboard-main-shadcn">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>GEO Score</h1>
              <p className="page-subtitle">
                How often AI engines mention {profile?.product_name || "your brand"} — and what to improve.
              </p>
            </div>
            <div className="user-avatar">{getInitials(user?.email)}</div>
          </div>

          <div className="dashboard-content">
            <GeoScore
              brand={profile?.product_name || profile?.starter_keyword || "Your brand"}
              category={profile?.industry || profile?.brand_description || ""}
            />

            {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
