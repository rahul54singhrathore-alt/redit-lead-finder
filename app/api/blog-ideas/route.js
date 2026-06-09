import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// Generates distinct, specific SEO/GEO blog ideas for a niche — real, varied
// titles (not a repetitive template), each with a focus line and an estimated
// competition + buyer-intent rating.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const niche = String(body?.niche || "").trim();
  const count = Math.min(24, Math.max(6, Number(body?.count) || 18));
  if (!niche) {
    return NextResponse.json({ error: "niche is required." }, { status: 400 });
  }

  try {
    const parsed = await groqJSON({
      maxTokens: 2800,
      system:
        "You are an SEO/GEO content strategist. Generate DISTINCT, specific, non-repetitive blog " +
        "post ideas for a niche — vary the angle, format, and audience across ideas (how-tos, " +
        "comparisons, listicles, data studies, mistakes, case studies, templates, trends). Each " +
        "idea has a compelling `title`, a short `focus` (one line on the angle/audience), a " +
        "`competition` rating (\"Low\"|\"Medium\"|\"High\") and an `intent` rating " +
        "(\"High\"|\"Medium\"|\"Low\"). Prioritise low-competition, high-intent ideas first. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"ideas":[{"title":"...","focus":"...","competition":"Low","intent":"High"}]}.',
      user: `Niche: "${niche}". Generate ${count} distinct, specific blog ideas.`,
    });

    const compSet = new Set(["Low", "Medium", "High"]);
    const ideas = Array.isArray(parsed.ideas)
      ? parsed.ideas
          .map((i) => {
            const competition = String(i?.competition || "").trim();
            const intent = String(i?.intent || "").trim();
            return {
              title: String(i?.title || "").trim(),
              focus: String(i?.focus || "").trim(),
              competition: compSet.has(competition) ? competition : "Medium",
              intent: compSet.has(intent) ? intent : "Medium",
            };
          })
          .filter((i) => i.title)
          .slice(0, count)
      : [];

    return NextResponse.json({ niche, ideas });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
