"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SourcePresetPicker } from "@/components/source-preset-picker";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowRightIcon, LockIcon, SparklesIcon } from "lucide-react";
import { createBrowserSupabaseClient, isMissingSupabaseTableError } from "../../../lib/supabase";
import {
  formatDefaultVisibilitySources,
  normalizeWorkspaceProfile,
  parseCommaSeparatedList,
} from "../../../lib/workspace-profile";
import { canAddBrand, getLimits, getTier, nextTier } from "../../../lib/subscription";
import { LimitNotice, UsageMeter } from "@/components/upgrade-prompt";

const PlusIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TrashIcon = () => (
  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function buildSeoBrief(keyword) {
  const cleanKeyword = keyword.trim();

  return {
    titleIdeas: [
      `${cleanKeyword}: A Practical Guide for Better Rankings`,
      `How to Use ${cleanKeyword} to Capture More Qualified Traffic`,
      `The Complete ${cleanKeyword} Playbook for 2026`,
    ],
    h1: `The Complete ${cleanKeyword} Guide`,
    h2s: [
      `What is ${cleanKeyword}?`,
      `How ${cleanKeyword} helps users decide`,
      `Best practices for using ${cleanKeyword} on your site`,
      `Common mistakes to avoid with ${cleanKeyword}`,
    ],
    faqs: [
      {
        q: `What is the best way to start with ${cleanKeyword}?`,
        a: `Open with a clear definition, then add a quick how-to section and a practical example.`,
      },
      {
        q: `How do I optimize content for ${cleanKeyword}?`,
        a: `Use the keyword in the title, H1, intro, a few H2s, and a concise meta description without stuffing.`,
      },
      {
        q: `What questions should a ${cleanKeyword} page answer?`,
        a: `Answer intent, use cases, comparison points, pricing or process, and next steps for the reader.`,
      },
      {
        q: `How can I improve GEO and AEO for ${cleanKeyword}?`,
        a: `Add concise answers, FAQ schema, citations, and clear entity references so AI systems can parse the page easily.`,
      },
    ],
    internalLinks: [
      "Link to the related product or category page",
      "Link to the pricing page for conversion intent",
      "Link to a supporting blog post or case study",
      "Link to a comparison or alternatives page",
    ],
    metaDescription: `Learn how to use ${cleanKeyword} with a concise SEO brief covering titles, headings, FAQs, internal links, and GEO/AEO optimization.`,
    geoAeo: [
      "Add a direct answer near the top of the page.",
      "Use structured FAQs with schema markup.",
      "Cite sources and reference related entities.",
      "Keep paragraphs short and answer-first.",
      "Include comparison language and outcome-driven phrasing.",
    ],
  };
}

function SeoBriefTool({ subscriptionTier = "free", defaultKeyword = "" }) {
  const isPremium = subscriptionTier !== "free";
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [brief, setBrief] = useState(() => (defaultKeyword.trim() ? buildSeoBrief(defaultKeyword) : null));

  useEffect(() => {
    if (defaultKeyword.trim()) {
      setKeyword(defaultKeyword);
      setBrief(buildSeoBrief(defaultKeyword));
    }
  }, [defaultKeyword]);

  const handleGenerate = (event) => {
    event.preventDefault();

    const cleaned = keyword.trim();
    if (!cleaned) return;

    setBrief(buildSeoBrief(cleaned));
  };

  if (!isPremium) {
    return (
      <section className="dashboard-card seo-brief-lock">
        <div className="card-header">
          <div>
            <h2>Full SEO brief</h2>
            <p className="card-supporting-copy">Available on Pro and above.</p>
          </div>
          <span className="pricing-badge">Locked</span>
        </div>
        <div className="seo-brief-locked">
          <LockIcon />
          <div>
            <strong>Upgrade to unlock keyword briefs</strong>
            <p>
              Get title ideas, H1/H2 structure, FAQs, internal links, meta descriptions, and GEO/AEO recommendations for any keyword.
            </p>
          </div>
          <Link className="primary-button seo-brief-upgrade" href="/pricing">
            View plans
            <ArrowRightIcon />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-card seo-brief-card">
      <div className="card-header">
        <div>
          <h2>Full SEO brief</h2>
          <p className="card-supporting-copy">Generate a keyword brief with SEO, AEO, and GEO guidance.</p>
        </div>
        <span className="pricing-badge">Pro</span>
      </div>

      <form className="seo-brief-form" onSubmit={handleGenerate}>
        <label className="form-label" htmlFor="seo-brief-keyword">
          Keyword
        </label>
        <div className="seo-brief-row">
          <input
            id="seo-brief-keyword"
            className="form-input"
            placeholder="e.g., AI lead generation"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className="primary-button seo-brief-button" type="submit">
            Generate brief
            <SparklesIcon />
          </button>
        </div>
      </form>

      {brief ? (
        <div className="seo-brief-output">
          <div className="seo-brief-block">
            <h3>Title ideas</h3>
            <ul>
              {brief.titleIdeas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="seo-brief-grid">
            <div className="seo-brief-block">
              <h3>H1 / H2</h3>
              <p><strong>H1:</strong> {brief.h1}</p>
              <ul>
                {brief.h2s.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="seo-brief-block">
              <h3>Meta description</h3>
              <p>{brief.metaDescription}</p>
            </div>
          </div>

          <div className="seo-brief-grid">
            <div className="seo-brief-block">
              <h3>FAQs</h3>
              <ul>
                {brief.faqs.map((item) => (
                  <li key={item.q}>
                    <strong>{item.q}</strong>
                    <span>{item.a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="seo-brief-block">
              <h3>Internal links</h3>
              <ul>
                {brief.internalLinks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="seo-brief-block seo-brief-full-width">
            <h3>GEO / AEO optimization</h3>
            <ul className="seo-brief-chips">
              {brief.geoAeo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="seo-brief-empty">
          <SparklesIcon />
          <p>Enter a keyword to generate the full SEO brief.</p>
        </div>
      )}
    </section>
  );
}

function BlogIdeasTool({ subscriptionTier = "free", defaultNiche = "" }) {
  const isPremium = subscriptionTier !== "free";
  const [niche, setNiche] = useState(defaultNiche);
  const [ideas, setIdeas] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  const generate = async (rawNiche) => {
    const cleaned = rawNiche.trim();
    if (!cleaned) return;
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/blog-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: cleaned }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not generate ideas.");
      setIdeas(data.ideas || []);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (defaultNiche.trim()) setNiche(defaultNiche);
  }, [defaultNiche]);

  const handleGenerate = (event) => {
    event.preventDefault();
    generate(niche);
  };

  if (!isPremium) {
    return (
      <section className="dashboard-card seo-brief-lock">
        <div className="card-header">
          <div>
            <h2>50 SEO blog ideas</h2>
            <p className="card-supporting-copy">Available on Pro and above.</p>
          </div>
          <span className="pricing-badge">Locked</span>
        </div>
        <div className="seo-brief-locked">
          <LockIcon />
          <div>
            <strong>Upgrade to unlock blog idea generation</strong>
            <p>
              Enter a niche and generate 50 blog ideas tagged with `Low competition + high intent`.
            </p>
          </div>
          <Link className="primary-button seo-brief-upgrade" href="/pricing">
            View plans
            <ArrowRightIcon />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-card seo-brief-card">
      <div className="card-header">
        <div>
          <h2>AI blog ideas</h2>
          <p className="card-supporting-copy">Enter a niche — AI generates distinct ideas rated by competition and buyer intent.</p>
        </div>
        <span className="pricing-badge">Pro</span>
      </div>

      <form className="seo-brief-form" onSubmit={handleGenerate}>
        <label className="form-label" htmlFor="blog-ideas-niche">
          Niche
        </label>
        <div className="seo-brief-row">
          <input
            id="blog-ideas-niche"
            className="form-input"
            placeholder="e.g., AI lead generation"
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
          />
          <button className="primary-button seo-brief-button" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Generating…" : "Generate ideas"}
            <SparklesIcon />
          </button>
        </div>
      </form>

      {status === "loading" ? (
        <div className="seo-brief-empty">
          <SparklesIcon />
          <p>Generating fresh ideas for “{niche.trim()}”…</p>
        </div>
      ) : status === "error" ? (
        <div className="seo-brief-empty">
          <p style={{ color: "#dc2626" }}>{error}</p>
        </div>
      ) : ideas.length > 0 ? (
        <div className="blog-ideas-output">
          <div className="blog-ideas-summary">
            <strong>{ideas.length}</strong>
            <span>ideas ready</span>
          </div>
          <div className="blog-ideas-list">
            {ideas.map((idea, index) => (
              <article key={`${idea.title}-${index}`} className="blog-idea-card">
                <div className="blog-idea-top">
                  <span className="blog-idea-index">{index + 1}</span>
                  <div className="blog-idea-tags">
                    <span className={`blog-idea-tag blog-idea-comp-${idea.competition.toLowerCase()}`}>
                      {idea.competition} competition
                    </span>
                    <span className={`blog-idea-tag blog-idea-intent-${idea.intent.toLowerCase()}`}>
                      {idea.intent} intent
                    </span>
                  </div>
                </div>
                <h3>{idea.title}</h3>
                {idea.focus ? <p>{idea.focus}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="seo-brief-empty">
          <SparklesIcon />
          <p>Enter a niche to generate AI blog ideas.</p>
        </div>
      )}
    </section>
  );
}

export default function KeywordsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newSubreddits, setNewSubreddits] = useState("");
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) {
      setUser({ id: "demo-user", email: "demo@local" });
      setProfile({
        onboarding_completed: true,
        starter_keyword: "AI lead generation",
        target_subreddits: formatDefaultVisibilitySources().split(", ").filter(Boolean),
        subscription_tier: "pro",
      });
      setKeywords([]);
      setMessage("Demo mode is active because Supabase is not configured.");
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/signin");
        return;
      }
      setUser(session.user);
      await loadWorkspace(session.user.id);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
        loadWorkspace(session.user.id);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const loadWorkspace = async (userId) => {
    if (!supabase) return;
    const [profileResult, keywordsResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("tracked_keywords")
        .select("id, keyword, subreddits, leads_found")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (profileResult.error) {
      setMessage("Could not load keywords. Run supabase-schema.sql in Supabase first.");
      return;
    }

    setProfile(profileResult.data ? normalizeWorkspaceProfile(profileResult.data) : null);
    setKeywords(keywordsResult.data || []);
    setMessage("");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setMessage("Demo mode: connect Supabase to save brands.");
      return;
    }
    if (!newKeyword.trim() || !user || !supabase) return;

    const tierKey = profile?.subscription_tier || "free";
    if (!canAddBrand(tierKey, keywords.length)) {
      const upgrade = nextTier(tierKey);
      setMessage(
        `You've reached the ${getLimits(tierKey).brands}-brand limit on ${getTier(tierKey).name}.` +
          (upgrade ? ` Upgrade to ${upgrade.name} to track more.` : ""),
      );
      return;
    }

    const subreddits = parseCommaSeparatedList(newSubreddits);
    const { data, error } = await supabase
      .from("tracked_keywords")
      .insert({
        user_id: user.id,
        keyword: newKeyword.trim(),
        subreddits,
      })
      .select("id, keyword, subreddits, leads_found")
      .single();

    if (error) {
      if (!isMissingSupabaseTableError(error, "tracked_keywords")) {
        setMessage(error.message || "Could not add keyword.");
        return;
      }
      setKeywords([{ id: `${Date.now()}`, keyword: newKeyword.trim(), subreddits, leads_found: 0 }, ...keywords]);
      setNewKeyword("");
      setNewSubreddits("");
      return;
    }

    if (data) {
      setKeywords([data, ...keywords]);
      setNewKeyword("");
      setNewSubreddits("");
    }
  };

  const handleDeleteKeyword = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from("tracked_keywords").delete().eq("id", id);
    if (error && !isMissingSupabaseTableError(error, "tracked_keywords")) {
      setMessage(error.message || "Could not delete keyword.");
      return;
    }
    setKeywords(keywords.filter((k) => k.id !== id));
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

  const tierKey = profile?.subscription_tier || "free";
  const brandLimit = getLimits(tierKey).brands;
  const brandLimitLabel = brandLimit === Infinity ? "unlimited" : brandLimit;
  const atBrandLimit = !canAddBrand(tierKey, keywords.length);
  const upgradeTier = nextTier(tierKey);

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} subscriptionTier={tierKey} />
      <SidebarInset>
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>Brands</h1>
              <p style={{ color: "#71717a", margin: "4px 0 0 0" }}>Manage the brands you want to track across AI answers</p>
            </div>
          </div>

          {message ? <p className="signin-message" style={{ textAlign: "left" }}>{message}</p> : null}

          <div className="dashboard-content">
            <section className="dashboard-setup-hub">
              <div className="dashboard-setup-hub-copy">
                <span className="dashboard-kicker">Visibility setup</span>
                <h2>Start here: setup and brands live in one place.</h2>
                <p>
                  This page is the control center for both setup and brand management. Add your first brand, pick sources, and open the brief tools without hunting through the sidebar.
                </p>
              </div>
              <div className="dashboard-setup-hub-actions">
                <Link href="/dashboard/settings" className="secondary-button dashboard-secondary-action">
                  Sources
                </Link>
                <Link href="/dashboard/alerts" className="secondary-button dashboard-secondary-action">
                  Alerts
                </Link>
                <Link href="/dashboard" className="primary-button dashboard-primary-action">
                  Open dashboard
                </Link>
              </div>
            </section>

            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2>Add new brand</h2>
                  <p className="card-supporting-copy">
                    {getTier(tierKey).name} plan · {brandLimitLabel} brands included
                  </p>
                </div>
                <span className="pricing-badge">{getTier(tierKey).name}</span>
              </div>

              <UsageMeter label="Brands tracked" used={keywords.length} limit={brandLimit} />

              {atBrandLimit ? (
                <LimitNotice
                  title={`You've hit your ${brandLimitLabel}-brand limit`}
                  description={
                    upgradeTier
                      ? `Upgrade to ${upgradeTier.name} to track up to ${getLimits(upgradeTier.key).brands === Infinity ? "unlimited" : getLimits(upgradeTier.key).brands} brands.`
                      : "You're on the top plan."
                  }
                  ctaTier={upgradeTier?.name}
                />
              ) : null}

              <form onSubmit={handleAddKeyword} className="add-keyword-form">
                <div className="form-fields">
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Oras"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      disabled={atBrandLimit}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sources (comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={formatDefaultVisibilitySources()}
                      value={newSubreddits}
                      onChange={(e) => setNewSubreddits(e.target.value)}
                      disabled={atBrandLimit}
                    />
                    <SourcePresetPicker value={newSubreddits} onChange={setNewSubreddits} />
                  </div>
                </div>
                <button type="submit" className="primary-button" disabled={atBrandLimit}>
                  <PlusIcon /> Add Brand
                </button>
              </form>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>Your Brands</h2>
                <span style={{ fontSize: "0.875rem", color: "#71717a" }}>{keywords.length} brands</span>
              </div>
              {keywords.length === 0 ? (
                <div className="empty-state">
                  <h2>No brands yet</h2>
                  <p>Add your first brand to start tracking visibility signals.</p>
                </div>
              ) : (
                <div className="keywords-list">
                  {keywords.map((keyword) => (
                    <div key={keyword.id} className="keyword-item">
                      <div className="keyword-info">
                        <div className="keyword-name">{keyword.keyword}</div>
                        <div className="keyword-subreddits">
                          {Array.isArray(keyword.subreddits) && keyword.subreddits.length > 0 ? (
                            <div className="source-chip-row">
                              {keyword.subreddits.map((source) => (
                                <span key={source} className="source-mini-chip">{source}</span>
                              ))}
                            </div>
                          ) : (
                            "All sources"
                          )}
                        </div>
                      </div>
                      <div className="keyword-stats">
                        <span className="stat-badge">{keyword.leads_found || 0} mentions found</span>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteKeyword(keyword.id)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <SeoBriefTool
              subscriptionTier={profile?.subscription_tier || "free"}
              defaultKeyword={profile?.starter_keyword || keywords[0]?.keyword || ""}
            />
            <BlogIdeasTool
              subscriptionTier={profile?.subscription_tier || "free"}
              defaultNiche={profile?.starter_keyword || keywords[0]?.keyword || ""}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
