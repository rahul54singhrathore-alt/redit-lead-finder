"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "../../lib/supabase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Use your work email to get a secure sign-in link.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Enter your email to continue.");
      return;
    }

    if (!supabase) {
      setMessage("Supabase is not configured yet. Add your keys in .env.local.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Sending your sign-in link...");

    const redirectTo =
      typeof window === "undefined" ? undefined : `${window.location.origin}/signin`;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message || "Could not send the sign-in link. Try again.");
      return;
    }

    setMessage("Check your inbox for the secure sign-in link.");
    setEmail("");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-label="Sign in">
        <Link className="brand auth-brand" href="/" aria-label="Lead Finder home">
          <img src="/logo.svg" alt="" aria-hidden="true" />
          Lead Finder
        </Link>

        <div className="auth-copy">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your lead inbox.</h1>
          <p>
            We will send a one-time magic link. No password needed, and your session is handled by
            Supabase Auth.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Work email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send magic link"}
          </button>
          <p>{message}</p>
        </form>

        <Link className="auth-return" href="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
