"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { CheckIcon, XIcon, ChevronDownIcon } from "lucide-react";

/* ── Competitor data ── */
const COMPARISONS = {
  "Manual tracking": {
    alt: "Manual AI Tracking",
    verdict:
      "Oras automates everything that manual tracking makes painful — querying four AI engines, recording results, spotting trends, and surfacing competitor gaps. Manual tracking is free but doesn't scale past one person running it twice a week.",
    stats: [
      { oras: "$0",       other: "$0",      label: "Starting price" },
      { oras: "4",        other: "1–2",     label: "AI engines" },
      { oras: "Automatic",other: "Manual",  label: "Scanning" },
    ],
    features: [
      { label: "Starting price",            oras: "Free",        alt: "Free" },
      { label: "Free plan forever",          oras: true,          alt: true },
      { label: "Multi-engine scanning",      oras: true,          alt: false },
      { label: "GEO Score",                  oras: true,          alt: false },
      { label: "Competitor leaderboard",     oras: true,          alt: false },
      { label: "Citation source tracking",   oras: true,          alt: false },
      { label: "Daily automated scans",      oras: true,          alt: false },
      { label: "Trend graphs over time",     oras: true,          alt: false },
      { label: "White-label PDF reports",    oras: "Growth+",     alt: false },
      { label: "Prompt gap finder",          oras: true,          alt: false },
      { label: "Reddit & Quora visibility",  oras: true,          alt: false },
      { label: "Time to first insight",      oras: "60 seconds",  alt: "30–60 min" },
    ],
    wins: [
      "Tracks ChatGPT, Gemini, Claude, and Perplexity automatically",
      "GEO Score gives you one number to watch over time",
      "Citation sources show exactly what drives AI mentions",
      "Daily scans with trend graphs — no manual effort",
      "Competitor leaderboard built in",
      "Free forever plan, no credit card needed",
    ],
    altWins: [
      "Zero cost, no tool dependency",
      "Full control over exact prompt wording",
      "Good enough for one-off audits if you only check monthly",
    ],
    faqs: [
      { q: "Is Oras faster than manual tracking?", a: "Yes — significantly. A full four-engine scan with competitor comparison takes Oras under 60 seconds. The same audit done manually takes 30–60 minutes per prompt set." },
      { q: "Can I use Oras to check specific custom prompts?", a: "Yes. Oras lets you add any prompt you care about to your tracking list. You're not limited to preset categories." },
      { q: "Does Oras replace manual spot-checks?", a: "For most teams, yes. If you want to spot-check a specific prompt in a specific AI engine, you can still do that — Oras handles the systematic, repeatable measurement." },
      { q: "What's the main limitation of manual tracking?", a: "Scale and consistency. It's hard to track 20+ prompts across 4 engines daily, and humans interpret answers differently each time. Oras removes both problems." },
    ],
  },

  "BrandMentions": {
    alt: "BrandMentions",
    verdict:
      "BrandMentions is a brand monitoring tool built for social media and web mentions. Oras is purpose-built for AI engine visibility. If your goal is to know how ChatGPT and Gemini describe your brand, Oras is the right tool — BrandMentions doesn't track AI answer engines at all.",
    stats: [
      { oras: "Free",     other: "$49/mo",  label: "Starting price" },
      { oras: "4",        other: "0",       label: "AI engines tracked" },
      { oras: "GEO Score",other: "None",    label: "AI score" },
    ],
    features: [
      { label: "Starting price",            oras: "Free",        alt: "$49/mo" },
      { label: "Free plan forever",          oras: true,          alt: false },
      { label: "AI engine tracking",         oras: true,          alt: false },
      { label: "GEO Score",                  oras: true,          alt: false },
      { label: "Social media monitoring",    oras: false,         alt: true },
      { label: "Web mention alerts",         oras: false,         alt: true },
      { label: "Citation source tracking",   oras: true,          alt: false },
      { label: "Competitor AI comparison",   oras: true,          alt: false },
      { label: "White-label PDF reports",    oras: "Growth+",     alt: true },
      { label: "Prompt gap finder",          oras: true,          alt: false },
      { label: "Reddit & Quora visibility",  oras: true,          alt: false },
      { label: "Email digest",               oras: true,          alt: true },
    ],
    wins: [
      "Actually tracks AI engines — BrandMentions doesn't",
      "Free to start vs $49/mo minimum",
      "GEO Score gives a clear number to improve",
      "Shows which citation sources drive AI recommendations",
      "Prompt gap finder reveals AI queries you're missing",
      "Reddit and Quora AI visibility included",
    ],
    altWins: [
      "Social media mention monitoring across Twitter, Facebook, Instagram",
      "Real-time web mention alerts and email notifications",
      "Better for PR teams tracking press coverage",
    ],
    faqs: [
      { q: "Does BrandMentions track AI engines?", a: "No. BrandMentions monitors social media platforms and web mentions. It does not track how ChatGPT, Gemini, Claude, or Perplexity describe your brand." },
      { q: "Can I use both tools together?", a: "Yes — they cover different channels. BrandMentions handles social and web; Oras handles AI engine visibility. If both channels matter to you, they're complementary." },
      { q: "Why is Oras free and BrandMentions isn't?", a: "Oras's free plan covers core GEO visibility tracking. Advanced features like white-label reports and multi-brand tracking are on paid plans starting lower than BrandMentions." },
      { q: "Which is better for agencies?", a: "Oras for agencies that want to offer AI visibility as a service — white-label GEO reports, multi-client dashboards, and AI-specific insights are all built in." },
    ],
  },

  "Mention.com": {
    alt: "Mention.com",
    verdict:
      "Mention.com is a social listening and web monitoring platform. It's strong for tracking brand mentions across social media and news. It does not track AI engine recommendations. Oras fills the gap Mention.com leaves entirely uncovered — how AI answers describe your brand.",
    stats: [
      { oras: "Free",     other: "$41/mo",  label: "Starting price" },
      { oras: "4",        other: "0",       label: "AI engines tracked" },
      { oras: "Automatic",other: "Manual",  label: "AI scanning" },
    ],
    features: [
      { label: "Starting price",            oras: "Free",        alt: "$41/mo" },
      { label: "Free plan forever",          oras: true,          alt: false },
      { label: "AI engine tracking",         oras: true,          alt: false },
      { label: "GEO Score",                  oras: true,          alt: false },
      { label: "Social listening",           oras: false,         alt: true },
      { label: "News monitoring",            oras: false,         alt: true },
      { label: "Citation source tracking",   oras: true,          alt: false },
      { label: "Competitor AI comparison",   oras: true,          alt: false },
      { label: "White-label reports",        oras: "Growth+",     alt: "Enterprise" },
      { label: "Prompt gap finder",          oras: true,          alt: false },
      { label: "Reddit & Quora AI visibility", oras: true,        alt: false },
      { label: "Influencer identification",  oras: false,         alt: true },
    ],
    wins: [
      "Built specifically for AI engine visibility — Mention.com isn't",
      "Free plan vs $41/mo minimum",
      "GEO Score to track AI visibility over time",
      "Tracks all 4 major AI engines in one dashboard",
      "Competitor AI leaderboard built in",
      "Shows citation sources behind every AI recommendation",
    ],
    altWins: [
      "Comprehensive social media listening across all platforms",
      "Real-time news and press mention alerts",
      "Influencer identification for PR and outreach",
      "More mature platform with a larger feature set for social",
    ],
    faqs: [
      { q: "Does Mention.com track ChatGPT or Gemini?", a: "No. Mention.com monitors social media, news, and web sources. AI engine answer tracking is not part of their product." },
      { q: "What's the main difference between Oras and Mention?", a: "Different channels. Mention.com covers social, news, and web. Oras covers AI engines — where an increasingly large share of brand discovery happens in 2026." },
      { q: "Is Mention.com better for PR teams?", a: "For traditional PR tracking (press coverage, social mentions, sentiment), yes. For understanding how AI recommends your brand to buyers, Oras is the right tool." },
      { q: "Can I use Oras without replacing Mention?", a: "Yes — many teams use both. Mention handles the social and PR layer; Oras handles the AI visibility layer. They don't overlap." },
    ],
  },

  "Semrush": {
    alt: "Semrush",
    verdict:
      "Semrush is the gold standard for traditional SEO. If you're tracking keyword rankings, backlinks, and content gaps, there's no better tool. But Semrush has no native AI engine tracking — it doesn't tell you whether ChatGPT or Gemini recommends your brand. Oras fills that gap without replacing your Semrush subscription.",
    stats: [
      { oras: "Free",       other: "$139/mo", label: "Starting price" },
      { oras: "GEO-native", other: "SEO-native", label: "Focus" },
      { oras: "4",          other: "0",       label: "AI engines tracked" },
    ],
    features: [
      { label: "Starting price",            oras: "Free",        alt: "$139/mo" },
      { label: "Free plan",                  oras: true,          alt: "Limited trial" },
      { label: "AI engine tracking",         oras: true,          alt: false },
      { label: "GEO Score",                  oras: true,          alt: false },
      { label: "Keyword rank tracking",      oras: false,         alt: true },
      { label: "Backlink analysis",          oras: false,         alt: true },
      { label: "Competitor SEO audit",       oras: false,         alt: true },
      { label: "Citation source tracking",   oras: true,          alt: false },
      { label: "Competitor AI comparison",   oras: true,          alt: false },
      { label: "White-label reports",        oras: "Growth+",     alt: true },
      { label: "Prompt gap finder",          oras: true,          alt: false },
      { label: "Content gap analysis",       oras: false,         alt: true },
    ],
    wins: [
      "Tracks AI engines — Semrush doesn't",
      "Free to start vs $139/mo minimum",
      "GEO-specific metric that SEO rank tracking can't replace",
      "Citation sources for AI mentions, not just SEO backlinks",
      "Prompt gap finder for AI queries your brand is missing",
      "Built for 2026 AI search, not 2010 keyword search",
    ],
    altWins: [
      "Industry-leading keyword research and rank tracking",
      "Deep backlink analysis and toxic link detection",
      "Content gap and topic cluster analysis",
      "Mature platform with years of competitive data",
      "Technical SEO audit at scale",
    ],
    faqs: [
      { q: "Does Semrush track AI engine visibility?", a: "Not natively. Semrush tracks keyword rankings in Google and Bing. They have added some AI Overviews data, but tracking ChatGPT, Claude, Gemini, and Perplexity recommendations is outside their core product." },
      { q: "Do I need both Semrush and Oras?", a: "If SEO matters to you, yes. Semrush covers the Google channel; Oras covers AI engines. They address different distribution channels and the data doesn't overlap." },
      { q: "Will Semrush add AI tracking eventually?", a: "Possibly — large platforms often add emerging channel coverage. But purpose-built tools built specifically for AI visibility will always have a depth advantage for that use case." },
      { q: "Which should I start with if I'm new?", a: "Oras is free, so start there to understand your AI visibility baseline. Add Semrush when SEO becomes a priority and you have budget for it." },
    ],
  },

  "SparkToro": {
    alt: "SparkToro",
    verdict:
      "SparkToro is an audience intelligence tool — it tells you where your audience spends time online, what podcasts they listen to, and what they read. Oras tells you how AI engines describe your brand to those same buyers. Different jobs, no overlap, genuinely complementary.",
    stats: [
      { oras: "Free",       other: "$50/mo",  label: "Starting price" },
      { oras: "AI visibility", other: "Audience intel", label: "Focus" },
      { oras: "4",          other: "0",       label: "AI engines tracked" },
    ],
    features: [
      { label: "Starting price",            oras: "Free",        alt: "$50/mo" },
      { label: "Free plan",                  oras: true,          alt: "5 searches/mo" },
      { label: "AI engine tracking",         oras: true,          alt: false },
      { label: "GEO Score",                  oras: true,          alt: false },
      { label: "Audience research",          oras: false,         alt: true },
      { label: "Podcast audience data",      oras: false,         alt: true },
      { label: "Citation source tracking",   oras: true,          alt: false },
      { label: "Competitor AI comparison",   oras: true,          alt: false },
      { label: "Social media followership",  oras: false,         alt: true },
      { label: "Prompt gap finder",          oras: true,          alt: false },
      { label: "Reddit & Quora visibility",  oras: true,          alt: false },
      { label: "Daily automated scans",      oras: true,          alt: false },
    ],
    wins: [
      "Direct AI visibility data — SparkToro doesn't cover this",
      "Know how ChatGPT and Gemini describe you to buyers",
      "Free vs $50/mo to start",
      "Daily automated scans with trend data",
      "Competitor AI leaderboard",
      "Citation sources show where AI pulls your brand context from",
    ],
    altWins: [
      "Audience intelligence — what media, podcasts, and sites your buyers frequent",
      "Great for media buying, PR outreach, and influencer targeting",
      "No other tool matches SparkToro for audience profiling",
    ],
    faqs: [
      { q: "Are Oras and SparkToro substitutes?", a: "No — they answer different questions. SparkToro answers 'where does my audience spend time?' Oras answers 'how do AI engines describe my brand to that audience?' They're complementary." },
      { q: "Which should I use first?", a: "SparkToro to understand where your audience is, then Oras to make sure AI engines are describing you accurately when your audience asks AI systems for recommendations." },
      { q: "Does SparkToro have any AI visibility features?", a: "Not in the GEO sense. SparkToro focuses on audience behavior data, not on how AI answer engines synthesize and present brand information." },
      { q: "Is Oras useful for audience research too?", a: "Not directly. Oras is focused on AI engine visibility — mention rates, citation sources, GEO scoring, and competitor comparison across ChatGPT, Gemini, Claude, and Perplexity." },
    ],
  },
};

