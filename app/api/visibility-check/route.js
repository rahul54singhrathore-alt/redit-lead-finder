import { NextResponse } from "next/server";

import { checkVisibilityAcrossEngines, GroqError } from "../../../lib/engines";
import {
  checkRateLimit,
  clientIdentifier,
  getCachedResult,
  putCachedResult,
} from "../../../lib/visibility-guard";

// Real multi-engine AI-visibility check: ask ChatGPT, Gemini, Claude, and
// Perplexity the user's prompt the way a buyer would, capture each genuine
// answer, and extract the brand's real rank per engine. Engines without their
// own API key fall back to Groq (clearly flagged), so the check always returns.
//
// Guarded by a Supabase-backed cache (identical prompt+brand reuses a fresh
// result instead of paying for 4 provider calls) and a per-client rate limit.
//
// Response stays backward-compatible: top-level fields carry the aggregate
// (best rank across engines, average score), and `engines` carries the
// per-engine breakdown for the UI.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prompt = String(body?.prompt || "").trim();
  const brand = String(body?.brand || "").trim();
  if (!prompt || !brand) {
    return NextResponse.json({ error: "prompt and brand are required." }, { status: 400 });
  }

  // Rate limit per client before doing any expensive work.
  const rate = await checkRateLimit(clientIdentifier(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many checks. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  // Serve a fresh cached result if we have one.
  const cached = await getCachedResult(prompt, brand);
  if (cached) {
    return NextResponse.json(
      { ...cached.result, cached: true, cachedAt: cached.cachedAt },
      { headers: rateLimitHeaders(rate) },
    );
  }

  try {
    const { engines, aggregate } = await checkVisibilityAcrossEngines({ prompt, brand });

    if (engines.every((e) => e.error)) {
      return NextResponse.json(
        { error: "No AI engine could be reached. Check your API keys." },
        { status: 502 },
      );
    }

    const recommendations = buildRecommendations(brand, engines, aggregate);

    const payload = {
      engine: "Multi-engine",
      brand,
      prompt,
      mentioned: aggregate.mentioned,
      rank: aggregate.rank,
      total: aggregate.total,
      score: aggregate.score,
      mentionedCount: aggregate.mentionedCount,
      engineCount: aggregate.engineCount,
      liveCount: aggregate.liveCount,
      engines,
      recommendations,
    };

    // Cache the fresh result (best-effort).
    await putCachedResult(prompt, brand, payload);

    return NextResponse.json(
      { ...payload, cached: false },
      { headers: rateLimitHeaders(rate) },
    );
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}

function buildRecommendations(brand, engines, aggregate) {
  const recs = [];
  const missed = engines.filter((e) => !e.mentioned && !e.error).map((e) => e.label);
  const hitting = engines.filter((e) => e.mentioned && !e.error);
  const avgRank = hitting.length
    ? Math.round(hitting.reduce((s, e) => s + (e.rank || 5), 0) / hitting.length)
    : null;

  if (aggregate.mentionedCount === 0) {
    recs.push({
      priority: "High",
      title: "Build your AI citation base",
      detail: `${brand} is not appearing in any AI engine for this prompt. Create or claim profiles on G2, Capterra, Product Hunt, and Trustpilot — these are the top sources AI engines pull from.`,
    });
    recs.push({
      priority: "High",
      title: "Add a comparison page",
      detail: `Write a page titled "${brand} vs [Top Competitor]" on your site. AI engines rank brands that appear on direct-comparison pages higher in recommendation prompts.`,
    });
    recs.push({
      priority: "Medium",
      title: "Get Reddit & Quora mentions",
      detail: `Answer questions about your category on Reddit and Quora mentioning ${brand}. Perplexity and ChatGPT heavily weight these community sources.`,
    });
  } else if (missed.length > 0) {
    recs.push({
      priority: "High",
      title: `Fix visibility on ${missed.join(" & ")}`,
      detail: `${brand} is missing from ${missed.join(", ")}. These engines rely on different citation sources — get listed on ${missed.includes("Gemini") ? "Google Business Profile and Wikipedia" : "Reddit, G2, and comparison sites"} to appear there.`,
    });
    if (avgRank && avgRank > 2) {
      recs.push({
        priority: "Medium",
        title: `Move from rank #${avgRank} to #1`,
        detail: `You're appearing but not at the top. Add an FAQ schema to your homepage, build 3–5 more third-party reviews, and create a "[Category] tools" comparison page.`,
      });
    }
    recs.push({
      priority: "Medium",
      title: "Strengthen entity coverage",
      detail: `Add a clear "What is ${brand}?" section to your site with structured data. AI engines surface brands with strong entity definitions more consistently.`,
    });
  } else {
    if (avgRank && avgRank > 1) {
      recs.push({
        priority: "Medium",
        title: `Push from rank #${avgRank} to #1`,
        detail: `${brand} appears on all engines but isn't leading. Outrank competitors by getting more review citations, adding author bios, and building comparison content.`,
      });
    }
    recs.push({
      priority: "Low",
      title: "Monitor for drift",
      detail: `Your visibility looks solid for this prompt. Set up daily monitoring to catch ranking drops before they compound — AI engine rankings shift as new content is indexed.`,
    });
    recs.push({
      priority: "Medium",
      title: "Expand to more prompts",
      detail: `You're visible here but buyers use many different prompts. Track "${brand} pricing", "best ${brand} alternatives", and category prompts to get the full picture.`,
    });
  }

  return recs;
}

function rateLimitHeaders(rate) {
  return {
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
  };
}
