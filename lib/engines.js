// Real multi-engine AI-visibility layer.
//
// For a given buyer prompt we ask each AI engine the question the way a real
// user would, capture its genuine answer, and extract the ranked brands it
// recommends. The brand's position in that list IS its visibility on that
// engine.
//
// Each engine calls its OWN provider API when that provider's key is present.
// When a key is missing we fall back to Groq (Llama) so the product still
// works end-to-end, but the result is clearly flagged `live: false` and the
// backend is labelled — we never pass a Groq answer off as a real ChatGPT/
// Gemini/Claude/Perplexity answer.
//
// Add keys to .env.local to make an engine genuinely live:
//   OPENAI_API_KEY      -> ChatGPT      (default model gpt-4o-mini)
//   GEMINI_API_KEY      -> Gemini       (default model gemini-2.0-flash)
//   ANTHROPIC_API_KEY   -> Claude       (default model claude-haiku-4-5)
//   PERPLEXITY_API_KEY  -> Perplexity   (default model sonar)

import Anthropic from "@anthropic-ai/sdk";

import { groqJSON, hasGroqKey, GroqError } from "./groq";

// The four engines the product tracks, in display order.
export const ENGINES = [
  { key: "chatgpt", label: "ChatGPT", provider: "OpenAI", envVar: "OPENAI_API_KEY" },
  { key: "gemini", label: "Gemini", provider: "Google", envVar: "GEMINI_API_KEY" },
  { key: "claude", label: "Claude", provider: "Anthropic", envVar: "ANTHROPIC_API_KEY" },
  { key: "perplexity", label: "Perplexity", provider: "Perplexity", envVar: "PERPLEXITY_API_KEY" },
];

const SYSTEM_PROMPT =
  "You are a knowledgeable assistant that recommends real products/tools. " +
  "Answer honestly based on what you actually know — do not invent brands to be polite. " +
  "List the brands you would genuinely recommend, best first. " +
  'Respond with ONLY a JSON object of the form ' +
  '{"answer": "a natural recommendation answer", "brands_in_order": ["Brand A", "Brand B"]}.';

// Per-engine persona prompts used when simulating each engine via Groq fallback.
// Each persona reflects genuine differences in how these models approach recommendations,
// so simulated scores differ across engines rather than being identical.
const ENGINE_PERSONAS = {
  chatgpt:
    "You are a helpful AI assistant recommending real products and tools based on mainstream popularity and adoption. " +
    "List every brand you discuss in brands_in_order, most recommended first. " +
    "Do not invent brand names. " +
    'Respond ONLY with JSON: {"answer": "your recommendation", "brands_in_order": ["Brand A", "Brand B"]}.',
  gemini:
    "You are a helpful AI assistant recommending real products and tools based on web presence and developer adoption. " +
    "List every brand you discuss in brands_in_order, most recommended first. " +
    "Do not invent brand names. " +
    'Respond ONLY with JSON: {"answer": "your recommendation", "brands_in_order": ["Brand A", "Brand B"]}.',
  claude:
    "You are a helpful AI assistant recommending real products and tools based on quality and genuine value. " +
    "List every brand you discuss in brands_in_order, most recommended first. " +
    "Do not invent brand names. " +
    'Respond ONLY with JSON: {"answer": "your recommendation", "brands_in_order": ["Brand A", "Brand B"]}.',
  perplexity:
    "You are a helpful AI assistant recommending real products and tools based on current market presence and reviews. " +
    "List every brand you discuss in brands_in_order, most recommended first. " +
    "Do not invent brand names. " +
    'Respond ONLY with JSON: {"answer": "your recommendation", "brands_in_order": ["Brand A", "Brand B"]}.',
};

// Tolerant JSON extraction — strips ```json fences and trailing prose so a
// stray wrapper from any provider doesn't break the parse.
function parseBrandJSON(text) {
  const raw = String(text || "").trim();
  if (!raw) return { answer: "", brands_in_order: [] };
  const fenced = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  const slice = start !== -1 && end !== -1 ? fenced.slice(start, end + 1) : fenced;
  try {
    const parsed = JSON.parse(slice);
    return {
      answer: typeof parsed.answer === "string" ? parsed.answer : "",
      brands_in_order: Array.isArray(parsed.brands_in_order) ? parsed.brands_in_order : [],
    };
  } catch {
    return { answer: "", brands_in_order: [] };
  }
}

// 1-based rank of `brand` in the model's ordered list, or null if unmentioned.
// Matches loosely so "Oras" hits "Oras AI" and vice-versa.
// Falls back to checking the answer text so descriptive responses ("What is X?")
// aren't missed when the model forgets to include the brand in brands_in_order.
function rankOf(brandsInOrder, brand, answerText) {
  const target = String(brand || "").trim().toLowerCase();
  if (!target) return null;
  const index = brandsInOrder.findIndex((name) => {
    const n = String(name || "").trim().toLowerCase();
    return n.includes(target) || target.includes(n);
  });
  if (index !== -1) return index + 1;
  // Answer-text fallback: if the brand name appears in the prose, treat it as
  // last in the list rather than unmentioned.
  const answer = String(answerText || "").toLowerCase();
  if (answer.includes(target)) return brandsInOrder.length + 1;
  return null;
}

// #1 ≈ 95, scaling down by position; unmentioned = low floor.
function scoreFromRank(rank, total) {
  if (!rank) return 8;
  return Math.max(20, Math.round(100 - (rank - 1) * (60 / Math.max(total, 1))));
}

