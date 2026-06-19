import { NextResponse } from "next/server";
import { ENGINES } from "../../../lib/engines";
import { groqJSON } from "../../../lib/groq";
import Anthropic from "@anthropic-ai/sdk";

// Brand Audit — runs 5 direct branded questions across all engines, then
// checks each answer for accuracy against the user's brand description.
// Returns per-question, per-engine answers with an accuracy breakdown.

const BRAND_QUESTIONS = [
  { id: "what",   q: (b)       => `What is ${b} and what does it do?` },
  { id: "who",    q: (b)       => `Who is ${b} designed for? What kind of users or companies use it?` },
  { id: "pros",   q: (b)       => `What are the main strengths and advantages of ${b}?` },
  { id: "cons",   q: (b)       => `What are the main weaknesses or limitations of ${b}?` },
  { id: "vs",     q: (b, cat)  => `How does ${b} compare to other ${cat || "similar"} tools?` },
];

async function askEngine(engine, question) {
  const system =
    "You are a knowledgeable AI assistant. Answer the question honestly based on what you know about the product. " +
    "If you don't know the product, say so clearly. Keep your answer to 2-4 sentences. " +
    "Reply with ONLY a JSON object: {\"answer\": \"your answer here\", \"knows_product\": true/false}";

  const groqFallback = () =>
    groqJSON({
      system: `You are simulating how ${engine.label} would answer a question about a product. ${system}`,
      user: question,
      maxTokens: 400,
    });

  try {
    if (engine.key === "chatgpt" && process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          max_tokens: 400,
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: system }, { role: "user", content: question }],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}`);
      const d = await res.json();
      return parseAnswer(d?.choices?.[0]?.message?.content);
    }

    if (engine.key === "gemini" && (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)) {
      const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: 400 },
        }),
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const d = await res.json();
      return parseAnswer(d?.candidates?.[0]?.content?.parts?.[0]?.text);
    }

    if (engine.key === "claude" && process.env.ANTHROPIC_API_KEY) {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system,
        messages: [{ role: "user", content: question }],
      });
      return parseAnswer(msg.content.find((b) => b.type === "text")?.text || "");
    }

    if (engine.key === "perplexity" && process.env.PERPLEXITY_API_KEY) {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` },
        body: JSON.stringify({
          model: process.env.PERPLEXITY_MODEL || "sonar",
          max_tokens: 400,
          messages: [{ role: "system", content: system }, { role: "user", content: question }],
        }),
      });
      if (!res.ok) throw new Error(`Perplexity ${res.status}`);
      const d = await res.json();
      return parseAnswer(d?.choices?.[0]?.message?.content);
    }

    if (engine.key === "grok" && process.env.XAI_API_KEY) {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.XAI_API_KEY}` },
        body: JSON.stringify({
          model: process.env.GROK_MODEL || "grok-3-mini",
          max_tokens: 400,
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: system }, { role: "user", content: question }],
        }),
      });
      if (!res.ok) throw new Error(`Grok ${res.status}`);
      const d = await res.json();
      return parseAnswer(d?.choices?.[0]?.message?.content);
    }

    return groqFallback().then((r) => ({ answer: r.answer || "", knows_product: !!r.knows_product, simulated: true }));
  } catch {
    try {
      const r = await groqFallback();
      return { answer: r.answer || "", knows_product: !!r.knows_product, simulated: true };
    } catch {
      return { answer: "", knows_product: false, simulated: true, error: true };
    }
  }
}

function parseAnswer(raw) {
  if (!raw) return { answer: "", knows_product: false };
  const text = String(raw).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  try {
    const parsed = JSON.parse(start !== -1 && end !== -1 ? text.slice(start, end + 1) : text);
    return { answer: String(parsed.answer || ""), knows_product: !!parsed.knows_product };
  } catch {
    return { answer: text, knows_product: true };
  }
}

async function checkAccuracy(brand, description, question, answer) {
  if (!answer || !description) return null;

  const system =
    "You are a brand accuracy analyst. Compare an AI engine's answer about a product against the real brand description. " +
    'Return ONLY JSON: {"score": 0-100, "verdict": "accurate"|"partial"|"inaccurate"|"unknown", "correct": ["things it got right"], "issues": ["specific inaccuracies or missing facts"], "summary": "one sentence"}';

  const user = `Brand: ${brand}
Real description: ${description}
Question asked: ${question}
AI's answer: ${answer}

Rate accuracy 0-100. List what the AI got right and what is wrong, missing, or outdated.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: user }],
    });
    const text = msg.content.find((b) => b.type === "text")?.text || "";
    const raw = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
    const parsed = JSON.parse(start !== -1 && end !== -1 ? raw.slice(start, end + 1) : raw);
    return {
      score:   typeof parsed.score === "number" ? Math.min(100, Math.max(0, parsed.score)) : null,
      verdict: parsed.verdict || "unknown",
      correct: Array.isArray(parsed.correct) ? parsed.correct.slice(0, 4) : [],
      issues:  Array.isArray(parsed.issues)  ? parsed.issues.slice(0, 4)  : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    };
  } catch {
    try {
      const r = await groqJSON({ system, user, maxTokens: 500 });
      return {
        score:   typeof r.score === "number" ? r.score : null,
        verdict: r.verdict || "unknown",
        correct: Array.isArray(r.correct) ? r.correct.slice(0, 4) : [],
        issues:  Array.isArray(r.issues)  ? r.issues.slice(0, 4)  : [],
        summary: r.summary || "",
      };
    } catch {
      return null;
    }
  }
}

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const brand       = String(body?.brand       || "").trim();
  const description = String(body?.description || "").trim();
  const category    = String(body?.category    || "").trim();

  if (!brand) return NextResponse.json({ error: "brand is required." }, { status: 400 });

  const results = await Promise.all(
    BRAND_QUESTIONS.map(async ({ id, q }) => {
      const question = q(brand, category);

      // Ask all engines in parallel
      const engineAnswers = await Promise.all(
        ENGINES.map(async (engine) => {
          const { answer, knows_product, simulated, error } = await askEngine(engine, question);
          return { key: engine.key, label: engine.label, answer, knows_product, simulated: !!simulated, error: !!error };
        })
      );

      // Accuracy check (only if we have a description and at least one real answer)
      const accuracyChecks = description
        ? await Promise.all(
            engineAnswers.map(async (e) => {
              if (!e.answer || e.error) return { ...e, accuracy: null };
              const accuracy = await checkAccuracy(brand, description, question, e.answer);
              return { ...e, accuracy };
            })
          )
        : engineAnswers.map((e) => ({ ...e, accuracy: null }));

      const overallScore = accuracyChecks
        .filter((e) => e.accuracy?.score != null)
        .reduce((sum, e, _, arr) => sum + e.accuracy.score / arr.length, 0);

      return {
        id,
        question,
        engines: accuracyChecks,
        overallAccuracy: accuracyChecks.some((e) => e.accuracy?.score != null)
          ? Math.round(overallScore)
          : null,
      };
    })
  );

  const avgAccuracy = results
    .filter((r) => r.overallAccuracy != null)
    .reduce((sum, r, _, arr) => sum + r.overallAccuracy / arr.length, 0);

  return NextResponse.json({
    brand,
    narrativeScore: results.some((r) => r.overallAccuracy != null) ? Math.round(avgAccuracy) : null,
    questions: results,
  });
}
