"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BuyerIntelTool } from "@/components/buyer-intel-tool";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardOnboarding } from "@/components/dashboard-onboarding";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../lib/supabase";
import {
  DEFAULT_VISIBILITY_SOURCES,
  normalizeWorkspaceProfile,
} from "../../lib/workspace-profile";
import { SparklesIcon } from "lucide-react";

// SVG icons
const SearchIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const BellIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const recentActivity = [
  {
    id: 1,
    action: "Brand mention found",
    details: "in ChatGPT",
    time: "2 min ago",
  },
  {
    id: 2,
    action: "Brand added",
    details: "\"Rankora\"",
    time: "15 min ago",
  },
  {
    id: 3,
    action: "GEO audit run",
    details: "with missing citations flagged",
    time: "2 hours ago",
  },
  {
    id: 4,
    action: "Citation saved",
    details: "for competitor comparison",
    time: "5 hours ago",
  },
];

const setupSteps = [
  {
    title: "Brand",
    description: "Add the name you want to track.",
    href: "/dashboard/keywords",
    cta: "Manage brands",
  },
  {
    title: "Sources",
    description: "Choose the places where signals matter.",
    href: "/dashboard/settings",
    cta: "Edit sources",
  },
  {
    title: "Alerts",
    description: "Set when the workspace should notify you.",
    href: "/dashboard/alerts",
    cta: "Set alerts",
  },
  {
    title: "Briefs",
    description: "Generate SEO briefs and blog ideas from keywords.",
    href: "/dashboard/keywords",
    cta: "Open briefs",
  },
];

