import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { FreeVisibilityChecker } from "@/components/free-visibility-checker";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BotIcon,
  BoxIcon,
  BracesIcon,
  ChevronDownIcon,
  GlobeIcon,
  MailIcon,
  PlusIcon,
  SendIcon,
  SettingsIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  WorkflowIcon,
  ZapIcon,
} from "lucide-react";

const features = [
  {
    icon: BracesIcon,
    title: "AI Citation Sources",
    copy: "See where AI pulls brand context from: Reddit, Quora, blogs, news, comparison pages, and directories.",
  },
  {
    icon: BoxIcon,
    title: "Why Not Mentioned?",
    copy: "Oras explains why competitors appear — high authority citations, stronger entity coverage, or missing comparison pages.",
  },
  {
    icon: GlobeIcon,
    title: "GEO Recommendations",
    copy: "Get automatic actions: add FAQ schema, author pages, comparison pages, citations, and entity-rich content.",
  },
  {
    icon: WorkflowIcon,
    title: "Brand Monitoring",
    copy: "Run daily scans, track yesterday vs today mentions, and watch trend graphs across every AI answer engine.",
  },
];

const faqs = [
  {
    q: "What is AI visibility tracking?",
    a: "AI visibility tracking measures how often answer engines like ChatGPT, Gemini, Claude, and Perplexity mention your brand when people ask category and comparison questions. Oras runs those prompts across each engine and scores whether you're named, named first, or missing.",
  },
  {
    q: "What is GEO (Generative Engine Optimization)?",
    a: "GEO is the practice of getting your brand recommended inside AI generated answers, the way SEO gets you ranked in search results. Instead of optimizing for a list of links, you optimize for being the brand the model names.",
  },
  {
    q: "Which AI engines does Oras track?",
    a: "Oras tracks ChatGPT, Gemini, Claude, and Perplexity, plus the citation sources behind their answers such as Reddit, Quora, blogs, news, and comparison pages.",
  },
  {
    q: "How is this different from traditional SEO tools?",
    a: "SEO tools track keyword rankings on search engines. Oras tracks whether AI answer engines mention you in their responses — a separate and growing channel where there is no second page.",
  },
  {
    q: "Can I track competitors?",
    a: "Yes. Oras compares your mentions against competitors across every engine, shows who gets recommended first, and explains why — from citation authority to missing comparison pages.",
  },
  {
    q: "Do you offer reports for agencies?",
    a: "Yes. Oras generates white-label GEO audit reports and lets agencies manage every client dashboard from one account.",
  },
];

const trackedPrompts = [
  ["Best SEO tools", "ChatGPT mentions Competitor A. Gemini mentions your brand."],
  ["Best AI tools", "Claude does not mention you yet. Add comparison and citation pages."],
  ["Best CRM", "Competitor B appears in 35 answers across ChatGPT and Perplexity."],
  ["Best influencer platform", "Your brand appears in Perplexity, but not ChatGPT."],
  ["Best UGC marketplace", "Gap detected: competitors rank, your brand is missing."],
];

const ENGINES = [
  { name: "ChatGPT",    color: "#10a37f" },
  { name: "Gemini",     color: "#4285f4" },
  { name: "Claude",     color: "#d97706" },
  { name: "Perplexity", color: "#ea580c" },
];

