import { SiteNavbar } from "@/components/site-navbar";
import { FreeVisibilityChecker } from "@/components/free-visibility-checker";
import Link from "next/link";

export const metadata = {
  title: "Free GEO Score Checker — See Your AI Visibility Instantly",
  description:
    "Enter your brand and see exactly where you rank on ChatGPT, Gemini, Claude, and Perplexity — live, free, no signup required.",
  alternates: { canonical: "https://www.tryoras.com/tools" },
};

const TOOLS = [
  { name: "GEO Score checker", desc: "Live rank across 4 AI engines", href: "#check", active: true },
  { name: "AI citation audit", desc: "Which sources AI cites for your niche", href: "/signin" },
  { name: "Prompt gap finder", desc: "Prompts where competitors beat you", href: "/signin" },
  { name: "Competitor comparison", desc: "Side-by-side AI mention leaderboard", href: "/signin" },
  { name: "Brand memory audit", desc: "What AI thinks your brand does", href: "/signin" },
  { name: "Citation source finder", desc: "Which sites drive AI recommendations", href: "/signin" },
];

export default function ToolsPage() {
  return (
    <main className="autosend-page">
      <SiteNavbar />

      <header className="tools-hero">
        <span className="tools-eyebrow">Free tools</span>
        <h1>Check your AI visibility in seconds</h1>
        <p>
          Live queries to ChatGPT, Gemini, Claude, and Perplexity — see your real GEO score,
          which engines mention you, and what your competitors rank instead.
          No signup required.
        </p>
        <div className="tools-hero-engines">
          {[
            { name: "ChatGPT", color: "#10a37f" },
            { name: "Gemini",  color: "#4285f4" },
            { name: "Claude",  color: "#d97706" },
            { name: "Perplexity", color: "#7c3aed" },
          ].map(({ name, color }) => (
            <span key={name} className="tools-engine-pill">
              <span style={{ background: color, width: 8, height: 8, borderRadius: "50%", display: "inline-block" }} />
              {name}
            </span>
          ))}
        </div>
      </header>

      <FreeVisibilityChecker />

      <section className="tools-more">
        <h2>More tools</h2>
        <p className="tools-more-sub">Advanced tools unlock after a free sign-up.</p>
        <div className="tools-grid">
          {TOOLS.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className={`tools-card${tool.active ? " tools-card-active" : " tools-card-locked"}`}
            >
              <span className="tools-card-name">{tool.name}</span>
              <span className="tools-card-desc">{tool.desc}</span>
              {tool.active ? (
                <span className="tools-card-badge">Free</span>
              ) : (
                <span className="tools-card-badge tools-card-badge-lock">Sign up →</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <footer className="oras-legal-foot" style={{ marginTop: 64 }}>
        <Link href="/">← Back to home</Link>
        <Link href="/pricing">View pricing</Link>
      </footer>
    </main>
  );
}
