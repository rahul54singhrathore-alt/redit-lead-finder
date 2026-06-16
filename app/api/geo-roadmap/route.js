import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { groqJSON, GroqError } from "../../../lib/groq";

function buildContext({ brand, category, productUrl, competitors, scanHistory, currentScore }) {
  const lines = [];

  if (category) lines.push(`Industry/category: ${category}`);
  if (productUrl) lines.push(`Website: ${productUrl}`);
  if (competitors?.length) lines.push(`Known competitors: ${competitors.join(", ")}`);
  if (Number.isFinite(currentScore) && currentScore > 0)
    lines.push(`Current GEO score: ${currentScore}/100`);

  if (Array.isArray(scanHistory) && scanHistory.length > 0) {
    const missed = scanHistory.filter((s) => !s.mentioned).map((s) => s.prompt);
    const found  = scanHistory.filter((s) =>  s.mentioned).map((s) => `"${s.prompt}" (rank #${s.rank})`);

    if (missed.length)
      lines.push(`Prompts where ${brand} was NOT mentioned: ${missed.map(p => `"${p}"`).join(", ")}`);
    if (found.length)
      lines.push(`Prompts where ${brand} WAS mentioned: ${found.join(", ")}`);

    const avgScore = Math.round(
      scanHistory.reduce((s, r) => s + (r.score || 0), 0) / scanHistory.length
    );
    lines.push(`Average visibility score across scanned prompts: ${avgScore}/100`);
  } else {
    lines.push(`No scan data yet — brand has zero AI engine visibility`);
  }

  return lines.join("\n");
}

async function runWithClaude({ brand, context }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system:
      "You are an expert in Generative Engine Optimization (GEO) — helping brands appear in ChatGPT, Gemini, Claude, and Perplexity answers. " +
      "Given a brand's real scan data, produce a prioritized roadmap of 8–10 SPECIFIC, ACTIONABLE tasks. " +
      "Tasks must be concrete and tailored to this exact brand — not generic advice. " +
      "Reference the actual missed prompts, competitor gaps, and score to justify each task. " +
      "Each task must have: " +
      '"task" (short imperative, max 9 words, specific to this brand), ' +
      '"why" (one sentence — reference the actual scan data, e.g. which engine missed them or which prompt failed), ' +
      '"effort" ("quick", "medium", or "high"), ' +
      '"category" ("Content", "Citations", "Presence", or "Technical"), ' +
      '"points" (integer 1–8, estimated GEO score gain). ' +
      "Return ONLY valid JSON: {\"tasks\": [...]}",
    messages: [
      {
        role: "user",
        content:
          `Brand: "${brand}"\n\nReal visibility data:\n${context}\n\n` +
          `Generate a specific GEO roadmap for ${brand} based on the actual scan results above. ` +
          `Tasks should directly address why AI engines are not recommending ${brand} for the missed prompts.`,
      },
    ],
  });

  const text = response.content[0]?.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in Claude response");
  return JSON.parse(match[0]);
}

async function runWithGroq({ brand, category, context, currentScore }) {
  const categoryLine = category ? ` in the "${category}" space` : "";
  const scoreLine = Number.isFinite(currentScore) && currentScore > 0
    ? ` Current GEO score: ${currentScore}/100.` : "";

  return groqJSON({
    maxTokens: 2000,
    system:
      "You are a GEO/AEO strategist. Given a brand's real scan data, produce 8–10 SPECIFIC, ACTIONABLE tasks. " +
      "Reference actual missed prompts and engine gaps — do not give generic advice. " +
      'Each task: "task" (max 9 words), "why" (reference actual scan data), ' +
      '"effort" ("quick"/"medium"/"high"), "category" ("Content"/"Citations"/"Presence"/"Technical"), ' +
      '"points" (1–8). Return ONLY JSON: {"tasks": [...]}',
    user:
      `Brand: "${brand}"${categoryLine}.${scoreLine}\n\nReal visibility data:\n${context}\n\n` +
      `Generate a specific GEO roadmap based on the actual data above.`,
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brand       = String(body?.brand || "").trim();
  const category    = String(body?.category || "").trim();
  const currentScore = Number(body?.currentScore);
  const productUrl  = String(body?.productUrl || "").trim();
  const competitors = Array.isArray(body?.competitors) ? body.competitors : [];
  const scanHistory = Array.isArray(body?.scanHistory) ? body.scanHistory : [];

  if (!brand) {
    return NextResponse.json({ error: "brand is required." }, { status: 400 });
  }

  const context = buildContext({ brand, category, productUrl, competitors, scanHistory, currentScore });

  try {
    let parsed;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        parsed = await runWithClaude({ brand, context });
      } catch (claudeErr) {
        console.warn("Claude failed, falling back to Groq:", claudeErr.message);
        parsed = await runWithGroq({ brand, category, context, currentScore });
      }
    } else {
      parsed = await runWithGroq({ brand, category, context, currentScore });
    }

    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks
          .map((t) => ({
            task:     String(t?.task || "").trim(),
            why:      String(t?.why  || "").trim(),
            effort:   ["quick", "medium", "high"].includes(t?.effort) ? t.effort : "medium",
            category: ["Content", "Citations", "Presence", "Technical"].includes(t?.category)
              ? t.category : "Content",
            points:   Math.max(1, Math.min(8, Math.round(Number(t?.points) || 1))),
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
    console.error("GEO roadmap error:", error);
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
