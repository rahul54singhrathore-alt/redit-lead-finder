"use client";

import { useState } from "react";
import { ArrowRightIcon, BellRingIcon, CheckCircle2Icon, SearchIcon, SparklesIcon } from "lucide-react";

import { SourcePresetPicker } from "@/components/source-preset-picker";
import { formatDefaultVisibilitySources, parseCommaSeparatedList } from "@/lib/workspace-profile";

const frequencyOptions = [
  {
    value: "daily",
    label: "Daily",
    description: "A compact summary once per day.",
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Batch results into a weekly digest.",
  },
  {
    value: "off",
    label: "Off",
    description: "Keep notifications inside the dashboard.",
  },
];

export function DashboardOnboarding({ user, supabase, onComplete }) {
  const [brandName, setBrandName] = useState("");
  const [sources, setSources] = useState(formatDefaultVisibilitySources());
  const [digestFrequency, setDigestFrequency] = useState("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedBrandName = brandName.trim();
    const sourceList = parseCommaSeparatedList(sources);

    if (!trimmedBrandName) {
      setMessage("Add the brand you want to track.");
      return;
    }

    if (sourceList.length === 0) {
      setMessage("Add at least one source or competitor.");
      return;
    }

    if (!supabase || !user) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const profileResult = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        onboarding_completed: true,
        starter_keyword: trimmedBrandName,
        target_subreddits: sourceList,
        digest_frequency: digestFrequency,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    const keywordResult = await supabase.from("tracked_keywords").insert({
      user_id: user.id,
      keyword: trimmedBrandName,
      subreddits: sourceList,
    });

    const alertResult = await supabase.from("alert_rules").insert({
      user_id: user.id,
      name: "Visibility audits",
      trigger: "new matching signal found",
      channel: digestFrequency === "off" ? "Dashboard only" : "Instant email",
      active: digestFrequency !== "off",
    });

    setIsSubmitting(false);

    if (profileResult.error || alertResult.error) {
      const errorMessage =
        profileResult.error?.message ||
        alertResult.error?.message ||
        "Could not save onboarding setup.";
      setMessage(errorMessage);
      return;
    }

    onComplete({
      starter_keyword: trimmedBrandName,
      target_subreddits: sourceList,
      digest_frequency: digestFrequency,
    });
  };

  return (
    <section className="onboarding-shell">
      <div className="onboarding-intro">
        <span className="onboarding-kicker">
          <SparklesIcon className="onboarding-kicker-icon" />
          First-time setup
        </span>
        <h1>Set up the brands, sources, and visibility rhythm you care about.</h1>
        <p>
          We will create your first tracked brand, save the source targets,
          and store your audit frequency so the workspace is ready the next time
          you sign in.
        </p>

        <div className="onboarding-steps">
          <div className="onboarding-step">
            <SearchIcon className="onboarding-step-icon" />
            <div>
              <strong>Brand name</strong>
              <span>Start with the brand you want to track across AI answers.</span>
            </div>
          </div>
          <div className="onboarding-step">
            <CheckCircle2Icon className="onboarding-step-icon" />
            <div>
              <strong>Sources and competitors</strong>
              <span>Focus on the websites, forums, and competitors that shape AI visibility.</span>
            </div>
          </div>
          <div className="onboarding-step">
            <BellRingIcon className="onboarding-step-icon" />
            <div>
              <strong>Audit frequency</strong>
              <span>Choose how often you want visibility checks surfaced back to you.</span>
            </div>
          </div>
        </div>
      </div>

      <form className="onboarding-card" onSubmit={handleSubmit}>
        <div className="card-header">
          <h2>Visibility setup</h2>
          <span className="onboarding-progress">Step 1 of 1</span>
        </div>

        <div className="settings-stack">
          <div className="form-group">
            <label className="form-label" htmlFor="onboarding-keyword">
              Brand name
            </label>
            <input
              id="onboarding-keyword"
              className="form-input"
              type="text"
              placeholder="e.g., Rankora"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="onboarding-subreddits">
              Sources / competitors
            </label>
            <input
              id="onboarding-subreddits"
              className="form-input"
              type="text"
              placeholder={formatDefaultVisibilitySources()}
              value={sources}
              onChange={(event) => setSources(event.target.value)}
            />
            <SourcePresetPicker value={sources} onChange={setSources} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="onboarding-frequency">
              Audit frequency
            </label>
            <select
              id="onboarding-frequency"
              className="form-input"
              value={digestFrequency}
              onChange={(event) => setDigestFrequency(event.target.value)}
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="onboarding-summary">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`onboarding-choice${digestFrequency === option.value ? " onboarding-choice-active" : ""}`}
                onClick={() => setDigestFrequency(option.value)}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {message ? <p className="onboarding-message">{message}</p> : null}

        <div className="onboarding-actions">
          <button className="primary-button onboarding-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create workspace"}
            {!isSubmitting ? <ArrowRightIcon className="button-icon" /> : null}
          </button>
        </div>
      </form>
    </section>
  );
}
