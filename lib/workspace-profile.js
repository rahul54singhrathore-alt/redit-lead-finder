export const DEFAULT_VISIBILITY_SOURCES = [
  "ChatGPT",
  "Gemini",
  "Claude",
  "Perplexity",
  "Reddit",
  "Quora",
];

export const REFERRAL_SOURCE_OPTIONS = [
  "Google search",
  "Twitter / X",
  "Reddit",
  "LinkedIn",
  "Friend or colleague",
  "Other",
];

export const WORKSPACE_PROFILE_DEFAULTS = {
  onboarding_completed: false,
  product_name: "",
  product_url: "",
  referral_source: "",
  starter_keyword: "",
  customer_type: "both",
  target_subreddits: DEFAULT_VISIBILITY_SOURCES,
  digest_frequency: "daily",
  email_digest: true,
  instant_alerts: true,
  alert_channel: "email",
  min_score: 5,
  min_comments: 3,
  ignored_terms: "",
  export_format: "csv",
  subscription_tier: "free",
};

export function parseCommaSeparatedList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatCommaSeparatedList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  return items.join(", ");
}

export function formatDefaultVisibilitySources() {
  return formatCommaSeparatedList(DEFAULT_VISIBILITY_SOURCES);
}

export function normalizeWorkspaceProfile(profile) {
  const targetSubreddits = Array.isArray(profile?.target_subreddits)
    ? profile.target_subreddits
    : [];

  return {
    ...WORKSPACE_PROFILE_DEFAULTS,
    ...profile,
    target_subreddits: targetSubreddits,
  };
}
