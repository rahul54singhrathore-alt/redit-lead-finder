"use client";

import { useEffect, useState } from "react";
import { FileTextIcon, LinkIcon, MegaphoneIcon, RefreshCwIcon, RouteIcon, ShieldCheckIcon, TargetIcon } from "lucide-react";

const COVERAGE_AREAS = [
  { icon: FileTextIcon, label: "Content & Schema", detail: "Structured data, meta descriptions, FAQs" },
  { icon: LinkIcon, label: "Citation signals", detail: "Backlinks, mentions, authority sources" },
  { icon: MegaphoneIcon, label: "Brand presence", detail: "AI-visible brand definition and context" },
  { icon: ShieldCheckIcon, label: "Competitive edge", detail: "Positioning gaps vs. your rivals" },
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
  const allDone = tasks.length > 0 && tasks.every((t) => done[t.task]);

  return (
    <>
      <section className="dashboard-card geo-roadmap">
        <div className="card-header">
          <div>
            <h2>
              <RouteIcon className="geo-title-icon" /> GEO Tasks — Auto Roadmap
            </h2>
            {scan.status !== "idle" && (
              <p className="card-supporting-copy">
                A prioritized checklist to raise {cleanBrand}&apos;s AI visibility — check tasks off as you go.
              </p>
            )}
          </div>
          {scan.status !== "idle" && (
            <button
              type="button"
              className="primary-button"
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

        {scan.status === "idle" ? (
          <div className="geo-empty-hero">
            <div className="geo-preview-tasks">
              <div className="geo-preview-row">
                <span className="geo-preview-check" />
                <span className="geo-preview-bar" style={{ width: "72%" }} />
                <span className="geo-preview-pts">+8</span>
              </div>
              <div className="geo-preview-row">
                <span className="geo-preview-check" />
                <span className="geo-preview-bar" style={{ width: "55%" }} />
                <span className="geo-preview-pts">+6</span>
              </div>
              <div className="geo-preview-row">
                <span className="geo-preview-check" />
                <span className="geo-preview-bar" style={{ width: "65%" }} />
                <span className="geo-preview-pts">+5</span>
              </div>
            </div>
            <div className="geo-empty-chips">
              <span>~10 tasks</span>
              <span>Impact-weighted</span>
              <span>AI-personalized</span>
            </div>
            <p className="geo-empty-tagline">
              Generate a personalized action plan and start earning GEO points for <strong>{cleanBrand}</strong>.
            </p>
            <button type="button" className="geo-build-cta" onClick={runScan}>
              <TargetIcon /> Build my roadmap
            </button>
          </div>
        ) : scan.status === "loading" ? (
          <div className="geo-empty">
            <RefreshCwIcon className="spin" />
            <p>Building your GEO roadmap for {cleanBrand}…</p>
          </div>
        ) : scan.status === "error" ? (
          <div className="geo-empty geo-empty-error">
            <p>{scan.error}</p>
            <button type="button" className="geo-build-cta" onClick={runScan} style={{ marginTop: 12 }}>
              <RefreshCwIcon /> Try again
            </button>
          </div>
        ) : (
          <>
            <div className="geo-headline">
              <div className="geo-gain">
                <span className="geo-gain-plus">+{allDone ? totalGain : totalGain - earned || totalGain}</span>
                <span className="geo-gain-label">{allDone ? "GEO points earned 🎉" : "potential GEO points"}</span>
              </div>
              <div className="geo-progress-wrap">
                <div className="geo-progress-top">
                  <span>Progress</span>
                  <strong>+{earned} of +{totalGain} pts</strong>
                </div>
                <div className="geo-progress-track">
                  <span style={{ width: `${totalGain ? (earned / totalGain) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            <ul className="geo-tasks">
              {tasks.map((t) => {
                const checked = Boolean(done[t.task]);
                return (
                  <li key={t.task} className={`geo-task${checked ? " geo-task-done" : ""}`}>
                    <label>
                      <input type="checkbox" checked={checked} onChange={() => toggle(t.task)} />
                      <span className="geo-task-box" />
                      <span className="geo-task-text">{t.task}</span>
                    </label>
                    <span className="geo-task-points">+{t.points}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

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
