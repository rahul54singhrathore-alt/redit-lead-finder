// Client-side report exporters. No external services required.

function escapeCsv(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

// Downloads the given signals as a CSV file in the browser.
export function exportLeadsCsv(leads, filename = "oras-signals.csv") {
  if (typeof window === "undefined") return;

  const headers = ["Title", "Source", "Brand/Keyword", "Intent", "Status", "Score", "Comments", "URL", "Posted"];
  const rows = (leads || []).map((lead) => [
    lead.title,
    lead.subreddit,
    lead.keyword,
    lead.intent,
    lead.status,
    lead.score,
    lead.comments,
    lead.url,
    lead.posted_at,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Downloads visibility engine data as a CSV file in the browser.
// engines: array of { key, name, score, mentioned, sentiment } from the visibility API.
export function exportVisibilityCsv(engines, brand, filename) {
  if (typeof window === "undefined") return;

  const safeBrand = String(brand || "brand");
  const defaultFilename = filename || `oras-visibility-${safeBrand.toLowerCase().replace(/\s+/g, "-")}.csv`;
  const date = new Date().toISOString().split("T")[0];

  const headers = ["Engine", "Score", "Mentioned", "Sentiment", "Date"];
  const rows = (engines || []).map((e) => [
    e.name || e.key || "",
    e.score ?? "",
    e.mentioned ? "Yes" : "No",
    e.sentiment || "",
    date,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Opens a print-ready, white-label branded report in a new window.
// The user prints to PDF from the browser dialog (works everywhere, no deps).
export function openWhiteLabelReport({ brand, generatedOn, leads = [] }) {
  if (typeof window === "undefined") return;

  const safeBrand = String(brand || "Your brand");
  const total = leads.length;
  const high = leads.filter((l) => l.intent === "High").length;
  const sources = new Set(leads.map((l) => l.subreddit)).size;

  const rowsHtml = leads
    .slice(0, 50)
    .map(
      (l) => `
        <tr>
          <td>${escapeHtml(l.title)}</td>
          <td>${escapeHtml(l.subreddit)}</td>
          <td>${escapeHtml(l.keyword)}</td>
          <td><span class="badge badge-${String(l.intent).toLowerCase()}">${escapeHtml(l.intent)}</span></td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(safeBrand)} — AI Visibility Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #18181b; margin: 0; padding: 40px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #ea580c; padding-bottom: 18px; }
  .brand { font-size: 26px; font-weight: 800; }
  .brand span { color: #ea580c; }
  .meta { text-align: right; color: #71717a; font-size: 13px; }
  h1 { font-size: 20px; margin: 28px 0 6px; }
  .sub { color: #71717a; margin: 0 0 24px; }
  .cards { display: flex; gap: 16px; margin-bottom: 28px; }
  .card { flex: 1; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; }
  .card strong { display: block; font-size: 30px; }
  .card span { color: #71717a; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; background: #fafafa; padding: 10px; border-bottom: 2px solid #e4e4e7; }
  td { padding: 10px; border-bottom: 1px solid #f1f1f4; }
  .badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .badge-high { background: #fee2e2; color: #b91c1c; }
  .badge-medium { background: #fef3c7; color: #92400e; }
  .badge-low { background: #e0e7ff; color: #3730a3; }
  .foot { margin-top: 32px; color: #a1a1aa; font-size: 11px; text-align: center; }
  @media print { body { padding: 24px; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="head">
    <div class="brand"><span>Oras</span></div>
    <div class="meta">AI Visibility Report<br/>Generated ${escapeHtml(generatedOn)}</div>
  </div>

  <h1>${escapeHtml(safeBrand)} — Visibility Summary</h1>
  <p class="sub">How ${escapeHtml(safeBrand)} appears across AI answer engines and tracked sources.</p>

  <div class="cards">
    <div class="card"><strong>${total}</strong><span>Total signals</span></div>
    <div class="card"><strong>${high}</strong><span>High-confidence</span></div>
    <div class="card"><strong>${sources}</strong><span>Sources covered</span></div>
  </div>

  <h1>Signals</h1>
  <table>
    <thead><tr><th>Title</th><th>Source</th><th>Brand / Keyword</th><th>Intent</th></tr></thead>
    <tbody>${rowsHtml || '<tr><td colspan="4">No signals yet.</td></tr>'}</tbody>
  </table>

  <p class="foot">Powered by Oras · tryoras.com</p>

  <script>window.onload = function () { setTimeout(function () { window.print(); }, 300); };</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
