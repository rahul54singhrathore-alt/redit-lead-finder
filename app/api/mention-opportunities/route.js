import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// AI Mention Opportunities: in ONE call, generate realistic buyer-intent prompts
// for the brand's category and, for each, have the model honestly say whether it
// would recommend this brand. The prompts where it would NOT are the brand's
// direct, actionable visibility gaps ("missing in 73 of 100 prompts").

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand = String(body?.brand || "").trim();
  const category = String(body?.category || "").trim();
  // Clamp count to keep one call fast and within token limits.
  const count = Math.min(30, Math.max(5, Number(body?.count) || 18));
  if (!brand) {
    return NextResponse.json({ error: "brand is required." }, { status: 400 });
  }

  const categoryLine = category
    ? `The brand operates in this category: "${category}".`
    : `Infer the brand's category from its name.`;

  try {
    const parsed = await groqJSON({
      maxTokens: 3500,
      system:
        "You simulate how AI assistants answer buyer-intent questions. Be honest and " +
        "realistic — most niche brands are NOT recommended for most prompts, so do not " +
        "inflate `mentioned`. Set mentioned=true only when you would genuinely include " +
        "the given brand in your recommendations for that prompt. For each prompt also give " +
        "a `fix`: one short, concrete action (max ~15 words) the brand could take to get " +
        "recommended by AI for that prompt — e.g. publish a comparison page, get listed on a " +
        "top review/listicle, earn Reddit/Quora mentions, add a use-case landing page. Make the " +
        "fix specific to that prompt, not generic. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"prompts": [{"prompt": "best X for Y", "mentioned": true|false, "top_brands": ["A","B"], "fix": "one concrete action"}]}.',
      user:
        `Brand: "${brand}". ${categoryLine}\n\n` +
        `Generate ${count} distinct, realistic high-intent prompts that potential buyers ` +
        `would ask an AI assistant in this space (e.g. "best SEO tool for startups", ` +
        `"best influencer marketplace", "best AI nutrition app"). For each prompt, list the ` +
        `brands you would actually recommend (top_brands, best first), set "mentioned" to ` +
        `true only if you would genuinely recommend "${brand}", and give a "fix" — a specific ` +
        `action "${brand}" could take to get recommended for that exact prompt.`,
    });

    if (!Array.isArray(parsed.prompts)) {
      return NextResponse.json({ error: "Could not parse the AI response." }, { status: 502 });
    }

    const prompts = parsed.prompts
      .map((item) => ({
        prompt: String(item?.prompt || "").trim(),
        mentioned: Boolean(item?.mentioned),
        topBrands: Array.isArray(item?.top_brands) ? item.top_brands : [],
        fix: String(item?.fix || "").trim(),
      }))
      .filter((item) => item.prompt);

    const total = prompts.length;
    const present = prompts.filter((p) => p.mentioned);
    const missing = prompts.filter((p) => !p.mentioned);

    return NextResponse.json({
      brand,
      total,
      mentionedCount: present.length,
      missingCount: missing.length,
      missing,
      present,
    });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
