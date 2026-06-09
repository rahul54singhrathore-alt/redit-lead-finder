"use client";

import { useEffect, useState } from "react";
import { RefreshCwIcon, RouteIcon, TargetIcon } from "lucide-react";

// GEO Tasks (Auto Roadmap): an AI-generated, checkable to-do list that raises
// the brand's GEO score by a concrete number of points. Checked state persists
// per brand in localStorage so progress sticks across visits.
export function GeoRoadmap({ brand, category, currentScore }) {
  const cleanBrand = (brand || "Your brand").trim();
  const storageKey = `geo-roadmap-${cleanBrand.toLowerCase()}`;
  const [scan, setScan] = useState({ status: "idle" });
  const [done, setDone] = useState({}); // { [task]: true }

  // Restore checked tasks for this brand.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved && typeof saved === "object") setDone(saved);
    } catch {
      /* ignore bad storage */
    }
  }, [storageKey]);

  const persist = (next) => {
    setDone(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggle = (task) => {
    persist({ ...done, [task]: !done[task] });
  };

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
    <section className="dashboard-card geo-roadmap">
      <div className="card-header">
        <div>
          <h2>
            <RouteIcon className="geo-title-icon" /> GEO Tasks — Auto Roadmap
          </h2>
          <p className="card-supporting-copy">
            A prioritized checklist to raise {cleanBrand}’s AI visibility — check tasks off as you go.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={runScan}
          disabled={scan.status === "loading"}
        >
          {scan.status === "loading" ? (
            <>
              <RefreshCwIcon className="button-icon spin" /> Building…
            </>
          ) : scan.status === "done" ? (
            <>
              <RefreshCwIcon className="button-icon" /> Rebuild
            </>
          ) : (
            <>
              <TargetIcon className="button-icon" /> Build roadmap
            </>
          )}
        </button>
      </div>

      {scan.status === "idle" ? (
        <div className="geo-empty">
          <RouteIcon />
          <p>Build an auto roadmap of tasks to increase {cleanBrand}’s GEO score.</p>
        </div>
      ) : scan.status === "loading" ? (
        <div className="geo-empty">
          <RefreshCwIcon className="spin" />
          <p>Building your GEO roadmap…</p>
        </div>
      ) : scan.status === "error" ? (
        <div className="geo-empty geo-empty-error">
          <p>{scan.error}</p>
          <button type="button" className="primary-button" onClick={runScan} style={{ marginTop: 12 }}>
            Try again
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
  );
}