const TABS = Object.keys(COMPARISONS);

function Cell({ value }) {
  if (value === true)  return <span className="cmp-check"><CheckIcon /></span>;
  if (value === false) return <span className="cmp-cross"><XIcon /></span>;
  return <span className="cmp-text">{value}</span>;
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`cmp-faq-item${open ? " cmp-faq-open" : ""}`}>
      <button type="button" className="cmp-faq-q" onClick={() => setOpen(o => !o)}>
        {q}
        <ChevronDownIcon className="cmp-faq-chevron" />
      </button>
      {open && <p className="cmp-faq-a">{a}</p>}
    </div>
  );
}

export default function ComparePage() {
  const [active, setActive] = useState(TABS[0]);
  const c = COMPARISONS[active];

  return (
    <main className="autosend-page">
      <SiteNavbar />

      <div className="cmp-page">

        {/* ── Tab bar ── */}
        <div className="cmp-tab-bar">
          <span className="cmp-tab-label">Oras vs</span>
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`cmp-chip${active === tab ? " cmp-chip-on" : ""}`}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Hero ── */}
        <header className="cmp-hero">
          <p className="cmp-hero-eyebrow">HONEST COMPARISON · 2026</p>
          <h1 className="cmp-hero-h1">
            Oras vs <span className="cmp-hero-alt">{c.alt}</span>
          </h1>

          {/* Verdict */}
          <div className="cmp-verdict">
            <span className="cmp-verdict-label">✦ THE VERDICT</span>
            <p>{c.verdict}</p>
            <Link href="/signin" className="cmp-verdict-cta">Start free with Oras →</Link>
          </div>

          {/* Stats */}
          <div className="cmp-stats">
            {c.stats.map(({ oras, other, label }) => (
              <div key={label} className="cmp-stat">
                <span className="cmp-stat-val">
                  {oras} <span className="cmp-stat-vs">vs {other}</span>
                </span>
                <span className="cmp-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ── Feature table ── */}
        <section className="cmp-section">
          <h2 className="cmp-section-h">Oras vs {c.alt}: feature comparison</h2>
          <div className="cmp-table-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="cmp-th-oras">Oras</th>
                  <th>{c.alt}</th>
                </tr>
              </thead>
              <tbody>
                {c.features.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td className="cmp-td-oras"><Cell value={row.oras} /></td>
                    <td><Cell value={row.alt} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Why / Where ── */}
        <section className="cmp-section cmp-split">
          <div className="cmp-split-col">
            <h3 className="cmp-split-h">Why teams pick Oras</h3>
            <ul className="cmp-list cmp-list-green">
              {c.wins.map((item) => (
                <li key={item}><CheckIcon />{item}</li>
              ))}
            </ul>
          </div>
          <div className="cmp-split-col">
            <h3 className="cmp-split-h">Where {c.alt} wins</h3>
            <ul className="cmp-list cmp-list-gray">
              {c.altWins.map((item) => (
                <li key={item}><CheckIcon />{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="cmp-section">
          <h2 className="cmp-section-h">Frequently asked questions</h2>
          <div className="cmp-faq-list">
            {c.faqs.map((faq) => <FAQ key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="cmp-bottom-cta">
          <h2>Your AI visibility dashboard, ready in 60 seconds</h2>
          <p>Track ChatGPT, Gemini, Claude, and Perplexity — free, no credit card required.</p>
          <Link href="/signin" className="cmp-verdict-cta">Start free →</Link>
        </section>

      </div>
    </main>
  );
}
