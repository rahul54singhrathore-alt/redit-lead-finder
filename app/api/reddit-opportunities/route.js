import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// Reddit Opportunity Engine: AI models lean heavily on Reddit as a source, so a
// helpful reply on the right thread can earn the brand an AI citation. Given the
// brand + category, surface realistic Reddit threads worth replying to — scored
// by opportunity, with AI-citation potential and a ready-to-post reply draft.

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
      maxTokens: 2800,
      system:
        "You are a Reddit growth strategist. AI assistants cite Reddit heavily, so a genuinely " +
        "helpful reply on a relevant thread can earn a brand an AI citation. Generate realistic, " +
        "buyer-intent Reddit threads where the brand could add value. For each: the subreddit, a " +
        "realistic post title (a real question a buyer would ask), a `score` 1-10 for how strong " +
        "the opportunity is, `citation` potential as \"High\"|\"Medium\"|\"Low\", and a `draft` — a " +
        "genuinely helpful, non-spammy reply (2-4 sentences) that answers the question and mentions " +
        "the brand naturally alongside real options, NOT as an ad. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"opportunities": [{"post":"...","subreddit":"r/SEO","score":9,"citation":"High","draft":"..."}]}.',
      user:
        `Brand: "${brand}"${categoryLine}. Give 6 Reddit threads worth replying to, best opportunities ` +
        `first, each with a ready-to-post reply draft that naturally works "${brand}" in.`,
    });

    const allowed = new Set(["High", "Medium", "Low"]);
    const opportunities = Array.isArray(parsed.opportunities)
      ? parsed.opportunities
          .map((o) => {
            const citation = String(o?.citation || "").trim();
            return {
              post: String(o?.post || "").trim(),
              subreddit: String(o?.subreddit || "").trim(),
              score: Math.max(1, Math.min(10, Math.round(Number(o?.score) || 1))),
              citation: allowed.has(citation) ? citation : "Medium",
              draft: String(o?.draft || "").trim(),
            };
          })
          .filter((o) => o.post)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
      : [];

    return NextResponse.json({ brand, opportunities });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
