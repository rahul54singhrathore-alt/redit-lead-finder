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

function rateLimitHeaders(rate) {
  return {
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
  };
}
