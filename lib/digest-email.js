// Generates the weekly digest email HTML. No external dependencies — plain HTML
// so it renders correctly in every email client.

const ENGINE_COLORS = {
  ChatGPT: "#10a37f",
  Gemini: "#4285f4",
  Claude: "#d97706",
  Perplexity: "#7c3aed",
};

function scoreBar(score) {
  const pct = Math.max(0, Math.min(100, score));
  const color = pct >= 70 ? "#22c55e" : pct >= 45 ? "#f59e0b" : "#ef4444";
  return `
    <div style="background:#f4f4f5;border-radius:4px;height:6px;width:120px;display:inline-block;vertical-align:middle;">
      <div style="background:${color};border-radius:4px;height:6px;width:${pct}%;"></div>
    </div>`;
}

export function buildDigestHtml({ userName, brand, score, trend, engines, topRecommendations, appUrl }) {
  const trendSign = trend >= 0 ? "+" : "";
  const trendColor = trend >= 0 ? "#22c55e" : "#ef4444";
  const trendArrow = trend >= 0 ? "↑" : "↓";
  const safeUrl = appUrl || "https://www.tryoras.com";

  const engineRows = engines
    .map(
      ({ name, score: s }) => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#3f3f46;width:110px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ENGINE_COLORS[name] || "#71717a"};margin-right:6px;vertical-align:middle;"></span>
        ${name}
      </td>
      <td style="padding:8px 0;vertical-align:middle;">
        ${scoreBar(s)}
      </td>
      <td style="padding:8px 0;font-size:14px;color:#3f3f46;text-align:right;font-weight:600;">
        ${s}
      </td>
    </tr>`
    )
    .join("");

  const recItems = (topRecommendations || [])
    .slice(0, 3)
    .map(
      (r) => `
    <li style="margin-bottom:8px;font-size:14px;color:#3f3f46;line-height:1.5;">
      ${r}
    </li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Your weekly GEO digest — ${brand}</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#09090b;border-radius:12px 12px 0 0;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:18px;font-weight:700;color:#fafafa;letter-spacing:-0.5px;">oras</span>
                    <span style="font-size:12px;color:#71717a;margin-left:8px;">AI visibility tracker</span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px;color:#71717a;">Weekly digest</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero score -->
          <tr>
            <td style="background:#ffffff;padding:32px 32px 24px;">
              <p style="margin:0 0 4px;font-size:14px;color:#71717a;">
                Hey${userName ? " " + userName : ""} — here's how <strong style="color:#09090b;">${brand}</strong> showed up in AI this week.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">GEO Score</p>
                    <p style="margin:4px 0 0;font-size:48px;font-weight:700;color:#09090b;line-height:1;">${score}</p>
                    <p style="margin:6px 0 0;font-size:14px;color:${trendColor};font-weight:600;">
                      ${trendArrow} ${trendSign}${trend}% vs last week
                    </p>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <a href="${safeUrl}/dashboard" style="display:inline-block;background:#09090b;color:#fafafa;text-decoration:none;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;">
                      Open dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Engine breakdown -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 28px;">
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0 0 20px;" />
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;">Per-engine visibility</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${engineRows}
              </table>
            </td>
          </tr>

          ${recItems ? `
          <!-- Recommendations -->
          <tr>
            <td style="background:#f9f9f9;padding:24px 32px;border-top:1px solid #f4f4f5;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;">Top actions this week</p>
              <ul style="margin:0;padding-left:20px;">
                ${recItems}
              </ul>
              <a href="${safeUrl}/dashboard/recommendations" style="display:inline-block;margin-top:16px;font-size:13px;color:#09090b;font-weight:600;text-decoration:underline;">
                See all recommendations →
              </a>
            </td>
          </tr>` : ""}

          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f5;border-radius:0 0 12px 12px;padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:#a1a1aa;">
                    You're receiving this because weekly digests are on in your
                    <a href="${safeUrl}/dashboard/settings" style="color:#71717a;">settings</a>.
                  </td>
                  <td align="right">
                    <a href="${safeUrl}/dashboard/settings" style="font-size:12px;color:#71717a;text-decoration:none;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
