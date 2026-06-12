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
      maxTokens: 3600,
      system:
        "You are a Reddit growth strategist. AI assistants cite Reddit heavily, so a genuinely " +
        "helpful reply on a relevant thread can earn a brand an AI citation. Generate realistic, " +
        "buyer-intent Reddit threads where the brand could add value. For each thread return: " +
        "the `subreddit` (specific, e.g. r/SaaS — not generic), a realistic `post` title (the exact " +
        "question a real buyer would ask), `type` as one of \"Question\"|\"Recommendation\"|\"Comparison\"|\"Complaint\", " +
        "a `score` 1-10 for opportunity strength, `citation` potential as \"High\"|\"Medium\"|\"Low\", " +
        "and a `draft` — a genuinely helpful, non-spammy reply (2-4 sentences) that answers the question " +
        "and mentions the brand naturally alongside real alternatives, NOT as an ad. " +
        'Respond with ONLY a JSON object: ' +
        '{"opportunities": [{"post":"...","subreddit":"r/SaaS","type":"Recommendation","score":9,"citation":"High","draft":"..."}]}.',
      user:
        `Brand: "${brand}"${categoryLine}. Give 8 Reddit threads worth replying to, best opportunities ` +
        `first, each with a ready-to-post reply draft that naturally works "${brand}" in.`,
    });

    const allowedCitation = new Set(["High", "Medium", "Low"]);
    const allowedType = new Set(["Question", "Recommendation", "Comparison", "Complaint"]);
    const opportunities = Array.isArray(parsed.opportunities)
      ? parsed.opportunities
          .map((o) => {
            const citation = String(o?.citation || "").trim();
            const type = String(o?.type || "").trim();
            return {
              post: String(o?.post || "").trim(),
              subreddit: String(o?.subreddit || "").trim(),
              type: allowedType.has(type) ? type : "Question",
              score: Math.max(1, Math.min(10, Math.round(Number(o?.score) || 1))),
              citation: allowedCitation.has(citation) ? citation : "Medium",
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
