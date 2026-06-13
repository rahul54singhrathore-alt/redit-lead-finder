"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MailIcon } from "lucide-react";
import { SiteNavbar } from "@/components/site-navbar";
import { createBrowserSupabaseClient } from "../../lib/supabase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef([]);
  const router = useRouter();

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

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

    // No emailRedirectTo → Supabase sends a 6-digit OTP code, not a magic link
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { shouldCreateUser: true },
    });

    setIsSubmitting(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message || "Could not send the code. Please try again.");
      return;
    }

    setOtp(["", "", "", "", "", ""]);
    setStep("otp");
    setMessage("");
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }

  function handleOtpChange(index, value) {
    // Allow paste of full 6-digit code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      digits.forEach((d, i) => { next[i] = d; });
      setOtp(next);
      const focusIdx = Math.min(digits.length, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, "");
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleOtpSubmit(event) {
    event.preventDefault();

    const token = otp.join("");
    if (token.length !== 6) {
      setMessageType("error");
      setMessage("Enter the full 6-digit code.");
      return;
    }

    if (!supabase) return;

    setIsSubmitting(true);
    setMessage("");

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "email",
    });

    setIsSubmitting(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message || "Invalid code. Please try again.");
      return;
    }

    await routeAfterAuth(data?.user?.id);
  }

  async function signInWithGoogle() {
    if (!supabase) {
      setMessageType("error");
      setMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const redirectTo = `${baseUrl}/auth/callback?next=/onboarding`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    setIsSubmitting(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message || "Could not start Google sign in.");
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

          {step === "otp" ? (
            <form className="oras-login-form" onSubmit={handleOtpSubmit}>
              <p className="oras-otp-hint">
                We sent a 6-digit code to <strong>{email.trim()}</strong>. Enter it below.
              </p>
              <div className="oras-otp-inputs">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="oras-otp-box"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                  />
                ))}
              </div>
              <button className="oras-auth-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Verifying…" : "Verify code"}
              </button>
              <button
                type="button"
                className="oras-auth-resend"
                onClick={() => { setStep("email"); setMessage(""); setOtp(["","","","","",""]); }}
              >
                Use a different email
              </button>
            </form>
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
                  {isSubmitting ? "Sending code…" : "Email me a code"}
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
