"use client";

// Share-of-voice donut: brand vs competitors as % of total AI visibility.
// Pure SVG, no chart library.

const PALETTE = ["#ea580c", "#6366f1", "#0ea5e9", "#16a34a", "#a855f7", "#f59e0b", "#64748b"];

export function ShareOfVoice({ data = [] }) {
  const top = data.slice(0, 6);
  // Re-normalize the visible slice so the donut always sums to 100%.
  const total = top.reduce((sum, entry) => sum + entry.share, 0) || 1;
  const slices = top.map((entry, index) => ({
    ...entry,
    pct: (entry.share / total) * 100,
    color: entry.isBrand ? "#ea580c" : PALETTE[(index % (PALETTE.length - 1)) + 1],
  }));

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const brand = slices.find((s) => s.isBrand);

  return (
    <section className="dashboard-card sov-card">
      <div className="card-header">
        <div>
          <h2>Share of voice</h2>
          <p className="card-supporting-copy">How AI visibility is split across you and competitors.</p>
        </div>
      </div>

      <div className="sov-body">
        <div className="sov-chart">
          <svg viewBox="0 0 140 140" className="sov-svg">
            <circle cx="70" cy="70" r={radius} className="sov-track" />
            {slices.map((slice) => {
              const length = (slice.pct / 100) * circumference;
              const dash = `${length} ${circumference - length}`;
              const el = (
                <circle
                  key={slice.name}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="16"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 70 70)"
                />
              );
              offset += length;
              return el;
            })}
          </svg>
          <div className="sov-center">
            <strong>{brand ? `${brand.share}%` : "—"}</strong>
            <span>your share</span>
          </div>
        </div>

        <ul className="sov-legend">
          {slices.map((slice) => (
            <li key={slice.name} className={slice.isBrand ? "sov-legend-brand" : ""}>
              <span className="sov-dot" style={{ background: slice.color }} />
              <span className="sov-legend-name">
                {slice.name}
                {slice.isBrand ? <em> (you)</em> : null}
              </span>
              <strong>{slice.share}%</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
