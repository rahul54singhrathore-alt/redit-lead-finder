import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

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
      maxTokens: 1800,
      system:
        "You are a GEO/AEO (generative engine optimization) strategist. Given a brand, produce a " +
        "prioritized roadmap of concrete tasks that will increase how often AI assistants recommend " +
        "and cite it. Return 8 to 10 tasks ordered highest-impact first. " +
        "Each task must have: " +
        '"task" (short imperative phrase like "Get listed on G2" — max 8 words), ' +
        '"why" (one sentence explaining why this moves the GEO score — be specific), ' +
        '"effort" (one of: "quick", "medium", "high"), ' +
        '"category" (one of: "Content", "Citations", "Presence", "Technical"), ' +
        '"points" (integer 1-8 for estimated GEO point gain). ' +
        'Respond with ONLY a JSON object: {"tasks": [...]}.',
      user:
        `Brand: "${brand}"${categoryLine}.${scoreLine} ` +
        `Generate the GEO roadmap — specific tasks ranked by AI visibility impact.`,
    });

    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks
          .map((t) => ({
            task: String(t?.task || "").trim(),
            why: String(t?.why || "").trim(),
            effort: ["quick", "medium", "high"].includes(t?.effort) ? t.effort : "medium",
            category: ["Content", "Citations", "Presence", "Technical"].includes(t?.category)
              ? t.category
              : "Content",
            points: Math.max(1, Math.min(8, Math.round(Number(t?.points) || 1))),
          }))
          .filter((t) => t.task)
          .slice(0, 10)
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
