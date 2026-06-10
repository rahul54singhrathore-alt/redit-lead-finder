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
    copy: "Oras explains why competitors appear, like high-authority citations, stronger entity coverage, or missing comparison pages.",
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
          <span className="autosend-hero-eyebrow">AI VISIBILITY &amp; GEO TRACKING</span>
          <h1>
            AI visibility for <em>brands</em> growing in <em>answers</em>
          </h1>
          <p>
            Track where ChatGPT, Gemini, Claude, and Perplexity mention your brand.
            Compare competitors, citations, prompts, and GEO actions in one place.
          </p>
          <div className="autosend-hero-cta">
            <Link className="autosend-button autosend-button-primary" href="#check">
              Check your visibility free
            </Link>
            <Link className="autosend-button" href="/pricing">
              View pricing
            </Link>
          </div>
        </div>

        <div className="autosend-hero-illustration">
          <img
            src="/illustor.png"
            alt="AI Recommendation Simulator showing how ChatGPT, Gemini, Claude, and Perplexity rank your brand against competitors"
          />
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
        <h2>AI MENTION TRACKING FOR BRANDS AND AGENCIES!</h2>
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
          <span>#01 - AI RECOMMENDATION SIMULATOR</span>
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
        <span>#03 - AGENCY READY</span>
        <h2>Generate white-label GEO audit reports and manage every client dashboard from one account.</h2>
        <Link className="autosend-button autosend-button-primary" href="/pricing">
          VIEW PRICING
        </Link>
      </section>

      <footer className="oras-footer">
        <div className="oras-footer-brand">
          <Link className="autosend-brand" href="/">
            <img src="/logo.png" alt="" />
            <span>ORAS</span>
          </Link>
          <p>AI visibility, GEO audits, citation tracking, and white-label reports for brands and agencies.</p>
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
        <p className="oras-footer-bottom">© 2026 · ORAS INC.</p>
      </footer>
    </main>
  );
}