export default function Home() {
  return (
    <main className="autosend-page">
      <SiteNavbar />

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-eyebrow">
              <span className="home-eyebrow-dot" />
              GEO — Generative Engine Optimization
            </span>
            <h1>
              Be the brand <em>AI recommends</em>,<br />not a competitor
            </h1>
            <p>
              Oras tracks where ChatGPT, Gemini, Claude, and Perplexity mention
              your brand, shows why competitors rank higher, and gives you a
              ranked action plan to fix it.
            </p>
            <div className="home-hero-actions">
              <Link className="home-cta-primary" href="#check">
                Check your visibility free <ArrowRightIcon />
              </Link>
              <Link className="home-cta-ghost" href="/pricing">
                View pricing
              </Link>
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="home-hero-visual">
            <div className="home-preview-card">
              <div className="home-preview-header">
                <span className="home-preview-title">GEO Score</span>
                <span className="home-preview-live"><span />Live</span>
              </div>
              <div className="home-preview-score-row">
                <div className="home-preview-ring">
                  <svg viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#f4f4f5" strokeWidth="7" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#ea580c" strokeWidth="7"
                      strokeDasharray="213.6" strokeDashoffset="64" strokeLinecap="round"
                      transform="rotate(-90 40 40)" />
                  </svg>
                  <div className="home-preview-ring-val"><strong>70</strong><span>/100</span></div>
                </div>
                <div className="home-preview-engines-col">
                  {[
                    { name: "ChatGPT", rank: "#2", win: false },
                    { name: "Gemini",  rank: "#1", win: true  },
                    { name: "Claude",  rank: "#3", win: false },
                    { name: "Perplexity", rank: "#1", win: true },
                  ].map((e) => (
                    <div key={e.name} className="home-preview-engine-row">
                      <span>{e.name}</span>
                      <span className={e.win ? "home-preview-rank-win" : "home-preview-rank"}>{e.rank}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="home-preview-trend">
                <TrendingUpIcon />
                <span>+12 pts this week</span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="home-preview-badge home-preview-badge-1">
              <ZapIcon />
              <span>3 fixes available</span>
            </div>
            <div className="home-preview-badge home-preview-badge-2">
              <SparklesIcon />
              <span>Mentioned on Gemini #1</span>
            </div>
          </div>
        </div>

        {/* Engine strip */}
        <div className="home-engine-strip">
          <span className="home-engine-strip-label">Live queries to</span>
          {ENGINES.map(({ name, color }) => (
            <span key={name} className="home-engine-pill">
              <span style={{ background: color }} className="home-engine-dot" />
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Free checker ── */}
      <FreeVisibilityChecker />

      {/* ── Stats strip ── */}
      <section className="home-stats">
        {[
          { val: "4",    label: "AI engines tracked" },
          { val: "Live", label: "Real queries, not simulated" },
          { val: "Free", label: "No credit card required" },
          { val: "60s",  label: "First score in 60 seconds" },
        ].map(({ val, label }) => (
          <div key={label} className="home-stat">
            <strong>{val}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="home-features" id="docs">
        <div className="home-features-head">
          <span className="home-section-label">Features</span>
          <h2>Everything you need to win in AI search</h2>
          <p>Track, understand, and improve your brand's presence across every major AI engine.</p>
        </div>
        <div className="home-features-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="home-feature-card">
                <span className="home-feature-icon"><Icon /></span>
                <h3>{f.title}</h3>
                <p>{f.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Product demo ── */}
      <section className="autosend-product" id="demo">
        <div className="autosend-product-head">
          <span>#01 AI RECOMMENDATION TRACKER</span>
          <h2>See which AI engine recommends you, competitors, or nobody.</h2>
        </div>
        <div className="autosend-product-body">
          <div className="autosend-feature-list">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title}>
                  <Icon aria-hidden="true" />
                  <div>
                    <h3>{feature.title.toUpperCase()}</h3>
                    <p>{feature.copy}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="autosend-code-panel">
            <div className="autosend-window">
              <div className="autosend-window-bar"><span /><span /><span /></div>
              <div className="autosend-code-content">
                <aside>
                  {["ChatGPT", "Gemini", "Claude", "Perplexity", "Reddit", "Quora", "Blogs", "News"].map((item) => (
                    <button key={item} type="button">{item}</button>
                  ))}
                </aside>
                <pre>{`Prompt:
"Best influencer marketing platform for startups"

AI result:
ChatGPT      Competitor A
Gemini       Competitor B
Claude       Not mentioned
Perplexity   Your brand

Why not mentioned?
Competitor A appears on 15 high-authority
sites. Your brand appears on only 3.

Recommended actions:
→ Add comparison pages
→ Add FAQ schema
→ Build Reddit & Quora citations
→ Create author and entity pages`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Prompt library ── */}
      <section className="oras-prompt-library" id="prompts">
        <div className="oras-prompt-lead">
          <span>PROMPT LIBRARY</span>
          <h2>Track the prompts that decide who gets recommended.</h2>
        </div>
        {trackedPrompts.map(([prompt, result]) => (
          <article key={prompt}>
            <h3>{prompt}</h3>
            <p>{result}</p>
            <ArrowUpRightIcon aria-hidden="true" />
          </article>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="home-cta-section">
        <span className="home-section-label">Get started free</span>
        <h2>Your AI visibility dashboard, ready in 60 seconds</h2>
        <p>Start tracking ChatGPT, Gemini, Claude, and Perplexity — free, no credit card required.</p>
        <div className="home-cta-row">
          <Link href="/signin" className="home-cta-primary">
            Start free <ArrowRightIcon />
          </Link>
          <Link href="/pricing" className="home-cta-ghost">
            See pricing
          </Link>
        </div>
        <p className="home-cta-note">Agency plan available · White-label reports · Cancel anytime</p>
      </section>

      {/* ── FAQ ── */}
      <section className="oras-faq" id="faq">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            }),
          }}
        />
        <div className="oras-faq-lead">
          <span>FAQ</span>
          <h2>Questions about AI visibility and GEO</h2>
        </div>
        <div className="oras-faq-list">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <ChevronDownIcon aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="oras-footer">
        <div className="oras-footer-inner">
          <div className="oras-footer-brand">
            <Link className="autosend-brand" href="/">
              <img src="/logo.png" alt="" />
              <span>ORAS</span>
            </Link>
            <p className="oras-footer-tagline">Online Reputation &amp; AI Search</p>
            <p>AI visibility, GEO audits, citation tracking, and white-label reports for brands and agencies.</p>
          </div>
          {[
            ["Product",   ["GEO Score", "/#demo"],     ["Visibility", "/dashboard"],  ["Competitors", "/dashboard/competitors"], ["Pricing", "/pricing"]],
            ["Tools",     ["Free GEO check", "/tools"], ["AI citation audit", "/tools"], ["Prompt gap finder", "/tools"],        ["Brand memory audit", "/tools"]],
            ["Solutions", ["For founders", "/pricing"], ["For agencies", "/pricing"],  ["For marketers", "/pricing"],            ["For creators", "/pricing"]],
            ["Company",   ["Blog", "/blog"],            ["Compare", "/compare"],        ["Contact", "/contact"],                  ["Sign in", "/signin"]],
            ["Legal",     ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]],
          ].map(([heading, ...pairs]) => (
            <div className="oras-footer-list" key={heading}>
              <h2>{heading}</h2>
              {pairs.map(([label, href]) => (
                <a href={href} key={label}>{label}</a>
              ))}
            </div>
          ))}
        </div>

        <div className="oras-footer-bottom-bar">
          <span className="oras-footer-status">
            <span className="oras-footer-status-dot" />
            Operational
          </span>
          <span className="oras-footer-copy">© 2026 · ORAS INC.</span>
        </div>

        <div className="oras-footer-resources">
          <div className="oras-footer-resources-head">
            <span>Free tools</span>
            <a href="/tools">All tools →</a>
          </div>
          <div className="oras-footer-resources-grid">
            {[
              "GEO Score checker", "AI citation audit", "Brand visibility scan",
              "Competitor comparison", "Prompt gap finder", "AI mention tracker",
              "ChatGPT rank check", "Gemini brand scan", "Claude mention check",
              "Perplexity audit", "Reddit visibility", "Quora presence check",
              "Share of voice report", "Brand memory audit", "GEO score history",
              "Visibility leaderboard", "AI recommendation gaps", "Citation source finder",
            ].map((tool) => (
              <a href="/tools" key={tool} className="oras-footer-tool-link">{tool}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
