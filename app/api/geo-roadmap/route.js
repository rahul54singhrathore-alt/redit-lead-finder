import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// GEO Tasks (Auto Roadmap): instead of just a score, generate a prioritized,
// checkable to-do list that moves the brand's AI visibility (GEO) up by a
// concrete number of points. Each task carries its own estimated point gain.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand = String(body?.brand || "").trim();
  const category = String(body?.category || "").trim();
  const currentScore = Number(body?.currentScore);
  if (!brand) {
    return NextResponse.json({ error: "brand is required." }, { status: 400 });
  }

  const categoryLine = category ? ` in the "${category}" space` : "";
  const scoreLine = Number.isFinite(currentScore)
    ? ` Its current GEO score is about ${currentScore}/100.`
    : "";

  try {
    const parsed = await groqJSON({
      maxTokens: 1200,
      system:
        "You are a GEO/AEO (generative engine optimization) strategist. Given a brand, produce a " +
        "prioritized roadmap of concrete tasks that will increase how often AI assistants " +
        "recommend and cite it (its GEO score). 4 to 6 tasks, ordered easiest/highest-impact " +
        "first. Each task is one short imperative phrase like \"Get listed on G2\", \"Create a " +
        "comparison page\", \"Answer 10 Reddit threads\", \"Publish 5 authority blogs\", with an " +
        "integer `points` (1-6) for its estimated GEO point gain. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"tasks": [{"task": "Get listed on G2", "points": 4}]}.',
      user:
        `Brand: "${brand}"${categoryLine}.${scoreLine} ` +
        `Give the GEO roadmap — the specific tasks that would raise its AI visibility the most.`,
    });

    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks
          .map((t) => ({
            task: String(t?.task || "").trim(),
            points: Math.max(1, Math.min(10, Math.round(Number(t?.points) || 1))),
          }))
          .filter((t) => t.task)
          .slice(0, 6)
      : [];

    const totalGain = tasks.reduce((sum, t) => sum + t.points, 0);

    return NextResponse.json({ brand, totalGain, tasks });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
