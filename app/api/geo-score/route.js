import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// GEO Score: estimate how visible the brand is to AI assistants today (0-100),
// the concrete reasons it isn't higher, and the score it could reach if those
// gaps are fixed. Estimates, not live-crawled metrics.

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
      maxTokens: 1000,
      system:
        "You are a GEO (generative engine optimization) analyst. Estimate how visible a brand is " +
        "to AI assistants today as a `score` from 0-100 (how often AI would recommend/cite it). " +
        "Be realistic — niche brands usually score 40-70. Give 3-5 concrete `reasons` it is not " +
        "higher, quantified where possible and phrased like \"Not listed on G2\", " +
        "\"Only ~3 Reddit mentions\", \"No comparison pages\". Give `impact` = the estimated number " +
        "of points the score would rise if those gaps were fixed. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"score": 62, "reasons": ["...","..."], "impact": 14}.',
      user:
        `Brand: "${brand}"${categoryLine}. Estimate its current GEO score, the reasons it is missing ` +
        `from AI answers, and how many points it could gain by fixing them.`,
    });

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.map((r) => String(r || "").trim()).filter(Boolean).slice(0, 6)
      : [];
    // Cap the projected score at 100.
    const impact = Math.max(0, Math.min(100 - score, Math.round(Number(parsed.impact) || 0)));

    return NextResponse.json({ brand, score, reasons, impact, potential: score + impact });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
