"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2Icon,
  FileTextIcon,
  LinkIcon,
  MegaphoneIcon,
  MonitorIcon,
  RefreshCwIcon,
  RouteIcon,
  ShieldCheckIcon,
  TargetIcon,
  ZapIcon,
} from "lucide-react";

const CATEGORY_META = {
  Content:   { icon: FileTextIcon,    color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  label: "Content" },
  Citations: { icon: LinkIcon,        color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", label: "Citations" },
  Presence:  { icon: MegaphoneIcon,   color: "#f97316", bg: "rgba(249,115,22,0.08)", label: "Presence" },
  Technical: { icon: MonitorIcon,     color: "#10b981", bg: "rgba(16,185,129,0.08)", label: "Technical" },
};

const CATEGORY_ORDER = ["Content", "Citations", "Presence", "Technical"];

const EFFORT_META = {
  quick:  { label: "Quick win", color: "#16a34a", bg: "rgba(22,163,74,0.10)" },
  medium: { label: "Medium",    color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  high:   { label: "High effort", color: "#7c3aed", bg: "rgba(124,58,237,0.10)" },
};

const COVERAGE_AREAS = [
  { icon: FileTextIcon,   label: "Content & Schema",   detail: "Structured data, meta descriptions, FAQs" },
  { icon: LinkIcon,       label: "Citation signals",   detail: "Backlinks, mentions, authority sources" },
  { icon: MegaphoneIcon,  label: "Brand presence",     detail: "AI-visible brand definition and context" },
  { icon: ShieldCheckIcon,label: "Competitive edge",   detail: "Positioning gaps vs. your rivals" },
];

export function GeoRoadmap({ brand, category, currentScore }) {
  const cleanBrand = (brand || "Your brand").trim();
  const storageKey = `geo-roadmap-${cleanBrand.toLowerCase()}`;
  const [scan, setScan] = useState({ status: "idle" });
  const [done, setDone] = useState({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved && typeof saved === "object") setDone(saved);
    } catch { /* ignore */ }
  }, [storageKey]);

  const persist = (next) => {
    setDone(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const toggle = (task) => persist({ ...done, [task]: !done[task] });

  const runScan = async () => {
    setScan({ status: "loading" });
    try {
      const response = await fetch("/api/geo-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: cleanBrand, category, currentScore }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Roadmap failed.");
      setScan({ status: "done", data });
    } catch (error) {
      setScan({ status: "error", error: error.message });
    }
  };

  const data = scan.data;
  const tasks = data?.tasks || [];
  const totalGain = data?.totalGain || 0;
  const earned = tasks.reduce((sum, t) => (done[t.task] ? sum + t.points : sum), 0);
  const completedCount = tasks.filter((t) => done[t.task]).length;
  const allDone = tasks.length > 0 && completedCount === tasks.length;
  const pct = totalGain > 0 ? Math.round((earned / totalGain) * 100) : 0;

  // Group tasks by category preserving CATEGORY_ORDER
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const group = tasks.filter((t) => t.category === cat);
    if (group.length) acc.push({ cat, tasks: group });
    return acc;
  }, []);

  return (
    <>
      <section className="dashboard-card geo-roadmap">
        <div className="card-header">
          <div>
            <h2>
              <RouteIcon className="geo-title-icon" /> GEO Roadmap
            </h2>
            {scan.status !== "idle" && (
              <p className="card-supporting-copy">
                Ranked actions to raise {cleanBrand}&apos;s AI visibility — check off as you go.
              </p>
            )}
          </div>
          {scan.status !== "idle" && (
            <button
              type="button"
              className="action-button"
              onClick={runScan}
              disabled={scan.status === "loading"}
            >
              {scan.status === "loading" ? (
                <><RefreshCwIcon className="button-icon spin" /> Building…</>
              ) : (
                <><RefreshCwIcon className="button-icon" /> Rebuild</>
              )}
            </button>
          )}
        </div>

        {/* Idle */}
        {scan.status === "idle" && (
          <div className="geo-empty-hero">
            <div className="geo-preview-tasks">
              {[
                { w: "68%", pts: "+7", cat: "Content" },
                { w: "52%", pts: "+5", cat: "Citations" },
                { w: "60%", pts: "+6", cat: "Presence" },
              ].map(({ w, pts, cat }) => {
                const meta = CATEGORY_META[cat];
                return (
                  <div key={cat} className="geo-preview-row">
                    <span className="geo-preview-check" />
                    <span className="geo-preview-cat-dot" style={{ background: meta.color }} />
                    <span className="geo-preview-bar" style={{ width: w }} />
                    <span className="geo-preview-pts">{pts}</span>
                  </div>
                );
              })}
            </div>
            <div className="geo-empty-chips">
              <span>8–10 tasks</span>
              <span>Impact-ranked</span>
              <span>AI-personalized</span>
            </div>
            <p className="geo-empty-tagline">
              Get a personalized action plan to grow <strong>{cleanBrand}</strong>&apos;s presence across AI engines.
            </p>
            <button type="button" className="geo-build-cta" onClick={runScan}>
              <TargetIcon /> Build my roadmap
            </button>
          </div>
        )}

        {/* Loading */}
        {scan.status === "loading" && (
          <div className="geo-empty">
            <RefreshCwIcon className="spin" />
            <p>Building your GEO roadmap for {cleanBrand}…</p>
          </div>
        )}

        {/* Error */}
        {scan.status === "error" && (
          <div className="geo-empty geo-empty-error">
            <p>{scan.error}</p>
            <button type="button" className="geo-build-cta" onClick={runScan} style={{ marginTop: 12 }}>
              <RefreshCwIcon /> Try again
            </button>
          </div>
        )}

        {/* Results */}
        {scan.status === "done" && (
          <>
            {/* Progress headline */}
            <div className="geo-headline">
              <div className="geo-gain">
                <span className="geo-gain-plus">+{allDone ? totalGain : totalGain - earned}</span>
                <span className="geo-gain-label">{allDone ? "points earned" : "pts available"}</span>
              </div>
              <div className="geo-progress-wrap">
                <div className="geo-progress-top">
                  <span>{completedCount}/{tasks.length} tasks done</span>
                  <strong>+{earned} of +{totalGain} pts</strong>
                </div>
                <div className="geo-progress-track">
                  <span style={{ width: `${pct}%` }} />
                </div>
                {allDone && (
                  <p className="geo-all-done">
                    <CheckCircle2Icon /> All tasks complete — your GEO score should be rising.
                  </p>
                )}
              </div>
            </div>

            {/* Category groups */}
            <div className="geo-category-list">
              {grouped.map(({ cat, tasks: catTasks }) => {
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                const catDone = catTasks.filter((t) => done[t.task]).length;
                return (
                  <div key={cat} className="geo-category-group">
                    <div className="geo-category-header">
                      <span className="geo-category-icon" style={{ background: meta.bg, color: meta.color }}>
                        <Icon />
                      </span>
                      <span className="geo-category-label">{meta.label}</span>
                      <span className="geo-category-count">{catDone}/{catTasks.length}</span>
                    </div>
                    <ul className="geo-tasks">
                      {catTasks.map((t) => {
                        const checked = Boolean(done[t.task]);
                        const effort = EFFORT_META[t.effort] || EFFORT_META.medium;
                        return (
                          <li key={t.task} className={`geo-task${checked ? " geo-task-done" : ""}`}>
                            <label>
                              <input type="checkbox" checked={checked} onChange={() => toggle(t.task)} />
                              <span className="geo-task-box" />
                              <span className="geo-task-body">
                                <span className="geo-task-text">{t.task}</span>
                                {t.why && <span className="geo-task-why">{t.why}</span>}
                              </span>
                            </label>
                            <div className="geo-task-meta">
                              <span
                                className="geo-task-effort"
                                style={{ color: effort.color, background: effort.bg }}
                              >
                                {t.effort === "quick" && <ZapIcon />}
                                {effort.label}
                              </span>
                              <span className="geo-task-points">+{t.points}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Coverage areas — idle only */}
      {scan.status === "idle" && (
        <section className="geo-coverage">
          <h3 className="geo-coverage-heading">What your roadmap will cover</h3>
          <div className="geo-coverage-grid">
            {COVERAGE_AREAS.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="geo-coverage-item">
                <span className="geo-coverage-icon"><Icon /></span>
                <strong>{label}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
