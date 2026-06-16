"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { CheckIcon, XIcon, ChevronDownIcon } from "lucide-react";

/* ── Data ── */
const FEATURES = [
  { label: "Starting price",           oras: "Free",       alt: "$49/mo"     },
  { label: "Free plan forever",         oras: true,         alt: false        },
  { label: "Multi-engine AI scanning",  oras: true,         alt: false        },
  { label: "GEO Score",                 oras: true,         alt: false        },
  { label: "Competitor leaderboard",    oras: true,         alt: false        },
  { label: "Citation source tracking",  oras: true,         alt: false        },
  { label: "Brand verification checks", oras: true,         alt: false        },
  { label: "White-label PDF reports",   oras: "Growth+",    alt: true         },
  { label: "Email digest",              oras: true,         alt: true         },
  { label: "Reddit & Quora visibility", oras: true,         alt: false        },
  { label: "Prompt gap finder",         oras: true,         alt: false        },
  { label: "API access",                oras: "Coming soon",alt: true         },
];

const WHY_ORAS = [
  "Tracks ChatGPT, Gemini, Claude, and Perplexity in one dashboard",
  "Real AI scans — not simulated or keyword-based scores",
  "Free forever plan with no credit card required",
  "GEO Score gives you a single number to track over time",
  "Competitor leaderboard shows exactly where AI ranks you",
  "Citation source finder shows which sources drive AI mentions",
  "Brand memory audit reveals what AI thinks you do",
];

const WHERE_ALT_WINS = [
  "Deeper SEO integrations if you still run a traditional search strategy",
  "More established API ecosystem for enterprise data pipelines",
  "If you only care about one AI engine, not multi-engine coverage",
];

const STEPS = [
  { title: "Check your current AI visibility",   body: "Run a free GEO score check on oras.app — no account needed. See where you rank across ChatGPT, Gemini, Claude, and Perplexity." },
  { title: "Create a free Oras workspace",        body: "Sign up at oras.app — no credit card required — and create your workspace in under 60 seconds." },
  { title: "Set up your brand profile",           body: "Add your product name, website, and the prompts your buyers use. Oras builds your baseline visibility score instantly." },
  { title: "Run your first full scan",            body: "Oras queries every AI engine and returns your GEO score, competitor ranking, and the specific citation sources behind every mention." },
];

const FAQS = [
  { q: "Is Oras a real alternative to manual AI tracking?",   a: "Yes. Oras automates what takes hours manually — querying multiple AI engines, recording mentions, tracking rank over time, and surfacing competitor gaps." },
  { q: "How does Oras pricing compare to other GEO tools?",   a: "Oras offers a free forever plan. Paid plans start significantly lower than enterprise GEO tools, with no per-seat or per-engine fees." },
  { q: "Can I use Oras alongside my existing SEO tools?",      a: "Absolutely. Oras is complementary to SEO — it covers the AI layer that traditional tools miss. Most customers run both." },
  { q: "What's Oras's biggest advantage over alternatives?",   a: "Real multi-engine scanning. Most tools simulate scores; Oras actually queries ChatGPT, Gemini, Claude, and Perplexity and shows you the raw AI response." },
  { q: "How long does it take to see results?",                a: "Your first GEO score appears within 60 seconds of setup. Trend data builds over your first 1–2 weeks of daily scans." },
];

const MORE = [
  "All comparisons", "Oras vs Manual tracking", "Oras vs Semrush AI",
  "Oras vs BrightEdge", "Oras vs Conductor", "Oras vs Authoritas",
  "Oras vs Search Atlas", "Oras vs Rank Tracker",
];

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
  const [activeTab, setActiveTab] = useState("All comparisons");

  return (
    <main className="autosend-page">
      <SiteNavbar />

      <div className="cmp-page">

        {/* ── Hero ── */}
        <header className="cmp-hero">
          <p className="cmp-hero-eyebrow">HONEST COMPARISON · 2026</p>
          <h1 className="cmp-hero-h1">
            Oras vs <span className="cmp-hero-alt">Manual AI Tracking</span>
          </h1>
          <p className="cmp-hero-sub">
            Spending hours each week pasting prompts into ChatGPT? Here's an honest breakdown of what you gain by switching to automated GEO monitoring.
          </p>

          {/* Verdict */}
          <div className="cmp-verdict">
            <span className="cmp-verdict-label">✦ THE VERDICT</span>
            <p>
              Oras is the fastest way to know how AI engines describe your brand in 2026. It scans ChatGPT, Gemini, Claude, and Perplexity automatically, tracks your GEO score over time, surfaces competitor gaps, and costs nothing to start. Manual tracking gives you raw access but doesn't scale past one person running it twice a week.
            </p>
            <Link href="/dashboard" className="cmp-verdict-cta">Start free with Oras →</Link>
          </div>

          {/* Stats */}
          <div className="cmp-stats">
            <div className="cmp-stat">
              <span className="cmp-stat-val">$0 <span className="cmp-stat-vs">vs $0</span></span>
              <span className="cmp-stat-label">Starting price</span>
            </div>
            <div className="cmp-stat">
              <span className="cmp-stat-val">4 <span className="cmp-stat-vs">vs 1</span></span>
              <span className="cmp-stat-label">AI engines tracked</span>
            </div>
            <div className="cmp-stat">
              <span className="cmp-stat-val">Automatic <span className="cmp-stat-vs">vs Manual</span></span>
              <span className="cmp-stat-label">Scanning method</span>
            </div>
          </div>
        </header>

        {/* ── Feature table ── */}
        <section className="cmp-section">
          <h2 className="cmp-section-h">Oras vs Manual tracking: feature comparison</h2>
          <div className="cmp-table-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="cmp-th-oras">Oras</th>
                  <th>Manual</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row) => (
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
              {WHY_ORAS.map((item) => (
                <li key={item}><CheckIcon />{item}</li>
              ))}
            </ul>
          </div>
          <div className="cmp-split-col">
            <h3 className="cmp-split-h">Where manual still wins</h3>
            <ul className="cmp-list cmp-list-gray">
              {WHERE_ALT_WINS.map((item) => (
                <li key={item}><CheckIcon />{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── How to switch ── */}
        <section className="cmp-section">
          <h2 className="cmp-section-h">How to switch from manual tracking to Oras</h2>
          <p className="cmp-section-sub">Takes about five minutes. Your prompts, brand profile, and competitors carry over.</p>
          <div className="cmp-steps">
            {STEPS.map((step, i) => (
              <div key={i} className="cmp-step">
                <span className="cmp-step-num">{i + 1}</span>
                <div>
                  <p className="cmp-step-title">{step.title}</p>
                  <p className="cmp-step-body">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="cmp-section">
          <h2 className="cmp-section-h">Frequently asked questions</h2>
          <div className="cmp-faq-list">
            {FAQS.map((faq) => <FAQ key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </section>

        {/* ── More comparisons ── */}
        <section className="cmp-section">
          <p className="cmp-more-label">MORE COMPARISONS</p>
          <div className="cmp-more-chips">
            {MORE.map((label) => (
              <button
                key={label}
                type="button"
                className={`cmp-chip${activeTab === label ? " cmp-chip-on" : ""}`}
                onClick={() => setActiveTab(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="cmp-bottom-cta">
          <h2>Your AI visibility dashboard, ready in minutes</h2>
          <p>Start tracking ChatGPT, Gemini, Claude, and Perplexity — free, no credit card required.</p>
          <Link href="/dashboard" className="cmp-verdict-cta">Start free →</Link>
        </section>

      </div>
    </main>
  );
}
