import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// Visibility overview: an at-a-glance estimate of how visible the brand is across
// the major AI engines, its share of voice, mentions, citations, and 30-day
// trend. Estimates, not live-measured metrics from each engine.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand = String(body?.brand || "").trim();
  const category = String(body?.category || "").trim();
  if (!brand) {
    return NextResponse.json({ error: "brand is required." }, { status: 400 });
  }

  const categoryLine = category ? ` in the "${category}" space` : "";

  try {
    const parsed = await groqJSON({
      maxTokens: 900,
      system:
        "You are a GEO analyst. Estimate how visible a brand is across the major AI assistants. " +
        "Return per-engine visibility scores 0-100 for ChatGPT, Gemini, Claude, and Perplexity " +
        "(`engines`), an `overall` 0-100, `share_of_voice` as a percent 0-100 (its slice of AI " +
        "mentions vs competitors), estimated `mentions` and `citations` counts, and `trend` as the " +
        "percent change in visibility over the last 30 days (can be negative). Be realistic — niche " +
        "brands usually sit 40-80 and single-digit to ~25% share of voice. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"engines":[{"name":"ChatGPT","score":85},{"name":"Gemini","score":64},{"name":"Claude","score":58},{"name":"Perplexity","score":79}],' +
        '"overall":72,"share_of_voice":18,"mentions":127,"citations":43,"trend":12}.',
      user: `Brand: "${brand}"${categoryLine}. Estimate its AI visibility metrics.`,
    });

    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));
    const order = ["ChatGPT", "Gemini", "Claude", "Perplexity"];
    const byName = new Map(
      (Array.isArray(parsed.engines) ? parsed.engines : []).map((e) => [
        String(e?.name || "").trim(),
        clamp(e?.score, 0, 100),
      ]),
    );
    const engines = order.map((name) => ({ name, score: byName.get(name) ?? 0 }));

    return NextResponse.json({
      brand,
      overall: clamp(parsed.overall, 0, 100),
      engines,
      shareOfVoice: clamp(parsed.share_of_voice, 0, 100),
      mentions: Math.max(0, Math.round(Number(parsed.mentions) || 0)),
      citations: Math.max(0, Math.round(Number(parsed.citations) || 0)),
      trend: Math.round(Number(parsed.trend) || 0),
    });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
