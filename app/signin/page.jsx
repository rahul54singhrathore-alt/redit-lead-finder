"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthNavActions } from "@/components/auth-nav-actions";
import { createBrowserSupabaseClient, getAppUrl } from "../../lib/supabase";

export default function SignInPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authError = new URLSearchParams(window.location.search).get("error");
      if (authError) {
        setMessage(authError);
      }
    }

    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/onboarding");
      }
    });
  }, [router, supabase]);

  function getRedirectUrl() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : getAppUrl();
    if (!baseUrl) return undefined;
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    return `${cleanBaseUrl}/auth/callback?next=/onboarding`;
  }

  async function signInWithGoogle() {
    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl(),
      },
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message || "Could not start Google sign in.");
      console.error("Google Sign-In Error:", error);
    }
  }

  return (
    <main className="rankora-auth-page">
      <header className="autosend-nav rankora-auth-nav rankora-simple-nav">
        <Link className="autosend-brand" href="/">
          <img src="/logo.png" alt="" />
          <span>RANKORA</span>
        </Link>

        <AuthNavActions primary />
      </header>

      <section className="rankora-auth-wrap" aria-label="Login">
        <img className="rankora-auth-mark" src="/logo.png" alt="" />

        <div className="rankora-login-card">
          <div className="rankora-login-head">
            <h1>Login</h1>
            <p>Use Google to continue to your Rankora workspace.</p>
          </div>

          <button
            className="rankora-google-button"
            type="button"
            onClick={signInWithGoogle}
            disabled={isSubmitting}
          >
            <span className="google-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
                <path fill="#4285F4" d="M21.35 11.1h-9.18v2.94h5.27c-.23 1.23-.92 2.27-1.96 2.97v2.47h3.17c1.85-1.7 2.9-4.21 2.9-7.18 0-.73-.07-1.43-.2-2.1z" />
                <path fill="#34A853" d="M12.17 22c2.64 0 4.85-.87 6.47-2.36l-3.17-2.47c-.88.59-2 .94-3.3.94-2.53 0-4.67-1.7-5.44-3.98H3.46v2.5C5.08 19.53 8.37 22 12.17 22z" />
                <path fill="#FBBC05" d="M6.73 14.13c-.2-.59-.31-1.22-.31-1.87s.11-1.28.31-1.87V7.89H3.46A9.97 9.97 0 0 0 2.17 12c0 1.61.39 3.13 1.29 4.11l3.27-1.98z" />
                <path fill="#EA4335" d="M12.17 5.38c1.44 0 2.73.5 3.75 1.47l2.81-2.81C17.02 2.46 14.81 1.5 12.17 1.5 8.37 1.5 5.08 3.97 3.46 7.89l3.27 2.5c.77-2.28 2.91-5.01 5.44-5.01z" />
              </svg>
            </span>
            LOGIN WITH GOOGLE
          </button>

          {message ? <p className="signin-message">{message}</p> : null}
        </div>

        <p className="rankora-terms">
          By signing in, you agree to Rankora <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
        </p>
      </section>

      <footer className="rankora-auth-footer">© 2026 · RANKORA INC.</footer>
    </main>
  );
}
