"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon, CheckCircle2Icon, GaugeIcon, MailIcon } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const scoreConfig = [
  ["seo", "SEO", "Search pages, metadata, links"],
  ["aeo", "AEO", "Answer-ready content coverage"],
  ["geo", "GEO", "AI visibility and citations"],
  ["speed", "Speed", "Loading and technical friction"],
  ["keywords", "Keywords", "Topic and intent depth"],
];

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function makeScore(seed, offset) {
  let total = offset;
  for (let index = 0; index < seed.length; index += 1) {
    total += seed.charCodeAt(index) * (index + 3 + offset);
  }
  return 48 + (total % 47);
}

function getTone(score) {
  if (score >= 82) return "strong";
  if (score >= 68) return "mid";
  return "low";
}

export function UrlAuditTool() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const runAudit = (event) => {
    event.preventDefault();
    const normalized = normalizeUrl(url);

    try {
      const parsed = new URL(normalized);
      const host = parsed.hostname.replace(/^www\./, "");
      const scores = scoreConfig.map(([key, label, help], index) => ({
        key,
        label,
        help,
        value: makeScore(host + parsed.pathname, index * 11),
      }));
      const average = Math.round(scores.reduce((sum, item) => sum + item.value, 0) / scores.length);

      setReport({
        host,
        url: parsed.href,
        average,
        scores,
      });
      setNote("");
    } catch {
      setNote("Enter a valid URL, like example.com or https://example.com.");
    }
  };

  const sendReport = async (event) => {
    event.preventDefault();

    if (!report) {
      setNote("Generate the URL score first.");
      return;
    }

    if (!email.includes("@")) {
      setNote("Enter a valid email to send the report.");
      return;
    }

    setIsSending(true);
    setNote("Saving the report request...");

    if (!supabase) {
      setIsSending(false);
      setNote("Supabase keys are missing. The report request is ready locally, but the backend is not configured yet.");
      return;
    }

    const { error } = await supabase.from("early_access_leads").insert({
      email,
      market: `Full URL report requested for ${report.url}`,
      source: "website",
      user_agent: navigator.userAgent,
    });

    setIsSending(false);

    if (error) {
      setNote("The report request was not saved. Check the Supabase policy and schema.");
      return;
    }

    setNote("Done. The full report request has been saved.");
    setEmail("");
  };

  return (
    <section className="url-audit" id="audit">
      <div className="url-audit-copy">
        <span className="url-audit-kicker">
          <GaugeIcon />
          Free URL audit
        </span>
        <h2>Enter a URL. Get your score.</h2>
        <p>See instant demo scores for SEO, AEO, GEO, speed, and keywords.</p>
      </div>

      <div className="url-audit-panel">
        <form className="url-audit-form" onSubmit={runAudit}>
          <label htmlFor="audit-url">Website URL</label>
          <div>
            <input
              id="audit-url"
              name="audit-url"
              onChange={(event) => setUrl(event.target.value)}
              placeholder="example.com"
              type="text"
              value={url}
            />
            <button type="submit">
              Get score
              <ArrowRightIcon />
            </button>
          </div>
        </form>

        {report ? (
          <div className="url-audit-results">
            <div className="url-audit-summary">
              <div>
                <span>Overall score</span>
                <strong>{report.average}</strong>
              </div>
              <p>{report.host}</p>
            </div>

            <div className="url-score-grid">
              {report.scores.map((item) => (
                <div className="url-score-card" data-tone={getTone(item.value)} key={item.key}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.value}/100</span>
                  </div>
                  <p>{item.help}</p>
                  <em style={{ width: `${item.value}%` }} />
                </div>
              ))}
            </div>

            <form className="url-report-form" onSubmit={sendReport}>
              <div>
                <MailIcon />
                <div>
                  <strong>Want me to send the full report?</strong>
                  <span>Enter your email, and the detailed breakdown will be saved to the queue.</span>
                </div>
              </div>
              <div className="url-report-fields">
                <input
                  aria-label="Email for full report"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  type="email"
                  value={email}
                />
                <button disabled={isSending} type="submit">
                  {isSending ? "Sending..." : "Send report"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="url-audit-empty">
            <CheckCircle2Icon />
            <p>Enter URL to generate SEO, AEO, GEO, speed, and keyword scores.</p>
          </div>
        )}

        {note ? <p className="url-audit-note">{note}</p> : null}
      </div>
    </section>
  );
}
