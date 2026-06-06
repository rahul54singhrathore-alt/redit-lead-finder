"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ChevronLeftIcon, SparklesIcon } from "lucide-react";
import { createBrowserSupabaseClient } from "../../lib/supabase";
import {
  DEFAULT_VISIBILITY_SOURCES,
  normalizeWorkspaceProfile,
} from "../../lib/workspace-profile";

const customerOptions = [
  { label: "B2B", value: "b2b" },
  { label: "B2C", value: "b2c" },
  { label: "BOTH", value: "both" },
];

export default function OnboardingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [brandName, setBrandName] = useState("");
  const [customerType, setCustomerType] = useState("both");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/signin");
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // Handle case where user_profiles table doesn't exist yet
      if (error && !error.message?.includes("does not exist")) {
        setMessage("Could not load onboarding.");
      }

      const profile = data ? normalizeWorkspaceProfile(data) : null;
      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }

      if (profile?.starter_keyword) {
        setBrandName(profile.starter_keyword);
      }
      if (profile?.customer_type) {
        setCustomerType(profile.customer_type);
      }

      setLoading(false);
    };

    load();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedBrandName = brandName.trim();
    if (!trimmedBrandName) {
      setMessage("Add the brand or product name.");
      return;
    }

    if (!supabase || !user) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    // Try to create profile - if table doesn't exist, still proceed to dashboard
    try {
      await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          starter_keyword: trimmedBrandName,
          customer_type: customerType,
          target_subreddits: DEFAULT_VISIBILITY_SOURCES,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();
    } catch (err) {
      // Ignore errors
    }

    // Try to create keyword, but don't fail if it doesn't work
    if (supabase && user) {
      try {
        await supabase.from("tracked_keywords").insert({
          user_id: user.id,
          keyword: trimmedBrandName,
          subreddits: DEFAULT_VISIBILITY_SOURCES,
        });
      } catch (err) {
        // Ignore errors
      }
    }

    setIsSubmitting(false);
    router.replace("/dashboard");
  };

  if (loading) {
    return (
      <main className="onboarding-load">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="postlogin-onboarding">
      <div className="postlogin-onboarding-shell">
        <Link className="postlogin-back" href="/dashboard">
          <ChevronLeftIcon />
          Back to dashboard
        </Link>

        <section className="postlogin-onboarding-card">
          <div className="postlogin-onboarding-copy">
            <div className="postlogin-icon" aria-hidden="true">
              <SparklesIcon />
            </div>
            <h1>Welcome! Let's get you started</h1>
            <p>
              Add your brand or product name to begin tracking.
            </p>
          </div>

          <form className="postlogin-form" onSubmit={handleSubmit}>
            <label className="postlogin-field">
              <span>Site or product name</span>
              <input
                type="text"
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                placeholder="acme.com"
              />
            </label>

            <div className="postlogin-choice-group">
              <span className="postlogin-label">Who are your customers?</span>
              <div className="postlogin-choices">
                {customerOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={customerType === option.value ? "postlogin-choice active" : "postlogin-choice"}
                    onClick={() => setCustomerType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="postlogin-actions">
              <button className="postlogin-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Getting started..." : "Complete setup"}
                {!isSubmitting ? <ArrowRightIcon /> : null}
              </button>
            </div>

            {message ? <p className="postlogin-message">{message}</p> : null}
          </form>
        </section>
      </div>
    </main>
  );
}
