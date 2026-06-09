// Turns Claude's real ranked recommendation list (brandsInOrder, returned by
// /api/visibility-check) into a competitor leaderboard, share-of-voice data, and
// suggested competitors. No simulation — everything here is derived from the
// single list of brands Claude actually recommended for the prompt.

function norm(value) {
  return String(value || "").trim().toLowerCase();
}

// Fuzzy match a name against Claude's list (handles "Ahrefs" vs "Ahrefs.com").
export function rankInList(brandsInOrder, name) {
  const target = norm(name);
  if (!target) return null;
  const index = brandsInOrder.findIndex((item) => {
    const candidate = norm(item);
    return candidate.includes(target) || target.includes(candidate);
  });
  return index === -1 ? null : index + 1;
}

// Position in Claude's list -> 0-100 score. #1 ≈ 95, scaling down; not listed = 8.
// Mirrors the scoring used in /api/visibility-check so numbers stay consistent.
export function scoreFromRank(rank, total) {
  return rank ? Math.max(20, Math.round(100 - (rank - 1) * (60 / Math.max(total, 1)))) : 8;
}

// Builds the leaderboard for [brand, ...competitors] from Claude's real ranking.
// Returns rows sorted best-first: [{ name, isBrand, mentioned, claudeRank, score, rank }]
export function buildLeaderboard({ brandsInOrder = [], brand, competitors = [] }) {
  const total = brandsInOrder.length || 1;
  const names = [brand, ...competitors].filter(Boolean);

  const rows = names.map((name) => {
    const claudeRank = rankInList(brandsInOrder, name);
    return {
      name,
      isBrand: norm(name) === norm(brand),
      mentioned: claudeRank !== null,
      claudeRank,
      score: scoreFromRank(claudeRank, total),
    };
  });

  return rows
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

// Share of voice from the leaderboard: each name's score as a % of the total.
// Shape matches what the ShareOfVoice component expects.
export function shareFromLeaderboard(rows = []) {
  const sum = rows.reduce((acc, row) => acc + (row.score || 0), 0) || 1;
  return rows
    .map((row) => ({ name: row.name, isBrand: row.isBrand, share: Math.round((row.score / sum) * 100) }))
    .sort((a, b) => b.share - a.share);
}

// Competitors Claude actually recommended for this prompt that the user isn't
// tracking yet (and that aren't the user's own brand) — ready to one-click add.
export function suggestCompetitors({ brandsInOrder = [], brand, competitors = [], limit = 6 }) {
  const taken = new Set([norm(brand), ...competitors.map(norm)]);
  const seen = new Set();
  const out = [];
  for (const item of brandsInOrder) {
    const name = String(item || "").trim();
    const key = norm(name);
    if (!name || taken.has(key) || seen.has(key)) continue;
    // Skip a suggestion that fuzzily matches the brand or a tracked competitor.
    const clash = [...taken].some((t) => t && (key.includes(t) || t.includes(key)));
    if (clash) continue;
    seen.add(key);
    out.push(name);
    if (out.length >= limit) break;
  }
  return out;
}
