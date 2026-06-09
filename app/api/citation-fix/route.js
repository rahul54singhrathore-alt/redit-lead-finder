import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// Given one source the brand is NOT cited on (e.g. "Product Hunt", "Your Blog"),
// return a short, concrete step-by-step plan to get listed / cited there.
// Powers the "Fix it" button in the AI Citation Tracker.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand = String(body?.brand || "").trim();
  const source = String(body?.source || "").trim();
  const category = String(body?.category || "").trim();
  if (!brand || !source) {
    return NextResponse.json({ error: "brand and source are required." }, { status: 400 });
  }

  const categoryLine = category ? ` (a tool in the "${category}" space)` : "";

  try {
    const parsed = await groqJSON({
      maxTokens: 900,
      system:
        "You are a GEO/SEO growth advisor. Given a brand and ONE source website where it is not " +
        "yet cited or listed, give a short, concrete, do-able plan to get cited/listed there so " +
        "AI assistants start using it as a source. 3 to 5 steps, ordered easiest/highest-impact " +
        "first, each a specific task in 1 sentence. " +
        'Respond with ONLY a JSON object of the form {"steps": ["step 1", "step 2"]}.',
      user: `Brand: "${brand}"${categoryLine}. Source to get cited on: "${source}". Give the step-by-step plan.`,
    });

    const steps = Array.isArray(parsed.steps)
      ? parsed.steps.map((s) => String(s || "").trim()).filter(Boolean).slice(0, 5)
      : [];

    return NextResponse.json({ brand, source, steps });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
