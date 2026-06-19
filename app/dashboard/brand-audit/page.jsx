"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
  RefreshCwIcon,
  SearchIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createBrowserSupabaseClient } from "../../../lib/supabase";
import { normalizeWorkspaceProfile } from "../../../lib/workspace-profile";

const ENGINE_COLORS = {
  chatgpt:    "#10a37f",
  gemini:     "#4285f4",
  claude:     "#d97706",
  perplexity: "#7c3aed",
  grok:       "#0891b2",
};

const VERDICT_META = {
  accurate:   { label: "Accurate",    color: "#16a34a", bg: "rgba(22,163,74,0.08)",  icon: CheckCircle2Icon },
  partial:    { label: "Partial",     color: "#d97706", bg: "rgba(217,119,6,0.08)",  icon: AlertTriangleIcon },
  inaccurate: { label: "Inaccurate",  color: "#dc2626", bg: "rgba(220,38,38,0.08)", icon: XCircleIcon },
  unknown:    { label: "Unknown",     color: "#71717a", bg: "rgba(113,113,122,0.08)", icon: SearchIcon },
};

function NarrativeScoreBadge({ score }) {
  if (score == null) return null;
  const color = score >= 75 ? "#16a34a" : score >= 45 ? "#d97706" : "#dc2626";
  const label = score >= 75 ? "Well understood" : score >= 45 ? "Partially known" : "Poorly known";
  return (
    <div className="audit-score-badge" style={{ "--score-color": color }}>
      <span className="audit-score-num" style={{ color }}>{score}</span>
      <span className="audit-score-label" style={{ color }}>{label}</span>
    </div>
  );
}

