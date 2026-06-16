const THUMB_CONFIG = [
  { bg: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)", accent: "#818cf8", shape: "◈" },
  { bg: "linear-gradient(135deg,#0369a1 0%,#4f46e5 55%,#7c3aed 100%)", accent: "#60a5fa", shape: "◎" },
  { bg: "linear-gradient(135deg,#c2410c 0%,#dc2626 50%,#be185d 100%)", accent: "#fb923c", shape: "⬡" },
  { bg: "linear-gradient(135deg,#047857 0%,#0369a1 50%,#4f46e5 100%)", accent: "#34d399", shape: "⬢" },
  { bg: "linear-gradient(135deg,#b45309 0%,#c2410c 50%,#9f1239 100%)", accent: "#fbbf24", shape: "◆" },
  { bg: "linear-gradient(135deg,#9d174d 0%,#7c3aed 50%,#4f46e5 100%)", accent: "#f472b6", shape: "◉" },
  { bg: "linear-gradient(135deg,#0f766e 0%,#4f46e5 50%,#7c3aed 100%)", accent: "#2dd4bf", shape: "★" },
  { bg: "linear-gradient(135deg,#6d28d9 0%,#be185d 50%,#c2410c 100%)", accent: "#c4b5fd", shape: "✦" },
  { bg: "linear-gradient(135deg,#0369a1 0%,#047857 50%,#0f766e 100%)", accent: "#67e8f9", shape: "◇" },
];

export function PostThumbnail({ post, index, size = "normal" }) {
  const cfg = THUMB_CONFIG[index % THUMB_CONFIG.length];
  const isHero = size === "hero";
  const isArticle = size === "article";

  return (
    <div
      className={`bt bt-${size}`}
      style={{ background: cfg.bg, "--accent": cfg.accent }}
      aria-hidden="true"
    >
      {/* Fine noise overlay */}
      <div className="bt-noise" />

      {/* Decorative circles */}
      <div className="bt-circle bt-circle-a" style={{ background: cfg.accent }} />
      <div className="bt-circle bt-circle-b" style={{ background: cfg.accent }} />

      {/* Large watermark glyph */}
      <div className="bt-glyph">{cfg.shape}</div>

      {/* Content overlay */}
      <div className="bt-overlay">
        <div className="bt-top-row">
          <span className="bt-tag">{post.tags[0]}</span>
          <span className="bt-mins">{post.readMinutes} min read</span>
        </div>
        {(isHero || isArticle) && (
          <p className="bt-title">{post.title}</p>
        )}
      </div>
    </div>
  );
}
