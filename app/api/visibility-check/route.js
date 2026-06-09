import { NextResponse } from "next/server";
import { groqJSON, GroqError } from "../../../lib/groq";

// Real AI-visibility check: actually ask the model the user's prompt the way a
// buyer would, capture its genuine answer, and extract the ranked brands it
// recommends. The brand's real rank in that list IS its AI visibility.

function rankOf(brandsInOrder, brand) {
  const target = brand.trim().toLowerCase();
  const index = brandsInOrder.findIndex(
    (name) =>
      name.trim().toLowerCase().includes(target) || target.includes(name.trim().toLowerCase()),
  );
  return index === -1 ? null : index + 1;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prompt = String(body?.prompt || "").trim();
  const brand = String(body?.brand || "").trim();
  if (!prompt || !brand) {
    return NextResponse.json({ error: "prompt and brand are required." }, { status: 400 });
  }

  try {
    const parsed = await groqJSON({
      maxTokens: 1500,
      system:
        "You are a knowledgeable assistant that recommends real products/tools. " +
        "Answer honestly based on what you actually know — do not invent brands to be polite. " +
        "List the brands you would genuinely recommend, best first. " +
        'Respond with ONLY a JSON object of the form ' +
        '{"answer": "a natural recommendation answer", "brands_in_order": ["Brand A", "Brand B"]}.',
      user: prompt,
    });

    const brandsInOrder = Array.isArray(parsed.brands_in_order) ? parsed.brands_in_order : [];
    const rank = rankOf(brandsInOrder, brand);
    const total = brandsInOrder.length;
    // Score: #1 ≈ 95, scaling down by position; not mentioned = low.
    const score = rank ? Math.max(20, Math.round(100 - (rank - 1) * (60 / Math.max(total, 1)))) : 8;

    return NextResponse.json({
      engine: "Groq (Llama)",
      brand,
      prompt,
      mentioned: rank !== null,
      rank,
      total,
      score,
      brandsInOrder,
      answer: parsed.answer || "",
    });
  } catch (error) {
    if (error instanceof GroqError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
