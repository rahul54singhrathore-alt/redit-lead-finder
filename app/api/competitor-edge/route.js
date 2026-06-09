import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// "Why Competitor Wins": instead of just showing that a competitor is mentioned
// more, explain WHY. Asks the model to estimate the visibility gap (mentions)
// and the concrete reasons behind it — backlinks, directory listings, community
// mentions, comparison pages. Numbers are informed AI estimates, not live data.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand = String(body?.brand || "").trim();
  const competitor = String(body?.competitor || "").trim();
  const category = String(body?.category || "").trim();
  if (!brand || !competitor) {
    return NextResponse.json({ error: "brand and competitor are required." }, { status: 400 });
  }

  const categoryLine = category ? ` in the "${category}" space` : "";

  try {
    const parsed = await groqJSON({
      maxTokens: 1200,
      system:
        "You are a GEO/SEO competitive analyst. Estimate why one brand gets recommended by AI " +
        "and search engines more than another, based on what you know about their market " +
        "presence. Give realistic, informed ESTIMATES — not exact data. Each reason must be " +
        "concrete and quantified where possible, phrased like the examples: " +
        '"45 more backlinks", "Listed on G2 and Capterra", "Mentioned on Reddit ~220 times", ' +
        '"Appears on 18 comparison pages". Give 4 to 6 reasons. Then give 3 to 5 `actions`: ' +
        "specific, do-able next steps OUR brand should take to close each gap, ordered easiest/" +
        'highest-impact first, phrased as clear tasks like "Get listed on G2 and Capterra this month", ' +
        '"Answer 10 relevant r/SEO threads", "Publish a \\"vs ' + competitor + '\\" comparison page". ' +
        'Respond with ONLY a JSON object of the form ' +
        '{"competitor_mentions": number, "your_mentions": number, "reasons": ["..."], "actions": ["..."]}.',
      user:
        `Competitor brand: "${competitor}". Our brand: "${brand}"${categoryLine}.\n` +
        `Estimate how many times each is mentioned/recommended across AI answers, review sites, ` +
        `and communities (competitor_mentions vs your_mentions — competitor should be higher if it ` +
        `is the stronger brand). List the concrete reasons "${competitor}" wins, then give a clear, ` +
        `prioritized action plan "${brand}" can follow to catch up.`,
    });

    const competitorMentions = Math.max(0, Math.round(Number(parsed.competitor_mentions) || 0));
    const yourMentions = Math.max(0, Math.round(Number(parsed.your_mentions) || 0));
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.map((r) => String(r || "").trim()).filter(Boolean).slice(0, 6)
      : [];
    const actions = Array.isArray(parsed.actions)
      ? parsed.actions.map((a) => String(a || "").trim()).filter(Boolean).slice(0, 5)
      : [];

    return NextResponse.json({
      brand,
      competitor,
      competitorMentions,
      yourMentions,
      reasons,
      actions,
    });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
