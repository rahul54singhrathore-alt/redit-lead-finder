// Deterministic "AI recommendation" simulator.
// Given a prompt, the user's brand, and competitors, it produces a stable,
// repeatable ranking per AI engine — no external API, no randomness, so the
// same inputs always render the same result (good for demos and sharing).

export const SIM_ENGINES = ["ChatGPT", "Gemini", "Claude", "Perplexity"];

// Small, stable string hash (FNV-1a style) -> unsigned 32-bit int.
function hashString(value) {
  let hash = 2166136261;
  const str = String(value).toLowerCase();
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Score 0-100 for a given brand on a given engine + prompt. Deterministic.
function scoreFor(engine, prompt, name) {
  const seed = hashString(`${engine}::${prompt}::${name}`);
  // Spread into a 28-96 range so nobody is exactly 0 or 100.
  return 28 + (seed % 69);
}

// Builds a per-engine ranking of [brand, ...competitors], sorted by score.
// Returns: [{ engine, rows: [{ name, score, isBrand, rank }], brandRank }]
export function simulateVisibility({ prompt, brand, competitors = [], engines = SIM_ENGINES }) {
  const cleanPrompt = String(prompt || "").trim() || "best tools";
  const cleanBrand = String(brand || "Your brand").trim();
  const names = [cleanBrand, ...competitors.map((c) => String(c).trim()).filter(Boolean)];

  return engines.map((engine) => {
    const rows = names
      .map((name) => ({
        name,
        score: scoreFor(engine, cleanPrompt, name),
        isBrand: name === cleanBrand,
      }))
      .sort((a, b) => b.score - a.score)
      .map((row, index) => ({ ...row, rank: index + 1 }));

    const brandRow = rows.find((row) => row.isBrand);
    return {
      engine,
      rows,
      brandRank: brandRow ? brandRow.rank : null,
      brandScore: brandRow ? brandRow.score : 0,
      total: rows.length,
    };
  });
}

// Overall GEO score = average of the brand's score across engines.
export function overallGeoScore(results) {
  if (!results.length) return 0;
  const sum = results.reduce((total, result) => total + (result.brandScore || 0), 0);
  return Math.round(sum / results.length);
}

// Share of voice: each name's % of total visibility across all engines.
// Returns [{ name, isBrand, score, share }] sorted by share desc.
export function shareOfVoice(results) {
  const totals = new Map();
  results.forEach((engine) => {
    engine.rows.forEach((row) => {
      const prev = totals.get(row.name) || { name: row.name, isBrand: row.isBrand, score: 0 };
      prev.score += row.score;
      totals.set(row.name, prev);
    });
  });
  const sum = Array.from(totals.values()).reduce((total, entry) => total + entry.score, 0) || 1;
  return Array.from(totals.values())
    .map((entry) => ({ ...entry, share: Math.round((entry.score / sum) * 100) }))
    .sort((a, b) => b.share - a.share);
}

