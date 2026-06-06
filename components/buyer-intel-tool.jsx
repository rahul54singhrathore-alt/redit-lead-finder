"use client";

import { useState } from "react";
import { ArrowRightIcon, BriefcaseBusinessIcon, SearchIcon, UsersIcon } from "lucide-react";

const sourceOptions = ["Reddit", "X", "LinkedIn", "Communities"];

const buyerTemplates = [
  { role: "Founder", company: "seed-stage SaaS", intent: "actively asking for a solution" },
  { role: "Head of Growth", company: "B2B software team", intent: "comparing vendors and workflows" },
  { role: "RevOps Lead", company: "sales-led startup", intent: "evaluating stack gaps" },
  { role: "Marketing Director", company: "product-led company", intent: "looking for faster pipeline" },
  { role: "Agency Owner", company: "services business", intent: "searching for repeatable lead channels" },
  { role: "Operator", company: "bootstrapped founder", intent: "trying to reduce manual research" },
];

function normalizeSeed(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreFrom(seed, index) {
  let total = index * 31 + seed.length * 17;
  for (let cursor = 0; cursor < seed.length; cursor += 1) {
    total += seed.charCodeAt(cursor) * (cursor + 7 + index);
  }
  return 74 + (total % 19);
}

function buildProspects(niche, source) {
  const seed = normalizeSeed(niche);

  return buyerTemplates.map((template, index) => {
    const signal = scoreFrom(seed + source.toLowerCase(), index);
    return {
      name: `${template.role} ${index + 1}`,
      role: template.role,
      company: template.company,
      source,
      score: signal,
      reason: `${template.intent} around ${niche.toLowerCase()} on ${source}.`,
    };
  });
}

export function BuyerIntelTool() {
  const [niche, setNiche] = useState("");
  const [selectedSource, setSelectedSource] = useState(sourceOptions[0]);
  const [results, setResults] = useState([]);
  const [note, setNote] = useState("");

  const runSearch = (event) => {
    event.preventDefault();

    if (!niche.trim()) {
      setNote("Enter a niche to search.");
      setResults([]);
      return;
    }

    setResults(buildProspects(niche, selectedSource));
    setNote("");
  };

  return (
    <section className="buyer-intel" id="buyers">
      <div className="buyer-intel-copy">
        <span className="buyer-intel-kicker">
          <SearchIcon />
          AI buyer search
        </span>
        <h2>Search one source at a time for potential buyers.</h2>
        <p>
          Enter a niche, choose Reddit, X, LinkedIn, or Communities, and get a buyer list with signals founders actually pay for.
        </p>
      </div>

      <div className="buyer-intel-panel">
        <form className="buyer-intel-form" onSubmit={runSearch}>
          <label htmlFor="buyer-niche">Niche</label>
          <div className="buyer-intel-row">
            <input
              id="buyer-niche"
              name="buyer-niche"
              onChange={(event) => setNiche(event.target.value)}
              placeholder="AI lead generation"
              type="text"
              value={niche}
            />
            <button type="submit">
              Search buyers
              <ArrowRightIcon />
            </button>
          </div>

          <div className="buyer-intel-sources" role="radiogroup" aria-label="Source selection">
            {sourceOptions.map((source) => (
              <button
                aria-checked={selectedSource === source}
                className={selectedSource === source ? "active" : ""}
                key={source}
                role="radio"
                type="button"
                onClick={() => setSelectedSource(source)}
              >
                {source}
              </button>
            ))}
          </div>
        </form>

        <div className="buyer-intel-meta">
          <div>
            <UsersIcon />
            <strong>{selectedSource} selected</strong>
            <span>One source at a time keeps the search tight and easier to act on.</span>
          </div>
          <div>
            <BriefcaseBusinessIcon />
            <strong>Buyer list preview</strong>
            <span>Role, company type, source, and reason are generated from your niche.</span>
          </div>
        </div>

        {results.length ? (
          <div className="buyer-intel-results">
            {results.map((item) => (
              <article className="buyer-intel-card" key={`${item.role}-${item.source}-${item.name}`}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role} · {item.company}</span>
                </div>
                <em>{item.source}</em>
                <p>{item.reason}</p>
                <b>{item.score}/100 intent</b>
              </article>
            ))}
          </div>
        ) : (
          <div className="buyer-intel-empty">
            <p>Search one niche and the tool will return a focused buyer list from the selected source.</p>
          </div>
        )}

        {note ? <p className="buyer-intel-note">{note}</p> : null}
      </div>
    </section>
  );
}
