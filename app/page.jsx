"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "../lib/supabase";

export default function Home() {
  const [formNote, setFormNote] = useState("No spam. We'll only send product updates.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

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

    setFormNote("You're on the list! We'll be in touch soon.");
    form.reset();
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="brand" href="/">
          <img src="/logo.svg" alt="" />
          Lead Finder
        </Link>
        <nav className="nav-links">
          {user ? (
            <>
              <Link className="nav-cta" href="/dashboard">Dashboard</Link>
              <button onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <>
              <a href="#features">Features</a>
              <Link href="/pricing">Pricing</Link>
              <a href="#waitlist">Early Access</a>
              <Link className="nav-cta" href="/signin">Sign In</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Reddit lead tracking for operators</p>
          <h1>Find buyer-intent Reddit posts before they go cold</h1>
          <p className="hero-copy">
            Track keywords, spot active buying questions, and turn relevant Reddit threads into a clean lead inbox.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link href="/dashboard" className="primary-button">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <a href="#waitlist" className="primary-button">
                  Join the Waitlist
                </a>
                <Link href="/signin" className="secondary-button">
                  Sign In
                </Link>
                <Link href="/pricing" className="secondary-button">
                  See Pricing
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="product-strip" aria-label="Lead Finder highlights">
        <div>
          <strong>48</strong>
          <span>sample leads found</span>
        </div>
        <div>
          <strong>12</strong>
          <span>keywords tracked</span>
        </div>
        <div>
          <strong>8</strong>
          <span>subreddits monitored</span>
        </div>
      </section>

      <section className="screenshot-section">
        <div className="screenshot-container">
          <img src="/reddit-lead-dashboard.png" alt="Lead Finder dashboard screenshot" />
        </div>
      </section>

      <section className="features" id="features">
        <article className="feature-card">
          <span className="feature-icon">01</span>
          <h2>Real-time keyword tracking</h2>
          <p>Monitor the words and phrases your customers use when asking for help or recommendations on Reddit.</p>
        </article>
        <article className="feature-card">
          <span className="feature-icon">02</span>
          <h2>Smart lead filtering</h2>
          <p>Focus on posts that sound like active buying requests instead of generic mentions or discussions.</p>
        </article>
        <article className="feature-card">
          <span className="feature-icon">03</span>
          <h2>Instant email alerts</h2>
          <p>Get notified while the thread is still fresh and warm, before everyone else jumps in.</p>
        </article>
      </section>

      <section className="waitlist" id="waitlist">
        <div className="waitlist-text">
          <h2>Join the early access list</h2>
          <p>Be the first to try Lead Finder when we launch. We're onboarding users in batches.</p>
          <div className="waitlist-points">
            <span>Keyword monitoring</span>
            <span>Lead inbox</span>
            <span>Intent alerts</span>
          </div>
        </div>
        <form className="waitlist-form" onSubmit={handleSubmit}>
          <label className="hidden-field" aria-hidden="true">
            Website
            <input type="text" name="website" tabIndex="-1" autoComplete="off" />
          </label>
          <label className="form-label">
            Work email
            <input className="form-input" type="email" name="email" placeholder="you@company.com" required />
          </label>
          <label className="form-label">
            What do you sell?
            <input className="form-input" type="text" name="market" placeholder="SEO agency, CRM, AI tool..." />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Joining..." : "Join the waitlist"}
          </button>
          <p className="form-note">{formNote}</p>
        </form>
      </section>
    </main>
  );
}
