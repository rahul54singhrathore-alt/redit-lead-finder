import { NextResponse } from "next/server";
import { checkVisibilityAcrossEngines, GroqError, ENGINES } from "../../../lib/engines";
import { getCachedResult, putCachedResult } from "../../../lib/visibility-guard";

// Real GEO Score: runs the brand through multiple natural AI queries across
// all configured engines and measures the actual mention rate. Score =
// (mentions / possible mentions) × 100, weighted by rank.
//
// 4 query types × up to 4 engines = up to 16 real AI calls. Results for
// each individual prompt are cached by the visibility guard so repeated
// scans within the cache window are fast.

function buildPrompts(brand, category) {
  const cat = (category || "").trim() || "AI and productivity";
  return [
    // Pure discovery — user has no prior knowledge of the brand
    `Best ${cat} tools and software in 2025`,
    `Top ${cat} platforms recommended by professionals`,
    // Comparison — user is evaluating options, no brand preselected
    `${cat} software comparison — which tool should I use?`,
    // Problem-based — indirect path to discovery
    `How to track and improve my brand's visibility in AI search results`,
    // Direct brand check — intentionally last and weighted lower in scoring
    `Why do companies choose ${brand}? What makes it stand out?`,
  ];
}

// Rank score: #1 = 100, scaling down; unmentioned = 0.
function rankScore(rank, total) {
  if (!rank) return 0;
  return Math.max(10, Math.round(100 - (rank - 1) * (75 / Math.max(total, 1))));
}

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const brand = String(body?.brand || "").trim();
  const category = String(body?.category || "").trim();
  if (!brand) return NextResponse.json({ error: "brand is required." }, { status: 400 });

  const prompts = buildPrompts(brand, category);

  // Prompt weights: discovery queries count fully; the direct brand check (last prompt)
  // counts at 40% since asking "What is X?" almost always mentions X.
  const PROMPT_WEIGHTS = [1, 1, 1, 1, 0.4];

  try {
    // Run all prompts in parallel; use per-prompt cache when available.
    const promptResults = await Promise.all(
      prompts.map(async (prompt, idx) => {
        const cacheKey = `geo:${prompt}`;
        const cached = await getCachedResult(cacheKey, brand).catch(() => null);
        if (cached?.result) return { prompt, weight: PROMPT_WEIGHTS[idx], ...cached.result, fromCache: true };

        const { engines, aggregate } = await checkVisibilityAcrossEngines({ prompt, brand });
        const result = { prompt, weight: PROMPT_WEIGHTS[idx], engines, aggregate };
        await putCachedResult(cacheKey, brand, result).catch(() => null);
        return result;
      })
    );

    // Per-engine aggregation across all prompts, applying per-prompt weights.
    const engineStats = ENGINES.map(({ key, label }) => {
      const perPrompt = promptResults.map((pr) => {
        const eng = pr.engines?.find((e) => e.key === key);
        return eng ? { ...eng, weight: pr.weight ?? 1 } : null;
      }).filter(Boolean);

      const totalWeight = perPrompt.reduce((s, e) => s + e.weight, 0);
      const weightedMentions = perPrompt.reduce((s, e) => s + (e.mentioned ? e.weight : 0), 0);
      const mentionCount = perPrompt.filter((e) => e.mentioned).length;
      const totalPrompts = perPrompt.length;
      const mentionRate = totalWeight > 0 ? Math.round((weightedMentions / totalWeight) * 100) : 0;
      const mentioned = perPrompt.filter((e) => e.mentioned);
      const avgRank = mentionCount > 0
        ? Math.round(mentioned.reduce((s, e) => s + (e.rank ?? 1), 0) / mentionCount)
        : null;
      const avgRankScore = mentionCount > 0
        ? Math.round(mentioned.reduce((s, e) => s + rankScore(e.rank, e.total ?? 5), 0) / mentionCount)
        : 0;
      const isLive = perPrompt.some((e) => e.live);

      // Engine score: 60% weighted mention rate + 40% rank quality (when mentioned).
      const score = Math.round(mentionRate * 0.6 + avgRankScore * 0.4);

      return { key, label, mentionCount, totalPrompts, mentionRate, avgRank, score, live: isLive };
    });

    // Overall score = average across engines (all count equally).
    const overallScore = Math.round(
      engineStats.reduce((s, e) => s + e.score, 0) / engineStats.length
    );

    // Impact: how many points are available if every missed query had a mention.
    const missedSlots = promptResults.reduce((s, pr) => {
      const missed = ENGINES.length - (pr.aggregate?.mentionedCount ?? 0);
      return s + missed;
    }, 0);
    const totalSlots = prompts.length * ENGINES.length;
    const missedFraction = totalSlots > 0 ? missedSlots / totalSlots : 0;
    const impact = Math.round(missedFraction * (100 - overallScore) * 0.8);

    // Reasons from real data.
    const reasons = [];
    engineStats.forEach((e) => {
      if (e.mentionRate === 0) {
        reasons.push(`Not found by ${e.label} in any of the ${e.totalPrompts} test queries`);
      } else if (e.mentionRate < 50) {
        reasons.push(`Only in ${e.mentionCount}/${e.totalPrompts} ${e.label} queries — missing from category searches`);
      } else if (e.avgRank && e.avgRank > 3) {
        reasons.push(`${e.label} ranks ${brand} at #${e.avgRank} — content depth could move it higher`);
      }
    });

    const neverMentioned = promptResults.filter((pr) => !pr.aggregate?.mentioned);
    if (neverMentioned.length > 0) {
      reasons.push(`No engine mentioned ${brand} for: "${neverMentioned[0].prompt}"`);
    }

    // Per-prompt summary for the UI.
    const promptSummaries = promptResults.map((pr) => ({
      prompt: pr.prompt,
      mentioned: pr.aggregate?.mentioned ?? false,
      mentionedCount: pr.aggregate?.mentionedCount ?? 0,
      engineCount: ENGINES.length,
      engines: ENGINES.map(({ key }) => {
        const eng = pr.engines?.find((e) => e.key === key);
        return {
          key,
          mentioned: eng?.mentioned ?? false,
          rank: eng?.rank ?? null,
          answer: eng?.answer ?? "",
        };
      }),
    }));

    return NextResponse.json({
      brand,
      score: Math.max(0, Math.min(100, overallScore)),
      impact: Math.max(0, Math.min(40, impact)),
      potential: Math.min(100, overallScore + Math.max(0, Math.min(40, impact))),
      engines: engineStats,
      prompts: promptSummaries,
      reasons: reasons.slice(0, 5),
      totalChecks: totalSlots,
      liveChecks: engineStats.filter((e) => e.live).length,
    });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Score calculation failed." }, { status: 502 });
  }
}
