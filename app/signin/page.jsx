"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../lib/supabase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mode, setMode] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
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

  async function handlePasswordSignIn(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setMessage("Enter your email and password.");
      return;
    }

    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message || "Could not sign in.");
      return;
    }

    router.replace("/");
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

  async function handleResetPassword() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Enter your email first, then reset your password.");
      return;
    }

    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Sending reset link...");

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: getRedirectUrl(),
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message || "Could not send reset link.");
      return;
    }

    setMessage("Password reset link sent.");
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setOtp("");
    setOtpSent(false);
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

        <div className="auth-tabs" role="tablist" aria-label="Sign in method">
          <button
            type="button"
            className={mode === "password" ? "active" : ""}
            onClick={() => switchMode("password")}
          >
            Password
          </button>
          <button
            type="button"
            className={mode === "otp" ? "active" : ""}
            onClick={() => switchMode("otp")}
          >
            OTP
          </button>
        </div>

        {mode === "password" ? (
          <form className="signin-form" onSubmit={handlePasswordSignIn}>
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

            <label>
              <span className="input-icon" aria-hidden="true">
                □
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                ◉
              </button>
            </label>

            <button className="signin-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        ) : (
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
        )}

        {message ? <p className="signin-message">{message}</p> : null}

        <div className="signin-links">
          <p>
            Did you forget your password?{" "}
            <button type="button" onClick={handleResetPassword}>
              Reset it now
            </button>
          </p>
          <p>
            Don&apos;t have an account? <Link href="/signin">Sign up</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