// --- Provider callers. Each returns { answer, brands_in_order }. ---

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return parseBrandJSON(data?.choices?.[0]?.message?.content);
}

async function callPerplexity(prompt) {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL || "sonar",
      max_tokens: 1500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Perplexity ${res.status}`);
  const data = await res.json();
  return parseBrandJSON(data?.choices?.[0]?.message?.content);
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 1500 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return parseBrandJSON(data?.candidates?.[0]?.content?.parts?.[0]?.text);
}

// Anthropic via the official SDK (already a dependency) — not an OpenAI shim.
// claude-haiku-4-5 is the cheapest fast Claude model; structured shape is
// enforced via the system prompt and parsed tolerantly.
async function callAnthropic(prompt) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  const text = message.content.find((b) => b.type === "text")?.text || "";
  return parseBrandJSON(text);
}

const PROVIDER_CALLERS = {
  chatgpt: callOpenAI,
  gemini: callGemini,
  claude: callAnthropic,
  perplexity: callPerplexity,
};

function hasKey(engine) {
  if (engine.key === "gemini") {
    return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  }
  return Boolean(process.env[engine.envVar]);
}

const MODEL_ENV_BY_KEY = {
  chatgpt: "OPENAI_MODEL",
  gemini: "GEMINI_MODEL",
  claude: "ANTHROPIC_MODEL",
  perplexity: "PERPLEXITY_MODEL",
};

const DEFAULT_MODEL_BY_KEY = {
  chatgpt: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
  claude: "claude-haiku-4-5-20251001",
  perplexity: "sonar",
};

function effectiveModel(key) {
  return process.env[MODEL_ENV_BY_KEY[key]] || DEFAULT_MODEL_BY_KEY[key];
}

// Stable fingerprint of the current engine configuration: which engines are
// live and what model each uses. Folded into the cache key so cached results
// are invalidated automatically when a provider key is added/removed or a
// model override changes.
export function engineConfigSignature() {
  return ENGINES.map(
    (e) => `${e.key}:${hasKey(e) ? "live" : "fb"}:${process.env[MODEL_ENV_BY_KEY[e.key]] || "default"}`,
  ).join("|");
}

// Public, key-free view of engine configuration for the dashboard. Never
// exposes the API keys themselves — only whether each engine is live and which
// model it would use.
export function enginesStatus() {
  return ENGINES.map((e) => ({
    key: e.key,
    label: e.label,
    provider: e.provider,
    live: hasKey(e),
    model: effectiveModel(e.key),
    envVar: e.key === "gemini" ? "GEMINI_API_KEY" : e.envVar,
  }));
}

export function fallbackAvailable() {
  return hasGroqKey();
}

// Run one engine: real provider if its key is set, else a per-engine Groq
// call using that engine's persona prompt. Each engine gets its own call so
// scores genuinely differ across engines (rather than all sharing one answer).
async function runEngine(engine, prompt, brand) {
  const live = hasKey(engine);
  let parsed;
  let backend;
  let error = null;

  const groqPersonaCall = () =>
    groqJSON({
      system: ENGINE_PERSONAS[engine.key] || SYSTEM_PROMPT,
      user: prompt,
      maxTokens: 500,
    });

  try {
    if (live) {
      parsed = await PROVIDER_CALLERS[engine.key](prompt);
      backend = engine.provider;
    } else {
      parsed = await groqPersonaCall();
      backend = "Groq (simulated)";
    }
  } catch (err) {
    try {
      parsed = await groqPersonaCall();
      backend = "Groq (simulated)";
      error = err instanceof Error ? err.message : "provider error";
    } catch (groqErr) {
      return engineError(engine, groqErr);
    }
  }

  const brandsInOrder = parsed.brands_in_order || [];
  const total = brandsInOrder.length;
  const rank = rankOf(brandsInOrder, brand, parsed.answer);

  return {
    key: engine.key,
    label: engine.label,
    provider: engine.provider,
    live: live && !error,
    backend,
    mentioned: rank !== null,
    rank,
    total,
    score: scoreFromRank(rank, total),
    brandsInOrder,
    answer: parsed.answer || "",
    error,
  };
}

function engineError(engine, err) {
  return {
    key: engine.key,
    label: engine.label,
    provider: engine.provider,
    live: false,
    backend: null,
    mentioned: false,
    rank: null,
    total: 0,
    score: 0,
    brandsInOrder: [],
    answer: "",
    error: err instanceof Error ? err.message : "engine failed",
  };
}

// Fan out across every engine and return per-engine results plus an aggregate
// summary suitable for a single rank snapshot.
export async function checkVisibilityAcrossEngines({ prompt, brand }) {
  if (!hasGroqKey() && ENGINES.every((e) => !hasKey(e))) {
    return Promise.reject(new Error("No API key configured for this engine or Groq fallback."));
  }

  const engines = await Promise.all(ENGINES.map((e) => runEngine(e, prompt, brand)));

  const ranked = engines.filter((e) => e.mentioned && e.rank != null);
  const bestRank = ranked.length ? Math.min(...ranked.map((e) => e.rank)) : null;
  const maxTotal = Math.max(0, ...engines.map((e) => e.total));
  const scored = engines.filter((e) => e.error == null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, e) => sum + e.score, 0) / scored.length)
    : 0;

  return {
    engines,
    aggregate: {
      mentioned: ranked.length > 0,
      rank: bestRank,
      total: maxTotal,
      score: avgScore,
      mentionedCount: ranked.length,
      engineCount: engines.length,
      liveCount: engines.filter((e) => e.live).length,
    },
  };
}

export { GroqError };