function EngineAnswerCard({ engine, onCopy, copied }) {
  const [open, setOpen] = useState(false);
  const color  = ENGINE_COLORS[engine.key] || "#71717a";
  const verdict = engine.accuracy?.verdict;
  const vm      = VERDICT_META[verdict] || VERDICT_META.unknown;
  const VerdictIcon = vm.icon;

  return (
    <div className="audit-engine-card">
      <div className="audit-engine-header" onClick={() => setOpen((v) => !v)}>
        <div className="audit-engine-id">
          <span className="audit-engine-dot" style={{ background: color }} />
          <span className="audit-engine-name">{engine.label}</span>
          {engine.simulated && <span className="audit-sim-badge">simulated</span>}
        </div>

        <div className="audit-engine-right">
          {engine.accuracy?.score != null && (
            <span className="audit-accuracy-chip" style={{ background: vm.bg, color: vm.color }}>
              <VerdictIcon style={{ width: 11, height: 11 }} />
              {vm.label} · {engine.accuracy.score}%
            </span>
          )}
          {open ? <ChevronUpIcon className="audit-chevron" /> : <ChevronDownIcon className="audit-chevron" />}
        </div>
      </div>

      {open && (
        <div className="audit-engine-body">
          {engine.error || !engine.answer ? (
            <p className="audit-no-answer">This engine had no answer.</p>
          ) : (
            <>
              <div className="audit-answer-wrap">
                <p className="audit-answer">{engine.answer}</p>
                <button
                  className="audit-copy-btn"
                  onClick={() => onCopy(engine.key, engine.answer)}
                  title="Copy answer"
                >
                  {copied === engine.key
                    ? <ClipboardCheckIcon style={{ width: 14, height: 14, color: "#16a34a" }} />
                    : <ClipboardIcon     style={{ width: 14, height: 14 }} />}
                </button>
              </div>

              {engine.accuracy && (
                <div className="audit-accuracy-detail">
                  {engine.accuracy.summary && (
                    <p className="audit-accuracy-summary">{engine.accuracy.summary}</p>
                  )}
                  {engine.accuracy.correct?.length > 0 && (
                    <div className="audit-items audit-items-good">
                      {engine.accuracy.correct.map((c, i) => (
                        <div key={i} className="audit-item">
                          <CheckCircle2Icon />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {engine.accuracy.issues?.length > 0 && (
                    <div className="audit-items audit-items-bad">
                      {engine.accuracy.issues.map((iss, i) => (
                        <div key={i} className="audit-item">
                          <XCircleIcon />
                          <span>{iss}</span>
                        </div>
                      ))}
                      <Link href="/dashboard/visibility" className="audit-fix-link">
                        <ZapIcon style={{ width: 12, height: 12 }} />
                        Fix with GEO Fix
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionBlock({ block, defaultOpen = false }) {
  const [open, setOpen]   = useState(defaultOpen);
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (key, text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const score = block.overallAccuracy;
  const color = score == null ? "#71717a" : score >= 75 ? "#16a34a" : score >= 45 ? "#d97706" : "#dc2626";

  return (
    <div className="audit-question-block">
      <div className="audit-question-header" onClick={() => setOpen((v) => !v)}>
        <div className="audit-question-text">
          <span className="audit-q-mark">Q</span>
          <span>{block.question}</span>
        </div>
        <div className="audit-question-right">
          {score != null && (
            <span className="audit-q-score" style={{ color }}>
              {score}% accurate
            </span>
          )}
          {open ? <ChevronUpIcon className="audit-chevron" /> : <ChevronDownIcon className="audit-chevron" />}
        </div>
      </div>

      {open && (
        <div className="audit-question-body">
          {block.engines.map((engine) => (
            <EngineAnswerCard
              key={engine.key}
              engine={engine}
              onCopy={copyToClipboard}
              copied={copied}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrandAuditPage() {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scan, setScan]       = useState({ status: "idle" });
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/signin"); return; }
      setUser(session.user);
      supabase.from("user_profiles").select("*").eq("user_id", session.user.id).maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(normalizeWorkspaceProfile(data));
        })
        .finally(() => setLoading(false));
    });
  }, [router, supabase]);

  const brand       = profile?.product_name || profile?.starter_keyword || "";
  const description = profile?.brand_description || "";
  const category    = profile?.industry || "";

  const runAudit = async () => {
    if (!brand) return;
    setScan({ status: "loading" });
    try {
      const res  = await fetch("/api/brand-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, description, category }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Audit failed.");
      setScan({ status: "done", data });
    } catch (err) {
      setScan({ status: "error", error: err.message });
    }
  };

  const getInitials = (email) => email ? email.split("@")[0].charAt(0).toUpperCase() : "U";

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="dashboard-main dashboard-main-shadcn">
            <div className="page-loader"><div className="page-loader-ring" /></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const data = scan.status === "done" ? scan.data : null;

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={() => { supabase.auth.signOut(); router.replace("/"); }} subscriptionTier={profile?.subscription_tier || "free"} />
      <SidebarInset>
        <main className="dashboard-main dashboard-main-shadcn">
          <div className="dashboard-header">
            <div>
              <SidebarTrigger className="dashboard-sidebar-trigger" />
              <h1>AI Brand Audit</h1>
              <p className="page-subtitle">
                See exactly what AI engines say about {brand || "your brand"} — and what they get wrong.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {data && (
                <button className="action-button" onClick={runAudit}>
                  <RefreshCwIcon className="button-icon" /> Re-run
                </button>
              )}
              <div className="user-avatar">{getInitials(user?.email)}</div>
            </div>
          </div>

          <div className="dashboard-content">
            {scan.status === "idle" && (
              <div className="audit-start-card dashboard-card">
                <div className="audit-start-icon">🔍</div>
                <h2 className="audit-start-title">What does AI say about {brand || "your brand"}?</h2>
                <p className="audit-start-desc">
                  We ask ChatGPT, Gemini, Claude, Perplexity, and Grok 5 direct questions about your brand,
                  then check each answer for accuracy, missing info, and inaccuracies.
                </p>
                <ul className="audit-start-questions">
                  {["What is it and what does it do?", "Who is it designed for?", "What are its strengths?", "What are its weaknesses?", "How does it compare to alternatives?"]
                    .map((q) => (
                      <li key={q}><CheckCircle2Icon /> {q}</li>
                    ))}
                </ul>
                <button
                  className="primary-button"
                  onClick={runAudit}
                  disabled={!brand}
                >
                  <SearchIcon className="button-icon" />
                  {brand ? `Audit ${brand} across 5 engines` : "Complete your brand profile first"}
                </button>
                {!brand && (
                  <p className="audit-no-brand">
                    <Link href="/dashboard/memory">Add your brand name in Brand Memory →</Link>
                  </p>
                )}
              </div>
            )}

            {scan.status === "loading" && (
              <div className="audit-loading-card dashboard-card">
                <div className="audit-loading-spinner" />
                <p className="audit-loading-title">Asking all 5 AI engines about {brand}…</p>
                <p className="audit-loading-sub">
                  Running 5 questions × 5 engines, then checking accuracy. This takes 20–40 seconds.
                </p>
                <div className="audit-loading-engines">
                  {["ChatGPT", "Gemini", "Claude", "Perplexity", "Grok"].map((e) => (
                    <span key={e} className="audit-loading-engine-dot">{e}</span>
                  ))}
                </div>
              </div>
            )}

            {scan.status === "error" && (
              <div className="audit-start-card dashboard-card">
                <p style={{ color: "#dc2626" }}>{scan.error}</p>
                <button className="primary-button" onClick={runAudit}>Try again</button>
              </div>
            )}

            {data && (
              <div className="audit-results">
                <div className="audit-results-header dashboard-card">
                  <div>
                    <h2 className="audit-results-title">Narrative Score for {data.brand}</h2>
                    <p className="audit-results-sub">
                      How accurately AI engines understand your brand across 5 key questions.
                    </p>
                  </div>
                  <NarrativeScoreBadge score={data.narrativeScore} />
                </div>

                <div className="audit-questions">
                  {data.questions.map((block, i) => (
                    <QuestionBlock key={block.id} block={block} defaultOpen={i === 0} />
                  ))}
                </div>

                <div className="audit-cta dashboard-card">
                  <p>AI engines getting your brand wrong? GEO Fix generates content that corrects the narrative.</p>
                  <Link href="/dashboard/visibility" className="primary-button" style={{ display: "inline-flex" }}>
                    <ZapIcon className="button-icon" /> Open GEO Fix
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
