"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../lib/supabase";

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
    action: "New lead found",
    details: "in r/Entrepreneur",
    time: "2 min ago",
  },
  {
    id: 2,
    action: "Keyword added",
    details: "\"CRM tools\"",
    time: "15 min ago",
  },
  {
    id: 3,
    action: "Daily digest sent",
    details: "to your email",
    time: "2 hours ago",
  },
  {
    id: 4,
    action: "Lead marked",
    details: "as contacted",
    time: "5 hours ago",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLeads, setDashboardLeads] = useState([]);
  const [keywordCount, setKeywordCount] = useState(0);
  const [subredditCount, setSubredditCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
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
      await loadDashboardData();
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        loadDashboardData();
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const loadDashboardData = async () => {
    if (!supabase) return;

    const [leadsResult, keywordsResult, alertsResult] = await Promise.all([
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

    if (leadsResult.error || keywordsResult.error || alertsResult.error) {
      setMessage("Could not load dashboard data. Run supabase-schema.sql in Supabase first.");
      return;
    }

    const keywords = keywordsResult.data || [];
    const subreddits = new Set(keywords.flatMap((item) => item.subreddits || []));
    setDashboardLeads(leadsResult.data || []);
    setKeywordCount(keywords.length);
    setSubredditCount(subreddits.size);
    setAlertCount((alertsResult.data || []).length);
    setMessage("");
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

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="dashboard-main dashboard-main-shadcn" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Loading...</p>
        </div>
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
            <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Here's what's happening with your leads today</p>
          </div>
          <div className="user-menu">
            <Link href="/dashboard/alerts" className="header-action-button">
              <BellIcon />
              Alerts
            </Link>
            <div className="user-avatar">{getInitials(user?.email)}</div>
          </div>
        </div>

        <div className="dashboard-content">
          <section className="dashboard-hero-card">
            <div>
              <span className="dashboard-kicker">Today&apos;s lead flow</span>
              <h2>{highIntentCount} high-intent posts are ready for review.</h2>
              <p>Prioritize recent recommendation requests, then save or mark contacted from the Leads workspace.</p>
            </div>
            <img className="dashboard-character" src="/lead-finder-character-alerts.jpg" alt="" />
            <div className="dashboard-hero-actions">
              <Link href="/dashboard/leads" className="primary-button dashboard-primary-action">Review leads</Link>
              <Link href="/dashboard/keywords" className="secondary-button dashboard-secondary-action">Tune keywords</Link>
            </div>
          </section>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <SearchIcon />
              </div>
              <h3>Keywords tracked</h3>
              <p className="stat-value">{keywordCount}</p>
              <span className="stat-delta">+2 this week</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <TrendingIcon />
              </div>
              <h3>Leads found</h3>
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
              <h3>Subreddits</h3>
              <p className="stat-value">{subredditCount}</p>
              <span className="stat-delta">watched now</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-amber">
                <BellIcon />
              </div>
              <h3>Alerts sent</h3>
              <p className="stat-value">{alertCount}</p>
              <span className="stat-delta">active rules</span>
            </div>
          </div>
          {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}

          <div className="dashboard-insight-grid">
            <section className="dashboard-card">
              <div className="card-header">
                <h2>Intent split</h2>
                <Link href="/dashboard/leads" className="card-link">Open leads</Link>
              </div>
              <div className="intent-bars">
                <div className="intent-bar-row">
                  <span>High intent</span>
                  <div className="intent-track"><span style={{ width: `${intentPercent(highIntentCount)}%` }} /></div>
                  <strong>{intentPercent(highIntentCount)}%</strong>
                </div>
                <div className="intent-bar-row">
                  <span>Medium</span>
                  <div className="intent-track"><span style={{ width: `${intentPercent(mediumIntentCount)}%` }} /></div>
                  <strong>{intentPercent(mediumIntentCount)}%</strong>
                </div>
                <div className="intent-bar-row">
                  <span>Low</span>
                  <div className="intent-track"><span style={{ width: `${intentPercent(lowIntentCount)}%` }} /></div>
                  <strong>{intentPercent(lowIntentCount)}%</strong>
                </div>
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-header">
                <h2>Keyword pulse</h2>
                <Link href="/dashboard/keywords" className="card-link">Manage</Link>
              </div>
              <div className="keyword-pulse-list">
                {keywordPulse.map((item) => (
                  <div key={item.keyword} className="keyword-pulse-item">
                    <div>
                      <strong>{item.keyword}</strong>
                      <span>{item.count} leads</span>
                    </div>
                    <em>{latestLeadCount ? `${Math.round((item.count / latestLeadCount) * 100)}%` : "0%"}</em>
                  </div>
                ))}
                {keywordPulse.length === 0 && (
                  <div className="empty-state">
                    <h2>No keyword pulse yet</h2>
                    <p>Matched leads will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="dashboard-grid">
            {/* Recent Leads */}
            <div className="dashboard-card dashboard-card-large">
              <div className="card-header">
                <h2>Recent leads</h2>
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
                    <h2>No leads yet</h2>
                    <p>Add keywords and load Reddit leads into Supabase to see them here.</p>
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
                  Add keyword
                </Link>
                <Link href="/dashboard/leads" className="action-button">
                  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Export leads
                </Link>
                <Link href="/dashboard/alerts" className="action-button">
                  <BellIcon />
                  Configure alerts
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
