import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { FreeVisibilityChecker } from "@/components/free-visibility-checker";
import {
  ArrowUpRightIcon,
  BotIcon,
  BoxIcon,
  BracesIcon,
  ChevronDownIcon,
  CodeIcon,
  CopyIcon,
  GlobeIcon,
  MailIcon,
  PlusIcon,
  SendIcon,
  SettingsIcon,
  SparklesIcon,
  StarIcon,
  WorkflowIcon,
} from "lucide-react";

const solutionCards = [
  {
    title: "AI Visibility Score",
    copy: "Track ChatGPT, Gemini, Claude, and one overall GEO score in one dashboard.",
  },
  {
    title: "Competitor Gap",
    copy: "Compare your mentions against competitors and see who AI recommends first.",
  },
  {
    title: "Prompt Library",
    copy: "Monitor prompts like best SEO tools, best AI tools, best CRM, and influencer platforms.",
  },
];

const stats = [
  ["65/100", "ChatGPT visibility"],
  ["72/100", "Gemini visibility"],
  ["40/100", "Claude visibility"],
  ["62/100", "Overall GEO score"],
];

const companies = ["Your Brand 18", "Competitor A 42", "Competitor B 35", "Today +15"];

const features = [
  {
    icon: BracesIcon,
    title: "AI CITATION SOURCES",
    copy: "See where AI is pulling brand context from: Reddit, Quora, blogs, news, comparison pages, and directories.",
  },
  {
    icon: BoxIcon,
    title: "WHY NOT MENTIONED?",
    copy: "Oras explains why competitors appear, like high authority citations, stronger entity coverage, or missing comparison pages.",
  },
  {
    icon: GlobeIcon,
    title: "GEO RECOMMENDATIONS",
    copy: "Get automatic actions: add FAQ schema, author pages, comparison pages, citations, and entity-rich content.",
  },
  {
    icon: WorkflowIcon,
    title: "BRAND MONITORING",
    copy: "Run daily scans, track yesterday vs today mentions, and watch trend graphs across every AI answer engine.",
  },
];

const integrations = [
  ["ChatGPT", SparklesIcon],
  ["Gemini", BotIcon],
  ["Claude", StarIcon],
  ["Perplexity", WorkflowIcon],
  ["Reddit", BoxIcon],
  ["Quora", SendIcon],
  ["Blogs", BotIcon],
  ["News", PlusIcon],
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
    a: "SEO tools track keyword rankings on search engines. Oras tracks whether AI answer engines mention you in their responses, a separate and growing channel where there is no second page, so if you aren't mentioned you're invisible.",
  },
  {
    q: "Can I track competitors?",
    a: "Yes. Oras compares your mentions against competitors across every engine, shows who gets recommended first, and explains why, from citation authority to missing comparison pages.",
  },
  {
    q: "Do you offer reports for agencies?",
    a: "Yes. Oras generates white label GEO audit reports and lets agencies manage every client dashboard from one account.",
  },
];

const trackedPrompts = [
  ["Best SEO tools", "ChatGPT mentions Competitor A. Gemini mentions your brand."],
  ["Best AI tools", "Claude does not mention you yet. Add comparison and citation pages."],
  ["Best CRM", "Competitor B appears in 35 answers across ChatGPT and Perplexity."],
  ["Best influencer platform", "Your brand appears in Perplexity, but not ChatGPT."],
  ["Best UGC marketplace", "Gap detected: competitors rank, your brand is missing."],
];

