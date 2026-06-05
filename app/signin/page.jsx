"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient, getAppUrl } from "../../lib/supabase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/");
      }
    });
  }, [router, supabase]);

  function getRedirectUrl() {
    const baseUrl = getAppUrl();
    return baseUrl ? `${baseUrl}/auth/callback?next=/` : undefined;
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
    }
  }

  async function handleOtpSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.replace(/\s/g, "");

    if (!trimmedEmail) {
      setMessage("Enter your email to continue.");
      return;
    }

    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);

    if (!otpSent) {
      setMessage("Sending OTP...");

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      setIsSubmitting(false);

      if (error) {
        setMessage(error.message || "Could not send OTP.");
        return;
      }

      setOtpSent(true);
      setMessage("Enter the OTP from your email.");
      return;
    }

    if (!trimmedOtp) {
      setIsSubmitting(false);
      setMessage("Enter the OTP from your email.");
      return;
    }

    setMessage("Verifying OTP...");

    const { error } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token: trimmedOtp,
      type: "email",
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message || "Invalid OTP. Try again.");
      return;
    }

    router.replace("/");
  }

  return (
    <main className="signin-screen">
      <Link className="signin-logo" href="/" aria-label="Lead Finder home">
        <img src="/logo.svg" alt="" aria-hidden="true" />
        <span>Lead Finder</span>
      </Link>

      <section className="signin-panel" aria-label="Sign in">
        <div className="signin-heading">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <button
          className="google-button"
          type="button"
          onClick={signInWithGoogle}
          disabled={isSubmitting}
        >
          <span className="google-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M21.35 11.1h-9.18v2.94h5.27c-.23 1.23-.92 2.27-1.96 2.97v2.47h3.17c1.85-1.7 2.9-4.21 2.9-7.18 0-.73-.07-1.43-.2-2.1z"
              />
              <path
                fill="#34A853"
                d="M12.17 22c2.64 0 4.85-.87 6.47-2.36l-3.17-2.47c-.88.59-2 .94-3.3.94-2.53 0-4.67-1.7-5.44-3.98H3.46v2.5C5.08 19.53 8.37 22 12.17 22z"
              />
              <path
                fill="#FBBC05"
                d="M6.73 14.13c-.2-.59-.31-1.22-.31-1.87s.11-1.28.31-1.87V7.89H3.46A9.97 9.97 0 0 0 2.17 12c0 1.61.39 3.13 1.29 4.11l3.27-1.98z"
              />
              <path
                fill="#EA4335"
                d="M12.17 5.38c1.44 0 2.73.5 3.75 1.47l2.81-2.81C17.02 2.46 14.81 1.5 12.17 1.5 8.37 1.5 5.08 3.97 3.46 7.89l3.27 2.5c.77-2.28 2.91-5.01 5.44-5.01z"
              />
            </svg>
          </span>
          Continue with Google
        </button>

        <div className="signin-divider">
          <span />
          <p>or</p>
          <span />
        </div>

        <form className="signin-form" onSubmit={handleOtpSubmit}>
          <label>
            <span className="input-icon" aria-hidden="true">
              ✉
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          {otpSent ? (
            <label>
              <span className="input-icon" aria-hidden="true">
                #
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter OTP"
                required
              />
            </label>
          ) : null}

          <button className="signin-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
          </button>
        </form>

        {message ? <p className="signin-message">{message}</p> : null}
        <div className="signin-links">
          <Link href="/">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
