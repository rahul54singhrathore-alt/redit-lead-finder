"use client";

import { useEffect, useState } from "react";

const ENGINES = [
  {
    name: "Perplexity",
    color: "#1fb8ac",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L8.5 8.5H3l4.5 4-2 7L12 16l6.5 3.5-2-7 4.5-4h-5.5L12 2z"/>
      </svg>
    ),
  },
  {
    name: "Claude",
    color: "#7c3aed",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
      </svg>
    ),
  },
  {
    name: "Gemini",
    color: "#4285f4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.8 8.4 6.8 15.6 12 22c5.2-6.4 5.2-13.6 0-20z" opacity="0.85"/>
        <path d="M2 12c6.4 5.2 13.6 5.2 20 0C15.6 6.8 8.4 6.8 2 12z" opacity="0.7"/>
      </svg>
    ),
  },
  {
    name: "OpenAI",
    color: "#18181b",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.946a4.5 4.5 0 0 1-6.14-1.642zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.412-.663zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    ),
  },
];

const HOLD    = 1800; // ms each engine shows
const FADE    = 400;  // ms fade transition

export function EngineAnswerStrip() {
  const [idx,     setIdx]     = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ENGINES.length);
        setVisible(true);
      }, FADE);
    }, HOLD + FADE);

    return () => clearInterval(cycle);
  }, []);

  const engine = ENGINES[idx];

  return (
    <section className="eas-root">
      <h2 className="eas-heading">
        <span className="eas-line1">Be the answer</span>
        <span className="eas-line2">
          in{" "}
          <span
            className="eas-icon-wrap"
            style={{
              color:   engine.color,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)",
              transition: `opacity ${FADE}ms ease, transform ${FADE}ms ease`,
            }}
            aria-label={engine.name}
          >
            {engine.icon}
          </span>
          {" "}AI search.
        </span>
      </h2>
    </section>
  );
}
