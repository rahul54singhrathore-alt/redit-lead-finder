"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MailIcon } from "lucide-react";
import { SiteNavbar } from "@/components/site-navbar";
import { createBrowserSupabaseClient, getAppUrl } from "../../lib/supabase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  // After auth, send the user to the dashboard if onboarding is done, else onboarding.
  async function routeAfterAuth(userId) {
    let destination = "/onboarding";
    if (supabase && userId) {
      const { data } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", userId)
        .maybeSingle();
      if (data?.onboarding_completed) {
        destination = "/dashboard";
      }
    }
    router.replace(destination);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authError = new URLSearchParams(window.location.search).get("error");
      if (authError) {
        setMessageType("error");
        setMessage(authError);
      }
    }

    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        routeAfterAuth(data.session.user.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase]);

  function getRedirectUrl() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : getAppUrl();
    if (!baseUrl) return undefined;
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    return `${cleanBaseUrl}/auth/callback?next=/onboarding`;
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();

    if (!supabase) {
      setMessageType("error");
      setMessage("Supabase is not configured yet.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessageType("error");
      setMessage("Enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    // Email a magic sign-in link. Clicking it lands on /auth/callback, which
    // completes the session and routes the user onward.
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getRedirectUrl(),
      },
    });

    setIsSubmitting(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message || "Could not send the sign-in link. Please try again.");
      return;
    }

    setLinkSent(true);
    setMessageType("success");
    setMessage("");
  }

  async function signInWithGoogle() {
    if (!supabase) {
      setMessageType("error");
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
      setMessageType("error");
      setMessage(error.message || "Could not start Google sign in.");
      console.error("Google Sign-In Error:", error);
    }
  }

  return (
    <main className="oras-auth-page">
      <SiteNavbar />

      <section className="oras-auth-wrap" aria-label="Login">
        <div className="oras-login">
          <div className="oras-login-head">
            <span className="oras-login-brand">
              <img src="/logo.png" alt="Oras" />
              <strong>Oras</strong>
            </span>
            <h1>Log in to Oras</h1>
            <p>AI visibility and GEO tracking for modern teams.</p>
          </div>

          {linkSent ? (
            <div className="oras-auth-sent">
              <MailIcon aria-hidden="true" />
              <h2>Check your inbox</h2>
              <p>
                We emailed a sign-in link to <strong>{email.trim()}</strong>. Click it to
                finish logging in. The link expires shortly and can be used once.
              </p>
              <button
                type="button"
                className="oras-auth-resend"
                onClick={() => {
                  setLinkSent(false);
                  setMessage("");
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <form className="oras-login-form" onSubmit={handleEmailSubmit}>
                <label className="oras-auth-input">
                  <MailIcon aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                  />
                </label>

                <button className="oras-auth-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending link…" : "Email me a sign-in link"}
                </button>
              </form>

              <button
                className="oras-auth-google"
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
                Continue with Google
              </button>
            </>
          )}

          {message ? (
            <p className={`oras-auth-note ${messageType}`}>{message}</p>
          ) : null}
        </div>
      </section>

      <footer className="oras-auth-footer">© 2026 · ORAS INC.</footer>
    </main>
  );
}
