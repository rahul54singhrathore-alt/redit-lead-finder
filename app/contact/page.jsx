import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { MailIcon, MonitorIcon, BookOpenIcon } from "lucide-react";

export const metadata = {
  title: "Contact — Oras",
  description: "Get in touch with the Oras team. Support, sales, or browse our help articles.",
};

const CHANNELS = [
  {
    icon: MailIcon,
    title: "Support",
    desc: "Bug reports, billing, account help.",
    action: { label: "rahul54.singhrathore@gmail.com", href: "mailto:rahul54.singhrathore@gmail.com" },
  },
  {
    icon: MonitorIcon,
    title: "Sales",
    desc: "Agency plan, custom domains, volume pricing.",
    action: { label: "rony54.singh@gmail.com", href: "mailto:rony54.singh@gmail.com" },
  },
  {
    icon: BookOpenIcon,
    title: "Help articles",
    desc: "Guides, templates and how-tos in our blog.",
    action: { label: "Browse the blog →", href: "/blog" },
  },
];

export default function ContactPage() {
  return (
    <main className="autosend-page">
      <SiteNavbar />

      <div className="contact-page">
        <header className="contact-hero">
          <span className="contact-eyebrow">Contact</span>
          <h1>Talk to Oras</h1>
          <p>We reply within one business day. Pick the channel that fits.</p>
        </header>

        <div className="contact-cards">
          {CHANNELS.map(({ icon: Icon, title, desc, action }) => (
            <div key={title} className="contact-card">
              <span className="contact-card-icon"><Icon /></span>
              <h2>{title}</h2>
              <p>{desc}</p>
              <a href={action.href} className="contact-card-link">{action.label}</a>
            </div>
          ))}
        </div>

        <section className="contact-cta">
          <h2>Your AI visibility dashboard, ready in minutes</h2>
          <p>Start tracking ChatGPT, Gemini, Claude, and Perplexity — free, no credit card required.</p>
          <Link href="/dashboard" className="contact-cta-btn">Start free</Link>
        </section>

        <section className="contact-free-tools">
          <div className="contact-free-tools-head">
            <span>Free tools</span>
            <a href="/#check">All tools →</a>
          </div>
          <div className="contact-free-tools-grid">
            {[
              "GEO Score checker", "AI citation audit", "Brand visibility scan",
              "Competitor comparison", "Prompt gap finder", "AI mention tracker",
              "ChatGPT rank check", "Gemini brand scan", "Claude mention check",
              "Perplexity audit", "Reddit visibility", "Quora presence check",
              "Share of voice report", "Brand memory audit", "GEO score history",
              "Visibility leaderboard", "AI recommendation gaps", "Citation source finder",
            ].map((tool) => (
              <a href="/#check" key={tool} className="contact-tool-link">{tool}</a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
