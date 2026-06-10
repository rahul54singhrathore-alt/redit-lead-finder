import { NextResponse } from "next/server";

import { checkVisibilityAcrossEngines, GroqError } from "../../../lib/engines";

// Real multi-engine AI-visibility check: ask ChatGPT, Gemini, Claude, and
// Perplexity the user's prompt the way a buyer would, capture each genuine
// answer, and extract the brand's real rank per engine. Engines without their
// own API key fall back to Groq (clearly flagged), so the check always returns.
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

  try {
    const { engines, aggregate } = await checkVisibilityAcrossEngines({ prompt, brand });

    if (engines.every((e) => e.error)) {
      return NextResponse.json(
        { error: "No AI engine could be reached. Check your API keys." },
        { status: 502 },
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
