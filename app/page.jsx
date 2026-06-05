"use client";

import { useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase";

export default function Home() {
  const [formNote, setFormNote] = useState("No spam. We will only send product updates.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const honeypot = data.get("website")?.toString().trim();
    if (honeypot) return;

    const email = data.get("email")?.toString().trim();
    const market = data.get("market")?.toString().trim() || "Reddit lead tracking";

    if (!email) {
      setFormNote("Add your email to join the waitlist.");
      return;
    }

    if (!supabase) {
      setFormNote("Supabase is not configured yet. Add your keys in .env.local.");
      return;
    }

    setIsSubmitting(true);
    setFormNote("Saving your request...");

    const { error } = await supabase.from("early_access_leads").insert({
      email,
      market,
      source: "website",
      user_agent: navigator.userAgent,
    });

    setIsSubmitting(false);

    if (error) {
      setFormNote("Could not save your request. Please check Supabase setup.");
      console.error(error);
      return;
    }

    setFormNote("You are on the list. We will be in touch soon.");
    form.reset();
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lead Finder home">
          <img src="/logo.svg" alt="" aria-hidden="true" />
          Lead Finder
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#waitlist">Waitlist</a>
          <a href="/signin">Sign in</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">Reddit lead monitoring</p>
        <h1>Find buyer-intent Reddit posts before they go cold.</h1>
        <p className="hero-copy">
          Track keywords, spot active buying questions, and turn relevant Reddit threads into a
          clean lead inbox.
        </p>
        <a className="primary-link" href="#waitlist">
          Join the waitlist
        </a>
      </section>

      <section className="features" id="features" aria-label="Features">
        <article>
          <h2>Keyword tracking</h2>
          <p>Monitor the words and phrases your customers use when they ask for help.</p>
        </article>
        <article>
          <h2>Lead filtering</h2>
          <p>Focus on posts that sound like active requests instead of generic mentions.</p>
        </article>
        <article>
          <h2>Fast alerts</h2>
          <p>Get notified while the thread is still fresh and worth replying to.</p>
        </article>
      </section>

      <section className="waitlist" id="waitlist">
        <div>
          <p className="eyebrow">Early access</p>
          <h2>Join the waitlist</h2>
        </div>
        <form className="waitlist-form" onSubmit={handleSubmit}>
          <label className="hidden-field" aria-hidden="true">
            Website
            <input type="text" name="website" tabIndex="-1" autoComplete="off" />
          </label>
          <label>
            Work email
            <input type="email" name="email" placeholder="you@company.com" required />
          </label>
          <label>
            What do you sell?
            <input type="text" name="market" placeholder="SEO agency, CRM, AI tool..." />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Joining..." : "Join waitlist"}
          </button>
          <p>{formNote}</p>
        </form>
      </section>
    </main>
  );
}