const quickAccess = [
  {
    title: "Add a brand",
    description: "Start tracking a new keyword or brand.",
    href: "/dashboard/keywords",
  },
  {
    title: "Review signals",
    description: "Check the latest leads and mentions.",
    href: "/dashboard/leads",
  },
  {
    title: "Adjust alerts",
    description: "Change cadence and notification settings.",
    href: "/dashboard/alerts",
  },
  {
    title: "Open settings",
    description: "Tune the workspace and export preferences.",
    href: "/dashboard/settings",
  },
];

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

  const getLeadTime = (postedAt) => {
    if (!postedAt) return "recently";
    const diffMs = Date.now() - new Date(postedAt).getTime();
    const minutes = Math.max(1, Math.round(diffMs / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const highIntentCount = dashboardLeads.filter((lead) => lead.intent === "High").length;
  const latestLeadCount = dashboardLeads.length;
  const mediumIntentCount = dashboardLeads.filter((lead) => lead.intent === "Medium").length;
  const lowIntentCount = dashboardLeads.filter((lead) => lead.intent === "Low").length;
  const intentPercent = (count) => {
    if (!latestLeadCount) return 0;
    return Math.round((count / latestLeadCount) * 100);
  };
  const keywordPulse = Object.values(
    dashboardLeads.reduce((acc, lead) => {
      const key = lead.keyword || "Unmatched";
      acc[key] = acc[key] || { keyword: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {}),
  ).slice(0, 3);
  const visibilityScores = [
    { label: "ChatGPT visibility", value: 65, tone: "blue" },
    { label: "Gemini visibility", value: 72, tone: "green" },
    { label: "Claude visibility", value: 40, tone: "purple" },
    { label: "Perplexity visibility", value: 58, tone: "amber" },
  ];
  const overallGeoScore = Math.round(
    visibilityScores.reduce((sum, score) => sum + score.value, 0) / visibilityScores.length,
  );
  const mentionFocus = [
    "Best SEO tools",
    "Best AI tools",
    "Best CRM",
    "Best influencer platform",
  ];
  const mentionSources = [
    { label: "ChatGPT signals", value: latestLeadCount ? Math.max(4, latestLeadCount) : 0, tone: "blue" },
    { label: "Gemini signals", value: latestLeadCount ? Math.max(4, latestLeadCount) : 0, tone: "green" },
    { label: "Claude signals", value: latestLeadCount ? Math.max(3, Math.round(latestLeadCount * 0.8)) : 0, tone: "purple" },
    { label: "Perplexity signals", value: latestLeadCount ? Math.max(3, Math.round(latestLeadCount * 0.8)) : 0, tone: "amber" },
    { label: "Reddit mentions", value: latestLeadCount ? Math.max(6, latestLeadCount * 2) : 0, tone: "blue" },
    { label: "Quora mentions", value: latestLeadCount ? Math.max(3, Math.round(latestLeadCount * 0.8)) : 0, tone: "purple" },
  ];
  const trackedSources = profile?.target_subreddits?.length
    ? profile.target_subreddits
    : DEFAULT_VISIBILITY_SOURCES;

  const isOnboarding = !profile?.onboarding_completed;
  const frequencyLabel = profile?.digest_frequency
    ? profile.digest_frequency.charAt(0).toUpperCase() + profile.digest_frequency.slice(1)
    : "Daily";
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
      />
      <SidebarInset>
        <main className="dashboard-main dashboard-main-shadcn">
          <div className="dashboard-header">
              <div>
                <SidebarTrigger className="dashboard-sidebar-trigger" />
                <h1>Welcome back!</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Here's what AI visibility looks like today</p>
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
            <BuyerIntelTool />

            <section className="dashboard-setup-hub">
              <div className="dashboard-setup-hub-copy">
                <span className="dashboard-kicker">Visibility setup</span>
                <h2>Everything your team needs to start in one place.</h2>
                <p>
                  Add a brand, pick sources, set alerts, and jump straight into SEO briefs or blog ideas without digging through menus.
                </p>
              </div>
              <div className="dashboard-setup-hub-actions">
                <Link href="/dashboard/keywords" className="primary-button dashboard-primary-action">
                  Open setup
                </Link>
                <Link href="/dashboard/settings" className="secondary-button dashboard-secondary-action">
                  Preferences
                </Link>
              </div>
            </section>

            <div className="dashboard-setup-grid">
              {setupSteps.map((step) => (
                <section key={step.title} className="dashboard-setup-card">
                  <div className="dashboard-setup-card-top">
                    <span className="dashboard-setup-step">{step.title}</span>
                    <Link href={step.href} className="card-link">
                      {step.cta}
                    </Link>
                  </div>
                  <p>{step.description}</p>
                </section>
              ))}
            </div>

            <section className="dashboard-card dashboard-quick-access">
              <div className="card-header">
                <div>
                  <h2>Quick access</h2>
                  <p className="card-supporting-copy">Jump straight to the parts of the workspace people use most.</p>
                </div>
              </div>
              <div className="quick-access-grid">
                {quickAccess.map((item) => (
                  <Link key={item.title} href={item.href} className="quick-access-card">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </Link>
                ))}
              </div>
            </section>

            {profile?.starter_keyword ? (
              <section className="dashboard-setup-banner">
                <div>
                  <span className="dashboard-kicker">Workspace ready</span>
                  <h2>
                    Tracking {profile.starter_keyword} across{" "}
                    {trackedSources.length} visibility sources.
                  </h2>
                  <p>
                    Audit frequency is set to {frequencyLabel.toLowerCase()} and the first
                    brand is already saved in your workspace.
                  </p>
                </div>
                <div className="setup-banner-pills">
                  {trackedSources.map((source) => (
                    <span key={source} className="source-mini-chip">{source}</span>
                  ))}
                  <span>{frequencyLabel} audits</span>
                </div>
              </section>
            ) : null}

            <section className="dashboard-hero-card">
              <div>
                <span className="dashboard-kicker">Today&apos;s visibility flow</span>
                <h2>{highIntentCount} visibility signals are ready for review.</h2>
                <p>Prioritize fresh mentions, then save or compare them from the Signals workspace.</p>
              </div>
              <img className="dashboard-character" src="/lead-finder-character-alerts.jpg" alt="" />
              <div className="dashboard-hero-actions">
                <Link href="/dashboard/leads" className="primary-button dashboard-primary-action">Review signals</Link>
                <Link href="/dashboard/keywords" className="secondary-button dashboard-secondary-action">Tune brands</Link>
              </div>
            </section>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">
                  <SearchIcon />
                </div>
                <h3>Brands tracked</h3>
                <p className="stat-value">{keywordCount}</p>
                <span className="stat-delta">saved now</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-green">
                  <TrendingIcon />
                </div>
                <h3>Signals found</h3>
                <p className="stat-value">{latestLeadCount}</p>
                <span className="stat-delta">latest loaded</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple">
                  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <h3>Sources</h3>
                <p className="stat-value">{sourceCount || trackedSources.length}</p>
                <span className="stat-delta">watched now</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-amber">
                  <BellIcon />
                </div>
                <h3>Audits running</h3>
                <p className="stat-value">{alertCount}</p>
                <span className="stat-delta">active rules</span>
              </div>
            </div>
            {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}

            <section className="dashboard-card dashboard-score-card">
              <div className="card-header">
                <div>
                  <h2>AI Visibility Score</h2>
                  <p className="card-supporting-copy">Model visibility and source coverage in one view.</p>
                </div>
                <span className="score-badge">Overall GEO score {overallGeoScore}/100</span>
              </div>
              <div className="dashboard-score-grid">
                <div className="dashboard-score-summary">
                  <div className="dashboard-score-ring">
                    <strong>{overallGeoScore}</strong>
                    <span>GEO</span>
                  </div>
                  <div className="dashboard-score-copy">
                    <p>Higher scores mean your brand appears more often in AI answers and supporting source pages.</p>
                    <div className="focus-chip-list">
                      {mentionFocus.map((item) => (
                        <span key={item} className="focus-chip">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="dashboard-model-list">
                  {visibilityScores.map((score) => (
                    <div key={score.label} className="model-score-item">
                      <div className="model-score-label">
                        <strong>{score.label}</strong>
                        <span>{score.value}/100</span>
                      </div>
                      <div className={`model-score-track model-score-track-${score.tone}`}>
                        <span style={{ width: `${score.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="dashboard-source-breakdown">
                  {mentionSources.map((source) => (
                    <div key={source.label} className="source-score-item">
                      <div className="source-score-label">
                        <strong>{source.label}</strong>
                        <span>{source.value}</span>
                      </div>
                      <div className={`source-score-track source-score-track-${source.tone}`}>
                        <span style={{ width: `${Math.min(100, source.value * 10)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="dashboard-insight-grid">
            <section className="dashboard-card">
              <div className="card-header">
                <h2>Visibility split</h2>
                <Link href="/dashboard/leads" className="card-link">Open signals</Link>
              </div>
              <div className="intent-bars">
                <div className="intent-bar-row">
                  <span>High confidence</span>
                  <div className="intent-track"><span style={{ width: `${intentPercent(highIntentCount)}%` }} /></div>
                  <strong>{intentPercent(highIntentCount)}%</strong>
                </div>
                <div className="intent-bar-row">
                  <span>Medium confidence</span>
                  <div className="intent-track"><span style={{ width: `${intentPercent(mediumIntentCount)}%` }} /></div>
                  <strong>{intentPercent(mediumIntentCount)}%</strong>
                </div>
                <div className="intent-bar-row">
                  <span>Low confidence</span>
                  <div className="intent-track"><span style={{ width: `${intentPercent(lowIntentCount)}%` }} /></div>
                  <strong>{intentPercent(lowIntentCount)}%</strong>
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <h2>Brand pulse</h2>
                <Link href="/dashboard/keywords" className="card-link">Manage</Link>
              </div>
              <div className="keyword-pulse-list">
                {keywordPulse.map((item) => (
                  <div key={item.keyword} className="keyword-pulse-item">
                    <div>
                      <strong>{item.keyword}</strong>
                      <span>{item.count} mentions</span>
                    </div>
                    <em>{latestLeadCount ? `${Math.round((item.count / latestLeadCount) * 100)}%` : "0%"}</em>
                  </div>
                ))}
                {keywordPulse.length === 0 && (
                  <div className="empty-state">
                    <h2>No brand pulse yet</h2>
                    <p>Matched mentions will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="dashboard-grid">
            {/* Recent Leads */}
            <div className="dashboard-card dashboard-card-large">
              <div className="card-header">
                <h2>Recent signals</h2>
                <Link href="/dashboard/leads" className="card-link">View all</Link>
              </div>
              <div className="lead-list">
                {dashboardLeads.map((lead) => (
                  <Link key={lead.id} href={lead.url} className="lead-item">
                    <div className="lead-content">
                      <span className="lead-subreddit">{lead.subreddit}</span>
                      <h3 className="lead-title">{lead.title}</h3>
                      <div className="lead-meta">
                        <span>Posted by {lead.author}</span>
                        <span>•</span>
                        <span>{getLeadTime(lead.posted_at)}</span>
                      </div>
                    </div>
                    <div className="lead-stats">
                      <span className="lead-stat">
                        <svg className="stat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {lead.score}
                      </span>
                      <span className="lead-stat">
                        <svg className="stat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {lead.comments}
                      </span>
                    </div>
                  </Link>
                ))}
                {dashboardLeads.length === 0 && (
                  <div className="empty-state">
                    <h2>No signals yet</h2>
                    <p>Add brands and load visibility results into Supabase to see them here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity & Quick Actions */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Recent activity</h2>
              </div>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{activity.action}</strong> {activity.details}
                      </p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card">
              <h2>Quick actions</h2>
              <div className="quick-actions">
                <Link href="/dashboard/keywords" className="action-button">
                  <SearchIcon />
                  Add brand
                </Link>
                <Link href="/dashboard/leads" className="action-button">
                  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Export signals
                </Link>
                <Link href="/dashboard/alerts" className="action-button">
                  <BellIcon />
                  Configure audits
                </Link>
              </div>
            </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
