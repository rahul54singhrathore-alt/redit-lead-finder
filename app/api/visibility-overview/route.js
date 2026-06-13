import { NextResponse } from "next/server";
import { checkVisibilityAcrossEngines, GroqError, ENGINES } from "../../../lib/engines";
import { getCachedResult, putCachedResult } from "../../../lib/visibility-guard";

// Real visibility overview: runs the brand through 3 natural AI queries across
// all configured engines and returns per-engine mention data including the
// actual AI answer text. No made-up scores — everything comes from real queries.

function buildPrompts(brand, category) {
  const cat = (category || "").trim();
  return [
    cat ? `Best ${cat} tools and software` : `Best AI and productivity tools`,
    `What is ${brand} and what do they offer?`,
    cat ? `Compare the top ${cat} platforms` : `Most recommended SaaS platforms compared`,
  ];
}

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

  try {
    const promptResults = await Promise.all(
      prompts.map(async (prompt) => {
        const cacheKey = `vis:${prompt}`;
        const cached = await getCachedResult(cacheKey, brand).catch(() => null);
        if (cached?.result) return { prompt, ...cached.result, fromCache: true };

        const { engines, aggregate } = await checkVisibilityAcrossEngines({ prompt, brand });
        const result = { prompt, engines, aggregate };
        await putCachedResult(cacheKey, brand, result).catch(() => null);
        return result;
      })
    );

    // Per-engine aggregation.
    const engineStats = ENGINES.map(({ key, label }) => {
      const perPrompt = promptResults.map((pr) =>
        pr.engines?.find((e) => e.key === key) ?? null
      ).filter(Boolean);

      const mentioned = perPrompt.filter((e) => e.mentioned);
      const mentionCount = mentioned.length;
      const mentionRate = perPrompt.length > 0 ? Math.round((mentionCount / perPrompt.length) * 100) : 0;
      const avgRank = mentionCount > 0
        ? Math.round(mentioned.reduce((s, e) => s + (e.rank ?? 1), 0) / mentionCount)
        : null;
      const avgRankScore = mentionCount > 0
        ? Math.round(mentioned.reduce((s, e) => s + rankScore(e.rank, e.total ?? 5), 0) / mentionCount)
        : 0;
      const score = Math.round(mentionRate * 0.6 + avgRankScore * 0.4);
      const isLive = perPrompt.some((e) => e.live);

      // Pick the best answer — from the prompt where we ranked highest.
      const bestResult = mentioned.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))[0];
      const answer = bestResult?.answer || "";

      // Best rank across prompts.
      const bestRank = mentionCount > 0 ? Math.min(...mentioned.map((e) => e.rank ?? 99)) : null;

      return {
        key,
        name: label,
        score,
        mentioned: mentionCount > 0,
        mentionCount,
        totalPrompts: perPrompt.length,
        mentionRate,
        rank: bestRank,
        avgRank,
        answer,
        live: isLive,
      };
    });

    const overall = Math.round(engineStats.reduce((s, e) => s + e.score, 0) / engineStats.length);
    const mentionedEngines = engineStats.filter((e) => e.mentioned);

    const promptSummaries = promptResults.map((pr) => ({
      prompt: pr.prompt,
      mentioned: pr.aggregate?.mentioned ?? false,
      mentionedCount: pr.aggregate?.mentionedCount ?? 0,
      engines: ENGINES.map(({ key, label }) => {
        const eng = pr.engines?.find((e) => e.key === key);
        return { key, name: label, mentioned: eng?.mentioned ?? false, rank: eng?.rank ?? null };
      }),
    }));

    return NextResponse.json({
      brand,
      overall,
      engines: engineStats,
      prompts: promptSummaries,
      mentionedCount: mentionedEngines.length,
      engineCount: ENGINES.length,
      bestRank: mentionedEngines.length > 0
        ? Math.min(...mentionedEngines.map((e) => e.rank ?? 99))
        : null,
      liveCount: engineStats.filter((e) => e.live).length,
      totalChecks: prompts.length * ENGINES.length,
    });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
