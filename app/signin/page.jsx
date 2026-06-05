"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../lib/supabase";

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
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback?next=/`;
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
          <span aria-hidden="true">G</span>
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