export default function Home() {
  return (
    <main className="autosend-page">
      <SiteNavbar />

      <section className="autosend-hero" id="demo">
        <div className="autosend-hero-copy">
          <span className="autosend-hero-eyebrow">GEO — GENERATIVE ENGINE OPTIMIZATION</span>
          <h1>
            Be the brand <em>AI recommends</em>, not a competitor
          </h1>
          <p>
            Oras tracks where ChatGPT, Gemini, Claude, and Perplexity mention your brand,
            shows why competitors rank higher, and gives you a ranked action plan to fix it.
          </p>
          <div className="autosend-hero-actions">
            <Link className="autosend-button autosend-button-primary" href="#check">
              Check your visibility free
            </Link>
            <Link className="autosend-button autosend-button-ghost" href="/pricing">
              View pricing
            </Link>
          </div>

          <a
            href="https://x.com/TryOraswa"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-x-follow"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="hero-x-icon footer-social-icon">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow <strong>@TryOraswa</strong> for GEO tips
          </a>
        </div>

        <div className="hero-product-preview">

          <div className="hero-preview-window">
            <div className="hero-preview-bar">
              <span /><span /><span />
              <div className="hero-preview-title">GEO Score — Oras</div>
            </div>
            <div className="hero-preview-body">
              <div className="hero-preview-score-col">
                <div className="hero-preview-ring">
                  <strong>74</strong>
                  <span>/ 100</span>
                </div>
                <div className="hero-preview-grade">Growing</div>
                <div className="hero-preview-note">20 AI checks · 2 live engines</div>
              </div>
              <div className="hero-preview-engines">
                {[
                  { name: "ChatGPT", rate: 80, color: "#10a37f", hits: "4/5" },
                  { name: "Gemini",  rate: 60, color: "#4285f4", hits: "3/5" },
                  { name: "Claude",  rate: 80, color: "#7c3aed", hits: "4/5" },
                  { name: "Perplexity", rate: 60, color: "#f59e0b", hits: "3/5" },
                ].map((e) => (
                  <div key={e.name} className="hero-preview-engine-row">
                    <span className="hero-preview-engine-dot" style={{ background: e.color }} />
                    <span className="hero-preview-engine-name">{e.name}</span>
                    <div className="hero-preview-bar-track">
                      <div className="hero-preview-bar-fill" style={{ width: `${e.rate}%`, background: e.color }} />
                    </div>
                    <span className="hero-preview-engine-hits" style={{ color: e.color }}>{e.hits}</span>
                  </div>
                ))}
                <div className="hero-preview-divider" />
                <div className="hero-preview-impact">
                  <span className="hero-preview-impact-plus">+18 pts available</span>
                  <span className="hero-preview-impact-hint">See recommendations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FreeVisibilityChecker />

      <section className="autosend-docs-grid" id="solutions">
        {solutionCards.map((card) => (
          <article key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.copy}</p>
            <a href="#docs">
              DOCS <ArrowUpRightIcon aria-hidden="true" />
            </a>
          </article>
        ))}
      </section>

      <section className="autosend-proof">
        <div className="autosend-stat-grid">
          {stats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <h2>AI MENTION TRACKING FOR BRANDS AND AGENCIES</h2>
        <div className="autosend-company-grid">
          {companies.map((company, index) => (
            <div key={company}>
              <span>{company}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="autosend-product" id="docs">
        <div className="autosend-product-head">
          <span>#01 AI RECOMMENDATION SIMULATOR</span>
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
                    <h3>{feature.title}</h3>
                    <p>{feature.copy}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="autosend-code-panel">
            <div className="autosend-window">
              <div className="autosend-window-bar">
                <span />
                <span />
                <span />
              </div>
              <div className="autosend-code-content">
                <aside>
                  {["ChatGPT", "Gemini", "Claude", "Perplexity", "Reddit", "Quora", "Blogs", "News"].map((item) => (
                    <button key={item} type="button">
                      <CodeIcon aria-hidden="true" />
                      {item}
                    </button>
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
Add comparison pages
Add FAQ schema
Build Reddit and Quora citations
Create author and entity pages`}</pre>
                <button className="autosend-copy" type="button" aria-label="Copy code">
                  <CopyIcon aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <a className="autosend-section-link" href="#docs">
          EXPLORE THE AI SIMULATOR <ArrowUpRightIcon aria-hidden="true" />
        </a>
      </section>

      <section className="autosend-split">
        <div>
          <span>COMPETITOR CONTENT GAP</span>
          <h2>Find prompts competitors rank for and you do not.</h2>
          <p>Track gaps like influencer marketing platform, UGC marketplace, creator CRM, best AI tools, best CRM, and best SEO tools.</p>
        </div>
        <div className="autosend-project-visual">
          <div className="autosend-window">
            <div className="autosend-window-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="autosend-project-card">
              <button type="button">
                <MailIcon aria-hidden="true" />
                Client Workspace
                <ChevronDownIcon aria-hidden="true" />
              </button>
              <div>
                <p>
                  <MailIcon aria-hidden="true" />
                  <strong>Brand Alpha</strong>
                  <small>18 mentions</small>
                  <SettingsIcon aria-hidden="true" />
                </p>
                <p>
                  <SparklesIcon aria-hidden="true" />
                  <strong>Competitor A</strong>
                  <small>42 mentions</small>
                </p>
                <p>
                  <PlusIcon aria-hidden="true" />
                  <strong>NEW CLIENT</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="autosend-integrations" id="agents">
        <div>
          <span>AI CITATION SOURCES</span>
          <h2>Know where answer engines learn about your brand.</h2>
        </div>
        <div className="autosend-integration-grid">
          {integrations.map(([name, Icon]) => (
            <article key={name}>
              <Icon aria-hidden="true" />
              <ArrowUpRightIcon aria-hidden="true" />
              <h3>{name}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="oras-prompt-library" id="blog">
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

      <section className="autosend-pricing" id="pricing">
        <span>AGENCY READY</span>
        <h2>One dashboard. Every client. White label GEO audit reports included.</h2>
        <Link className="autosend-button autosend-button-primary" href="/pricing">
          See pricing
        </Link>
      </section>

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

      <footer className="oras-footer">
        <div className="oras-footer-inner">
          <div className="oras-footer-brand">
            <Link className="autosend-brand" href="/">
              <img src="/logo.png" alt="" />
              <span>ORAS</span>
            </Link>
            <p className="oras-footer-tagline">Online Reputation &amp; AI Search</p>
            <p>AI visibility, GEO audits, citation tracking, and white-label reports for brands and agencies.</p>
            <div className="footer-social-row">
              <a
                href="https://x.com/TryOraswa"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-handle"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-social-icon">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @TryOraswa
              </a>
              <a
                href="https://www.linkedin.com/in/try-oras-574298418"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-handle"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-social-icon">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
          {[
            ["PRODUCT", "GEO Score", "Prompt Library", "Citation Sources", "Reports"],
            ["ENGINES", "ChatGPT", "Gemini", "Claude", "Perplexity"],
            ["COMPANY", "How it works", "Free check", "Pricing", "Blog"],
            ["ACCOUNT", "Log in", "Dashboard", "Pricing", "Support"],
            ["LEGAL", "Privacy Policy", "Terms of Service"],
          ].map(([heading, ...items]) => {
            const hrefFor = (item) =>
              ({
                "GEO Score": "/#check",
                "Prompt Library": "/#blog",
                "Citation Sources": "/#agents",
                Reports: "/#pricing",
                ChatGPT: "/#agents",
                Gemini: "/#agents",
                Claude: "/#agents",
                Perplexity: "/#agents",
                "How it works": "/#docs",
                "Free check": "/#check",
                Blog: "/blog",
                Pricing: "/pricing",
                "Log in": "/signin",
                Dashboard: "/dashboard",
                Support: "mailto:support@tryoras.com",
                "Privacy Policy": "/privacy",
                "Terms of Service": "/terms",
              }[item] || "/");
            return (
              <div className="oras-footer-list" key={heading}>
                <h2>{heading}</h2>
                {items.map((item) => (
                  <a href={hrefFor(item)} key={item}>
                    {item}
                  </a>
                ))}
              </div>
            );
          })}
        </div>
        <div className="oras-footer-bottom-bar">
          <span className="oras-footer-copy">© 2026 · ORAS INC.</span>
        </div>
      </footer>
    </main>
  );
}
