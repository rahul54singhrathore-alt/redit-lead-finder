/* eslint-disable react/no-unknown-property */

/* Each post gets a unique colour + icon combo keyed by slug */
const SLUG_CONFIG = {
  "chatgpt-recommend-your-brand": {
    bg: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
    accent: "#818cf8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M8 12h8M12 8l4 4-4 4"/>
      </svg>
    ),
  },
  "geo-vs-seo-key-differences": {
    bg: "linear-gradient(135deg,#0369a1 0%,#4f46e5 100%)",
    accent: "#60a5fa",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  "top-citation-sources-ai-engines-trust": {
    bg: "linear-gradient(135deg,#047857 0%,#0369a1 100%)",
    accent: "#34d399",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  "write-brand-description-ai-understands": {
    bg: "linear-gradient(135deg,#9d174d 0%,#7c3aed 100%)",
    accent: "#f472b6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  "what-is-geo-score": {
    bg: "linear-gradient(135deg,#b45309 0%,#c2410c 100%)",
    accent: "#fbbf24",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
  },
  "reddit-quora-community-content-ai-recommendations": {
    bg: "linear-gradient(135deg,#c2410c 0%,#dc2626 100%)",
    accent: "#fb923c",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  "what-is-generative-engine-optimization": {
    bg: "linear-gradient(135deg,#6d28d9 0%,#4f46e5 100%)",
    accent: "#c4b5fd",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  "track-brand-visibility-in-ai-answers": {
    bg: "linear-gradient(135deg,#0f766e 0%,#0369a1 100%)",
    accent: "#2dd4bf",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  "why-ai-recommends-your-competitors": {
    bg: "linear-gradient(135deg,#1e3a5f 0%,#7c3aed 100%)",
    accent: "#93c5fd",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
  },
};

/* Fallback for unknown slugs */
const FALLBACK_CONFIGS = [
  { bg: "linear-gradient(135deg,#4f46e5,#7c3aed)", accent: "#818cf8" },
  { bg: "linear-gradient(135deg,#047857,#0369a1)", accent: "#34d399" },
  { bg: "linear-gradient(135deg,#b45309,#c2410c)", accent: "#fbbf24" },
];

/* Split title into ≤2 short lines for display */
function splitTitle(title) {
  const words = title.split(" ");
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function PostThumbnail({ post, index, size = "normal" }) {
  const cfg = SLUG_CONFIG[post.slug] ?? FALLBACK_CONFIGS[index % FALLBACK_CONFIGS.length];
  const [line1, line2] = splitTitle(post.title);

  return (
    <div
      className={`bt bt-${size}`}
      style={{ background: cfg.bg, "--accent": cfg.accent }}
      aria-hidden="true"
    >
      {/* Dot grid */}
      <div className="bt-dots" />

      {/* Glow blob */}
      <div className="bt-blob" style={{ background: cfg.accent }} />

      {/* Large decorative icon — bottom right */}
      {cfg.icon && (
        <span className="bt-deco-icon">{cfg.icon}</span>
      )}

      {/* Main content */}
      <div className="bt-content">
        <span className="bt-tag-pill">{post.tags[0]}</span>
        <p className="bt-headline">
          <span>{line1}</span>
          {line2 && <span>{line2}</span>}
        </p>
        <span className="bt-mins-pill">{post.readMinutes} min read</span>
      </div>
    </div>
  );
}
