const THUMB_CONFIG = [
  { bg: "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)", icon: "✦", dots: "#a5b4fc" },
  { bg: "linear-gradient(135deg,#0ea5e9,#6366f1,#8b5cf6)", icon: "◎", dots: "#93c5fd" },
  { bg: "linear-gradient(135deg,#f97316,#ef4444,#ec4899)", icon: "⬡", dots: "#fca5a5" },
  { bg: "linear-gradient(135deg,#10b981,#0ea5e9,#6366f1)", icon: "⬢", dots: "#6ee7b7" },
  { bg: "linear-gradient(135deg,#f59e0b,#f97316,#ef4444)", icon: "◈", dots: "#fcd34d" },
  { bg: "linear-gradient(135deg,#ec4899,#8b5cf6,#6366f1)", icon: "◉", dots: "#f9a8d4" },
  { bg: "linear-gradient(135deg,#14b8a6,#6366f1,#8b5cf6)", icon: "◆", dots: "#5eead4" },
  { bg: "linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)", icon: "★", dots: "#c4b5fd" },
  { bg: "linear-gradient(135deg,#0ea5e9,#10b981,#14b8a6)", icon: "◇", dots: "#67e8f9" },
];

export function PostThumbnail({ post, index, size = "normal" }) {
  const cfg = THUMB_CONFIG[index % THUMB_CONFIG.length];
  return (
    <div
      className={`bt bt-${size}`}
      style={{ background: cfg.bg, "--dot-color": cfg.dots }}
      aria-hidden="true"
    >
      <div className="bt-dots" />
      <div className="bt-ring" />
      <div className="bt-icon">{cfg.icon}</div>
      <div className="bt-bottom">
        <span className="bt-tag">{post.tags[0]}</span>
        <span className="bt-mins">{post.readMinutes} min</span>
      </div>
    </div>
  );
}
