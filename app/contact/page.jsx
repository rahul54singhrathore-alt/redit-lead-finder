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
    action: { label: "sourabhsingh2002.rathore@gmail.com", href: "mailto:sourabhsingh2002.rathore@gmail.com" },
  },
  {
    icon: MonitorIcon,
    title: "Sales",
    desc: "Agency plan, custom domains, volume pricing.",
    action: { label: "sourabhsingh2002.rathore@gmail.com", href: "mailto:sourabhsingh2002.rathore@gmail.com" },
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
      </div>
    </main>
  );
}
